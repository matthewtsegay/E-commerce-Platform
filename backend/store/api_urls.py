from django.urls import path

from . import api_views

urlpatterns = [
    path(
        "orders/<int:order_id>/start_payment/",
        api_views.StartPaymentView.as_view(),
        name="api_start_payment",
    ),
    path(
        "payments/verify/",
        api_views.VerifyPaymentView.as_view(),
        name="api_verify_payment",
    ),
]
