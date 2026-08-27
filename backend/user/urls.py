from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("user-profile/", UserMeView.as_view(), name="user-me"),
    path("user-profile/<int:id>/", UserDetailByIdView.as_view(), name="user-detail"),
    path("all/", UserListView.as_view(), name="get-users"),
    path("update/", UserUpdateView.as_view(), name="update-user"),
    path("delete/", UserDeleteView.as_view(), name="delete-user"),
    ## Extra views for user password and photo update
    path("password/update/", UserPasswordUpdateView.as_view(), name="update-password"),
    path("photo/update/", UserPhotoUpdateView.as_view(), name="update-photo"),
]
