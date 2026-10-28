from django.db import models
from django.utils import timezone

class Tariff(models.Model):
    TARIFF_TYPE_CHOICES = [
        ('OFF_PEAK', 'Off-Peak (Eco Discount)'),
        ('NORMAL', 'Standard Normal'),
        ('PEAK', 'Peak Demand Surcharge'),
    ]

    name = models.CharField(max_length=64, default="Standard Tariff")
    tariff_type = models.CharField(max_length=32, choices=TARIFF_TYPE_CHOICES, default='NORMAL')
    price_per_kwh = models.FloatField(default=0.18, help_text="Cost per kWh in USD ($)")
    start_hour = models.IntegerField(default=0, help_text="Start hour of day (0-23)")
    end_hour = models.IntegerField(default=24, help_text="End hour of day (1-24)")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_active_at(self, hour: int) -> bool:
        if self.start_hour <= self.end_hour:
            return self.start_hour <= hour < self.end_hour
        else: # spans midnight
            return hour >= self.start_hour or hour < self.end_hour

    @classmethod
    def get_rate_for_hour(cls, hour: int) -> float:
        active_tariffs = cls.objects.filter(is_active=True)
        for tariff in active_tariffs:
            if tariff.is_active_at(hour):
                return tariff.price_per_kwh
        return 0.20 # Fallback default rate

    def __str__(self):
        return f"{self.name} [{self.tariff_type}] - ${self.price_per_kwh}/kWh ({self.start_hour}:00 - {self.end_hour}:00)"
