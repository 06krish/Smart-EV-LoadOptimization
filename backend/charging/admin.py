from django.contrib import admin
from .models import ChargingSession, Reservation

@admin.register(ChargingSession)
class ChargingSessionAdmin(admin.ModelAdmin):
    list_display = (
        'id', 
        'vehicle', 
        'charger', 
        'station', 
        'status', 
        'allocated_power_kw', 
        'current_soc', 
        'target_soc', 
        'energy_delivered_kwh', 
        'started_at'
    )
    list_filter = ('status', 'station', 'charger')
    search_fields = ('vehicle__identifier', 'charger__identifier', 'station__name')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('vehicle', 'charger', 'status', 'start_time', 'end_time', 'created_at')
    list_filter = ('status', 'charger')
    search_fields = ('vehicle__identifier', 'charger__identifier')
