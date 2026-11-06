from django.contrib import admin
from .models import EnergyReading

@admin.register(EnergyReading)
class EnergyReadingAdmin(admin.ModelAdmin):
    list_display = ('station', 'charger', 'power_kw', 'cumulative_energy_kwh', 'reading_type', 'timestamp')
    list_filter = ('reading_type', 'station')
    search_fields = ('station__name', 'charger__identifier')
    date_hierarchy = 'timestamp'
