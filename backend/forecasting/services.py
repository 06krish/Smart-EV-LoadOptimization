import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

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
    def get_historical_load(cls, hours=48):
        if not os.path.exists(CSV_PATH):
            return []
        df = pd.read_csv(CSV_PATH)
        df = df.tail(hours)
        return df.to_dict(orient='records')

    @classmethod
    def get_actual_vs_predicted(cls, points=48):
        model = cls.get_model()
        if not os.path.exists(CSV_PATH) or model is None:
            return []
        df = pd.read_csv(CSV_PATH)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.sort_values('timestamp').reset_index(drop=True)
        
        df['sin_hour'] = np.sin(df['hour'] * (2 * np.pi / 24))
        df['cos_hour'] = np.cos(df['hour'] * (2 * np.pi / 24))
        df['lag_1h'] = df['total_load_kw'].shift(1)
        df['lag_2h'] = df['total_load_kw'].shift(2)
        df['lag_24h'] = df['total_load_kw'].shift(24)
        df['rolling_mean_6h'] = df['total_load_kw'].shift(1).rolling(window=6, min_periods=1).mean()
        
        df_clean = df.dropna().reset_index(drop=True)
        sample = df_clean.tail(points).copy()
        
        feature_cols = ['sin_hour', 'cos_hour', 'day_of_week', 'is_weekend', 'temperature_c', 'lag_1h', 'lag_2h', 'lag_24h', 'rolling_mean_6h']
        sample['predicted_load_kw'] = model.predict(sample[feature_cols]).round(2)
        
        results = []
        for _, row in sample.iterrows():
            results.append({
                'timestamp': str(row['timestamp']),
                'hour': int(row['hour']),
                'actual_load_kw': float(row['total_load_kw']),
                'predicted_load_kw': float(row['predicted_load_kw']),
                'error_kw': round(abs(float(row['total_load_kw']) - float(row['predicted_load_kw'])), 2),
                'base_facility_load_kw': float(row['base_facility_load_kw']),
                'ev_demand_kw': float(row['ev_demand_kw'])
            })
        return results

    @classmethod
    def generate_future_forecast(cls, horizon_hours=24):
        model = cls.get_model()
        if not os.path.exists(CSV_PATH) or model is None:
            return []
            
        df = pd.read_csv(CSV_PATH)
        last_rows = df.tail(30).to_dict(orient='records')
        
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
            rolling_6 = np.mean(history_loads[-6:])
            
            X_input = pd.DataFrame([{
                'sin_hour': np.sin(hour * (2 * np.pi / 24)),
                'cos_hour': np.cos(hour * (2 * np.pi / 24)),
                'day_of_week': day_of_week,
                'is_weekend': is_weekend,
                'temperature_c': temp,
                'lag_1h': lag_1,
                'lag_2h': lag_2,
                'lag_24h': lag_24,
                'rolling_mean_6h': rolling_6
            }])
            
            pred_load = max(8.0, round(float(model.predict(X_input)[0]), 2))
            history_loads.append(pred_load)
            
            # Confidence interval grows slightly with horizon
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

