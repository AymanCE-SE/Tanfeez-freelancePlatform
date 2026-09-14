from django.shortcuts import render, get_object_or_404
from django.utils import timezone

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.permissions import BasePermission

from chatroom.models import ChatRoom
from project.enums import Progress
from project.models import Project
from .models import ProjectProposal
from .serializers import ProposalSerializer , PublicProposalSerializer
from freelancer.models import Freelancer
from service_proposal.models import ServiceProposal

from notification.utils import send_notification
from notification.models import Notification


class IsFreelancer(BasePermission):
    def has_permission(self, request, view):
        return Freelancer.objects.filter(uid=request.user, is_deleted=False).exists()


class IsProposalOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.freelancer.uid == request.user


class IsProjectOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.project.client.uid == request.user


# only freelancers can apply to projects
class ApplyToProjectView(generics.CreateAPIView):
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated, IsFreelancer]

    def perform_create(self, serializer):
        freelancer = Freelancer.objects.get(uid=self.request.user)
        project = serializer.validated_data["project"]

        # Prevent duplicate proposals
        if ProjectProposal.objects.filter(freelancer=freelancer, project=project, is_deleted=False).exists():
            raise PermissionDenied("You have already submitted a proposal for this project.")

        proposal = serializer.save(freelancer=freelancer)

        chatroom, _ = ChatRoom.objects.get_or_create(
            client=proposal.project.clientId,
            freelancer=freelancer.uid,
            project=proposal.project,
            project_proposal=proposal,
            defaults={"is_negotiation": True},
        )
        self.chatroom_id = chatroom.id  # Store for use in response

        send_notification(
            recipient=proposal.project.clientId,
            notification_type=Notification.NotificationType.NEW_PROPOSAL,
            message=f"You have a new proposal on '{proposal.project.name}'",
            target_id=proposal.project.id,
            target_type=Notification.TargetType.PROJECT, 
        )

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return Response(
            {
                "detail": "Proposal submitted and negotiation chatroom created.",
                "chatroom_id": getattr(self, "chatroom_id", None),
            },
            status=status.HTTP_201_CREATED,
        )


# Get all proposals by logged-in freelancer
class MyProposalsView(generics.ListAPIView):
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated, IsFreelancer]

    def get_queryset(self):
        freelancer = get_object_or_404(Freelancer, uid=self.request.user)
        return ProjectProposal.objects.filter(freelancer=freelancer, is_deleted=False)


# Approve proposal by client (project owner only)
class ApproveProposalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            proposal = ProjectProposal.objects.get(id=pk, is_deleted=False)
        except ProjectProposal.DoesNotExist:
            return Response({"detail": "Proposal not found."}, status=status.HTTP_404_NOT_FOUND)

        project = proposal.project

        if project.clientId != request.user:
            return Response({"detail": "You are not the project owner."}, status=status.HTTP_403_FORBIDDEN)

        if project.freelancerId is not None:
            return Response(
                {"detail": "A freelancer is already assigned to this project."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        project.freelancerId = proposal.freelancer.uid
        project.progress = Progress.IN_PROGRESS
        proposal.is_approved = True
        project.start_date = proposal.created_at
        project.save()
        proposal.save()

        chatroom, created = ChatRoom.objects.get_or_create(
            client=project.clientId,
            freelancer=proposal.freelancer.uid,
            project=project,
            project_proposal=proposal,
            defaults={"is_negotiation": False},
        )

        send_notification(
            recipient=proposal.freelancer.uid,
            notification_type=Notification.NotificationType.PROPOSAL_APPROVED,
            message=f"Your proposal on '{project.name}' was approved!",
            target_id=project.id,
            target_type=Notification.TargetType.PROJECT,   
        )

        return Response({
            "detail": "Proposal approved. Freelancer assigned to project.",
            "chatroom_id": chatroom.id,
        })


class ProposalsByProjectView(generics.ListAPIView):
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectOwner]

    def get_queryset(self):
        project_id = self.kwargs["project_id"]
        project = get_object_or_404(Project, id=project_id)

        if project.clientId != self.request.user:
            raise PermissionDenied("You do not have permission to view proposals for this project.")

        return ProjectProposal.objects.filter(project=project, is_deleted=False)


class UpdateProposalView(generics.UpdateAPIView):
    queryset = ProjectProposal.objects.filter(is_deleted=False)
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        proposal = super().get_object()
        if proposal.freelancer.uid != self.request.user or proposal.is_approved == True:
            raise PermissionDenied("You are not allowed to update this proposal.")
        return proposal


# Soft delete proposal
class DeleteProposalView(generics.DestroyAPIView):
    queryset = ProjectProposal.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsProposalOwner]

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()


class AllProposalsView(generics.ListAPIView):
    queryset = ProjectProposal.objects.filter(is_deleted=False)
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]


class PublicProposalsByProjectView(generics.ListAPIView):
    serializer_class = PublicProposalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs["project_id"]
        return ProjectProposal.objects.filter(project_id=project_id, is_deleted=False)


# backend/project_proposal/views.py
class FinishProjectView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            proposal = ProjectProposal.objects.get(id=pk, is_deleted=False)
        except ProjectProposal.DoesNotExist:
            return Response({"detail": "Proposal not found."}, status=status.HTTP_404_NOT_FOUND)

        project = proposal.project

        if project.clientId != request.user:
            return Response({"detail": "You are not the project owner."}, status=status.HTTP_403_FORBIDDEN)

        project.progress = Progress.COMPLETED
        project.end_date = timezone.now()
        project.save()

        send_notification(
            recipient=proposal.freelancer.uid,
            notification_type=Notification.NotificationType.PROJECT_COMPLETED,
            message=f"'{project.name}' has been marked as completed.",
            target_id=project.id,
            target_type=Notification.TargetType.PROJECT,
        )

        # notification to rate the two sides
        send_notification(
            recipient=project.clientId,
            notification_type=Notification.NotificationType.NEW_RATING,
            message=f"'{project.name}' is complete — rate your freelancer.",
            target_id=project.id,
            target_type=Notification.TargetType.PROJECT,
        )
        send_notification(
            recipient=proposal.freelancer.uid,
            notification_type=Notification.NotificationType.NEW_RATING,
            message=f"'{project.name}' is complete — rate your client.",
            target_id=project.id,
            target_type=Notification.TargetType.PROJECT,
        )

        return Response({"detail": "Project marked as completed."})