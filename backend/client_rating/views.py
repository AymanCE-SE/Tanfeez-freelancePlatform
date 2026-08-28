from rest_framework.generics import (
    CreateAPIView,
    RetrieveAPIView,
    UpdateAPIView,
    DestroyAPIView,
    ListAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied, NotFound

from freelancer.models import Freelancer
from project.models import Project
from .models import ClientRating
from .serializers import ClientRatingSerializer
from .permissions import IsClientUser 
from django.db.models import Avg, Count
from rest_framework.views import APIView

class ClientRatingCreateView(CreateAPIView):
    serializer_class = ClientRatingSerializer
    permission_classes = [IsAuthenticated, IsClientUser]

    def perform_create(self, serializer):
        client = self.request.user.client_profile
        project_id = self.kwargs.get("project_id")
        freelancer_id = self.kwargs.get("freelancer_id")
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            raise NotFound("Project not found.")
        try:
            freelancer = Freelancer.objects.get(id=freelancer_id, is_deleted=False)
        except Freelancer.DoesNotExist:
            raise NotFound("Freelancer not found.")

        if project.clientId != self.request.user:
            raise PermissionDenied("You can only rate freelancers on your own projects.")

        if ClientRating.objects.filter(project=project, freelancer=freelancer, is_deleted=False).exists():
            raise serializers.ValidationError("You already rated this freelancer on this project.")

        serializer.save(client=client, project=project, freelancer=freelancer)

class ClientRatingDetailView(RetrieveAPIView):
    serializer_class = ClientRatingSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        rating_id = self.kwargs.get("rating_id")
        try:
            return ClientRating.objects.get(id=rating_id, is_deleted=False)
        except ClientRating.DoesNotExist:
            raise NotFound("Rating not found.")


class ClientRatingUpdateView(UpdateAPIView):
    serializer_class = ClientRatingSerializer
    permission_classes = [IsAuthenticated, IsClientUser]

    def get_object(self):
        rating_id = self.kwargs.get("rating_id")
        try:
            return ClientRating.objects.get(id=rating_id, is_deleted=False)
        except ClientRating.DoesNotExist:
            raise NotFound("Rating not found.")

    def perform_update(self, serializer):
        # Ensure only the client who created the rating can update it
        rating = self.get_object()
        if rating.client.uid != self.request.user:
            raise PermissionDenied("You do not have permission to update this rating.")
        serializer.save()


class ClientRatingDeleteView(DestroyAPIView):
    permission_classes = [IsAuthenticated, IsClientUser]

    def get_object(self):
        rating_id = self.kwargs.get("rating_id")
        try:
            return ClientRating.objects.get(id=rating_id, is_deleted=False)
        except ClientRating.DoesNotExist:
            raise NotFound("Rating not found.")

    def perform_destroy(self, instance):
        # Soft delete the rating
        instance.is_deleted = True
        instance.save()


class ClientRatingListView(ListAPIView):
    serializer_class = ClientRatingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get("project_id")
        return ClientRating.objects.filter(project_id=project_id, is_deleted=False)

class FreelancerRatingSummaryView(APIView):
    permission_classes = [IsAuthenticated]  # عايز اليوزر يبقى مسجل دخول بس، مش شرط كلاينت

    def get(self, request, freelancer_id):
        stats = ClientRating.objects.filter(
            freelancer_id=freelancer_id, is_deleted=False
        ).aggregate(average=Avg("rating"), count=Count("id"))

        return Response({
            "freelancer_id": freelancer_id,
            "average_rating": round(stats["average"], 2) if stats["average"] else None,
            "ratings_count": stats["count"],
        })