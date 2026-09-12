from rest_framework import serializers
from .models import ServiceProposal


class ServiceProposalSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    client_user_id = serializers.SerializerMethodField()
    chatroom_id = serializers.SerializerMethodField()

    class Meta:
        model = ServiceProposal
        fields = "__all__"
        read_only_fields = ["is_approved", "client", "created_at", "is_deleted"]

    def get_client_name(self, obj):
        user = obj.client.uid
        return f"{user.first_name} {user.second_name}".strip()

    def get_client_user_id(self, obj):
        return obj.client.uid_id

    def get_chatroom_id(self, obj):
        from chatroom.models import ChatRoom
        room = ChatRoom.objects.filter(service_proposal=obj).first()
        return room.id if room else None


class UpdateServiceProposalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceProposal
        fields = ["message", "price_offer"]