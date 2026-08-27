from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from .models import CustomUser  # Import CustomUser from user.models
from freelancer.models import Freelancer  # Import Freelancer from freelancer.models
from client.models import Client  # Import Client from client.models
from .serializers import (
    UserCreateSerializer,
    UserOutSerializer,
    UserLoginSerializer,
    UserPasswordUpdateSerializer,
    UserPhotoUpdateSerializer,
    UserUpdateSerializer,
)
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser


class RegisterView(generics.CreateAPIView):
    """
    View for registering a new user.
    Automatically creates a Freelancer or Client profile based on the user_type.
    """

    serializer_class = UserCreateSerializer
    queryset = CustomUser.objects.all()
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        """
        Save the user instance and create a corresponding Freelancer or Client profile.
        """
        # Save the user instance
        user = serializer.save()

        # Check the user_type and create a corresponding profile
        user_type = user.user_type
        if user_type == "freelancer":
            Freelancer.objects.create(uid=user)  # Create a Freelancer profile
        elif user_type == "client":
            Client.objects.create(uid=user)  # Create a Client profile


class LoginView(APIView):
    """
    View for user login.
    Authenticates the user and returns an access token.
    """

    def post(self, request):
        """
        Authenticate the user and return an access token.
        """
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            request,
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        if not user or user.is_deleted:
            return Response(
                {"detail": "Invalid credentials"}, status=status.HTTP_403_FORBIDDEN
            )
        user_data = UserOutSerializer(user).data
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
                "token_type": "bearer",
                "user": user_data,
            }
        )


class UserMeView(generics.RetrieveAPIView):
    """View to get the currently authenticated user (from token)"""

    serializer_class = UserOutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserDetailByIdView(generics.RetrieveAPIView):
    """View to get user by ID (admin or special access)"""

    queryset = CustomUser.objects.filter(is_deleted=False)
    serializer_class = UserOutSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"


class UserListView(generics.ListAPIView):
    """
    View for listing all users (excluding deleted ones).
    """

    queryset = CustomUser.objects.filter(is_deleted=False)
    serializer_class = UserOutSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserUpdateView(generics.UpdateAPIView):
    """
    View for updating user details.
    """

    queryset = CustomUser.objects.filter(is_deleted=False)
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserDeleteView(APIView):
    """
    View for soft-deleting a user.
    Marks the user as deleted without removing the record from the database.
    """

    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, id):
        """
        Soft-delete a user by marking them as deleted.
        """
        user = request.user
        user.is_deleted = True
        user.save()
        return Response({"msg": "Your account has been marked as deleted"})

# Extra views for user password and photo update


class UserPasswordUpdateView(APIView):
    """
    View for updating a user's password.
    """

    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        """
        Update the user's password after validating the old password and new passwords.
        """
        serializer = UserPasswordUpdateSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password updated successfully."})


class UserPhotoUpdateView(APIView):
    """
    View for updating a user's profile photo.
    """

    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request):
        """
        Update the user's profile photo.
        """
        user = request.user
        serializer = UserPhotoUpdateSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
