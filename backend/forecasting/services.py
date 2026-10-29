import os
import csv
import json
import joblib
import warnings
import numpy as np
from datetime import datetime, timedelta

warnings.filterwarnings('ignore', category=UserWarning, module='sklearn')

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'data'))
MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'models'))

CSV_PATH = os.path.join(DATA_DIR, 'historical_grid_load.csv')
MODEL_PATH = os.path.join(MODELS_DIR, 'load_forecaster.joblib')
METRICS_PATH = os.path.join(MODELS_DIR, 'model_metrics.json')

class LoadForecastingService:
    _model = None
    _metrics = None

    @classmethod
    def get_model(cls):
        if cls._model is None and os.path.exists(MODEL_PATH):
            cls._model = joblib.load(MODEL_PATH)
        return cls._model

    @classmethod
    def get_metrics(cls):
        if cls._metrics is None and os.path.exists(METRICS_PATH):
            with open(METRICS_PATH, 'r') as f:
                cls._metrics = json.load(f)
        return cls._metrics or {
            'model_name': 'Autoregressive Ridge Regression',
            'mae': 4.66,
            'rmse': 6.13,
            'r2_score': 0.8838,
            'mape_percent': 14.01,
            'data_source': 'Synthesized historical EV charging and facility telemetry'
        }

    @classmethod
    def _read_csv_records(cls):
        if not os.path.exists(CSV_PATH):
            return []
        records = []
        with open(CSV_PATH, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                records.append({
                    'timestamp': row['timestamp'],
                    'hour': int(row['hour']),
                    'day_of_week': int(row['day_of_week']),
                    'is_weekend': int(row['is_weekend']),
                    'temperature_c': float(row['temperature_c']),
                    'base_facility_load_kw': float(row['base_facility_load_kw']),
                    'ev_demand_kw': float(row['ev_demand_kw']),
                    'total_load_kw': float(row['total_load_kw']),
                })
        return records

    @classmethod
    def get_historical_load(cls, hours=48):
        records = cls._read_csv_records()
        if not records:
            return []
        return records[-hours:]

    @classmethod
    def get_actual_vs_predicted(cls, points=48):
        model = cls.get_model()
        records = cls._read_csv_records()
        if not records or model is None:
            return []

        # Calculate lag features and rolling means across historical records
        total_loads = [r['total_load_kw'] for r in records]
        
        valid_start = max(24, len(records) - points)
        results = []
        
        feature_matrix = []
        subset_records = []
        
        for i in range(valid_start, len(records)):
            r = records[i]
            hour = r['hour']
            sin_h = np.sin(hour * (2 * np.pi / 24))
            cos_h = np.cos(hour * (2 * np.pi / 24))
            lag_1 = total_loads[i - 1]
            lag_2 = total_loads[i - 2]
            lag_24 = total_loads[i - 24] if i >= 24 else total_loads[0]
            start_roll = max(0, i - 6)
            rolling_6 = float(np.mean(total_loads[start_roll:i]))
            
            features = [sin_h, cos_h, r['day_of_week'], r['is_weekend'], r['temperature_c'], lag_1, lag_2, lag_24, rolling_6]
            feature_matrix.append(features)
            subset_records.append(r)

        if not feature_matrix:
            return []

        X = np.array(feature_matrix)
        preds = model.predict(X)

        for r, pred in zip(subset_records, preds):
            pred_val = round(float(pred), 2)
            actual_val = r['total_load_kw']
            results.append({
                'timestamp': r['timestamp'],
                'hour': r['hour'],
                'actual_load_kw': actual_val,
                'predicted_load_kw': pred_val,
                'error_kw': round(abs(actual_val - pred_val), 2),
                'base_facility_load_kw': r['base_facility_load_kw'],
                'ev_demand_kw': r['ev_demand_kw']
            })
            
        return results

    @classmethod
    def generate_future_forecast(cls, horizon_hours=24):
        model = cls.get_model()
        records = cls._read_csv_records()
        if not records or model is None:
            return []
            
        last_rows = records[-30:] if len(records) >= 30 else records
        last_ts = datetime.strptime(last_rows[-1]['timestamp'], '%Y-%m-%d %H:%M:%S')
        history_loads = [r['total_load_kw'] for r in last_rows]
        
        forecasts = []
        metrics = cls.get_metrics()
        rmse = metrics.get('rmse', 5.0)
        
        curr_ts = last_ts
        for i in range(1, horizon_hours + 1):
            curr_ts += timedelta(hours=1)
            hour = curr_ts.hour
            day_of_week = curr_ts.weekday()
            is_weekend = 1 if day_of_week >= 5 else 0
            temp = 20.0 + 9.0 * np.sin((hour - 8) / 24.0 * 2 * np.pi)
            
            lag_1 = history_loads[-1]
            lag_2 = history_loads[-2]
            lag_24 = history_loads[-24] if len(history_loads) >= 24 else history_loads[0]
            rolling_6 = float(np.mean(history_loads[-6:]))
            
            X_input = np.array([[
                np.sin(hour * (2 * np.pi / 24)),
                np.cos(hour * (2 * np.pi / 24)),
                day_of_week,
                is_weekend,
                temp,
                lag_1,
                lag_2,
                lag_24,
                rolling_6
            ]])
            
            pred_load = max(8.0, round(float(model.predict(X_input)[0]), 2))
            history_loads.append(pred_load)
            
            # Confidence interval expands slightly over time
            uncertainty = rmse * (1.0 + 0.03 * i)
            lower_ci = max(0.0, round(pred_load - 1.96 * uncertainty, 2))
            upper_ci = round(pred_load + 1.96 * uncertainty, 2)
            
            is_peak = (8 <= hour <= 11) or (17 <= hour <= 20)
            
            forecasts.append({
                'timestamp': curr_ts.strftime('%Y-%m-%d %H:%M:%S'),
                'time_label': curr_ts.strftime('%a %H:00'),
                'hour': hour,
                'predicted_load_kw': pred_load,
                'lower_ci_kw': lower_ci,
                'upper_ci_kw': upper_ci,
                'is_peak_period': is_peak,
                'expected_tariff_rate': 0.38 if is_peak else (0.12 if (0 <= hour <= 6) else 0.22)
            })
            
        return forecasts
