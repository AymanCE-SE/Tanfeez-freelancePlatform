# backend/notification/utils.py
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Notification


def send_notification(recipient, notification_type, message, target_id=None, target_type=None):
    notif = Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        target_type=target_type,
        message=message,
        target_id=target_id,
    )

    # الجزء ده (البث الحي) اختياري بحت في وضع الـ polling — لو فشل لأي سبب
    # (مفيش Redis متظبطة، أو مفيش listener خالص)، الإشعار يبقى اتسجل في
    # الداتابيز بنجاح على أي حال، وده اللي الـ polling بيعتمد عليه فعليًا.
    try:
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"user_{recipient.id}_notifications",
                {
                    "type": "notify",
                    "kind": "notification",
                    "id": notif.id,
                    "notification_type": notif.notification_type,
                    "target_type": notif.target_type,
                    "message": notif.message,
                    "target_id": notif.target_id,
                    "created_at": notif.created_at.isoformat(),
                },
            )
    except Exception as e:
        print(f"⚠️ Live push skipped (non-fatal): {e}", flush=True)

    return notif