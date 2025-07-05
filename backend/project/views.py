from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework import generics, status
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


class ProjectCreateView(generics.CreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            # Print or log errors for debugging
            print("Project creation errors:", serializer.errors)
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
        return Project.objects.exclude(progress=Progress.CANCELLED)


# Retrieve (get one)
class ProjectRetrieveView(generics.RetrieveAPIView):
    queryset = Project.objects.select_related("clientId")
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data

        # Add user IDs to response
        return Response(data)


class ProjectUpdateView(generics.UpdateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectUpdateSerializer
    permission_classes = [IsAuthenticated]

    # Optional: customize update behavior by overriding perform_update()
    def perform_update(self, serializer):
        serializer.save()


# Delete
class ProjectDeleteView(generics.DestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def perform_destroy(self, instance):
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

        return Project.objects.filter(clientId=user).exclude(
            progress=Progress.CANCELLED
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

        return Project.objects.filter(clientId=user).exclude(
            progress=Progress.CANCELLED
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        if not queryset.exists():
            return Response(
                {"detail": "Client has no projects yet."}, status=status.HTTP_200_OK
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
