from rest_framework import serializers
from .models import ChatRoom, Message
from user.models import CustomUser
from project.models import Project

class ChatParticipantSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ["id", "name", "photo", "last_seen"]

    def get_name(self, obj):
        return " ".join(filter(None, [obj.first_name, obj.second_name]))

class ChatProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["id", "name"]

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = "__all__"
        read_only_fields = ("sender", "chatroom")


class ChatRoomSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    client_detail = ChatParticipantSerializer(source="client", read_only=True)
    freelancer_detail = ChatParticipantSerializer(source="freelancer", read_only=True)
    project_detail = ChatProjectSerializer(source="project", read_only=True) 
    unread_count = serializers.SerializerMethodField()
    class Meta:
        model = ChatRoom
        fields = "__all__"

    def get_unread_count(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()