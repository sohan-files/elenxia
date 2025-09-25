from celery import shared_task
from django.utils import timezone
from api.models import MedicineIntake, Caregiver
import requests

@shared_task
def send_medication_reminders():
    now = timezone.now()
    window = now + timezone.timedelta(minutes=30)
    intakes = MedicineIntake.objects.filter(time__gte=now, time__lte=window, notified=False)
    for intake in intakes:
        user = intake.user
        if hasattr(user, 'sms_enabled') and user.sms_enabled and user.phone_number:
            payload = {
                'phone': user.phone_number,
                'message': f"Reminder: Take your medicine {intake.medicine.name} at {intake.time.strftime('%H:%M')}"
            }
            # Call Node.js SMS service
            try:
                requests.post('http://localhost:3000/sms', json=payload)
                intake.notified = True
                intake.save()
            except Exception as e:
                pass
