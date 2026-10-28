from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChargingSessionViewSet, ReservationViewSet

router = DefaultRouter()
router.register(r'sessions', ChargingSessionViewSet, basename='chargingsession')
router.register(r'reservations', ReservationViewSet, basename='reservation')

urlpatterns = [
    path('', include(router.urls)),
]

