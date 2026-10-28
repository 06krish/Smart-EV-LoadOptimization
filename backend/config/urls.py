from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/dashboard/', include('analytics.urls')),
    path('api/vehicles/', include('vehicles.urls')),
    path('api/stations/', include('stations.urls')),
    path('api/tariffs/', include('tariffs.urls')),
    path('api/charging/', include('charging.urls')),
    path('api/energy/', include('energy.urls')),
    path('api/load/', include('forecasting.urls')),
    path('api/optimization/', include('optimization.urls')),
    path('api/simulator/', include('simulator.urls')),
    path('api/reports/', include('analytics.urls')),
]
