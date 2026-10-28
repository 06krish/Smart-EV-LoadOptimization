from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from vehicles.models import Vehicle
from stations.models import ChargingStation, Charger
from charging.models import ChargingSession
from tariffs.models import Tariff
from optimization.engine import OptimizationEngine
from forecasting.services import LoadForecastingService
from simulator.services import ChargerSimulatorService

class SmartEVTests(TestCase):
    def setUp(self):
        # 100 kW grid capacity, 10 kW base load -> 90 kW headroom
        self.station = ChargingStation.objects.create(
            name="Test Hub",
            grid_capacity_kw=100.0,
            base_load_kw=10.0
        )
        self.ch1 = Charger.objects.create(station=self.station, identifier="CH-1", max_power_kw=30.0)
        self.ch2 = Charger.objects.create(station=self.station, identifier="CH-2", max_power_kw=25.0)
        self.ch3 = Charger.objects.create(station=self.station, identifier="CH-3", max_power_kw=30.0)
        self.ch4 = Charger.objects.create(station=self.station, identifier="CH-4", max_power_kw=25.0)

        # 4 EVs with 30, 25, 30, 25 = 110 kW demand
        now = timezone.now()
        self.ev1 = Vehicle.objects.create(
            identifier="EV-TEST-1", battery_capacity_kwh=75.0, max_charge_power_kw=30.0,
            current_soc=20.0, target_soc=85.0, priority=4, arrival_time=now, departure_deadline=now + timedelta(hours=2)
        )
        self.ev2 = Vehicle.objects.create(
            identifier="EV-TEST-2", battery_capacity_kwh=58.0, max_charge_power_kw=25.0,
            current_soc=30.0, target_soc=80.0, priority=3, arrival_time=now, departure_deadline=now + timedelta(hours=3)
        )
        self.ev3 = Vehicle.objects.create(
            identifier="EV-TEST-3", battery_capacity_kwh=40.5, max_charge_power_kw=30.0,
            current_soc=10.0, target_soc=90.0, priority=2, arrival_time=now, departure_deadline=now + timedelta(hours=4)
        )
        self.ev4 = Vehicle.objects.create(
            identifier="EV-TEST-4", battery_capacity_kwh=50.0, max_charge_power_kw=25.0,
            current_soc=50.0, target_soc=80.0, priority=1, arrival_time=now, departure_deadline=now + timedelta(hours=5)
        )

        self.s1 = ChargingSession.objects.create(vehicle=self.ev1, charger=self.ch1, station=self.station, status='WAITING', current_soc=20.0, target_soc=85.0)
        self.s2 = ChargingSession.objects.create(vehicle=self.ev2, charger=self.ch2, station=self.station, status='WAITING', current_soc=30.0, target_soc=80.0)
        self.s3 = ChargingSession.objects.create(vehicle=self.ev3, charger=self.ch3, station=self.station, status='WAITING', current_soc=10.0, target_soc=90.0)
        self.s4 = ChargingSession.objects.create(vehicle=self.ev4, charger=self.ch4, station=self.station, status='WAITING', current_soc=50.0, target_soc=80.0)

        Tariff.objects.create(name="Normal", tariff_type="NORMAL", price_per_kwh=0.20, start_hour=0, end_hour=24)

    def test_priority_score_ordering(self):
        """Tests that Stage 1 priority calculation orders urgent/high-deficit/high-priority EVs highest."""
        ev_items = [
            {'id': 1, 'identifier': 'EV1', 'current_soc': 20.0, 'target_soc': 85.0, 'battery_capacity_kwh': 75.0, 'minutes_until_departure': 90, 'priority_level': 4},
            {'id': 2, 'identifier': 'EV2', 'current_soc': 50.0, 'target_soc': 80.0, 'battery_capacity_kwh': 50.0, 'minutes_until_departure': 300, 'priority_level': 1},
        ]
        scored = OptimizationEngine.calculate_priority_scores(ev_items)
        self.assertGreater(scored[0]['priority_score'], scored[1]['priority_score'])

    def test_optimization_respects_grid_capacity_hard_constraint(self):
        """Tests that total allocated power + base load never exceeds 100 kW grid capacity."""
        res = OptimizationEngine.execute_complete_optimization(self.station, algorithm='LP_PULP')
        self.assertLessEqual(res['peak_load_after_kw'], self.station.grid_capacity_kw)
        self.assertEqual(len(res['violations']), 0)
        # Demand was 110 kW + 10 kW = 120 kW, allocated must be <= 90 kW
        self.assertLessEqual(res['total_allocated_kw'], 90.0)

    def test_state_machine_transitions(self):
        """Tests that invalid transitions raise ValueError and valid transitions update status."""
        session = self.s1
        self.assertTrue(session.transition('CHARGING'))
        self.assertEqual(session.status, 'CHARGING')
        self.assertTrue(session.transition('PAUSED'))
        self.assertEqual(session.status, 'PAUSED')

        # Invalid transition: PAUSED directly to RESERVED should raise ValueError
        with self.assertRaises(ValueError):
            session.transition('RESERVED')

    def test_forecasting_pipeline(self):
        """Tests that load forecasting service generates 24-hour predictions with metrics."""
        forecast = LoadForecastingService.generate_future_forecast(horizon_hours=24)
        self.assertEqual(len(forecast), 24)
        metrics = LoadForecastingService.get_metrics()
        self.assertIn('mae', metrics)
        self.assertIn('rmse', metrics)

    def test_simulator_tick_and_energy_delivery(self):
        """Tests that simulator tick increments delivered energy and updates vehicle SOC."""
        self.s1.allocated_power_kw = 20.0
        self.s1.status = 'CHARGING'
        self.s1.save()

        initial_soc = self.ev1.current_soc
        res = ChargerSimulatorService.simulate_tick(minutes=15)
        self.s1.refresh_from_db()
        self.ev1.refresh_from_db()

        self.assertGreater(self.s1.energy_delivered_kwh, 0.0)
        self.assertGreater(self.ev1.current_soc, initial_soc)

