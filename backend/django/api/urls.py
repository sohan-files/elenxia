from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MeViewSet,
    MedicineViewSet,
    MedicineScheduleViewSet,
    NotificationViewSet,
    MedicineIntakeViewSet,
    CaregiverViewSet,
    AuthViewSet,
)

router = DefaultRouter()
router.register(r'me', MeViewSet, basename='me')
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'medicines', MedicineViewSet, basename='medicine')
router.register(r'schedules', MedicineScheduleViewSet, basename='schedule')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'intakes', MedicineIntakeViewSet, basename='intake')
router.register(r'caregivers', CaregiverViewSet, basename='caregiver')

urlpatterns = [
    path('', include(router.urls)),
]

