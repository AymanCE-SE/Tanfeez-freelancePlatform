from django.db import models
from django.conf import settings

class Notification(models.Model):
    class NotificationType(models.TextChoices):
        NEW_PROPOSAL = "new_proposal", "New Proposal"
        PRICE_UPDATED = "price_updated", "Price Updated"
        PROPOSAL_APPROVED = "proposal_approved", "Proposal Approved"
        PROJECT_COMPLETED = "project_completed", "Project Completed"
        NEW_RATING = "new_rating", "New Rating"
        RATING_RECEIVED = "rating_received", "Rating Received"   
        # add any new type here without creating a new model

    
    class TargetType(models.TextChoices):
        PROJECT = "project", "Project"
        SERVICE = "service", "Service"

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices)
    target_type = models.CharField(max_length=20, choices=TargetType.choices, null=True, blank=True)  
    message = models.CharField(max_length=255)  # a message like a new freelancer applied to your project
    target_id = models.PositiveIntegerField(null=True, blank=True)  # id for what the notification about ex(project_id)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]