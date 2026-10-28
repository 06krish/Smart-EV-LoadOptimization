from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import LoadForecastingService

class LoadHistoryView(APIView):
    def get(self, request):
        hours = int(request.query_params.get('hours', 48))
        data = LoadForecastingService.get_historical_load(hours=hours)
        return Response({
            "count": len(data),
            "historical_load": data
        })

class LoadPredictionView(APIView):
    def get(self, request):
        horizon = int(request.query_params.get('horizon', 24))
        forecast = LoadForecastingService.generate_future_forecast(horizon_hours=horizon)
        metrics = LoadForecastingService.get_metrics()
        actual_vs_pred = LoadForecastingService.get_actual_vs_predicted(points=24)
        
        peak_demand_predicted = max([f['predicted_load_kw'] for f in forecast]) if forecast else 0
        min_demand_predicted = min([f['predicted_load_kw'] for f in forecast]) if forecast else 0
        avg_demand_predicted = round(sum([f['predicted_load_kw'] for f in forecast]) / len(forecast), 2) if forecast else 0
        
        return Response({
            "horizon_hours": horizon,
            "forecast": forecast,
            "metrics": metrics,
            "actual_vs_predicted": actual_vs_pred,
            "summary": {
                "peak_load_kw": peak_demand_predicted,
                "min_load_kw": min_demand_predicted,
                "avg_load_kw": avg_demand_predicted,
                "data_disclosure": "Model evaluated on temporal hold-out test set from reproducible 30-day baseline dataset."
            }
        })
