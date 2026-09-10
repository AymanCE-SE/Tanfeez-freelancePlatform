from django.urls import path
from .views import (
    ClientRatingCreateView, ClientRatingDetailView, ClientRatingUpdateView,
    ClientRatingDeleteView, ClientRatingListView, FreelancerRatingSummaryView,
    EngagementRatingCreateView, EngagementRatingListView, EngagementRatingSummaryView
)

urlpatterns = [
    path("create/<int:project_id>/<int:freelancer_id>/", ClientRatingCreateView.as_view(), name="client-rating-create"),
    path("detail/<int:rating_id>/", ClientRatingDetailView.as_view(), name="client-rating-detail"),
    path("update/<int:rating_id>/", ClientRatingUpdateView.as_view(), name="client-rating-update"),
    path("delete/<int:rating_id>/", ClientRatingDeleteView.as_view(), name="client-rating-delete"),
    path("list/<int:project_id>/", ClientRatingListView.as_view(), name="client-rating-list"),
    path("summary/<int:freelancer_id>/", FreelancerRatingSummaryView.as_view(), name="freelancer-rating-summary"),
    path("engagement/create/", EngagementRatingCreateView.as_view()),
    path("engagement/list/<int:user_id>/", EngagementRatingListView.as_view()),
    path("engagement/summary/<int:user_id>/", EngagementRatingSummaryView.as_view()),
]