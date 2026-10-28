from django.db import models
from django.utils import timezone
from vehicles.models import Vehicle
from stations.models import ChargingStation, Charger

class ChargingSession(models.Model):
    STATUS_CHOICES = [
        ('RESERVED', 'Reserved'),
        ('WAITING', 'Waiting for Allocation'),
        ('CHARGING', 'Actively Charging'),
        ('PAUSED', 'Paused (Peak Curtailment)'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('FAILED', 'Failed / Fault'),
    ]

    ALLOWED_TRANSITIONS = {
        'RESERVED': ['WAITING', 'CANCELLED', 'FAILED'],
        'WAITING': ['CHARGING', 'PAUSED', 'CANCELLED'],
        'CHARGING': ['PAUSED', 'COMPLETED', 'CANCELLED', 'FAILED'],
        'PAUSED': ['CHARGING', 'COMPLETED', 'CANCELLED', 'FAILED'],
        'COMPLETED': [],
        'CANCELLED': [],
        'FAILED': [],
    }

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='charging_sessions')
    charger = models.ForeignKey(Charger, on_delete=models.CASCADE, related_name='charging_sessions')
    station = models.ForeignKey(ChargingStation, on_delete=models.CASCADE, related_name='charging_sessions')
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='WAITING')
    start_soc = models.FloatField(default=20.0)
    current_soc = models.FloatField(default=20.0)
    target_soc = models.FloatField(default=80.0)
    allocated_power_kw = models.FloatField(default=0.0)
    energy_delivered_kwh = models.FloatField(default=0.0)
    total_cost = models.FloatField(default=0.0)
    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    estimated_completion_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def transition(self, new_status, reason=""):
        if new_status == self.status:
            return True
        allowed = self.ALLOWED_TRANSITIONS.get(self.status, [])
        if new_status not in allowed:
            raise ValueError(f"Invalid state transition from {self.status} to {new_status}. Allowed: {allowed}")
        
        old_status = self.status
        self.status = new_status
        if new_status == 'COMPLETED':
            self.completed_at = timezone.now()
            self.allocated_power_kw = 0.0
            self.charger.status = 'AVAILABLE'
            self.charger.save()
        elif new_status == 'CHARGING':
            self.charger.status = 'CHARGING'
            self.charger.save()
        elif new_status == 'PAUSED':
            self.allocated_power_kw = 0.0
            self.charger.status = 'OCCUPIED'
            self.charger.save()
        elif new_status in ['CANCELLED', 'FAILED']:
            self.allocated_power_kw = 0.0
            self.charger.status = 'AVAILABLE' if new_status == 'CANCELLED' else 'FAULT'
            self.charger.save()
        self.save()
        return True

    @property
    def remaining_energy_needed_kwh(self):
        deficit = max(0.0, self.target_soc - self.current_soc)
        return round(self.vehicle.battery_capacity_kwh * (deficit / 100.0), 2)

    def __str__(self):
        return f"Session #{self.id} | {self.vehicle.identifier} at {self.charger.identifier} [{self.status} - {self.allocated_power_kw} kW]"


class Reservation(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending Confirmation'),
        ('CONFIRMED', 'Confirmed'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('EXPIRED', 'Expired'),
    ]

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='reservations')
    charger = models.ForeignKey(Charger, on_delete=models.CASCADE, related_name='reservations')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='CONFIRMED')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reservation {self.vehicle.identifier} -> {self.charger.identifier} ({self.start_time} to {self.end_time})"
