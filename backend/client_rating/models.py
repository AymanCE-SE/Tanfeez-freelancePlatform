from django.db import models
from project.models import Project  # Import the Project model
from client.models import Client  # Import the Client model
from freelancer.models import Freelancer  # Import the Freelancer model
from django.conf import settings
from service.models import Service

class ClientRating(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="ratings",
        help_text="The project associated with the rating."
    )
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name="ratings_given",
        help_text="The client giving the rating."
    )
    freelancer = models.ForeignKey(
        Freelancer,
        on_delete=models.CASCADE,
        related_name="ratings_received",
        help_text="The freelancer being rated."
    )
    rating = models.PositiveIntegerField(
        choices=[(i, i) for i in range(1, 6)],
        help_text="Rating value (1 to 5)."
    )
    is_deleted = models.BooleanField(
        default=False,
        help_text="Marks whether the rating is deleted."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Rating {self.rating} by {self.client.uid.email} for {self.freelancer.uid.email} on project {self.project.name}"

class EngagementRating(models.Model):
    """
    Rating in either direction (client<->freelancer), for either a completed
    project or a completed service order. Uses CustomUser directly for
    rater/ratee (not Client.id/Freelancer.id) to sidestep the ID-confusion
    class of bug we kept hitting today.
    """
    class Direction(models.TextChoices):
        CLIENT_TO_FREELANCER = "client_to_freelancer", "Client rating Freelancer"
        FREELANCER_TO_CLIENT = "freelancer_to_client", "Freelancer rating Client"

    direction = models.CharField(max_length=25, choices=Direction.choices)
    rater = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ratings_given")
    ratee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ratings_received")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, null=True, blank=True)
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    review = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(project__isnull=False) | models.Q(service__isnull=False),
                name="rating_must_have_project_or_service",
            )
        ]