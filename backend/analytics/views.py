from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from store.models import Order, OrderItem, Collection

@staff_member_required
def dashboard(request):
    return render(request, "analytics/admin_dashboard.html")

@staff_member_required
def get_analytics_data(request):
    """
    API Endpoint to fetch real-time analytics data.
    """
    # 1. Sales over time (Last 30 days)
    last_30_days = timezone.now() - timedelta(days=30)
    
    daily_sales = (
        OrderItem.objects
        .filter(order__placed_at__gte=last_30_days)
        .annotate(date=TruncDate('order__placed_at'))
        .values('date')
        .annotate(total_sales=Sum(F('quantity') * F('unit_price')))
        .order_by('date')
    )
    
    dates = [entry['date'].strftime('%Y-%m-%d') for entry in daily_sales]
    sales_values = [float(entry['total_sales']) for entry in daily_sales]
    
    # 2. Sales by Collection (Top 5)
    collection_sales = (
        OrderItem.objects
        .values('product__collection__title')
        .annotate(total_sales=Sum(F('quantity') * F('unit_price')))
        .order_by('-total_sales')[:5]
    )
    
    # Handle None for title if any
    collection_labels = [entry['product__collection__title'] or 'Unknown' for entry in collection_sales]
    collection_values = [float(entry['total_sales']) for entry in collection_sales]

    # 3. Overall Statistics (Optional, good for cards)
    total_orders_count = Order.objects.count()
    total_revenue_agg = OrderItem.objects.aggregate(total=Sum(F('quantity') * F('unit_price')))
    total_revenue = total_revenue_agg['total'] or 0

    return JsonResponse({
        'chart_data': {
            'dates': dates,
            'sales': sales_values,
        },
        'pie_data': {
            'labels': collection_labels,
            'values': collection_values,
        },
        'summary': {
            'total_orders': total_orders_count,
            'total_revenue': float(total_revenue),
        }
    })

