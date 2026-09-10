from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from notification.utils import send_notification
from notification.models import Notification
from chatroom.models import ChatRoom

from .models import ServiceProposal
from .serializers import ServiceProposalSerializer, UpdateServiceProposalSerializer
from service.models import Service
from client.models import Client
from freelancer.models import Freelancer
from rest_framework.exceptions import PermissionDenied, ValidationError


class AllServiceProposalsView(generics.ListAPIView):
    queryset = ServiceProposal.objects.filter(is_deleted=False)
    serializer_class = ServiceProposalSerializer
    permission_classes = [permissions.IsAuthenticated]

# Ensure only clients can create proposals
class IsClient(permissions.BasePermission):
    def has_permission(self, request, view):
        return Client.objects.filter(uid=request.user, is_deleted=False).exists()


class IsServiceOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.service.freelancer.uid == request.user


class CreateServiceProposalView(generics.CreateAPIView):
    serializer_class = ServiceProposalSerializer
    permission_classes = [permissions.IsAuthenticated, IsClient]

    def perform_create(self, serializer):
        client = Client.objects.get(uid=self.request.user)
        service = serializer.validated_data["service"]

        if ServiceProposal.objects.filter(client=client, service=service, is_deleted=False).exists():
            raise ValidationError("You already have an active order for this service.")

        proposal = serializer.save(client=client)
        chatroom, _ = ChatRoom.objects.get_or_create(
            client=client.uid,
            freelancer=proposal.service.freelancerId,
            service=proposal.service,
            service_proposal=proposal,
            defaults={"is_negotiation": True},
        )
        self.chatroom_id = chatroom.id

        send_notification(
            recipient=service.freelancerId,
            notification_type=Notification.NotificationType.NEW_PROPOSAL,
            target_type=Notification.TargetType.SERVICE,   
            message=f"You have a new order on '{service.service_name}'",
            target_id=service.id,
        )

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return Response(
            {"detail": "Service proposal submitted and negotiation chatroom created.",
             "chatroom_id": getattr(self, "chatroom_id", None)},
            status=status.HTTP_201_CREATED,
        )


class ClientServiceProposalsView(generics.ListAPIView):
    serializer_class = ServiceProposalSerializer
    permission_classes = [permissions.IsAuthenticated, IsClient]

    def get_queryset(self):
        client = get_object_or_404(Client, uid=self.request.user)
        return ServiceProposal.objects.filter(client=client, is_deleted=False)


class ApproveServiceProposalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            proposal = ServiceProposal.objects.get(id=pk, is_deleted=False)
        except ServiceProposal.DoesNotExist:
            return Response({"detail": "Proposal not found."}, status=404)

        service = proposal.service
        if service.freelancerId != request.user:
            return Response({"detail": "You are not the service owner."}, status=403)
        if proposal.is_approved:
            return Response({"detail": "Proposal already approved."}, status=400)

        proposal.is_approved = True
        proposal.save()

        chatroom, created = ChatRoom.objects.get_or_create(
            client=proposal.client.uid,
            freelancer=service.freelancerId,
            service=service,
            service_proposal=proposal,
            defaults={"is_negotiation": False},
        )
        if not created:
            chatroom.is_negotiation = False
            chatroom.save()

        send_notification(
            recipient=proposal.client.uid,
            notification_type=Notification.NotificationType.PROPOSAL_APPROVED,
            message=f"Your order for '{service.service_name}' was approved!",
            target_id=service.id,
            target_type=Notification.TargetType.SERVICE,  
        )

        return Response({"detail": "Proposal approved successfully.", "chatroom_id": chatroom.id})
    
# List Proposals by Service ID (only for service owner)


# views.py
class ServiceProposalsByServiceView(generics.ListAPIView):
    serializer_class = ServiceProposalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        service_id = self.kwargs.get("service_id")
        service = get_object_or_404(Service, id=service_id, is_deleted=False)

        # Check that the request user is the freelancer who owns the service
        if service.freelancerId != self.request.user:

            raise PermissionDenied("You are not the owner of this service.")

        return ServiceProposal.objects.filter(service=service, is_deleted=False)


# views.py
class UpdateOwnServiceProposalView(generics.UpdateAPIView):
    serializer_class = UpdateServiceProposalSerializer
    permission_classes = [permissions.IsAuthenticated, IsClient]
    queryset = ServiceProposal.objects.filter(is_deleted=False)

    def get_object(self):
        proposal = get_object_or_404(
            ServiceProposal, id=self.kwargs["pk"], is_deleted=False
        )

        if proposal.client.uid != self.request.user:
            raise PermissionDenied("You can only update your own proposals.")
        return proposal

    def perform_update(self, serializer):
        previous_price = serializer.instance.price_offer
        proposal = serializer.save()

        if previous_price != proposal.price_offer:
            send_notification(
                recipient=proposal.service.freelancerId,
                notification_type=Notification.NotificationType.PRICE_UPDATED,
                target_type=Notification.TargetType.SERVICE,
                message=(
                    f"The client updated the offer for '{proposal.service.service_name}' "
                    f"to ${proposal.price_offer}."
                ),
                target_id=proposal.service.id,
            )


class DeleteServiceProposalView(generics.DestroyAPIView):
    queryset = ServiceProposal.objects.all()
    serializer_class = ServiceProposalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        if instance.client.uid != self.request.user:
            raise PermissionDenied("You can't delete this proposal.")
        instance.is_deleted = True
        instance.save()

class CompleteServiceProposalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            proposal = ServiceProposal.objects.get(id=pk, is_deleted=False)
        except ServiceProposal.DoesNotExist:
            return Response({"detail": "Proposal not found."}, status=404)

        if proposal.service.freelancerId != request.user:
            return Response({"detail": "You are not the service owner."}, status=403)
        if not proposal.is_approved:
            return Response({"detail": "This order hasn't been approved yet."}, status=400)
        if proposal.is_completed:
            return Response({"detail": "This order is already marked as completed."}, status=400)

        proposal.is_completed = True
        proposal.save()


        send_notification(
            recipient=proposal.client.uid,
            notification_type=Notification.NotificationType.PROJECT_COMPLETED,
            message=f"'{proposal.service.service_name}' has been marked as completed.",
            target_id=proposal.service.id,
            target_type=Notification.TargetType.SERVICE,   
        )

        # rating for both not one side
        send_notification(
            recipient=proposal.client.uid,
            notification_type=Notification.NotificationType.NEW_RATING,
            message=f"'{proposal.service.service_name}' is complete — rate your freelancer.",
            target_id=proposal.service.id,
            target_type=Notification.TargetType.SERVICE,
        )
        send_notification(
            recipient=proposal.service.freelancerId,
            notification_type=Notification.NotificationType.NEW_RATING,
            message=f"'{proposal.service.service_name}' is complete — rate your client.",
            target_id=proposal.service.id,
            target_type=Notification.TargetType.SERVICE,
        )

        return Response({"detail": "Service order marked as completed."})