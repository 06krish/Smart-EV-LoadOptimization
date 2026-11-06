from django.contrib import admin
from .models import OptimizationResult, Schedule

@admin.register(OptimizationResult)
class OptimizationResultAdmin(admin.ModelAdmin):
    list_display = (
        'id', 
        'station', 
        'algorithm_version', 
        'total_demand_kw', 
        'total_allocated_kw', 
        'peak_load_before_kw', 
        'peak_load_after_kw', 
        'estimated_savings', 
        'savings_percent', 
        'run_at'
    )
    list_filter = ('algorithm_version', 'station', 'run_at')
    search_fields = ('station__name',)
    readonly_fields = ('run_at',)

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('title', 'station', 'status', 'created_at')
    list_filter = ('status', 'station')
    search_fields = ('title', 'station__name')
