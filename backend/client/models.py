from django.db import models
from django.conf import settings

class Client(models.Model):
    """
    Model representing a Client profile linked to a CustomUser.
    """

    # Primary Key
    id = models.AutoField(primary_key=True)

    # Foreign Key linking to the CustomUser model
    uid = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='client_profile',
        help_text="The user associated with this client profile."
    )

    # Fields specific to Client
    phone = models.CharField(
        max_length=20, 
        null=True, 
        blank=True,
        help_text="Phone number of the client."
    )
    company = models.CharField(
        max_length=255, 
        null=True, 
        blank=True,
        help_text="Name of the client's company."
    )
    languages = models.TextField(
        null=True,
        blank=True,
        help_text="Languages the client speaks (comma-separated)."
    )
    is_deleted = models.BooleanField(
        default=False,
        help_text="Soft delete flag for the client."
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp of when the client profile was created."
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp of the last update to the client profile."
    )

    def __str__(self):
        return f"{self.uid.user_name} - {self.company or 'No Company'}"

    class Meta:
        verbose_name = "Client"
        verbose_name_plural = "Clients"
        ordering = ['-created_at']  # Orders clients by creation date (newest first)