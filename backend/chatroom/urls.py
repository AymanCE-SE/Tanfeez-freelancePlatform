# chatroom/urls.py
from django.urls import path
from .views import ChatRoomListCreateView, MessageListCreateView, UnreadMessagesCountView

urlpatterns = [
    path("", ChatRoomListCreateView.as_view()),
    path("messages/<int:chatroom_id>/", MessageListCreateView.as_view()),
    path("unread-count/", UnreadMessagesCountView.as_view()),
]
