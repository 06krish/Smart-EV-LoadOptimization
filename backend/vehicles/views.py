from rest_framework import viewsets, filters
from accounts.permissions import IsAdminOrReadOnly
from .models import Vehicle
from .serializers import VehicleSerializer

class VehicleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    queryset = Vehicle.objects.all().order_by('-created_at')
    serializer_class = VehicleSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['identifier', 'make', 'model', 'owner_name']
    ordering_fields = ['identifier', 'battery_capacity_kwh', 'current_soc', 'priority', 'created_at']
