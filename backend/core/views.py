from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .permissions import IsAuthenticatedOrReadOnly
from .models import Table, Quiz, Reservation, EmailLog, ActivityLog
from .serializers import (
    TableSerializer,
    QuizSerializer,
    ReservationSerializer,
    EmailLogSerializer,
    ActivityLogSerializer,
)


class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.all()
    serializer_class = TableSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ReservationViewSet(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    @action(
        detail=False,
        methods=["post"],
        url_path="suggest-table",
        permission_classes=[IsAuthenticated],
    )
    def suggest_table(self, request):
        """
        POST /api/reservations/suggest-table/
        body: { "quiz_id": 1, "party_size": 4 }

        Pravilo:
        - bira najmanji slobodan sto koji može da primi ekipu
        """

        quiz_id = request.data.get("quiz_id")
        party_size = request.data.get("party_size")

        # validacija party_size
        try:
            party_size = int(party_size)
        except (TypeError, ValueError):
            return Response(
                {"detail": "party_size mora biti broj."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if party_size < 1 or party_size > 7:
            return Response(
                {"detail": "party_size mora biti između 1 i 7."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not quiz_id:
            return Response(
                {"detail": "quiz_id je obavezan."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # proveri da li kviz postoji
        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response(
                {"detail": "Nepostojeći kviz."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # zauzeti stolovi za ovaj kviz (samo ACTIVE)
        taken_table_ids = Reservation.objects.filter(
            quiz=quiz,
            status=Reservation.Status.ACTIVE,
        ).values_list("table_id", flat=True)

        # kandidati: najmanji sto koji prima ekipu
        table = (
            Table.objects.filter(capacity__gte=party_size)
            .exclude(id__in=taken_table_ids)
            .order_by("capacity", "id")
            .first()
        )

        if not table:
            return Response(
                {
                    "available": False,
                    "detail": "Nažalost, nema slobodnih stolova za taj kviz.",
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "available": True,
                "quiz": {
                    "id": quiz.id,
                    "name": quiz.name,
                    "start_datetime": quiz.start_datetime,
                },
                "table": {
                    "id": table.id,
                    "label": table.label,
                    "capacity": table.capacity,
                },
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["post"],
        url_path="confirm",
        permission_classes=[IsAuthenticated],
    )
    def confirm(self, request):
        """
        POST /api/reservations/confirm/
        body: {
          "quiz_id": 1,
          "table_id": 2,
          "team_name": "Ekipa A",
          "party_size": 4
        }
        """

        quiz_id = request.data.get("quiz_id")
        table_id = request.data.get("table_id")
        team_name = (request.data.get("team_name") or "").strip()
        party_size = request.data.get("party_size")

        if not team_name:
            return Response(
                {"detail": "team_name je obavezan."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            party_size = int(party_size)
        except (TypeError, ValueError):
            return Response(
                {"detail": "party_size mora biti broj."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if party_size < 1 or party_size > 7:
            return Response(
                {"detail": "party_size mora biti između 1 i 7."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # učitaj quiz i table
        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response(
                {"detail": "Nepostojeći kviz."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            table = Table.objects.get(id=table_id)
        except Table.DoesNotExist:
            return Response(
                {"detail": "Nepostojeći sto."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # proveri zauzetost
        already_taken = Reservation.objects.filter(
            quiz=quiz,
            table=table,
            status=Reservation.Status.ACTIVE,
        ).exists()

        if already_taken:
            return Response(
                {"detail": "Sto je već zauzet za ovaj kviz."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reservation = Reservation.objects.create(
            user=request.user,
            quiz=quiz,
            table=table,
            team_name=team_name,
            party_size=party_size,
            status=Reservation.Status.ACTIVE,
        )

        return Response(
            {
                "message": "Rezervacija kreirana.",
                "reservation": {
                    "id": reservation.id,
                    "team_name": reservation.team_name,
                    "party_size": reservation.party_size,
                    "status": reservation.status,
                    "table": {
                        "id": table.id,
                        "label": table.label,
                        "capacity": table.capacity,
                    },
                    "quiz": {
                        "id": quiz.id,
                        "name": quiz.name,
                        "start_datetime": quiz.start_datetime,
                    },
                },
            },
            status=status.HTTP_201_CREATED,
        )

    def get_queryset(self):
        return Reservation.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class EmailLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EmailLog.objects.all()
    serializer_class = EmailLogSerializer
    permission_classes = [permissions.IsAdminUser]


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAdminUser]
