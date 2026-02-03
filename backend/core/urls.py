from django.urls import path, include
from rest_framework.routers import DefaultRouter
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
    path("", include(router.urls)),
]
