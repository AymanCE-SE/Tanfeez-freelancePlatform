from django.urls import path
from .views import NotificationListView, MarkNotificationsReadView, MarkNotificationReadView

urlpatterns = [
    path("", NotificationListView.as_view()),
    path("mark-read/", MarkNotificationsReadView.as_view()),
    path("<int:notification_id>/mark-read/", MarkNotificationReadView.as_view()),
]