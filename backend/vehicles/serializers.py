from rest_framework import serializers
from .models import Vehicle

class VehicleSerializer(serializers.ModelSerializer):
    required_energy_kwh = serializers.ReadOnlyField()
    time_to_departure_hours = serializers.ReadOnlyField()

    class Meta:
        model = Vehicle
        fields = '__all__'

    def validate(self, data):
        current_soc = data.get('current_soc', getattr(self.instance, 'current_soc', 0))
        target_soc = data.get('target_soc', getattr(self.instance, 'target_soc', 100))
        battery_capacity = data.get('battery_capacity_kwh', getattr(self.instance, 'battery_capacity_kwh', 1))
        max_power = data.get('max_charge_power_kw', getattr(self.instance, 'max_charge_power_kw', 1))

        if not (0 <= current_soc <= 100):
            raise serializers.ValidationError({"current_soc": "Current SOC must be between 0 and 100%."})
        if not (0 <= target_soc <= 100):
            raise serializers.ValidationError({"target_soc": "Target SOC must be between 0 and 100%."})
        if current_soc > target_soc:
            raise serializers.ValidationError({"target_soc": "Target SOC should be greater than or equal to current SOC."})
        if battery_capacity <= 0:
            raise serializers.ValidationError({"battery_capacity_kwh": "Battery capacity must be positive."})
        if max_power <= 0:
            raise serializers.ValidationError({"max_charge_power_kw": "Max charge power must be positive."})
        return data

