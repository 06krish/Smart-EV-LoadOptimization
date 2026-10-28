from django.urls import path
from .views import SimulatorResetView, SimulatorTickView, SimulatorFaultView

urlpatterns = [
    path('reset/', SimulatorResetView.as_view(), name='simulator-reset'),
    path('tick/', SimulatorTickView.as_view(), name='simulator-tick'),
    path('fault/', SimulatorFaultView.as_view(), name='simulator-fault'),
]

