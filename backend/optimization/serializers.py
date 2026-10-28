from rest_framework import serializers
from .models import OptimizationResult, Schedule

class OptimizationResultSerializer(serializers.ModelSerializer):
    station_name = serializers.ReadOnlyField(source='station.name')

    class Meta:
        model = OptimizationResult
        fields = '__all__'


class ScheduleSerializer(serializers.ModelSerializer):
    station_name = serializers.ReadOnlyField(source='station.name')

    class Meta:
        model = Schedule
        fields = '__all__'

