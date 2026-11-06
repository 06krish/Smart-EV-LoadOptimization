from django.contrib import admin
from .models import Tariff

@admin.register(Tariff)
class TariffAdmin(admin.ModelAdmin):
    list_display = ('name', 'tariff_type', 'price_per_kwh', 'start_hour', 'end_hour', 'is_active')
    list_filter = ('tariff_type', 'is_active')
    search_fields = ('name',)
