from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OptimizationRunView, OptimizationResultViewSet, ScheduleViewSet

router = DefaultRouter()
router.register(r'runs', OptimizationResultViewSet, basename='opt-run')
router.register(r'schedules', ScheduleViewSet, basename='schedule')

urlpatterns = [
    path('run/', OptimizationRunView.as_view(), name='opt-run-execute'),
    path('', include(router.urls)),
]

