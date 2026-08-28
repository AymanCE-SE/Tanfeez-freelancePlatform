from django.db import models
from django.conf import settings


class ChatRoom(models.Model):
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="client_chats"
    )
    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="freelancer_chats",
    )

    # Link to either proposal or final accepted project/service
    project_proposal = models.ForeignKey(
        "project_proposal.ProjectProposal",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    service_proposal = models.ForeignKey(
        "service_proposal.ServiceProposal",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    project = models.ForeignKey(
        "project.Project", null=True, blank=True, on_delete=models.SET_NULL
    )
    service = models.ForeignKey(
        "service.Service", null=True, blank=True, on_delete=models.SET_NULL
    )

    is_negotiation = models.BooleanField(default=True)  # True = proposal phase

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client} - {self.freelancer}"


class Message(models.Model):
    chatroom = models.ForeignKey(
        ChatRoom, related_name="messages", on_delete=models.CASCADE
    )
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)  
    def __str__(self):
        return f"{self.sender}: {self.text[:20]}"
