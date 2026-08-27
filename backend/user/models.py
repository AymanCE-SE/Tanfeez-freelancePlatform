from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from django.db import models
from django.utils import timezone

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """
        Creates and saves a CustomUser with the given email and password.
        """
        if not email:
            raise ValueError("The Email must be set")
        email = self.normalize_email(email)
        extra_fields.setdefault("user_name", email.split("@")[0])  # Default user_name to email prefix
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # Hash the password
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Creates and saves a superuser with the given email and password.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("user_type", "none")  # Default user_type for superusers
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model for the application.
    """

    # User roles
    USER_TYPES = (
        ("none", "None"),  # Default: No role assigned
        ("freelancer", "Freelancer"),
        ("client", "Client"),
    )

    # Basic user information
    first_name = models.CharField(max_length=255)
    second_name = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)

    # Profile information
    user_name = models.CharField(max_length=255, unique=True)
    photo = models.ImageField(upload_to="profile_photos/", blank=True, null=True)  # Allow null for profile photos
    birth_date = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=14, null=False, blank=True)
    bio = models.TextField(null=False, blank=True)
    address = models.TextField(null=False, blank=True)

    # Metadata
    created_at = models.DateTimeField(default=timezone.now)
    is_deleted = models.BooleanField(default=False)
    is_registered = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)

    # Role tracking
    user_type = models.CharField(
        max_length=10,
        choices=USER_TYPES,
        default="none",
        help_text="Tracks whether the user is a freelancer, client, or neither.",
    )

    # 🔥 Add these two fields
    is_staff = models.BooleanField(
        default=False,
        help_text="Designates whether the user can log into this admin site."
    )
    is_superuser = models.BooleanField(
        default=False,
        help_text="Designates this user as a superuser (has all permissions)."
    )


    # Manager
    objects = CustomUserManager()

    # Fields for authentication
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "user_name"]

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        """
        Override the save method to ensure user_name is always set.
        """
        if not self.user_name:
            self.user_name = self.email.split("@")[0]  # Default user_name to email prefix
        super().save(*args, **kwargs)