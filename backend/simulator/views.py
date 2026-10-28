from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import ChargerSimulatorService

class SimulatorResetView(APIView):
    def post(self, request):
        result = ChargerSimulatorService.setup_master_plan_demo()
        return Response(result, status=status.HTTP_200_OK)

class SimulatorTickView(APIView):
    def post(self, request):
        minutes = int(request.data.get('minutes', 15))
        result = ChargerSimulatorService.simulate_tick(minutes=minutes)
        return Response(result, status=status.HTTP_200_OK)

class SimulatorFaultView(APIView):
    def post(self, request):
        charger_id = request.data.get('charger_id')
        if not charger_id:
            return Response({"error": "charger_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        result = ChargerSimulatorService.inject_charger_fault(charger_id)
        return Response(result, status=status.HTTP_200_OK)
