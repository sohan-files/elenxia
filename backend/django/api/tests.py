from django.test import TestCase
from .models import Medicine, User

class MedicineModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.medicine = Medicine.objects.create(user=self.user, name='Aspirin', dosage='100mg')

    def test_medicine_creation(self):
        self.assertEqual(self.medicine.name, 'Aspirin')
        self.assertEqual(self.medicine.dosage, '100mg')
        self.assertEqual(self.medicine.user.username, 'testuser')
