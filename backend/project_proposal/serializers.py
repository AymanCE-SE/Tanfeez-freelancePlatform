from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import ProjectProposal


class ProposalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectProposal
        fields = "__all__"
        read_only_fields = ("freelancer", "is_approved", "is_deleted", "created_at")

    def validate(self, attrs):
        freelancer = attrs.get('freelancer')
        project = attrs.get('project')

        if ProjectProposal.objects.filter(freelancer=freelancer, project=project, is_deleted=False).exists():
            raise ValidationError("You have already submitted a proposal for this project.")

        return attrs
