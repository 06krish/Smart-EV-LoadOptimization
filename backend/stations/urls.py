from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChargingStationViewSet, ChargerViewSet

router = DefaultRouter()
router.register(r'chargers', ChargerViewSet, basename='charger')
router.register(r'', ChargingStationViewSet, basename='station')

urlpatterns = [
    path('', include(router.urls)),
]

