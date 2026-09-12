from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError
from freelancer.serializers import FreelancerOutSerializer
from client.models import Client
from freelancer.models import Freelancer
from .models import CustomUser
from django.contrib.auth.hashers import make_password
from project.enums import Progress
from project.models import Project


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new user.
    Automatically validates and hashes the password.
    """

    user_type = serializers.ChoiceField(
        choices=CustomUser.USER_TYPES[1:],  # Exclude 'none'
        help_text="The type of user (freelancer or client).",
    )

    class Meta:
        model = CustomUser
        fields = [
            "first_name",
            "second_name",
            "email",
            "password",
            "user_name",
            "photo",
            "phone",
            "birth_date",
            "bio",
            "address",
            "user_type",
        ]
        extra_kwargs = {
            "password": {
                "write_only": True
            },  # Ensure password is not returned in responses
        }

    def create(self, validated_data):
        """
        Create a new CustomUser instance and hash the password.
        """
        validated_data["password"] = make_password(validated_data["password"])
        return CustomUser.objects.create(**validated_data)


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating an existing user.
    """

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "first_name",
            "second_name",
            "email",
            "user_name",
            "photo",
            "phone",
            "birth_date",
            "bio",
            "address",
            "user_type",
        ]


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    Validates email and password fields.
    """

    email = serializers.EmailField()
    password = serializers.CharField()


class UserPasswordUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating a user's password.
    Validates the old password and ensures the new passwords match.
    """

    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, data):
        user = self.context["request"].user

        if not user.check_password(data["old_password"]):
            raise ValidationError({"old_password": "Old password is incorrect."})

        if data["new_password"] != data["new_password_confirm"]:
            raise ValidationError({"new_password_confirm": "Passwords do not match."})

        try:
            validate_password(data["new_password"], user)
        except DjangoValidationError as e:
            raise ValidationError({"new_password": list(e.messages)})

        return data

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user


class UserPhotoUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating a user's profile photo.
    """

    class Meta:
        model = CustomUser
        fields = ["photo"]


class UserOutSerializer(serializers.ModelSerializer):
    freelancer_profile = serializers.SerializerMethodField()
    client_profile = serializers.SerializerMethodField()
    completionRate = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "first_name",
            "second_name",
            "email",
            "user_name",
            "photo",
            "phone",
            "birth_date",
            "user_type",
            "bio",
            "address",
            "freelancer_profile",
            "client_profile",
            "completionRate",
        ]

    def get_completionRate(self, obj):
        projects = Project.objects.filter(is_deleted=False).exclude(progress=Progress.CANCELLED)
        if obj.user_type == "client":
            projects = projects.filter(clientId=obj)
        elif obj.user_type == "freelancer":
            projects = projects.filter(freelancerId=obj)
        else:
            return 0

        total_projects = projects.count()
        if total_projects == 0:
            return 0

        completed_projects = projects.filter(progress=Progress.COMPLETED).count()
        return round((completed_projects / total_projects) * 100)

    def get_freelancer_profile(self, obj):
        if hasattr(obj, "freelancer_profile"):
            # Lazy import to avoid circular dependency
            from freelancer.serializers import FreelancerOutSerializer
            return FreelancerOutSerializer(obj.freelancer_profile).data
        return None

    def get_client_profile(self, obj):
        if hasattr(obj, "client_profile"):
            # Lazy import to avoid circular dependency
            from client.serializers import ClientOutSerializer
            return ClientOutSerializer(obj.client_profile).data
        return None