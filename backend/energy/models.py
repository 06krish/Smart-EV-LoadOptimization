from django.db import models
from django.utils import timezone
from stations.models import ChargingStation, Charger
from charging.models import ChargingSession

class EnergyReading(models.Model):
    READING_TYPE_CHOICES = [
        ('SESSION', 'Session Meter Reading'),
        ('STATION_BASE', 'Station Base Infrastructure Load'),
        ('GRID_TOTAL', 'Grid Total Load Snapshot'),
    ]

    station = models.ForeignKey(ChargingStation, on_delete=models.CASCADE, related_name='energy_readings')
    charger = models.ForeignKey(Charger, on_delete=models.SET_NULL, null=True, blank=True, related_name='energy_readings')
    session = models.ForeignKey(ChargingSession, on_delete=models.SET_NULL, null=True, blank=True, related_name='energy_readings')
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    power_kw = models.FloatField(default=0.0)
    cumulative_energy_kwh = models.FloatField(default=0.0)
    reading_type = models.CharField(max_length=32, choices=READING_TYPE_CHOICES, default='SESSION')

    class Meta:
        indexes = [
            models.Index(fields=['station', 'timestamp']),
        ]
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.station.name} | {self.timestamp.strftime('%H:%M:%S')} - {self.power_kw} kW ({self.reading_type})"
