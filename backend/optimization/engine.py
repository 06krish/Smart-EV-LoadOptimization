import numpy as np
from datetime import datetime, timedelta
from scipy.optimize import linprog
from tariffs.models import Tariff

class OptimizationEngine:
    """
    Smart EV Charging Optimization Engine implementing:
    - Stage 1: Rule-Based Priority Scoring (Master Plan Section 11)
    - Stage 2: Priority-Ordered Greedy Allocation with Fairness Pass
    - Stage 3: Mathematical Linear Programming (LP) with SciPy HiGHS (Master Plan Section 11)
    - Baseline Comparison: Naive simultaneous First-Come-First-Served charging
    """

    @staticmethod
    def calculate_priority_scores(ev_items, weights=(0.4, 0.4, 0.2)):
        """
        Stage 1: Multi-factor priority score normalized across cohort.
        Formula from Master Plan:
        SOC_Deficit = Target_SOC - Current_SOC
        Departure_Urgency = 1 / max(minutes_until_departure, 1)
        Required_Energy = Battery_Cap * (SOC_Deficit / 100)
        Priority_Score = w1 * norm(SOC_Deficit) + w2 * norm(Urgency) + w3 * norm(Energy)
        """
        w1, w2, w3 = weights
        if not ev_items:
            return []

        deficits = [max(0.0, ev['target_soc'] - ev['current_soc']) for ev in ev_items]
        urgencies = [1.0 / max(1.0, float(ev.get('minutes_until_departure', 60))) for ev in ev_items]
        energies = [ev['battery_capacity_kwh'] * (deficits[i] / 100.0) for i, ev in enumerate(ev_items)]

        def min_max(vals):
            min_v, max_v = min(vals), max(vals)
            if max_v - min_v < 1e-6:
                return [1.0 for _ in vals]
            return [(v - min_v) / (max_v - min_v) for v in vals]

        norm_deficits = min_max(deficits)
        norm_urgencies = min_max(urgencies)
        norm_energies = min_max(energies)

        scored = []
        for i, ev in enumerate(ev_items):
            manual_boost = 0.05 * ev.get('priority_level', 2)
            score = (
                w1 * norm_deficits[i] +
                w2 * norm_urgencies[i] +
                w3 * norm_energies[i] +
                manual_boost
            )
            item = dict(ev)
            item['soc_deficit'] = round(deficits[i], 1)
            item['urgency_factor'] = round(urgencies[i], 4)
            item['required_energy_kwh'] = round(energies[i], 2)
            item['priority_score'] = round(score, 3)
            scored.append(item)

        return scored

    @classmethod
    def run_greedy_allocation(cls, grid_capacity_kw, base_load_kw, ev_items):
        """
        Stage 2: Greedy priority-driven power allocation.
        Satisfies Master Plan 110 kW demand -> capped at 100 kW grid constraint.
        """
        available_power = max(0.0, grid_capacity_kw - base_load_kw)
        scored_evs = cls.calculate_priority_scores(ev_items)
        sorted_evs = sorted(scored_evs, key=lambda x: x['priority_score'], reverse=True)

        remaining_kw = available_power
        allocations = []

        # Pass 1: Allocate according to priority order
        for ev in sorted_evs:
            max_p = min(ev.get('max_charge_power_kw', 22.0), ev.get('charger_power_kw', 25.0))
            needed_kw = ev['required_energy_kwh']
            target_want = min(max_p, max(2.0, needed_kw)) if ev['soc_deficit'] > 0 else 0.0

            give = min(target_want, remaining_kw)
            give = round(give, 2)
            remaining_kw -= give

            allocations.append({
                'ev_id': ev.get('id'),
                'identifier': ev.get('identifier', 'EV'),
                'charger_identifier': ev.get('charger_identifier', 'CH'),
                'priority_score': ev['priority_score'],
                'priority_level': ev.get('priority_level', 2),
                'requested_power_kw': target_want,
                'allocated_power_kw': give,
                'slot_allocations_kw': [give, give, give, give],
                'energy_scheduled_kwh': round(give * 1.0, 2),
                'estimated_cost_usd': round(give * 0.22, 2),
                'unmet_power_kw': round(max(0.0, target_want - give), 2),
                'current_soc': ev['current_soc'],
                'target_soc': ev['target_soc'],
                'required_energy_kwh': ev['required_energy_kwh'],
                'minutes_until_departure': ev.get('minutes_until_departure', 60),
                'status': 'CHARGING' if give > 0 else ('PAUSED' if ev['soc_deficit'] > 0 else 'COMPLETED')
            })

        # Pass 2: Fairness distribution if headroom remains
        if remaining_kw > 1.0:
            eligible = [a for a in allocations if a['unmet_power_kw'] > 0]
            if eligible:
                split = remaining_kw / len(eligible)
                for a in eligible:
                    bonus = min(split, a['unmet_power_kw'])
                    a['allocated_power_kw'] = round(a['allocated_power_kw'] + bonus, 2)
                    a['unmet_power_kw'] = round(max(0.0, a['requested_power_kw'] - a['allocated_power_kw']), 2)
                    remaining_kw -= bonus

        return allocations

    @classmethod
    def run_lp_optimization(cls, grid_capacity_kw, base_load_kw, ev_items, horizon_slots=4, slot_duration_hours=1.0):
        """
        Stage 3: Multi-Time-Horizon Linear Programming solver using SciPy HiGHS.
        Optimizes allocations over `horizon_slots` (e.g. 4 hours) taking into account:
        - Time-varying dynamic electricity tariffs
        - Hard grid capacity invariant (station load never exceeds grid ceiling)
        - Charger and EV acceptance bounds
        - Total battery energy delivery requirements before departure
        """
        N = len(ev_items)
        T = horizon_slots
        if N == 0:
            return []

        now_hour = datetime.now().hour
        tariffs = [Tariff.get_rate_for_hour((now_hour + t) % 24) for t in range(T)]
        available_power_per_slot = max(0.0, grid_capacity_kw - base_load_kw)

        # Objective vector c: cost per kWh + slight time-preference penalty - priority weighting
        c = []
        bounds = []
        for i in range(N):
            ev = ev_items[i]
            max_p = min(ev.get('max_charge_power_kw', 22.0), ev.get('charger_power_kw', 25.0))
            max_active_slot = min(T, max(1, int(ev.get('minutes_until_departure', 180) / 60)))
            prio = ev.get('priority_level', 2)

            for t in range(T):
                if t < max_active_slot:
                    bounds.append((0.0, max_p))
                    # Minimize tariff cost, but incentivize high-priority vehicles to charge sooner
                    cost_weight = tariffs[t] + (0.02 * t) - (0.04 * prio)
                else:
                    bounds.append((0.0, 0.0)) # Already departed
                    cost_weight = 100.0
                c.append(cost_weight)

        A_ub = []
        b_ub = []

        # 1. Station total capacity constraint per time slot t
        for t in range(T):
            row = [0.0] * (N * T)
            for i in range(N):
                row[i * T + t] = 1.0
            A_ub.append(row)
            b_ub.append(available_power_per_slot)

        # 2. Maximum battery energy delivery limit (cannot overcharge beyond target SOC)
        for i in range(N):
            ev = ev_items[i]
            req_energy = max(0.0, ev.get('required_energy_kwh', 0.0))
            row = [0.0] * (N * T)
            for t in range(T):
                row[i * T + t] = slot_duration_hours
            A_ub.append(row)
            b_ub.append(req_energy)

        # Solve using HiGHS
        res = linprog(c, A_ub=A_ub, b_ub=b_ub, bounds=bounds, method='highs')

        allocations = []
        if res.success:
            matrix = np.array(res.x).reshape((N, T))
            for i in range(N):
                ev = ev_items[i]
                slot_powers = [round(float(matrix[i, t]), 2) for t in range(T)]
                first_slot_alloc = slot_powers[0]
                total_kwh = round(sum(slot_powers) * slot_duration_hours, 2)
                cost = round(sum(tariffs[t] * slot_powers[t] * slot_duration_hours for t in range(T)), 2)

                allocations.append({
                    'ev_id': ev.get('id'),
                    'identifier': ev.get('identifier', 'EV'),
                    'charger_identifier': ev.get('charger_identifier', 'CH'),
                    'priority_level': ev.get('priority_level', 2),
                    'allocated_power_kw': first_slot_alloc,
                    'slot_allocations_kw': slot_powers,
                    'energy_scheduled_kwh': total_kwh,
                    'estimated_cost_usd': cost,
                    'current_soc': ev['current_soc'],
                    'target_soc': ev['target_soc'],
                    'required_energy_kwh': ev.get('required_energy_kwh', 0.0),
                    'minutes_until_departure': ev.get('minutes_until_departure', 120),
                    'status': 'CHARGING' if first_slot_alloc > 0 else ('PAUSED' if ev.get('required_energy_kwh', 0) > 0 else 'COMPLETED')
                })
        else:
            # Fallback to greedy allocator if LP reaches numerical limit
            return cls.run_greedy_allocation(grid_capacity_kw, base_load_kw, ev_items)

        return allocations

    @classmethod
    def execute_complete_optimization(cls, station, ev_items=None, algorithm='LP_PULP', horizon_slots=4):
        from charging.models import ChargingSession

        grid_capacity = station.grid_capacity_kw
        base_load = station.base_load_kw

        if ev_items is None:
            active_sessions = ChargingSession.objects.filter(
                station=station,
                status__in=['CHARGING', 'WAITING', 'PAUSED']
            ).select_related('vehicle', 'charger')

            ev_items = []
            for s in active_sessions:
                ev_items.append({
                    'id': s.vehicle.id,
                    'session_id': s.id,
                    'identifier': s.vehicle.identifier,
                    'charger_identifier': s.charger.identifier,
                    'max_charge_power_kw': s.vehicle.max_charge_power_kw,
                    'charger_power_kw': s.charger.max_power_kw,
                    'current_soc': s.current_soc,
                    'target_soc': s.target_soc,
                    'battery_capacity_kwh': s.vehicle.battery_capacity_kwh,
                    'required_energy_kwh': s.remaining_energy_needed_kwh,
                    'priority_level': s.vehicle.priority,
                    'minutes_until_departure': int(s.vehicle.time_to_departure_hours * 60)
                })

        # BASELINE BENCHMARK: Uncoordinated First-Come-First-Served Charging
        baseline_demands = [min(ev.get('max_charge_power_kw', 22.0), ev.get('charger_power_kw', 25.0)) for ev in ev_items]
        total_ev_demand = round(sum(baseline_demands), 2)
        peak_load_before = round(base_load + total_ev_demand, 2)

        # Baseline cost with peak hour tariff rate ($0.38/kWh) plus peak demand overload surcharge
        peak_tariff = 0.38
        baseline_energy_cost = round(total_ev_demand * 1.0 * peak_tariff, 2)
        overload_kw = max(0.0, peak_load_before - grid_capacity)
        penalty_charge = round(overload_kw * 15.0, 2)
        cost_before = round(baseline_energy_cost + penalty_charge, 2)

        # Execute selected algorithm
        if algorithm == 'RULE_GREEDY':
            allocations = cls.run_greedy_allocation(grid_capacity, base_load, ev_items)
        else:
            allocations = cls.run_lp_optimization(grid_capacity, base_load, ev_items, horizon_slots=horizon_slots)

        total_allocated_kw = round(sum(a['allocated_power_kw'] for a in allocations), 2)
        peak_load_after = round(base_load + total_allocated_kw, 2)
        peak_reduction_percent = round(max(0.0, (peak_load_before - peak_load_after) / max(0.1, peak_load_before)) * 100.0, 1)

        current_hour_tariff = Tariff.get_rate_for_hour(datetime.now().hour)
        cost_after = round(total_allocated_kw * 1.0 * current_hour_tariff, 2)
        estimated_savings = round(max(0.0, cost_before - cost_after), 2)
        savings_percent = round((estimated_savings / max(0.01, cost_before)) * 100.0, 1)

        # Constraint check
        violations = []
        if peak_load_after > grid_capacity + 1e-3:
            violations.append(f"Grid capacity exceeded: {peak_load_after} kW > {grid_capacity} kW.")
        for a in allocations:
            if a['allocated_power_kw'] < 0:
                violations.append(f"Negative power on {a['identifier']}.")

        unmet_demand_kw = round(max(0.0, total_ev_demand - total_allocated_kw), 2)

        return {
            'algorithm_version': algorithm,
            'grid_capacity_kw': grid_capacity,
            'base_load_kw': base_load,
            'total_demand_kw': total_ev_demand,
            'total_allocated_kw': total_allocated_kw,
            'peak_load_before_kw': peak_load_before,
            'peak_load_after_kw': peak_load_after,
            'peak_reduction_percent': peak_reduction_percent,
            'cost_before_optimization': cost_before,
            'cost_after_optimization': cost_after,
            'estimated_savings': estimated_savings,
            'savings_percent': savings_percent,
            'unmet_demand_kw': unmet_demand_kw,
            'violations': violations,
            'allocations': allocations,
            'horizon_slots': horizon_slots
        }

