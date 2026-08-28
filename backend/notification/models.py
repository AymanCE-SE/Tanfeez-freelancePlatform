from django.db import models
from django.conf import settings

class Notification(models.Model):
    class NotificationType(models.TextChoices):
        NEW_PROPOSAL = "new_proposal", "New Proposal"
        PROPOSAL_APPROVED = "proposal_approved", "Proposal Approved"
        PROJECT_COMPLETED = "project_completed", "Project Completed"
        NEW_RATING = "new_rating", "New Rating"
        # add any new type here without creating a new model

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices)
    message = models.CharField(max_length=255)  # a message like a new freelancer applied to your project
    target_id = models.PositiveIntegerField(null=True, blank=True)  # id for what the notification about ex(project_id)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]