"""
Lightweight payment API stubs used by the Next.js frontend (`/api/...`).
Replace with real gateway integration (e.g. Chapa) when ready.
"""
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order


class StartPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        order = get_object_or_404(Order, pk=order_id)
        if not request.user.is_staff and order.customer.user_id != request.user.id:
            return Response(
                {"detail": "You do not have permission to start payment for this order."},
                status=status.HTTP_403_FORBIDDEN,
            )
        now = timezone.now().isoformat()
        return Response(
            {
                "id": f"pi_stub_{order_id}",
                "order_id": str(order_id),
                "amount": float(order.total),
                "currency": "ETB",
                "status": "pending",
                "payment_method": (request.data or {}).get("payment_method", "stub"),
                "payment_url": None,
                "created_at": now,
                "updated_at": now,
            }
        )


class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        payment_id = request.query_params.get("payment_id", "unknown")
        now = timezone.now().isoformat()
        return Response(
            {
                "id": payment_id,
                "status": "success",
                "message": "Stub verification (no gateway call).",
                "transaction_id": f"stub_tx_{payment_id}",
                "verified_at": now,
            }
        )

    def post(self, request):
        now = timezone.now().isoformat()
        body = request.data or {}
        return Response(
            {
                "id": body.get("payment_reference", "stub"),
                "status": "success",
                "message": "Stub verification (no gateway call).",
                "transaction_id": body.get("payment_reference", "stub"),
                "verified_at": now,
            }
        )
