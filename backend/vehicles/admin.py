from django.contrib import admin
from .models import Vehicle

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = (
        'identifier', 
        'make', 
        'model', 
        'current_soc', 
        'target_soc', 
        'battery_capacity_kwh', 
        'max_charge_power_kw', 
        'priority', 
        'departure_deadline'
    )
    list_filter = ('priority', 'make', 'model')
    search_fields = ('identifier', 'make', 'model', 'owner_name')
    ordering = ('-priority', 'departure_deadline')
    readonly_fields = ('created_at', 'updated_at')
