"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/user/", include("user.urls")),
    path("api/freelancers/", include("freelancer.urls")),
    path("api/clients/", include("client.urls")),
    path("api/skills/", include("skill.urls")),
    path("api/project/", include("project.urls")),
    path("api/service/", include("service.urls")),
    path("api/project-proposal/", include("project_proposal.urls")),
    path("api/service-proposal/", include("service_proposal.urls")),
    path("api/admin_dashboard/", include("admin_dashboard.urls")),
    path("api/chatroom/", include("chatroom.urls")),
    path("api/client-ratings/", include("client_rating.urls")),  
    path("api/", include("chatbot.urls")),
    path("api/notifications/", include("notification.urls")),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
