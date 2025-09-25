from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import MedicineIntake
import requests

class Command(BaseCommand):
    help = 'Send medication reminders to users via SMS'

    def handle(self, *args, **options):
        now = timezone.now()
        window = now + timezone.timedelta(minutes=30)
        intakes = MedicineIntake.objects.filter(scheduled_time__gte=now, scheduled_time__lte=window, status='pending')
        for intake in intakes:
            user = intake.medicine.user
            if hasattr(user, 'sms_enabled') and user.sms_enabled and user.phone_number:
                payload = {
                    'phone': user.phone_number,
                    'message': f"Reminder: Take your medicine {intake.medicine.name} at {intake.scheduled_time.strftime('%H:%M')}"
                }
                try:
                    requests.post('http://localhost:8787/api/sms', json=payload)
                    intake.status = 'notified'
                    intake.save()
                    self.stdout.write(self.style.SUCCESS(f"SMS sent to {user.phone_number} for {intake.medicine.name}"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Failed to send SMS: {e}"))
