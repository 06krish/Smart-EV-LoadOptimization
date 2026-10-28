from django.urls import path
from .views import DashboardSummaryView, AnalyticsReportView, ExportReportCSVView

urlpatterns = [
    path('summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('analytics/', AnalyticsReportView.as_view(), name='analytics-report'),
    path('export/', ExportReportCSVView.as_view(), name='export-csv'),
]

