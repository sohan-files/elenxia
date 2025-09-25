from django.contrib import admin
from .models import User, Medicine, MedicineSchedule, Notification, MedicineIntake, Caregiver

admin.site.register(User)
admin.site.register(Medicine)
admin.site.register(MedicineSchedule)
admin.site.register(Notification)
admin.site.register(MedicineIntake)
admin.site.register(Caregiver)
