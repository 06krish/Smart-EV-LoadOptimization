from rest_framework import serializers
from .models import EnergyReading

class EnergyReadingSerializer(serializers.ModelSerializer):
    station_name = serializers.ReadOnlyField(source='station.name')
    charger_identifier = serializers.ReadOnlyField(source='charger.identifier')

    class Meta:
        model = EnergyReading
        fields = '__all__'

