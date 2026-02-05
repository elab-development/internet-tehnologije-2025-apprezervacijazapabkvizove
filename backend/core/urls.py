from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .auth_views import RegisterView, LoginView, LogoutView
from .views import (
    TableViewSet,
    QuizViewSet,
    ReservationViewSet,
    EmailLogViewSet,
    ActivityLogViewSet,
)

router = DefaultRouter()
router.register("tables", TableViewSet)
router.register("quizzes", QuizViewSet)
router.register("reservations", ReservationViewSet, basename="reservation")
router.register("email-logs", EmailLogViewSet)
router.register("activity-logs", ActivityLogViewSet)

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("", include(router.urls)),
]
