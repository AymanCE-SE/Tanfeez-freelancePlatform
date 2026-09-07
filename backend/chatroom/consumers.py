import json
from collections import defaultdict
from django.utils import timezone
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()

# NOTE: plain in-memory dict — works because you're on InMemoryChannelLayer
# (single process, dev only). In production with multiple server processes,
# each process would have its own copy of this dict and presence would be
# wrong across processes. Fixing that needs a shared store (Redis) — not
# needed today, just know this is the limitation.
ONLINE_USERS_BY_ROOM = defaultdict(set)  # room_id -> {user_id, user_id, ...}


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.group_name = f"chat_{self.room_id}"

        query_string = self.scope["query_string"].decode()
        params = dict(p.split("=") for p in query_string.split("&") if "=" in p)
        token = params.get("token")

        self.user = await self.get_user_from_token(token)
        if self.user is None:
            await self.close(code=4001)
            return

        room = await self.get_room(self.room_id)
        if room is None or self.user.id not in (room.client_id, room.freelancer_id):
            await self.close(code=4003)
            return
        self.room = room   # new receive() to restore it

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        other_id = room.freelancer_id if self.user.id == room.client_id else room.client_id

        ONLINE_USERS_BY_ROOM[self.room_id].add(self.user.id)

        # Tell the group I just came online
        await self.channel_layer.group_send(self.group_name, {
            "type": "presence_event",
            "user_id": self.user.id,
            "status": "online",
        })

        # Tell MYSELF (not the group) the other participant's CURRENT status —
        # group broadcasts only fire on connect/disconnect events, so if I missed
        # an earlier one, this is how I catch up.
        if other_id in ONLINE_USERS_BY_ROOM[self.room_id]:
            await self.send(text_data=json.dumps({
                "type": "presence_event", "user_id": other_id, "status": "online",
            }))
        else:
            last_seen = await self.get_last_seen(other_id)
            await self.send(text_data=json.dumps({
                "type": "presence_event",
                "user_id": other_id,
                "status": "offline",
                "last_seen": last_seen.isoformat() if last_seen else None,
            }))


    async def disconnect(self, close_code):
        if not hasattr(self, "group_name"):
            return  # never got past auth/authorization, nothing to clean up

        ONLINE_USERS_BY_ROOM[self.room_id].discard(self.user.id)
        last_seen = await self.update_last_seen(self.user.id)

        await self.channel_layer.group_send(self.group_name, {
            "type": "presence_event",
            "user_id": self.user.id,
            "status": "offline",
            "last_seen": last_seen.isoformat(),
        })
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)

        # Two kinds of client->server events share this one socket:
        # a chat message, or a "I've read this conversation" signal.
        if data.get("type") == "read":
            message_ids = await self.mark_messages_read(self.room_id, self.user.id)
            if message_ids:
                await self.channel_layer.group_send(self.group_name, {
                    "type": "read_receipt",
                    "reader_id": self.user.id,
                    "message_ids": message_ids,
                })
            return

        text = data.get("message", "").strip()
        if not text:
            return

        message = await self.save_message(self.room_id, self.user.id, text)
        await self.channel_layer.group_send(self.group_name, {
            "type": "chat_message",
            "id": message.id,
            "message": message.text,
            "sender_id": message.sender_id,
            "sender_name": f"{self.user.first_name} {self.user.second_name or ''}".strip(),
            "timestamp": message.timestamp.isoformat(),
            })    
        
        recipient_id = self.room.freelancer_id if self.user.id == self.room.client_id else self.room.client_id
        await self.channel_layer.group_send(f"user_{recipient_id}_notifications", {
            "type": "notify",
            "kind": "new_message",
            "chatroom_id": self.room_id,
            "sender_name": f"{self.user.first_name} {self.user.second_name or ''}".strip(),
            "created_at": message.timestamp.isoformat(),
        })

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    async def presence_event(self, event):
        await self.send(text_data=json.dumps(event))

    async def read_receipt(self, event):
        await self.send(text_data=json.dumps(event))

    # --- DB helpers ---

    @database_sync_to_async
    def get_user_from_token(self, token):
        if not token:
            return None
        try:
            validated = AccessToken(token)
            return User.objects.get(id=validated["user_id"], is_deleted=False)
        except Exception:
            return None

    @database_sync_to_async
    def get_room(self, room_id):
        from .models import ChatRoom
        try:
            return ChatRoom.objects.get(id=room_id)
        except ChatRoom.DoesNotExist:
            return None

    @database_sync_to_async
    def save_message(self, room_id, sender_id, text):
        from .models import Message
        return Message.objects.create(chatroom_id=room_id, sender_id=sender_id, text=text)

    @database_sync_to_async
    def update_last_seen(self, user_id):
        now = timezone.now()
        User.objects.filter(id=user_id).update(last_seen=now)
        return now

    @database_sync_to_async
    def mark_messages_read(self, room_id, reader_id):
        from .models import Message
        # only messages NOT sent by the reader, and not already marked read
        qs = Message.objects.filter(chatroom_id=room_id, is_read=False).exclude(sender_id=reader_id)
        ids = list(qs.values_list("id", flat=True))
        qs.update(is_read=True)
        return ids

    @database_sync_to_async
    def get_last_seen(self, user_id):
        try:
            return User.objects.get(id=user_id).last_seen
        except User.DoesNotExist:
            return None