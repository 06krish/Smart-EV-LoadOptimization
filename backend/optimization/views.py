from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from stations.models import ChargingStation
from charging.models import ChargingSession
from .models import OptimizationResult, Schedule
from .serializers import OptimizationResultSerializer, ScheduleSerializer
from .engine import OptimizationEngine

class OptimizationRunView(APIView):
    def post(self, request):
        station_id = request.data.get('station_id')
        station = None
        if station_id:
            station = ChargingStation.objects.filter(id=station_id).first()
        if not station:
            station = ChargingStation.objects.first()
            if not station:
                station = ChargingStation.objects.create(
                    name="Metro Central EV Hub",
                    grid_capacity_kw=100.0,
                    base_load_kw=10.0
                )

        # Allow temporary capacity override from user UI input
        custom_cap = request.data.get('grid_capacity_kw')
        if custom_cap:
            try:
                station.grid_capacity_kw = float(custom_cap)
            except (ValueError, TypeError):
                pass

        algorithm = request.data.get('algorithm', 'LP_PULP')
        horizon_slots = int(request.data.get('horizon_slots', 4))
        ev_items = request.data.get('ev_items', None)
        apply_to_sessions = request.data.get('apply_to_sessions', True)

        # Execute optimization
        res = OptimizationEngine.execute_complete_optimization(
            station=station,
            ev_items=ev_items,
            algorithm=algorithm,
            horizon_slots=horizon_slots
        )

        # Save result to database
        opt_record = OptimizationResult.objects.create(
            station=station,
            algorithm_version=res['algorithm_version'],
            grid_capacity_kw=res['grid_capacity_kw'],
            base_load_kw=res['base_load_kw'],
            total_demand_kw=res['total_demand_kw'],
            total_allocated_kw=res['total_allocated_kw'],
            peak_load_before_kw=res['peak_load_before_kw'],
            peak_load_after_kw=res['peak_load_after_kw'],
            peak_reduction_percent=res['peak_reduction_percent'],
            cost_before_optimization=res['cost_before_optimization'],
            cost_after_optimization=res['cost_after_optimization'],
            estimated_savings=res['estimated_savings'],
            savings_percent=res['savings_percent'],
            unmet_demand_kw=res['unmet_demand_kw'],
            violations=res['violations'],
            input_snapshot={'ev_items_count': len(res['allocations']), 'algorithm': algorithm},
            output_allocations=res['allocations']
        )

        # Optionally apply allocated power to active ChargingSession records in DB
        if apply_to_sessions:
            for alloc in res['allocations']:
                ev_id = alloc.get('ev_id')
                if ev_id:
                    session = ChargingSession.objects.filter(
                        vehicle_id=ev_id,
                        status__in=['CHARGING', 'WAITING', 'PAUSED']
                    ).first()
                    if session:
                        session.allocated_power_kw = alloc['allocated_power_kw']
                        if alloc['allocated_power_kw'] > 0:
                            session.status = 'CHARGING'
                            session.charger.status = 'CHARGING'
                        elif session.current_soc >= session.target_soc:
                            session.status = 'COMPLETED'
                            session.charger.status = 'AVAILABLE'
                        else:
                            session.status = 'PAUSED'
                            session.charger.status = 'OCCUPIED'
                        session.charger.save()
                        session.save()

        res['optimization_id'] = opt_record.id
        res['station_name'] = station.name
        res['station_id'] = station.id
        return Response(res, status=status.HTTP_200_OK)


class OptimizationResultViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = OptimizationResult.objects.all().order_by('-run_at')
    serializer_class = OptimizationResultSerializer


class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all().order_by('-created_at')
    serializer_class = ScheduleSerializer
