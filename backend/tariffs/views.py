from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Tariff
from .serializers import TariffSerializer

class TariffViewSet(viewsets.ModelViewSet):
    queryset = Tariff.objects.all().order_by('start_hour')
    serializer_class = TariffSerializer

    @action(detail=False, methods=['get'])
    def current(self, request):
        now_hour = timezone.now().hour
        current_rate = Tariff.get_rate_for_hour(now_hour)
        matching_tariff = None
        for t in Tariff.objects.filter(is_active=True):
            if t.is_active_at(now_hour):
                matching_tariff = TariffSerializer(t).data
                break
        return Response({
            "current_hour": now_hour,
            "rate_per_kwh": current_rate,
            "tariff": matching_tariff
        })
