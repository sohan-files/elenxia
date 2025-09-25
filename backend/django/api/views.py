from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .models import Medicine, MedicineSchedule, Notification, MedicineIntake, Caregiver
from .serializers import (
    UserSerializer,
    MedicineSerializer,
    MedicineScheduleSerializer,
    NotificationSerializer,
    MedicineIntakeSerializer,
    CaregiverSerializer,
)


class MeViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        return Response(UserSerializer(request.user).data)


class MedicineViewSet(viewsets.ModelViewSet):
    serializer_class = MedicineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Medicine.objects.filter(user=self.request.user).order_by("-id")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MedicineScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = MedicineScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = MedicineSchedule.objects.filter(medicine__user=self.request.user)
        medicine_id = self.request.query_params.get('medicine', None)
        if medicine_id is not None:
            queryset = queryset.filter(medicine_id=medicine_id)
        return queryset

    def perform_create(self, serializer):
        # Ensure the medicine belongs to the current user
        medicine = serializer.validated_data['medicine']
        if medicine.user != self.request.user:
            raise PermissionError("You can only create schedules for your own medicines")
        serializer.save()

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.status = "read"
        notif.save()
        return Response(NotificationSerializer(notif).data)

    @action(detail=False, methods=['post'])
    def create_test_notification(self, request):
        """Create a test notification for the current user"""
        notification = Notification.objects.create(
            user=request.user,
            title="Test Notification",
            message="This is a test notification to verify the system is working.",
            type="test",
            status="pending"
        )
        return Response(NotificationSerializer(notification).data, status=status.HTTP_201_CREATED)


class MedicineIntakeViewSet(viewsets.ModelViewSet):
    serializer_class = MedicineIntakeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MedicineIntake.objects.filter(medicine__user=self.request.user).order_by("-scheduled_time")


class CaregiverViewSet(viewsets.ModelViewSet):
    serializer_class = CaregiverSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Caregiver.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AuthViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=["post"], url_path="signup")
    def signup(self, request):
        email = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")
        full_name = request.data.get("full_name", "")
        first_name, last_name = full_name.split(" ", 1) if " " in full_name else (full_name, "")
        if not email or not password:
            return Response({"error": "email and password required"}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=email).exists():
            return Response({"error": "account already exists"}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create(
            username=email,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=make_password(password),
        )
        return Response(UserSerializer(user).data)

