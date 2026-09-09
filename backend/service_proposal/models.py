# Create your models here.
from django.db import models
from client.models import Client
from service.models import Service


class ServiceProposal(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    message = models.TextField(blank=True, null=True)
    price_offer = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    is_approved = models.BooleanField(default=False)
    is_completed = models.BooleanField(default=False)  
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f"Proposal by {self.client.user.username} for {self.service.service_name}"
        )
