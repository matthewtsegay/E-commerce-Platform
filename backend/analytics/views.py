from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.http import HttpResponse
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from store.permissions import IsAnalyticsRole
from rest_framework.response import Response
from rest_framework import serializers
from drf_spectacular.utils import extend_schema
from rest_framework.views import APIView
from . import services
from . import utils


class AnalyticsDataResponseSerializer(serializers.Serializer):
    chart_data = serializers.DictField()
    pie_data = serializers.DictField()
    top_products = serializers.DictField()
    membership_dist = serializers.DictField()
    order_distribution = serializers.DictField()
    summary = serializers.DictField()
    low_stock = serializers.ListField()

@staff_member_required
def dashboard(request):
    return render(request, "analytics/admin_dashboard.html")

class AnalyticsDataView(APIView):
    authentication_classes = [SessionAuthentication, JWTAuthentication]
    permission_classes = [IsAnalyticsRole]

    @extend_schema(responses=AnalyticsDataResponseSerializer)
    def get(self, request):
        """
        API Endpoint to fetch real-time analytics data via the service layer.
        Accepts both session auth (Django admin) and JWT auth (frontend).
        """
        stats = services.get_dashboard_stats()
        return Response(stats)

@staff_member_required
def export_sales_report(request):
    """
    Generates and returns a PNG sales report using Matplotlib/Pandas.
    """
    df = utils.get_sales_data()
    if df.empty:
        return HttpResponse("No sales data available to generate report.", status=404)
        
    daily_sales, moving_avg = utils.analyze_sales(df)
    image_data = utils.plot_sales(daily_sales, moving_avg, as_base64=False)
    
    response = HttpResponse(image_data, content_type="image/png")
    response['Content-Disposition'] = 'attachment; filename="sales_report.png"'
    return response

