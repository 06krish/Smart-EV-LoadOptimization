from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import EnergyReading
from .serializers import EnergyReadingSerializer

class EnergyReadingViewSet(viewsets.ModelViewSet):
    queryset = EnergyReading.objects.all().order_by('-timestamp')
    serializer_class = EnergyReadingSerializer

    @action(detail=False, methods=['get'])
    def history(self, request):
        station_id = request.query_params.get('station_id')
        days = int(request.query_params.get('days', 1))
        cutoff = timezone.now() - timedelta(days=days)
        qs = EnergyReading.objects.filter(timestamp__gte=cutoff)
        if station_id:
            qs = qs.filter(station_id=station_id)
        
        # Limit to latest 100 points for responsiveness
        recent_readings = qs.order_by('timestamp')[:100]
        serializer = EnergyReadingSerializer(recent_readings, many=True)
        return Response(serializer.data)
