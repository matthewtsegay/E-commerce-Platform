from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from store.models import Order, OrderItem, Customer, Product


def get_dashboard_stats():
    """
    Collects and aggregates all statistics required for the analytics dashboard.
    Only COMPLETED orders (payment_status='C') are counted in revenue figures.
    """
    COMPLETED = Order.PAYMENT_STATUS_COMPLETE  # 'C'

    # 1. Sales over time (Last 30 days) — completed orders only
    last_30_days = timezone.now() - timedelta(days=30)

    daily_sales = (
        OrderItem.objects
        .filter(
            order__placed_at__gte=last_30_days,
            order__payment_status=COMPLETED,
        )
        .annotate(date=TruncDate('order__placed_at'))
        .values('date')
        .annotate(total_sales=Sum(F('quantity') * F('unit_price')))
        .order_by('date')
    )

    dates = [entry['date'].strftime('%Y-%m-%d') for entry in daily_sales]
    sales_values = [float(entry['total_sales']) for entry in daily_sales]

    # 2. Sales by Collection (Top 5) — completed orders only
    collection_sales = (
        OrderItem.objects
        .filter(order__payment_status=COMPLETED)
        .values('product__collection__title')
        .annotate(total_sales=Sum(F('quantity') * F('unit_price')))
        .order_by('-total_sales')[:5]
    )

    collection_labels = [entry['product__collection__title'] or 'Unknown' for entry in collection_sales]
    collection_values = [float(entry['total_sales']) for entry in collection_sales]

    # 3. Top Selling Products (by units, completed orders only)
    top_products = (
        OrderItem.objects
        .filter(order__payment_status=COMPLETED)
        .values('product__title')
        .annotate(total_sold=Sum('quantity'))
        .order_by('-total_sold')[:5]
    )
    product_labels = [entry['product__title'] for entry in top_products]
    product_values = [entry['total_sold'] for entry in top_products]

    # 4. Customer Membership Distribution
    membership_dist = (
        Customer.objects
        .values('membership')
        .annotate(count=Count('id'))
    )
    membership_map = {'B': 'Bronze', 'S': 'Silver', 'G': 'Gold'}
    membership_labels = [membership_map.get(entry['membership'], 'Unknown') for entry in membership_dist]
    membership_values = [entry['count'] for entry in membership_dist]

    # 5. Order Value Distribution — completed orders only, labelled in ETB
    from django.db.models import Case, When, Value, IntegerField

    order_ranges = (
        Order.objects
        .filter(payment_status=COMPLETED)
        .annotate(
            total_val=Sum(F('items__unit_price') * F('items__quantity'))
        )
        .aggregate(
            range_0_500=Count(Case(When(total_val__lte=500, then=Value(1)), output_field=IntegerField())),
            range_500_1000=Count(Case(When(total_val__gt=500, total_val__lte=1000, then=Value(1)), output_field=IntegerField())),
            range_1000_5000=Count(Case(When(total_val__gt=1000, total_val__lte=5000, then=Value(1)), output_field=IntegerField())),
            range_5000_plus=Count(Case(When(total_val__gt=5000, then=Value(1)), output_field=IntegerField())),
        )
    )

    ranges = {
        'ETB 0–500':    order_ranges['range_0_500'],
        'ETB 500–1k':   order_ranges['range_500_1000'],
        'ETB 1k–5k':    order_ranges['range_1000_5000'],
        'ETB 5k+':      order_ranges['range_5000_plus'],
    }

    # 6. Overall Statistics — completed orders only for revenue
    total_orders_count = Order.objects.count()
    completed_orders_count = Order.objects.filter(payment_status=COMPLETED).count()
    total_revenue_agg = (
        OrderItem.objects
        .filter(order__payment_status=COMPLETED)
        .aggregate(total=Sum(F('quantity') * F('unit_price')))
    )
    total_revenue = total_revenue_agg['total'] or 0

    # 7. Low Stock Products (inventory < 10) — NEW
    low_stock_products = list(
        Product.objects
        .filter(inventory__lt=10)
        .order_by('inventory')
        .values('id', 'title', 'inventory')[:10]
    )

    return {
        'chart_data': {
            'dates': dates,
            'sales': sales_values,
        },
        'pie_data': {
            'labels': collection_labels,
            'values': collection_values,
        },
        'top_products': {
            'labels': product_labels,
            'values': product_values,
        },
        'membership_dist': {
            'labels': membership_labels,
            'values': membership_values,
        },
        'order_distribution': {
            'labels': list(ranges.keys()),
            'values': list(ranges.values()),
        },
        'summary': {
            'total_orders': total_orders_count,
            'completed_orders': completed_orders_count,
            'total_revenue': float(total_revenue),
        },
        'low_stock': low_stock_products,
    }
