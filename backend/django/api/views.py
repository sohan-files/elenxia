from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from .models import Medicine, MedicineSchedule, Notification, MedicineIntake, Caregiver
from .serializers import (
    UserSerializer,
    MedicineSerializer,
    MedicineScheduleSerializer,
    NotificationSerializer,
    MedicineIntakeSerializer,
    CaregiverSerializer,
    SignupSerializer,
)

User = get_user_model()


class MeViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class AuthViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=["post"], url_path="signup")
    def signup(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                return Response({
                    "message": "Account created successfully",
                    "user": UserSerializer(user).data
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({
                    "error": f"Failed to create account: {str(e)}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"], url_path="login")
    def login(self, request):
        username = request.data.get("username", "").strip().lower()
        password = request.data.get("password", "")
        
        if not username or not password:
            return Response({
                "error": "Username and password are required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data
            })
        else:
            return Response({
                "error": "Invalid credentials"
            }, status=status.HTTP_401_UNAUTHORIZED)


class MedicineViewSet(viewsets.ModelViewSet):
    serializer_class = MedicineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Medicine.objects.filter(user=self.request.user).prefetch_related('schedules').order_by("-created_at")

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
        return queryset.order_by('time_of_day')

    def perform_create(self, serializer):
        # Ensure the medicine belongs to the current user
        medicine = serializer.validated_data['medicine']
        if medicine.user != self.request.user:
            raise permissions.PermissionDenied("You can only create schedules for your own medicines")
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
        try:
            notif = self.get_object()
            notif.status = "read"
            notif.save()
            return Response(NotificationSerializer(notif).data)
        except Exception as e:
            return Response({
                "error": f"Failed to mark notification as read: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def create_test_notification(self, request):
        """Create a test notification for the current user"""
        try:
            notification = Notification.objects.create(
                user=request.user,
                title="Test Notification",
                message="This is a test notification to verify the system is working correctly.",
                type="test",
                status="pending",
                scheduled_for=timezone.now()
            )
            return Response(NotificationSerializer(notification).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                "error": f"Failed to create test notification: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MedicineIntakeViewSet(viewsets.ModelViewSet):
    serializer_class = MedicineIntakeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MedicineIntake.objects.filter(medicine__user=self.request.user).order_by("-scheduled_time")

    def perform_create(self, serializer):
        # Ensure the medicine belongs to the current user
        medicine = serializer.validated_data['medicine']
        if medicine.user != self.request.user:
            raise permissions.PermissionDenied("You can only create intakes for your own medicines")
        serializer.save()


class CaregiverViewSet(viewsets.ModelViewSet):
    serializer_class = CaregiverSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Caregiver.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)