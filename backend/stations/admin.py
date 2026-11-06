from django.contrib import admin
from .models import ChargingStation, Charger

class ChargerInline(admin.TabularInline):
    model = Charger
    extra = 0
    fields = ('identifier', 'connector_type', 'max_power_kw', 'status')

@admin.register(ChargingStation)
class ChargingStationAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'grid_capacity_kw', 'base_load_kw', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'location')
    inlines = [ChargerInline]

@admin.register(Charger)
class ChargerAdmin(admin.ModelAdmin):
    list_display = ('identifier', 'station', 'connector_type', 'max_power_kw', 'status')
    list_filter = ('status', 'connector_type', 'station')
    search_fields = ('identifier', 'station__name')
