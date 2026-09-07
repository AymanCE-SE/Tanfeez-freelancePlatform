from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q

class ChatRoomListCreateView(generics.ListAPIView):
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ChatRoom.objects.filter(client=user) | ChatRoom.objects.filter(
            freelancer=user
        )


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        chatroom_id = self.kwargs["chatroom_id"]
        chatroom = get_object_or_404(ChatRoom, id=chatroom_id)

        # Check if the user belongs to the chat
        if self.request.user not in [chatroom.client, chatroom.freelancer]:
            return Message.objects.none()

        return Message.objects.filter(chatroom=chatroom)

    def perform_create(self, serializer):
        chatroom = get_object_or_404(ChatRoom, id=self.kwargs["chatroom_id"])

        if self.request.user not in [chatroom.client, chatroom.freelancer]:
            raise PermissionDenied("You're not part of this chat.")

        # sender is always the authenticated user
        sender = self.request.user

        serializer.save(chatroom=chatroom, sender=sender)

class UnreadMessagesCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rooms = ChatRoom.objects.filter(Q(client=request.user) | Q(freelancer=request.user))
        count = Message.objects.filter(chatroom__in=rooms, is_read=False).exclude(sender=request.user).count()
        return Response({"count": count})