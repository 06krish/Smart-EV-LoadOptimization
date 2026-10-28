import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'data'))
MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'models'))

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATA_DIR, 'historical_grid_load.csv')
MODEL_PATH = os.path.join(MODELS_DIR, 'load_forecaster.joblib')
METRICS_PATH = os.path.join(MODELS_DIR, 'model_metrics.json')

def generate_historical_dataset(num_days=30):
    np.random.seed(42)
    end_time = datetime.now().replace(minute=0, second=0, microsecond=0)
    start_time = end_time - timedelta(days=num_days)
    
    timestamps = []
    curr = start_time
    while curr <= end_time:
        timestamps.append(curr)
        curr += timedelta(hours=1)
        
    records = []
    for ts in timestamps:
        hour = ts.hour
        day_of_week = ts.weekday()
        is_weekend = 1 if day_of_week >= 5 else 0
        
        # Ambient temperature
        temp = 20.0 + 9.0 * np.sin((hour - 8) / 24.0 * 2 * np.pi) + np.random.normal(0, 1.0)
        
        # Base facility non-EV load
        base_load = 12.0 + 7.0 * (1.0 if 8 <= hour <= 19 else 0.25)
        
        # EV Charging Demand profile
        if is_weekend:
            ev_factor = 0.35 + 0.65 * np.exp(-((hour - 14) ** 2) / 20.0)
            ev_demand = 32.0 * ev_factor + np.random.normal(0, 2.0)
        else:
            morning_peak = np.exp(-((hour - 9) ** 2) / 6.0)
            evening_peak = np.exp(-((hour - 18) ** 2) / 8.0)
            ev_factor = 0.15 + 0.85 * morning_peak + 0.95 * evening_peak
            ev_demand = 56.0 * ev_factor + np.random.normal(0, 2.5)
            
        ev_demand = max(2.0, ev_demand)
        total_load = base_load + ev_demand + np.random.normal(0, 1.5)
        total_load = max(10.0, round(total_load, 2))
        
        records.append({
            'timestamp': ts.strftime('%Y-%m-%d %H:%M:%S'),
            'hour': hour,
            'day_of_week': day_of_week,
            'is_weekend': is_weekend,
            'temperature_c': round(temp, 1),
            'base_facility_load_kw': round(base_load, 2),
            'ev_demand_kw': round(ev_demand, 2),
            'total_load_kw': total_load
        })
        
    df = pd.DataFrame(records)
    df.to_csv(CSV_PATH, index=False)
    print(f"Generated {len(df)} historical load rows at {CSV_PATH}")
    return df

def train_and_evaluate_model():
    if not os.path.exists(CSV_PATH):
        df = generate_historical_dataset()
    else:
        df = pd.read_csv(CSV_PATH)
        
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('timestamp').reset_index(drop=True)
    
    # Feature engineering: trigonometric cyclic hour, dayofweek, lags
    df['sin_hour'] = np.sin(df['hour'] * (2 * np.pi / 24))
    df['cos_hour'] = np.cos(df['hour'] * (2 * np.pi / 24))
    df['lag_1h'] = df['total_load_kw'].shift(1)
    df['lag_2h'] = df['total_load_kw'].shift(2)
    df['lag_24h'] = df['total_load_kw'].shift(24)
    df['rolling_mean_6h'] = df['total_load_kw'].shift(1).rolling(window=6, min_periods=1).mean()
    
    df_clean = df.dropna().reset_index(drop=True)
    
    feature_cols = ['sin_hour', 'cos_hour', 'day_of_week', 'is_weekend', 'temperature_c', 'lag_1h', 'lag_2h', 'lag_24h', 'rolling_mean_6h']
    target_col = 'total_load_kw'
    
    split_idx = int(len(df_clean) * 0.8)
    train_df = df_clean.iloc[:split_idx]
    test_df = df_clean.iloc[split_idx:]
    
    X_train = train_df[feature_cols]
    y_train = train_df[target_col]
    X_test = test_df[feature_cols]
    y_test = test_df[target_col]
    
    model = Ridge(alpha=1.0)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    
    mae = float(mean_absolute_error(y_test, y_pred))
    mse = float(mean_squared_error(y_test, y_pred))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_test, y_pred))
    mape = float(np.mean(np.abs((y_test - y_pred) / y_test)) * 100.0)
    
    metrics = {
        'model_name': 'Autoregressive Ridge Regression (AR-X)',
        'trained_at': datetime.now().isoformat(),
        'samples_train': len(X_train),
        'samples_test': len(X_test),
        'mae': round(mae, 3),
        'rmse': round(rmse, 3),
        'r2_score': round(r2, 4),
        'mape_percent': round(mape, 2),
        'features': feature_cols,
        'coefficients': {col: round(float(coef), 4) for col, coef in zip(feature_cols, model.coef_)},
        'intercept': round(float(model.intercept_), 4),
        'data_source': 'Synthesized 30-day realistic EV charging telemetry and grid load (Disclosed Reproducible Baseline)',
    }
    
    joblib.dump(model, MODEL_PATH)
    with open(METRICS_PATH, 'w') as f:
        json.dump(metrics, f, indent=2)
        
    print(f"Model saved to {MODEL_PATH}")
    print(f"Metrics: MAE={mae:.2f} kW, RMSE={rmse:.2f} kW, R2={r2:.4f}, MAPE={mape:.2f}%")
    return metrics

if __name__ == '__main__':
    train_and_evaluate_model()

