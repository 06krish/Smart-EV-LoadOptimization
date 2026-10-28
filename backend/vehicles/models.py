from django.db import models
from django.utils import timezone
from datetime import timedelta

class Vehicle(models.Model):
    PRIORITY_CHOICES = [
        (1, 'Low (1)'),
        (2, 'Medium (2)'),
        (3, 'High (3)'),
        (4, 'Critical (4)'),
    ]

    identifier = models.CharField(max_length=64, unique=True, help_text="Vehicle License Plate or Fleet ID")
    make = models.CharField(max_length=64, default="Tesla")
    model = models.CharField(max_length=64, default="Model 3")
    battery_capacity_kwh = models.FloatField(default=60.0, help_text="Total battery capacity in kWh")
    max_charge_power_kw = models.FloatField(default=22.0, help_text="Max charging acceptance power in kW")
    current_soc = models.FloatField(default=20.0, help_text="Current battery level (0-100%)")
    target_soc = models.FloatField(default=80.0, help_text="Target battery level (0-100%)")
    priority = models.IntegerField(default=2, choices=PRIORITY_CHOICES, help_text="Priority level (1=Low, 4=Critical)")
    arrival_time = models.DateTimeField(default=timezone.now)
    departure_deadline = models.DateTimeField(null=True, blank=True)
    owner_name = models.CharField(max_length=128, default="Fleet Logistics")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.departure_deadline:
            self.departure_deadline = timezone.now() + timedelta(hours=4)
        super().save(*args, **kwargs)

    @property
    def required_energy_kwh(self):
        soc_deficit = max(0.0, self.target_soc - self.current_soc)
        return round(self.battery_capacity_kwh * (soc_deficit / 100.0), 2)

    @property
    def time_to_departure_hours(self):
        if not self.departure_deadline:
            return 4.0
        diff = (self.departure_deadline - timezone.now()).total_seconds() / 3600.0
        return max(0.1, round(diff, 2))

    def __str__(self):
        return f"{self.identifier} ({self.make} {self.model}) - SOC: {self.current_soc}%"
