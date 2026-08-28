from rest_framework import serializers
from .models import ChatRoom, Message
from user.models import CustomUser


class ChatParticipantSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ["id", "name", "photo", "last_seen"]

    def get_name(self, obj):
        return " ".join(filter(None, [obj.first_name, obj.second_name]))


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = "__all__"
        read_only_fields = ("sender", "chatroom")


class ChatRoomSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    client_detail = ChatParticipantSerializer(source="client", read_only=True)
    freelancer_detail = ChatParticipantSerializer(source="freelancer", read_only=True)

    class Meta:
        model = ChatRoom
        fields = "__all__"