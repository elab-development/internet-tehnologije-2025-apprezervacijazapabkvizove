from django.conf import settings
from django.core.mail import send_mail


def send_reservation_confirmation_email(
    *,
    to_email: str,
    quiz_name: str,
    quiz_start,
    table_label: str,
    team_name: str,
    party_size: int,
    reservation_id: int,
):
    subject = f"Potvrda rezervacije — {quiz_name}"

    message = (
        f"Tvoja rezervacija je uspešno kreirana.\n\n"
        f"Kviz: {quiz_name}\n"
        f"Termin: {quiz_start}\n"
        f"Sto: {table_label}\n"
        f"Naziv ekipe: {team_name}\n"
        f"Broj članova: {party_size}\n"
        f"Vidimo se!\n"
        f"Egzibicija Pab Kviz"
    )

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[to_email],
        fail_silently=False,
    )
