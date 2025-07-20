from django.db import models
from django.conf import settings
from django.contrib.postgres.fields import ArrayField


class Service(models.Model):
    freelancerId = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="services"
    )
    service_name = models.CharField(max_length=255, null=False, blank=False)
    description = models.TextField(null=False, blank=False)
    price = models.DecimalField(
        max_digits=10, decimal_places=2, null=False, blank=False
    )
    tags = ArrayField(models.CharField(max_length=256))
    created_at = models.DateTimeField(auto_now_add=True)
    video = models.TextField(null=True, blank=True)
    photo = models.ImageField(
        upload_to="service_photos/", blank=True, null=True
    )  # Allow null for profile photos
    category = models.CharField(max_length=255, null=False, blank=True)

    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.service_name


class ServiceImage(models.Model):
    service = models.ForeignKey(
        Service, on_delete=models.CASCADE, related_name="gallery_images"
    )
    image = models.ImageField(upload_to="service_gallery/")
    uploaded_at = models.DateTimeField(auto_now_add=True)
