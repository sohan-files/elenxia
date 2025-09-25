from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Medicine, MedicineSchedule, Notification, MedicineIntake, Caregiver

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'sms_enabled']
        read_only_fields = ['id']


class MedicineScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicineSchedule
        fields = ['id', 'medicine', 'time_of_day', 'days_of_week', 'is_active']


class MedicineSerializer(serializers.ModelSerializer):
    schedules = MedicineScheduleSerializer(many=True, read_only=True)
    type = serializers.CharField(source='med_type')  # Map 'type' to 'med_type'
    
    class Meta:
        model = Medicine
        fields = ['id', 'name', 'dosage', 'type', 'remaining_count', 'refill_threshold', 
                 'instructions', 'side_effects', 'created_at', 'schedules']
        read_only_fields = ['id', 'created_at', 'schedules']

    def create(self, validated_data):
        # Handle the type -> med_type mapping
        if 'med_type' in validated_data:
            validated_data['med_type'] = validated_data.pop('med_type')
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Handle the type -> med_type mapping
        if 'med_type' in validated_data:
            validated_data['med_type'] = validated_data.pop('med_type')
        return super().update(instance, validated_data)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'type', 'status', 'scheduled_for', 'created_at']
        read_only_fields = ['id', 'created_at']


class MedicineIntakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicineIntake
        fields = ['id', 'medicine', 'scheduled_time', 'actual_time', 'status', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']


class CaregiverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Caregiver
        fields = ['id', 'name', 'relationship', 'phone_number', 'email', 
                 'notifications_enabled', 'emergency_contact', 'created_at']
        read_only_fields = ['id', 'created_at']


class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6)
    full_name = serializers.CharField(max_length=200)
    phone_number = serializers.CharField(max_length=15, required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(username=value.lower()).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data['password']
        full_name = validated_data['full_name']
        phone_number = validated_data.get('phone_number', '')
        
        # Split full name into first and last name
        name_parts = full_name.strip().split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number
        )
        return user