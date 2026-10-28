from django.db import models

class ChargingStation(models.Model):
    name = models.CharField(max_length=128, default="Metro Central EV Hub")
    location = models.CharField(max_length=256, default="Sector 62, Innovation Corridor")
    latitude = models.FloatField(default=28.6280)
    longitude = models.FloatField(default=77.3649)
    grid_capacity_kw = models.FloatField(default=100.0, help_text="Total transformer grid ceiling in kW")
    base_load_kw = models.FloatField(default=10.0, help_text="Facility non-EV background load in kW")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def current_load_kw(self):
        # Calculate load dynamically from active charging sessions
        from charging.models import ChargingSession
        active_sessions = ChargingSession.objects.filter(
            station=self,
            status__in=['CHARGING', 'OCCUPIED', 'WAITING']
        )
        ev_load = sum(s.allocated_power_kw for s in active_sessions)
        return round(self.base_load_kw + ev_load, 2)

    @property
    def available_capacity_kw(self):
        return round(max(0.0, self.grid_capacity_kw - self.current_load_kw), 2)

    @property
    def total_chargers_count(self):
        return self.chargers.count()

    @property
    def active_chargers_count(self):
        return self.chargers.filter(status__in=['CHARGING', 'OCCUPIED']).count()

    def __str__(self):
        return f"{self.name} (Cap: {self.grid_capacity_kw} kW)"


class Charger(models.Model):
    STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('OCCUPIED', 'Occupied'),
        ('CHARGING', 'Charging'),
        ('FAULT', 'Fault'),
        ('OFFLINE', 'Offline'),
    ]

    CONNECTOR_CHOICES = [
        ('CCS2', 'CCS Type 2 (DC Fast)'),
        ('CHAdeMO', 'CHAdeMO (DC)'),
        ('Type2', 'AC Type 2'),
        ('GB/T', 'GB/T Fast DC'),
    ]

    station = models.ForeignKey(ChargingStation, on_delete=models.CASCADE, related_name='chargers')
    identifier = models.CharField(max_length=64, help_text="Bay ID, e.g. BAY-01")
    connector_type = models.CharField(max_length=32, choices=CONNECTOR_CHOICES, default='CCS2')
    max_power_kw = models.FloatField(default=30.0, help_text="Max charger power output in kW")
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='AVAILABLE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('station', 'identifier')

    def __str__(self):
        return f"{self.station.name} - {self.identifier} ({self.status})"
