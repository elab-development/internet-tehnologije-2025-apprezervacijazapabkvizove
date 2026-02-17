from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Table, Quiz, Reservation, EmailLog, ActivityLog

User = get_user_model()


class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = "__all__"


class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = "__all__"


class ReservationSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Reservation
        fields = "__all__"
        read_only_fields = ("status", "created_at")
        validators = []  # BITNO: gasi DRF auto UniqueConstraint validator (koji puca na PATCH bez status-a)

    def validate(self, data):
        """
        Validacija koja radi i za POST i za PATCH:
        - party_size <= capacity
        - (quiz, table) mora biti jedinstveno za aktivne rezervacije
        """

        # finalne vrednosti posle PATCH-a (ako nešto nije poslato, uzmi sa instance)
        table = data.get("table") or getattr(self.instance, "table", None)
        quiz = data.get("quiz") or getattr(self.instance, "quiz", None)
        party_size = data.get("party_size") or getattr(self.instance, "party_size", None)

        # status je read_only pa kod PATCH-a neće stići u data, zato uzimamo sa instance
        status_value = getattr(self.instance, "status", None)
        if "status" in data:
            status_value = data.get("status")

        # 1) Kapacitet stola
        if table is not None and party_size is not None:
            if party_size > table.capacity:
                raise serializers.ValidationError(
                    {"party_size": "Broj clanova prelazi dozvoljen broj ljudi za stolom"}
                )

        # 2) Unique pravilo samo za aktivne
        # (pretpostavljam da ti je string statusa "aktivna" jer tako prikazuješ na frontu)
        ACTIVE_VALUE = "aktivna"

        if quiz is not None and table is not None and status_value == ACTIVE_VALUE:
            qs = Reservation.objects.filter(
                quiz=quiz,
                table=table,
                status=ACTIVE_VALUE,
            )
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)

            if qs.exists():
                raise serializers.ValidationError(
                    {"table": "Ovaj sto je vec rezervisan za izabrani kviz."}
                )

        return data


class EmailLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailLog
        fields = "__all__"
        read_only_fields = ("created_at",)


class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = "__all__"
        read_only_fields = ("created_at",)
