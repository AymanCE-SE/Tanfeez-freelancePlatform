from django.shortcuts import render, get_object_or_404
from django.utils import timezone

# Create your views here.
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from chatroom.models import ChatRoom
from project.enums import Progress
from .models import ProjectProposal
from .serializers import ProposalSerializer
from freelancer.models import Freelancer
from project.models import Project

from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.permissions import BasePermission

from chatroom.models import ChatRoom
from project_proposal.models import ProjectProposal
from service_proposal.models import ServiceProposal


class IsFreelancer(BasePermission):
    def has_permission(self, request, view):
        return Freelancer.objects.filter(uid=request.user, is_deleted=False).exists()


class IsProposalOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.freelancer.uid == request.user


class IsProjectOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.project.client.uid == request.user


from freelancer.models import Freelancer


# only freelancer s can apply to projects
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
        # Access the freelancer object associated with the current user
        freelancer = get_object_or_404(Freelancer, uid=self.request.user)
        return ProjectProposal.objects.filter(freelancer=freelancer, is_deleted=False)


# make sure not already asigned
# Approve proposal by client (project owner only)


class ApproveProposalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            proposal = ProjectProposal.objects.get(id=pk, is_deleted=False)
        except ProjectProposal.DoesNotExist:
            return Response(
                {"detail": "Proposal not found."}, status=status.HTTP_404_NOT_FOUND
            )

        project = proposal.project

        # Check ownership
        if project.clientId != request.user:
            return Response(
                {"detail": "You are not the project owner."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Check if a freelancer is already assigned
        if project.freelancerId is not None:
            return Response(
                {"detail": "A freelancer is already assigned to this project."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Assign freelancer, mark as approved, set start_date
        project.freelancerId = proposal.freelancer.uid
        project.progress = Progress.IN_PROGRESS
        proposal.is_approved = True
        project.start_date = proposal.created_at  # <-- Set start_date here!
        project.save()
        proposal.save()

        # Create chat room now that freelancer is officially assigned
        chatroom, created = ChatRoom.objects.get_or_create(
            client=project.clientId,
            freelancer=proposal.freelancer.uid,
            project=project,
            project_proposal=proposal,
            defaults={"is_negotiation": False},
        )

        return Response(
            {
                "detail": "Proposal approved. Freelancer assigned to project.",
                "chatroom_id": chatroom.id,
            }
        )


class ProposalsByProjectView(generics.ListAPIView):
    serializer_class = ProposalSerializer
    permission_classes = [
        permissions.IsAuthenticated,
        IsProjectOwner,
    ]  # Ensure only project owners can view proposals

    def get_queryset(self):
        # Get the project by ID
        project_id = self.kwargs["project_id"]
        project = get_object_or_404(Project, id=project_id)

        # Ensure that the request's user is the project owner (client)
        if project.clientId != self.request.user:
            raise PermissionDenied(
                "You do not have permission to view proposals for this project."
            )

        # Return all proposals for the specific project
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


class FinishProjectView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            proposal = ProjectProposal.objects.get(id=pk, is_deleted=False)
        except ProjectProposal.DoesNotExist:
            return Response(
                {"detail": "Proposal not found."}, status=status.HTTP_404_NOT_FOUND
            )

        project = proposal.project

        # Only allow if project is in progress and user is owner
        if project.clientId != request.user:
            return Response(
                {"detail": "You are not the project owner."},
                status=status.HTTP_403_FORBIDDEN,
            )

        project.progress = Progress.COMPLETED
        project.end_date = timezone.now()  # <-- Set end_date here!
        project.save()

        return Response({"detail": "Project marked as completed."})