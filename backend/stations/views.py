from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ChargingStation, Charger
from .serializers import ChargingStationSerializer, ChargerSerializer

class ChargingStationViewSet(viewsets.ModelViewSet):
    queryset = ChargingStation.objects.all().order_by('id')
    serializer_class = ChargingStationSerializer

    @action(detail=True, methods=['get'])
    def load(self, request, pk=None):
        station = self.get_object()
        chargers = station.chargers.all()
        return Response({
            "station_id": station.id,
            "station_name": station.name,
            "grid_capacity_kw": station.grid_capacity_kw,
            "base_load_kw": station.base_load_kw,
            "current_load_kw": station.current_load_kw,
            "available_capacity_kw": station.available_capacity_kw,
            "utilization_percent": round((station.current_load_kw / station.grid_capacity_kw) * 100, 1) if station.grid_capacity_kw else 0,
            "total_chargers": chargers.count(),
            "active_chargers": chargers.filter(status__in=['CHARGING', 'OCCUPIED']).count(),
            "available_chargers": chargers.filter(status='AVAILABLE').count(),
            "fault_chargers": chargers.filter(status='FAULT').count()
        })


class ChargerViewSet(viewsets.ModelViewSet):
    queryset = Charger.objects.all().order_by('id')
    serializer_class = ChargerSerializer
    filterset_fields = ['station', 'status', 'connector_type']
