from rest_framework import serializers
from .models import ChargingStation, Charger

class ChargerSerializer(serializers.ModelSerializer):
    station_name = serializers.ReadOnlyField(source='station.name')

    class Meta:
        model = Charger
        fields = '__all__'

    def validate_max_power_kw(self, value):
        if value <= 0:
            raise serializers.ValidationError("Charger maximum power must be greater than zero.")
        if value > 350:
            raise serializers.ValidationError("Charger power exceeds commercial ultra-fast limit (350 kW).")
        return value


class ChargingStationSerializer(serializers.ModelSerializer):
    chargers = ChargerSerializer(many=True, read_only=True)
    current_load_kw = serializers.ReadOnlyField()
    available_capacity_kw = serializers.ReadOnlyField()
    total_chargers_count = serializers.ReadOnlyField()
    active_chargers_count = serializers.ReadOnlyField()

    class Meta:
        model = ChargingStation
        fields = '__all__'

    def validate_grid_capacity_kw(self, value):
        if value <= 0:
            raise serializers.ValidationError("Grid capacity must be positive.")
        return value

    def validate(self, data):
        grid_capacity = data.get('grid_capacity_kw', getattr(self.instance, 'grid_capacity_kw', 100))
        base_load = data.get('base_load_kw', getattr(self.instance, 'base_load_kw', 0))
        if base_load >= grid_capacity:
            raise serializers.ValidationError({"base_load_kw": "Base load cannot equal or exceed total grid capacity."})
        return data

