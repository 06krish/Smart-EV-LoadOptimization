from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ChargingSession, Reservation
from .serializers import ChargingSessionSerializer, ReservationSerializer

class ChargingSessionViewSet(viewsets.ModelViewSet):
    queryset = ChargingSession.objects.all().order_by('-id')
    serializer_class = ChargingSessionSerializer
    filterset_fields = ['station', 'charger', 'vehicle', 'status']

    @action(detail=True, methods=['post'])
    def change_state(self, request, pk=None):
        session = self.get_object()
        new_status = request.data.get('status')
        reason = request.data.get('reason', '')
        if not new_status:
            return Response({"error": "Target 'status' is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            session.transition(new_status, reason=reason)
            return Response(ChargingSessionSerializer(session).data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all().order_by('-start_time')
    serializer_class = ReservationSerializer
