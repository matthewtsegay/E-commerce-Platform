from django.urls import path
from . import views

urlpatterns = [
    path("dashboard/", views.dashboard, name="analytics_dashboard"),
    path("data/", views.AnalyticsDataView.as_view(), name="analytics_data"),
    path("report/", views.export_sales_report, name="analytics_report"),
]
