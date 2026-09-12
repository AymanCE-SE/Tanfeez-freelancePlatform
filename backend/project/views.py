import logging

from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework import generics, status,permissions
from rest_framework.response import Response
from chatroom.models import ChatRoom
from user.models import CustomUser
from project.enums import Progress
from project.serializers import (
    ProjectCreateSerializer,
    ProjectSerializer,
    ProjectUpdateSerializer,
)
from .models import Project
from rest_framework.permissions import IsAuthenticatedOrReadOnly

logger = logging.getLogger(__name__)


class ProjectCreateView(generics.CreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.warning("Project creation validation failed: %s", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = self.request.user
        serializer.save(clientId=user)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


# List
class ProjectListView(generics.ListAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Project.objects.select_related("clientId")
            .prefetch_related("skills")
            .exclude(progress=Progress.CANCELLED)
            .order_by("-created_at")
        )

# latest projects 
# In your Django view
class LatestProjectsView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return (
            Project.objects.select_related("clientId")
            .prefetch_related("skills")
            .filter(is_deleted=False)
            .order_by("-created_at")[:5]
        )

# Retrieve (get one)
class ProjectRetrieveView(generics.RetrieveAPIView):
    queryset = Project.objects.select_related("clientId").prefetch_related("skills")
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]


class ProjectUpdateView(generics.UpdateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectUpdateSerializer
    permission_classes = [IsAuthenticated]

    # Optional: customize update behavior by overriding perform_update()
    def perform_update(self, serializer):
        if serializer.instance.clientId != self.request.user:
            raise PermissionDenied("You are not the owner of this project.")
        serializer.save()


# Delete
class ProjectDeleteView(generics.DestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        if instance.clientId != self.request.user:
            raise PermissionDenied("You are not the owner of this project.")
        instance.progress = Progress.CANCELLED
        instance.save()


# Special view to get all projects by a specific client


class ProjectsByCurrentClientView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.user_type != "client":
            raise PermissionDenied("Only clients can view their projects.")

        if not hasattr(user, "client_profile"):
            raise NotFound("Client profile not found for this user.")

        return (
            Project.objects.select_related("clientId")
            .prefetch_related("skills")
            .filter(clientId=user)
            .exclude(progress=Progress.CANCELLED)
        )


class ProjectsByUserIdView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")

        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            raise NotFound("User not found.")

        if user.user_type != "client":
            raise NotFound("This user is not a client.")

        return (
            Project.objects.select_related("clientId")
            .prefetch_related("skills")
            .filter(clientId=user)
            .exclude(progress=Progress.CANCELLED)
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        if not queryset.exists():
            return Response(
                {"detail": "Client has no projects yet."}, status=status.HTTP_200_OK
            )

        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
