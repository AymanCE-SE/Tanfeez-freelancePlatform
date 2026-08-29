# backend/notification/views.py
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # only the logged-in user's own notifications — no id in the URL,
        # same reasoning as UserDeleteView earlier: never trust a client-supplied id here
        return Notification.objects.filter(recipient=self.request.user)


class MarkNotificationsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({"detail": "All notifications marked as read."})

class MarkNotificationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, notification_id):
        Notification.objects.filter(id=notification_id, recipient=request.user).update(is_read=True)
        return Response({"detail": "Notification marked as read."})