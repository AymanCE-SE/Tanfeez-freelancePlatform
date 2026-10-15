from rest_framework import serializers
from .models import Client

class ClientCreateSerializer(serializers.ModelSerializer):
    languages_list = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        write_only=True,
    )

    class Meta:
        model = Client
        fields = [
            "phone",
            "company",
            "languages_list",
        ]  

    def validate(self, attrs):
        if self.instance is None: 
            user = self.context["request"].user
            if hasattr(user, 'client_profile'):
                raise serializers.ValidationError("This user is already a client.")
        return attrs

    def create(self, validated_data):
        # Automatically set the uid to the currently logged-in user
        languages = validated_data.pop("languages_list", None)
        if languages is not None:
            validated_data["languages"] = ", ".join(language.strip() for language in languages if language.strip())
        validated_data["uid"] = self.context["request"].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        languages = validated_data.pop("languages_list", None)
        if languages is not None:
            validated_data["languages"] = ", ".join(language.strip() for language in languages if language.strip())
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["languages_list"] = [language.strip() for language in (instance.languages or "").split(",") if language.strip()]
        return data

class ClientOutSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="uid.user_name", read_only=True)
    email = serializers.EmailField(source="uid.email", read_only=True)
    languages_list = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            "id",
            "user_name",
            "email",
            "phone",
            "company",
            "languages_list",
            "is_deleted",
            "created_at",
            "updated_at",
        ]

    def get_languages_list(self, obj):
        return [language.strip() for language in (obj.languages or "").split(",") if language.strip()]