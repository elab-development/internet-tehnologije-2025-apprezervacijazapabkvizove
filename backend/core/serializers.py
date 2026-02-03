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

    def validate(self, data):
        table = data["table"]
        party_size = data["party_size"]

        if party_size > table.capacity:
            raise serializers.ValidationError(
                "Party size exceeds table capacity."
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
