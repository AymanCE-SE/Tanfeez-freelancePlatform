import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()


class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        query_string = self.scope["query_string"].decode()
        params = dict(p.split("=") for p in query_string.split("&") if "=" in p)
        token = params.get("token")

        self.user = await self.get_user_from_token(token)
        if self.user is None:
            await self.close(code=4001)
            return

        # Every user gets their OWN personal group — no shared "room" concept
        # here, unlike chat. Anything sent to this group reaches only this user,
        # across every tab/device they have open.
        self.group_name = f"user_{self.user.id}_notifications"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    # No receive() override needed — this socket is one-way, server pushes
    # notifications, the client never sends anything back through it.

    async def notify(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def get_user_from_token(self, token):
        if not token:
            return None
        try:
            validated = AccessToken(token)
            return User.objects.get(id=validated["user_id"], is_deleted=False)
        except Exception:
            return None