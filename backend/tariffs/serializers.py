from rest_framework import serializers
from .models import Tariff

class TariffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tariff
        fields = '__all__'

    def validate_price_per_kwh(self, value):
        if value < 0:
            raise serializers.ValidationError("Price per kWh cannot be negative.")
        return value

    def validate(self, data):
        start = data.get('start_hour', getattr(self.instance, 'start_hour', 0))
        end = data.get('end_hour', getattr(self.instance, 'end_hour', 24))
        if not (0 <= start <= 24) or not (0 <= end <= 24):
            raise serializers.ValidationError("Hours must be between 0 and 24.")
        return data

