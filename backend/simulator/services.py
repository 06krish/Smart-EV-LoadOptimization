from django.utils import timezone
from datetime import timedelta
from stations.models import ChargingStation, Charger
from vehicles.models import Vehicle
from charging.models import ChargingSession
from energy.models import EnergyReading
from optimization.engine import OptimizationEngine

class ChargerSimulatorService:
    @classmethod
    def setup_master_plan_demo(cls):
        """
        Creates or resets the canonical demo scenario described in Section 24 of the Master Plan:
        - 1 Charging Station: Metro Central EV Hub (100 kW grid capacity, 10 kW base load)
        - 4 Charging Bays: CH-01 (30 kW), CH-02 (25 kW), CH-03 (30 kW), CH-04 (25 kW)
        - 4 EVs arriving simultaneously:
          1. EV-01: Tesla Model Y (75 kWh, SOC 20%, Target 85%, Max 30 kW, Critical Priority)
          2. EV-02: Hyundai Ioniq 5 (58 kWh, SOC 35%, Target 80%, Max 25 kW, High Priority)
          3. EV-03: Tata Nexon EV Max (40.5 kWh, SOC 15%, Target 90%, Max 30 kW, Medium Priority)
          4. EV-04: MG ZS EV (50.3 kWh, SOC 40%, Target 80%, Max 25 kW, Low Priority)
          Total Simultaneous Demand = 30 + 25 + 30 + 25 = 110 kW (Exceeds available 90 kW capacity!)
        """
        station, _ = ChargingStation.objects.get_or_create(
            name="Metro Central EV Hub",
            defaults={
                "location": "Sector 62, Innovation Corridor",
                "grid_capacity_kw": 100.0,
                "base_load_kw": 10.0,
                "latitude": 28.6280,
                "longitude": 77.3649
            }
        )
        station.grid_capacity_kw = 100.0
        station.base_load_kw = 10.0
        station.save()

        # Create/update 4 chargers
        charger_configs = [
            ("BAY-01", "CCS2", 30.0),
            ("BAY-02", "CCS2", 25.0),
            ("BAY-03", "CCS2", 30.0),
            ("BAY-04", "Type2", 25.0),
        ]
        chargers = []
        for bay_id, conn, max_p in charger_configs:
            ch, _ = Charger.objects.get_or_create(
                station=station,
                identifier=bay_id,
                defaults={"connector_type": conn, "max_power_kw": max_p, "status": "AVAILABLE"}
            )
            ch.max_power_kw = max_p
            ch.status = "CHARGING"
            ch.save()
            chargers.append(ch)

        # Clear existing active demo sessions
        ChargingSession.objects.filter(station=station).delete()

        # Vehicles
        now = timezone.now()
        ev_configs = [
            ("EV-01-ALPHA", "Tesla", "Model Y", 75.0, 30.0, 20.0, 85.0, 4, 90), # 1.5 hr departure
            ("EV-02-BETA", "Hyundai", "Ioniq 5", 58.0, 25.0, 35.0, 80.0, 3, 120), # 2.0 hr departure
            ("EV-03-GAMMA", "Tata", "Nexon EV Max", 40.5, 30.0, 15.0, 90.0, 2, 180), # 3.0 hr departure
            ("EV-04-DELTA", "MG", "ZS EV", 50.3, 25.0, 40.0, 80.0, 1, 240), # 4.0 hr departure
        ]

        sessions = []
        for i, (ident, make, model, batt, max_p, cur_soc, tgt_soc, prio, dep_mins) in enumerate(ev_configs):
            v, _ = Vehicle.objects.get_or_create(
                identifier=ident,
                defaults={
                    "make": make,
                    "model": model,
                    "battery_capacity_kwh": batt,
                    "max_charge_power_kw": max_p,
                    "current_soc": cur_soc,
                    "target_soc": tgt_soc,
                    "priority": prio,
                    "arrival_time": now,
                    "departure_deadline": now + timedelta(minutes=dep_mins)
                }
            )
            v.current_soc = cur_soc
            v.target_soc = tgt_soc
            v.priority = prio
            v.departure_deadline = now + timedelta(minutes=dep_mins)
            v.save()

            # Create charging session
            s = ChargingSession.objects.create(
                vehicle=v,
                charger=chargers[i],
                station=station,
                status="WAITING",
                start_soc=cur_soc,
                current_soc=cur_soc,
                target_soc=tgt_soc,
                allocated_power_kw=0.0,
                energy_delivered_kwh=0.0,
                started_at=now
            )
            sessions.append(s)

        # Run initial optimization so allocations are immediately set
        OptimizationEngine.execute_complete_optimization(station=station, algorithm='LP_PULP')
        return {
            "station": station.name,
            "grid_capacity_kw": station.grid_capacity_kw,
            "total_chargers": len(chargers),
            "active_sessions": len(sessions),
            "message": "Master Plan 110 kW simultaneous demand demo loaded successfully."
        }

    @classmethod
    def simulate_tick(cls, minutes=15):
        """
        Advances the simulation by `minutes` (e.g. 15 min).
        Integrates delivered power into kWh, increments SOC, logs EnergyReading,
        and marks completed sessions.
        """
        station = ChargingStation.objects.first()
        if not station:
            return {"error": "No station found"}

        active_sessions = ChargingSession.objects.filter(
            station=station,
            status__in=['CHARGING', 'WAITING', 'PAUSED']
        ).select_related('vehicle', 'charger')

        updated_count = 0
        total_delivered_this_tick = 0.0

        for session in active_sessions:
            if session.allocated_power_kw > 0 and session.status == 'CHARGING':
                # Energy = Power (kW) * (minutes / 60) hours
                kwh_delivered = round(session.allocated_power_kw * (minutes / 60.0), 3)
                session.energy_delivered_kwh = round(session.energy_delivered_kwh + kwh_delivered, 2)
                total_delivered_this_tick += kwh_delivered

                # SOC increment = (kWh / capacity) * 100%
                soc_gain = (kwh_delivered / session.vehicle.battery_capacity_kwh) * 100.0
                new_soc = min(100.0, round(session.current_soc + soc_gain, 1))
                session.current_soc = new_soc
                session.vehicle.current_soc = new_soc
                session.vehicle.save()

                # Check if target SOC reached
                if new_soc >= session.target_soc:
                    session.transition('COMPLETED', reason="Target SOC reached")
                else:
                    session.save()

                # Write telemetry reading
                EnergyReading.objects.create(
                    station=station,
                    charger=session.charger,
                    session=session,
                    power_kw=session.allocated_power_kw,
                    cumulative_energy_kwh=session.energy_delivered_kwh,
                    reading_type='SESSION'
                )
                updated_count += 1

        # Also log station total reading
        EnergyReading.objects.create(
            station=station,
            power_kw=station.current_load_kw,
            cumulative_energy_kwh=total_delivered_this_tick,
            reading_type='GRID_TOTAL'
        )

        # Trigger automatic reallocation if any session finished
        OptimizationEngine.execute_complete_optimization(station=station, algorithm='LP_PULP')

        return {
            "simulated_minutes": minutes,
            "sessions_updated": updated_count,
            "total_delivered_kwh": round(total_delivered_this_tick, 2),
            "current_station_load_kw": station.current_load_kw,
            "available_capacity_kw": station.available_capacity_kw
        }

    @classmethod
    def inject_charger_fault(cls, charger_id):
        """
        Injects a hardware fault or pauses a bay, causing the optimizer to rebalance load.
        """
        charger = Charger.objects.filter(id=charger_id).first()
        if not charger:
            return {"error": "Charger not found"}

        if charger.status == 'FAULT':
            charger.status = 'CHARGING'
            msg = f"Charger {charger.identifier} restored to active service."
        else:
            charger.status = 'FAULT'
            msg = f"Injected fault on Charger {charger.identifier}."
        charger.save()

        # Update active session on this charger if any
        session = ChargingSession.objects.filter(charger=charger, status__in=['CHARGING', 'WAITING']).first()
        if session:
            session.transition('FAILED' if charger.status == 'FAULT' else 'CHARGING')

        # Recompute optimization allocations
        res = OptimizationEngine.execute_complete_optimization(station=charger.station, algorithm='LP_PULP')
        return {
            "charger_id": charger.id,
            "charger_status": charger.status,
            "message": msg,
            "new_peak_load_kw": res['peak_load_after_kw'],
            "total_allocated_kw": res['total_allocated_kw']
        }

