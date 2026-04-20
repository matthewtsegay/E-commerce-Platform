# store/payments.py
import uuid
import requests
from django.conf import settings

def initialize_chapa_payment(order, callback_url):
    # unique ref to tie Chapa response back to your Payment record
    tx_ref = str(uuid.uuid4())

    payload = {
        "amount": str(order.total),          # order.total is Decimal => string
        "currency": "ETB",
        "email": order.customer.user.email,
        "first_name": order.customer.user.first_name,
        "last_name": order.customer.user.last_name,
        "tx_ref": tx_ref,
        "callback_url": callback_url,
    }
    headers = {"Authorization": f"Bearer {settings.CHAPA_SECRET_KEY}"}
    resp = requests.post(settings.CHAPA_INIT_URL, json=payload, headers=headers, timeout=10)
    resp.raise_for_status()
    return resp.json()   # contains data.checkout_url and data.tx_ref

def verify_chapa_transaction(tx_ref):
    headers = {"Authorization": f"Bearer {settings.CHAPA_SECRET_KEY}"}
    resp = requests.get(f"{settings.CHAPA_VERIFY_URL}/{tx_ref}", headers=headers, timeout=10)
    resp.raise_for_status()
    return resp.json()
