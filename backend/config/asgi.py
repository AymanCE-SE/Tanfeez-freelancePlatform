import os
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from chatroom.routing import websocket_urlpatterns as chat_ws
from notification.routing import websocket_urlpatterns as notification_ws

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": URLRouter(chat_ws + notification_ws),  
})
