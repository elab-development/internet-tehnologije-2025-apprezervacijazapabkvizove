from django.db import IntegrityError
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .emailing import send_reservation_confirmation_email
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
        quiz_id = request.data.get("quiz_id")
        party_size = request.data.get("party_size")

        # robustno parsiranje party_size (može doći kao string)
        try:
            party_size = int(party_size)
        except (TypeError, ValueError):
            return Response(
                {"detail": "party_size mora biti ceo broj."},
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

        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response(
                {"detail": "Nepostojeći kviz."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        taken_table_ids = Reservation.objects.filter(
            quiz=quiz,
            status=Reservation.Status.ACTIVE,
        ).values_list("table_id", flat=True)

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
        quiz_id = request.data.get("quiz_id")
        table_id = request.data.get("table_id")
        team_name = (request.data.get("team_name") or "").strip()
        party_size = request.data.get("party_size")

        if not team_name:
            return Response(
                {"detail": "team_name je obavezan."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # robustno parsiranje party_size (može doći kao string)
        try:
            party_size = int(party_size)
        except (TypeError, ValueError):
            return Response(
                {"detail": "party_size mora biti ceo broj."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if party_size < 1 or party_size > 7:
            return Response(
                {"detail": "party_size mora biti između 1 i 7."},
                status=status.HTTP_400_BAD_REQUEST,
            )

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

        # Kreiranje rezervacije + zaštita od race condition (unique constraint)
        try:
            reservation = Reservation.objects.create(
                user=request.user,
                quiz=quiz,
                table=table,
                team_name=team_name,
                party_size=party_size,
                status=Reservation.Status.ACTIVE,
            )
        except IntegrityError:
            return Response(
                {"detail": "Sto je upravo zauzet. Izaberi drugi sto."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Email potvrda (ne ruši rezervaciju ako slanje padne)
        try:
            to_email = (request.user.email or "").strip()
            if not to_email:
                raise ValueError("User email je prazan.")
            
            print("TO_EMAIL =", repr(request.user.email), "USERNAME =", repr(request.user.username))

            send_reservation_confirmation_email(
                to_email=to_email,
                quiz_name=quiz.name,
                quiz_start=quiz.start_datetime,
                table_label=table.label,
                team_name=reservation.team_name,
                party_size=reservation.party_size,
                reservation_id=reservation.id,
            )

            EmailLog.objects.create(
                reservation=reservation,
                email_type="reservation_confirmation",
                success=True,
            )
        except Exception as e:
            print("EMAIL SEND ERROR:", repr(e))
            EmailLog.objects.create(
                reservation=reservation,
                email_type="reservation_confirmation",
                success=False,
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
