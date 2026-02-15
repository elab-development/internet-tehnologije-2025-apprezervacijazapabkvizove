from django.conf import settings
from django.db import models


class Table(models.Model):
    label = models.CharField(max_length=30, unique=True)
    capacity = models.PositiveSmallIntegerField()

    def __str__(self):
        return f"{self.label} ({self.capacity})"


class Quiz(models.Model):
    name = models.CharField(max_length=120)
    start_datetime = models.DateTimeField()

    def __str__(self):
        return f"{self.name} @ {self.start_datetime}"


class Reservation(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "aktivna", "Aktivna"
        CANCELLED = "neaktivna", "Neaktivna"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reservations"
    )
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="reservations"
    )
    table = models.ForeignKey(
        Table,
        on_delete=models.PROTECT,
        related_name="reservations"
    )

    team_name = models.CharField(max_length=80)
    party_size = models.PositiveSmallIntegerField()


    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["table", "quiz"], name="unique_table_per_quiz"),
            models.CheckConstraint(
                condition=models.Q(party_size__gt=0),
                name="party_size_gt_0",
            ),
        ]

    def __str__(self):
        return f"{self.team_name} - {self.table} ({self.status})"



class EmailLog(models.Model):
    reservation = models.ForeignKey(
        Reservation,
        on_delete=models.CASCADE,
        related_name="email_logs"
    )
    email_type = models.CharField(max_length=50)
    success = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.email_type} ({self.success})"


class ActivityLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="activity_logs"
    )
    action = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.action}"
    

class UserProfile(models.Model):
    class Role(models.TextChoices):
        GUEST = "guest", "Guest"
        USER = "user", "User"
        ADMIN = "admin", "Admin"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.GUEST,
    )

    def __str__(self):
        return f"{self.user.username} ({self.role})"
