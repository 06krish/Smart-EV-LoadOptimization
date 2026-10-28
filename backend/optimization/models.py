from django.db import models
from stations.models import ChargingStation

class OptimizationResult(models.Model):
    ALGORITHM_CHOICES = [
        ('RULE_GREEDY', 'Stage 1-2: Rule-Based Priority & Greedy Allocator'),
        ('LP_PULP', 'Stage 3: PuLP Linear Programming Solver'),
    ]

    station = models.ForeignKey(ChargingStation, on_delete=models.CASCADE, related_name='optimization_results')
    run_at = models.DateTimeField(auto_now_add=True)
    algorithm_version = models.CharField(max_length=32, choices=ALGORITHM_CHOICES, default='LP_PULP')
    grid_capacity_kw = models.FloatField()
    base_load_kw = models.FloatField(default=0.0)
    total_demand_kw = models.FloatField()
    total_allocated_kw = models.FloatField()
    peak_load_before_kw = models.FloatField()
    peak_load_after_kw = models.FloatField()
    peak_reduction_percent = models.FloatField(default=0.0)
    cost_before_optimization = models.FloatField()
    cost_after_optimization = models.FloatField()
    estimated_savings = models.FloatField()
    savings_percent = models.FloatField(default=0.0)
    input_snapshot = models.JSONField(default=dict)
    output_allocations = models.JSONField(default=list)
    unmet_demand_kw = models.FloatField(default=0.0)
    violations = models.JSONField(default=list)

    class Meta:
        ordering = ['-run_at']

    def __str__(self):
        return f"Optimization #{self.id} on {self.station.name} [{self.algorithm_version}] - Saved ${self.estimated_savings:.2f}"


class Schedule(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active / In Effect'),
        ('DRAFT', 'Draft / Simulated'),
        ('ARCHIVED', 'Archived'),
    ]

    optimization_result = models.ForeignKey(OptimizationResult, on_delete=models.SET_NULL, null=True, blank=True, related_name='schedules')
    station = models.ForeignKey(ChargingStation, on_delete=models.CASCADE, related_name='schedules')
    title = models.CharField(max_length=128, default="Optimized Charging Dispatch Schedule")
    schedule_matrix = models.JSONField(default=list, help_text="Time slots and per-EV power allocations")
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Schedule #{self.id} for {self.station.name} ({self.status})"
