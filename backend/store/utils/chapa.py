import requests
import uuid
import logging
from django.conf import settings
from decimal import Decimal

logger = logging.getLogger(__name__)

def get_chapa_config():
    """Retrieve Chapa configuration from settings with sensible defaults."""
    return {
        "SECRET_KEY": getattr(settings, "CHAPA_SECRET_KEY", "mock-secret-key"),
        "BASE_URL": getattr(settings, "CHAPA_API_URL", "https://api.chapa.co/v1/transaction"),
        "MOCK_MODE": getattr(settings, "CHAPA_MOCK_MODE", True),
    }

def initialize_chapa_payment(order, return_url, callback_url=None):
    """
    Initializes a Chapa payment transaction.
    If CHAPA_MOCK_MODE is True, returns a mock success response.
    """
    config = get_chapa_config()
    tx_ref = f"order-{order.id}-{uuid.uuid4().hex[:8]}"
    
    amount = order.total
    if isinstance(amount, Decimal):
        amount = float(amount)

    if config["MOCK_MODE"]:
        logger.info(f"[MOCK CHAPA] Initializing payment for Order {order.id}, Ref: {tx_ref}")
        return {
            "status": "success",
            "message": "Payment initialized (MOCKED)",
            "data": {
                "checkout_url": f"{return_url}?status=success&tx_ref={tx_ref}",
                "tx_ref": tx_ref
            }
        }

    # Real implementation
    headers = {
        "Authorization": f"Bearer {config['SECRET_KEY']}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "amount": str(amount),
        "currency": "ETB",
        "email": order.customer.user.email,
        "first_name": order.customer.user.first_name or "Customer",
        "last_name": order.customer.user.last_name or "",
        "tx_ref": tx_ref,
        "callback_url": callback_url,
        "return_url": return_url,
        "customization": {
            "title": "Nebi Store",
            "description": f"Payment for Order #{order.id}"
        }
    }

    try:
        resp = requests.post(f"{config['BASE_URL']}/initialize", json=payload, headers=headers, timeout=15)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logger.error(f"Chapa Initialization Error: {str(e)}")
        return {"status": "error", "message": str(e)}

def verify_chapa_transaction(tx_ref):
    """
    Verifies a transaction with Chapa.
    If CHAPA_MOCK_MODE is True, always returns success.
    """
    config = get_chapa_config()

    if config["MOCK_MODE"]:
        logger.info(f"[MOCK CHAPA] Verifying transaction Ref: {tx_ref}")
        return {
            "status": "success",
            "data": {
                "status": "success",
                "amount": 100, # Mock value
                "currency": "ETB"
            }
        }

    headers = {"Authorization": f"Bearer {config['SECRET_KEY']}"}
    try:
        resp = requests.get(f"{config['BASE_URL']}/verify/{tx_ref}", headers=headers, timeout=15)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logger.error(f"Chapa Verification Error: {str(e)}")
        return {"status": "error", "message": str(e)}
