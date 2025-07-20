from django.urls import path
from .views import (
    CreateServiceView,
    MyServicesView,
    ServiceByTagView,
    ServiceListView,
    ServiceDetailView,
    ServiceUpdateView,
    ServiceDeleteView,
    ServicesByUserIdView,
    LatestServicesView,
)

urlpatterns = [
    path("", ServiceListView.as_view(), name="service-list"),
    path("create/", CreateServiceView.as_view(), name="service-create"),
    path("<int:id>/", ServiceDetailView.as_view(), name="service-detail"),
    path("update/<int:id>/", ServiceUpdateView.as_view(), name="service-update"),
    path("delete/<int:id>/", ServiceDeleteView.as_view(), name="service-delete"),
    # Extra Routes for service by freelancer
    # List services by a tag (pass tag as query param)
    path("by-tag/", ServiceByTagView.as_view()),  # remove <str:tag>
    # List all services by the logged-in freelancer
    path("personal-services/", MyServicesView.as_view(), name="my-services"),
    # List all services by any user ID (freelancer)
    path(
        "user/<int:user_id>/",
        ServicesByUserIdView.as_view(),
        name="services-by-user",
    ),
    path("latest/", LatestServicesView.as_view(), name="latest-services"),
]
