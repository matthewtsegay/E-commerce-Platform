# store/utils/chapa.py
'''import requests
from django.conf import settings

CHAPA_BASE = getattr(settings, "CHAPA_API_URL", "https://api.chapa.co/v1/transaction")
INIT_URL = f"{CHAPA_BASE}/initialize"
VERIFY_URL_BASE = f"{CHAPA_BASE}/verify" 

def get_chapa_headers():
    secret = getattr(settings, "CHAPA_SECRET_KEY", None)
    if not secret:
        return None
    return {"Authorization": f"Bearer {secret}", "Content-Type": "application/json"}

def initialize_chapa_payment(order, callback_url):
    headers = get_chapa_headers()
    if not headers:
        return {"status": "error", "detail": "CHAPA_SECRET_KEY not configured"}

    payload = {
        "amount": str(order.total),
        "currency": "ETB",
        "email": getattr(order.customer.user, "email", ""),
        "first_name": getattr(order.customer.user, "first_name", "") or "",
        "last_name": getattr(order.customer.user, "last_name", "") or "",
        "tx_ref": f"order-{order.id}-{int(order.placed_at.timestamp())}",  # unique
        "callback_url": callback_url,
        "return_url": callback_url,
        "customization": {
            "title": "Ecommerce Store",
            "description": f"Payment for order #{order.id}"
        },
        "meta": {
            "order_id": order.id,
            "customer_id": order.customer.id
        }
    }

    try:
        resp = requests.post(INIT_URL, json=payload, headers=headers, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except requests.Timeout:
        return {"status": "error", "detail": "Chapa request timed out"}
    except requests.RequestException as e:
        # Attempt to return JSON error if available
        try:
            return {"status": "error", "detail": resp.json()}
        except Exception:
            return {"status": "error", "detail": str(e)}

def verify_chapa_transaction(tx_ref):
    headers = get_chapa_headers()
    if not headers:
        return {"status": "error", "detail": "CHAPA_SECRET_KEY not configured"}

    url = f"{VERIFY_URL_BASE}/{tx_ref}"
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except requests.Timeout:
        return {"status": "error", "detail": "Chapa verification timed out"}
    except requests.RequestException as e:
        try:
            return {"status": "error", "detail": resp.json()}
        except Exception:
            return {"status": "error", "detail": str(e)}'''
