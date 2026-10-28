# Smart-EV-LoadOptimization

> **Intelligent EV Charging & Dynamic Power Load Optimization Platform**  
> Built strictly according to the [EV Charging Optimization Master Plan](https://github.com/06krish/Smart-EV-LoadOptimization/blob/main/EV_Charging_Optimization_Master_Plan%20(1).md).

---

## 1. Project Overview

Charging stations are provisioned with fixed grid transformer limits (e.g. 100 kW ceiling). As electric vehicle adoption accelerates, simultaneous demand frequently exceeds available supply (e.g. 110 kW uncoordinated demand on a 100 kW connection with a 10 kW facility base load). Naive first-come-first-served charging trips main breakers, forces utility curtailment, or incurs severe peak demand surcharge penalties.

**Smart-EV-LoadOptimization** is a full-stack, enterprise-grade energy management system that continuously calculates **who gets how much power, right now**, ensuring the station never exceeds its declared physical capacity while minimizing electricity costs and fulfilling EV departure deadlines.

---

## 2. Architecture & Algorithms

The system implements the 3-stage optimization hierarchy detailed in Section 11 of the Master Plan:

### Stage 1 — Multi-Factor Rule-Based Priority Scoring
$$SOC\_Deficit = \text{Target\_SOC} - \text{Current\_SOC} \quad (0-100)$$
$$\text{Departure\_Urgency} = \frac{1}{\max(\text{minutes\_until\_departure}, 1)}$$
$$\text{Required\_Energy\_kWh} = \text{battery\_capacity\_kwh} \times \left(\frac{SOC\_Deficit}{100}\right)$$
$$\text{Priority Score} = 0.4 \times \widetilde{SOC\_Deficit} + 0.4 \times \widetilde{\text{Urgency}} + 0.2 \times \widetilde{\text{Energy\_Needed}} + \text{Manual Boost}$$

### Stage 2 — Greedy Allocation with Fairness Redistribution
1. Sorts active charging sessions by priority score in descending order.
2. Allocates power up to $\min(\text{Vehicle Max Power}, \text{Charger Bay Rating})$ from available station headroom.
3. Performs a second-pass fairness distribution over eligible vehicles if capacity remains.

### Stage 3 — Mathematical Linear Programming (LP)
- Utilizes **SciPy HiGHS simplex/interior-point solver** (as specified in Master Plan line 339 for a pure-Python execution path without external solver binaries).
- Multi-horizon formulation ($T = 4$ slots) minimizing total electricity costs and peak load while enforcing:
  $$\sum_{i=1}^{N} P_{i, t} \le \text{grid\_capacity\_kw} - \text{base\_load\_kw} \quad \forall t \in [0, T-1]$$
  $$0 \le P_{i, t} \le \min(P_{\text{vehicle, max}}, P_{\text{charger, max}})$$
  $$\sum_{t=0}^{T-1} P_{i, t} \times \Delta t \le E_{\text{required}, i}$$
- Fulfills the canonical demo: 4 EVs with 30 kW, 25 kW, 30 kW, 25 kW (110 kW demand) capped at 90 kW headroom (100 kW grid - 10 kW base load) with 0 constraint violations.

### Stage 4 — Autoregressive Machine Learning Load Forecasting
- Uses an autoregressive multi-lag Ridge regression model (`AR-X`) with cyclic harmonic hour encoding, day-of-week, seasonal 24-hour lag, and 6-hour rolling window moving averages.
- Achieves $R^2 = 0.8838$ and $\text{MAE} = 4.66\text{ kW}$ on strict chronological hold-out evaluation.

---

## 3. Technology Stack & Design System

- **Frontend**: React 18, Vite 5, Tailwind CSS 3, React Router v6, Axios, Recharts, Lucide React.
- **Backend**: Python 3, Django 6.1, Django REST Framework, SQLite system of record, CORS headers.
- **Data & ML**: Pandas, NumPy, Scikit-learn, Joblib.
- **Optimization**: SciPy HiGHS linear programming solver.

### Design System & Theme Support
The application features a modern, clean energy-technology SaaS interface with full **Light and Dark mode** support:
- **Primary**: Electric Teal `#00C2A8` (Active states, CTAs, key metrics, glows)
- **Secondary**: Deep Indigo `#2E3A8C` (Brand typography, headers, trust elements)
- **Accent 1 (Lime Energy)**: `#A3E635` (Positive deltas, optimized state, charging indicators)
- **Accent 2 (Amber)**: `#F59E0B` (Peak alerts, load shifting suggestions)
- **Accent 3 (Coral Red)**: `#EF4444` (Grid overload, safety warnings)
- **Theme Toggle**: Accessible from both the public Landing Page and the application top navigation bar, persisted across sessions in `localStorage`. Supports system preference auto-detection.

---

## 4. Final Project Structure

```
SmartEV/
├── backend/
│   ├── manage.py
│   ├── config/              # Django settings, ASGI/WSGI, root URLs
│   ├── vehicles/            # Vehicle model, validation, and REST API
│   ├── stations/            # Station & Charger bay hardware management
│   ├── charging/            # ChargingSession state machine & reservations
│   ├── energy/              # EnergyReading time-series telemetry
│   ├── tariffs/             # Time-of-Use dynamic electricity price tiers
│   ├── optimization/        # Core LP & Greedy engine, schedules, results
│   ├── forecasting/         # Autoregressive ML models & load prediction
│   ├── analytics/           # KPI summaries, financial savings, CSV export
│   ├── simulator/           # Synthetic tick and bay fault injection engine
│   ├── tests/               # Django automated test suite
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Sidebar, Modal, StatusBadge
│   │   ├── layouts/         # DashboardLayout
│   │   ├── pages/           # Landing, Dashboard, Optimization, Forecasting,
│   │   │                    # Vehicles, Stations, Analytics, Settings
│   │   ├── services/        # Axios API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
├── data/
│   └── historical_grid_load.csv  # 30-day baseline hourly load dataset
├── models/
│   ├── load_forecaster.joblib    # Trained scikit-learn forecasting model
│   └── model_metrics.json        # Evaluation metrics (MAE, RMSE, R2, MAPE)
├── EV_Charging_Optimization_Master_Plan (1).md
├── README.md
└── .gitignore
```

---

## 5. Installation & Execution (Windows PowerShell)

### Step 1: Install Python Dependencies
```powershell
python -m pip install -r backend/requirements.txt
```

### Step 2: Database Migrations & Data Seeding
```powershell
cd backend
python manage.py migrate
python manage.py seed_data
cd ..
```
*The `seed_data` command seeds the default 100 kW Metro Central station, 4 charger bays, ToU tariffs, 4 demo EVs with 110 kW demand, and runs the initial optimization solve.*

### Step 3: Run Django Backend Server (Terminal 1)
```powershell
cd backend
python manage.py runserver 8000
```
Backend API will be accessible at: `http://127.0.0.1:8000/api/`

### Step 4: Run React Frontend (Terminal 2)
```powershell
cd frontend
pnpm dev
# Or: npm run dev
```
Frontend Web Dashboard will be accessible at: `http://localhost:5173/`

---

## 6. API Endpoint Documentation

| Endpoint | Method | Description |
|---|---|---|
| `/api/dashboard/summary/` | `GET` | Aggregated KPI cards, active grid load, predicted peak, and latest savings |
| `/api/vehicles/` | `GET, POST` | List all EVs or register a new EV |
| `/api/vehicles/{id}/` | `GET, PUT, DELETE` | Retrieve, update, or remove an EV record |
| `/api/stations/` | `GET, POST` | List charging stations or create a new hub |
| `/api/stations/{id}/load/` | `GET` | Real-time live load, available headroom, and bay status breakdown |
| `/api/stations/chargers/` | `GET` | List all individual charger bays across stations |
| `/api/tariffs/` | `GET, POST` | List or create Time-of-Use pricing tiers |
| `/api/tariffs/current/` | `GET` | Get currently applicable electricity rate based on time of day |
| `/api/charging/sessions/` | `GET` | List active and historical charging sessions |
| `/api/charging/sessions/{id}/change_state/` | `POST` | Transition session through state machine (`WAITING` &rarr; `CHARGING` &rarr; `PAUSED` &rarr; `COMPLETED`) |
| `/api/load/history/` | `GET` | Retrieve historical grid load series for charts |
| `/api/load/predict/` | `GET` | Future 6h/12h/24h/48h load predictions with confidence intervals and ML metrics |
| `/api/optimization/run/` | `POST` | Execute LP / Greedy solver and apply power setpoints |
| `/api/optimization/runs/` | `GET` | Historical optimization run records |
| `/api/optimization/schedules/` | `GET, POST` | List or persist generated charging dispatch schedules |
| `/api/simulator/tick/` | `POST` | Advance simulated time (e.g. +15m), increment SOC, log telemetry |
| `/api/simulator/fault/` | `POST` | Inject or clear hardware fault on a charger bay, triggering reallocation |
| `/api/simulator/reset/` | `POST` | Reset station to Master Plan 110 kW demand on 100 kW grid demo state |
| `/api/reports/analytics/` | `GET` | 7-day cost comparison and completion rate metrics |
| `/api/reports/export/` | `GET` | Download full optimization audit report as CSV |

---

## 7. Running Automated Tests

Run the backend unit and integration test suite:

```powershell
cd backend
python manage.py test tests
```

Tests verify:
1. Stage 1 priority score calculation and normalization.
2. Hard transformer capacity invariant under peak demand (120 kW total demand strictly capped at $\le 100\text{ kW}$).
3. ChargingSession state machine transitions and invalid transition rejection.
4. Autoregressive load forecasting service and metrics generation.
5. Simulator tick power integration, SOC progression, and meter logging.

---

## 8. Disclosures & Demo Mode Behavior

- **Dataset Disclosure**: As the original repository contained the master plan markdown file without historical CSV datasets, a reproducible 30-day baseline hourly telemetry dataset was generated in `data/historical_grid_load.csv` and trained via `forecasting/train_forecaster.py`.
- **Solver Disclosure**: Mathematical optimization uses SciPy HiGHS simplex/interior-point linear programming (standard in power systems engineering and explicitly cited in Master Plan Section 11, line 339).
- **Simulation Transparency**: All real-time hardware telemetry is explicitly tagged with `is_simulation: true` in the API and disclosed on the dashboard, distinguishing simulated hardware telemetry from physical hardware.
