from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('ADMIN', 'System Administrator / Grid Operator'),
        ('USER', 'EV Fleet Driver / Station User'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=16, choices=ROLE_CHOICES, default='USER')
    phone = models.CharField(max_length=32, blank=True, default='')
    company = models.CharField(max_length=128, blank=True, default='EV Fleet')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_admin(self):
        return self.role == 'ADMIN' or self.user.is_staff or self.user.is_superuser

    def __str__(self):
        return f"{self.user.username} ({self.role})"
