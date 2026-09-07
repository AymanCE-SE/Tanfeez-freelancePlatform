from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Notification


def send_notification(recipient, notification_type, message, target_id=None):
    """Call this from any view when something notification-worthy happens."""
    notif = Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        message=message,
        target_id=target_id,
    )
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{recipient.id}_notifications",
        {
            "type": "notify",
            "kind": "notification",   
            "id": notif.id,
            "notification_type": notif.notification_type,
            "message": notif.message,
            "target_id": notif.target_id,
            "created_at": notif.created_at.isoformat(),
        },
    )