import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.group_name = f"chat_{self.room_id}"

        # 1. Auth — query param browser doesn't allow 
        #    custom headers with websocket handshake
        query_string = self.scope["query_string"].decode()
        params = dict(p.split("=") for p in query_string.split("&") if "=" in p)
        token = params.get("token")

        self.user = await self.get_user_from_token(token)
        if self.user is None:
            await self.close(code=4001)  # auth fail
            return

        # 2. Authorization — must be the client or freelancer exactly of the room
        room = await self.get_room(self.room_id)
        if room is None or self.user.id not in (room.client_id, room.freelancer_id):
            await self.close(code=4003)  # not allowed
            return

        #3. join the group only if passed the first  checks
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        text = data.get("message", "").strip()
        if not text:
            return

        #saving in database first — its the real source
        # الـ socket بس وسيلة نبلغ بيها الناس إن حصل حاجة
        message = await self.save_message(self.room_id, self.user.id, text)

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat_message",   # ده اللي بيوجه للميثود chat_message تحت
                "message": message.text,
                "sender_id": message.sender_id,
                "sender_name": f"{self.user.first_name} {self.user.second_name or ''}".strip() or self.user.email,
                "timestamp": message.timestamp.isoformat(),
            },
        )

    # الميثود دي بتتنفذ على كل consumer داخل في نفس الجروب، حتى اللي باعت الرسالة نفسه
    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    # --- الاستعلامات للداتابيز لازم تتلف بالشكل ده لإن الـ consumer async
    #     لكن الـ Django ORM sync — الـ database_sync_to_async بتعمل الجسر بينهم ---

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