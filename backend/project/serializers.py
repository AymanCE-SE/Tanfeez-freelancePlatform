# serializers.py
from rest_framework import serializers
from .models import Project
from skill.models import Skill
from skill.serializers import SkillSerializer


class ProjectSerializer(serializers.ModelSerializer):
    client_id = serializers.SerializerMethodField()
    user_id = serializers.SerializerMethodField()
    skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = "__all__"

    def get_client_id(self, obj):
        return obj.clientId.id if obj.clientId else None

    def get_user_id(self, obj):
        return obj.clientId.id if obj.clientId else None


class ProjectCreateSerializer(serializers.ModelSerializer):
    skills = serializers.ListField(
        child=serializers.CharField(), required=False, write_only=True
    )

    class Meta:
        model = Project
        fields = [
            "name",
            "description",
            "start_date",
            "end_date",
            "duration",
            "progress",
            "experience_level",
            "type",
            "budget",
            "hourly_rate",
            "location",
            "status",
            "skills",
        ]

    def create(self, validated_data):
        skills_data = validated_data.pop("skills", [])
        project = Project.objects.create(**validated_data)
        for skill_name in skills_data:
            skill, _ = Skill.objects.get_or_create(skill_name=skill_name)
            project.skills.add(skill)
        return project


class ProjectUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "name",
            "description",
            "start_date",
            "end_date",
            "freelancerId",
            "duration",
            "progress",
            "experience_level",
            "type",
            "budget",
        ]
