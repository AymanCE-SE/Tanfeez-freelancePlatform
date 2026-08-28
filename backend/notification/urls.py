from django.urls import path
from .views import NotificationListView, MarkNotificationsReadView

urlpatterns = [
    path("", NotificationListView.as_view()),
    path("mark-read/", MarkNotificationsReadView.as_view()),
]