from rest_framework import serializers
from .models import ChargingSession, Reservation

class ChargingSessionSerializer(serializers.ModelSerializer):
    vehicle_identifier = serializers.ReadOnlyField(source='vehicle.identifier')
    vehicle_make = serializers.ReadOnlyField(source='vehicle.make')
    vehicle_model = serializers.ReadOnlyField(source='vehicle.model')
    vehicle_priority = serializers.ReadOnlyField(source='vehicle.priority')
    charger_identifier = serializers.ReadOnlyField(source='charger.identifier')
    station_name = serializers.ReadOnlyField(source='station.name')
    remaining_energy_needed_kwh = serializers.ReadOnlyField()

    class Meta:
        model = ChargingSession
        fields = '__all__'


class ReservationSerializer(serializers.ModelSerializer):
    vehicle_identifier = serializers.ReadOnlyField(source='vehicle.identifier')
    charger_identifier = serializers.ReadOnlyField(source='charger.identifier')

    class Meta:
        model = Reservation
        fields = '__all__'

