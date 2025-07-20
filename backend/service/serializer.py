from rest_framework import serializers
from .models import Service, ServiceImage


class ServiceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceImage
        fields = ["id", "image", "uploaded_at"]


class ServiceCreateUpdateSerializer(serializers.ModelSerializer):
    gallery_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    class Meta:
        model = Service
        exclude = ["freelancerId"]
        read_only_fields = ["freelancerId"]  # <- this is the key fix

    def create(self, validated_data):
        gallery_images = validated_data.pop("gallery_images", [])
        service = Service.objects.create(**validated_data)
        for img in gallery_images:
            ServiceImage.objects.create(service=service, image=img)
        return service


class ServiceRetriveDeleteSerializer(serializers.ModelSerializer):
    gallery_images = ServiceImageSerializer(many=True, read_only=True)

    class Meta:
        model = Service
        exclude = ["is_deleted"]
