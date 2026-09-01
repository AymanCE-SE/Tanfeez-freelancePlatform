from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import ProjectProposal


class ProposalSerializer(serializers.ModelSerializer):
    freelancer_user_id = serializers.SerializerMethodField()
    freelancer_name = serializers.SerializerMethodField()

    class Meta:
        model = ProjectProposal
        fields = "__all__"
        read_only_fields = ("freelancer", "is_approved", "is_deleted", "created_at")

    def get_freelancer_user_id(self, obj):
        return obj.freelancer.uid_id

    def get_freelancer_name(self, obj):
        user = obj.freelancer.uid
        return f"{user.first_name} {user.second_name}".strip()

    def validate(self, attrs):
        freelancer = attrs.get('freelancer')
        project = attrs.get('project')
        if ProjectProposal.objects.filter(freelancer=freelancer, project=project, is_deleted=False).exists():
            raise ValidationError("You have already submitted a proposal for this project.")
        return attrs

class PublicProposalSerializer(serializers.ModelSerializer):
    freelancer_name = serializers.SerializerMethodField()
    preview = serializers.SerializerMethodField()

    class Meta:
        model = ProjectProposal
        fields = ["id", "freelancer_name", "preview", "created_at"]

    def get_freelancer_name(self, obj):
        user = obj.freelancer.uid
        return f"{user.first_name} {user.second_name}".strip()

    def get_preview(self, obj):
        words = obj.body.split()
        preview = " ".join(words[:15])
        return preview + ("..." if len(words) > 15 else "")