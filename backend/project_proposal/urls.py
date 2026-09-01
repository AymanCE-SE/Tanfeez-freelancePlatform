from django.urls import path
from .views import (
    AllProposalsView,
    ApplyToProjectView,
    DeleteProposalView,
    MyProposalsView,
    ApproveProposalView,
    ProposalsByProjectView,
    PublicProposalsByProjectView,
    UpdateProposalView,
    FinishProjectView,
)

urlpatterns = [
    path("all/", AllProposalsView.as_view(), name="all-proposals"),
    path("apply/", ApplyToProjectView.as_view()),
    path("proposals/<int:project_id>/", ProposalsByProjectView.as_view(), name="proposals-by-project"),
    path("public/<int:project_id>/", PublicProposalsByProjectView.as_view()),
    path("my-proposals/", MyProposalsView.as_view()),
    path("approve/<int:pk>/", ApproveProposalView.as_view()),
    path("finish/<int:pk>/", FinishProjectView.as_view()),
    path("update/<int:pk>/", UpdateProposalView.as_view(), name="update-proposal"),
    path("delete/<int:pk>/", DeleteProposalView.as_view()),
]