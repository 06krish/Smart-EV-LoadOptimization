from django.urls import path
from .views import LoadHistoryView, LoadPredictionView

urlpatterns = [
    path('history/', LoadHistoryView.as_view(), name='load-history'),
    path('predict/', LoadPredictionView.as_view(), name='load-predict'),
]

