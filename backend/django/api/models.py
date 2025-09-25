from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    sms_enabled = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return self.username


class Medicine(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="medicines")
    name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100)
    med_type = models.CharField(max_length=50)
    remaining_count = models.IntegerField(default=0)
    refill_threshold = models.IntegerField(default=0)
    instructions = models.TextField(blank=True, null=True)
    side_effects = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.dosage}"

class MedicineSchedule(models.Model):
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name="schedules")
    time_of_day = models.CharField(max_length=5)  # HH:MM
    days_of_week = models.JSONField(default=list)  # [1..7]
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.medicine.name} at {self.time_of_day}"

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=50)
    status = models.CharField(max_length=20, default="pending")
    scheduled_for = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"

class MedicineIntake(models.Model):
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name="intakes")
    scheduled_time = models.DateTimeField()
    actual_time = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=20, default="pending")  # pending|taken|missed|skipped
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.medicine.name} - {self.status}"

class Caregiver(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="caregivers")
    name = models.CharField(max_length=200)
    relationship = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    notifications_enabled = models.BooleanField(default=True)
    emergency_contact = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.user.username}"
