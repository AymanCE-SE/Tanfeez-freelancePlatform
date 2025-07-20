from django.shortcuts import render
from rest_framework.exceptions import NotFound, ValidationError

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from service.serializer import (
    ServiceCreateUpdateSerializer,
    ServiceRetriveDeleteSerializer,
)
from .models import Service
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied


# Create Service
class CreateServiceView(generics.CreateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceCreateUpdateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        print(user.user_type)
        if user.user_type != "freelancer" or not hasattr(user, "freelancer_profile"):
            raise PermissionDenied("Only freelancers can create a service.")
        serializer.save(freelancerId=user)


# List all Services
class ServiceListView(generics.ListAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceRetriveDeleteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Override get_queryset to filter out soft-deleted services.
        """
        return Service.objects.filter(is_deleted=False)  # Exclude soft-deleted records


# get service by id
class ServiceDetailView(generics.RetrieveAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceRetriveDeleteSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "id"

    def get_object(self):
        """
        Override get_object to check if the service is soft-deleted.
        """
        service = super().get_object()  # Get the object using the default method

        if service.is_deleted:
            raise NotFound("This service has been deleted.")  # Return a 404 if deleted

        return service


# update service
class ServiceUpdateView(generics.UpdateAPIView):
    serializer_class = ServiceCreateUpdateSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        user = self.request.user

        if user.user_type != "freelancer":
            raise PermissionDenied("Only freelancers can update services.")

        return Service.objects.filter(freelancerId=user, is_deleted=False)

    def perform_update(self, serializer):
        serializer.save(freelancerId=self.request.user)


# delete service
class ServiceDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, id):
        try:
            service = Service.objects.get(
                id=id, freelancerId=request.user, is_deleted=False
            )
        except Service.DoesNotExist:
            raise NotFound("Service not found or already deleted.")

        if request.user.user_type != "freelancer":
            raise PermissionDenied("Only freelancers can delete services.")

        service.is_deleted = True
        service.save(update_fields=["is_deleted"])

        return Response(
            {"message": "Service marked as deleted"}, status=status.HTTP_204_NO_CONTENT
        )


# Extra views for services


#  List Services by Tags
class ServiceByTagView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tag = request.query_params.get("tag")

        if not tag:
            raise ValidationError("Query parameter 'tag' is required.")

        # Normalize tag to lowercase
        tag = tag.lower()

        # Filter services where tag is in the tags array
        services = Service.objects.filter(tags__icontains=f"{tag}")
        serializer = ServiceRetriveDeleteSerializer(services, many=True)
        return Response(serializer.data)


#  List Services by Logged-in User
class MyServicesView(generics.ListAPIView):
    serializer_class = ServiceRetriveDeleteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Service.objects.filter(freelancerId=self.request.user, is_deleted=False)


#  List Services by Given User ID
class ServicesByUserIdView(generics.ListAPIView):
    serializer_class = ServiceRetriveDeleteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")
        return Service.objects.filter(freelancerId__id=user_id, is_deleted=False)
