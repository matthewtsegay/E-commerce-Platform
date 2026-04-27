from django.core.mail import send_mail
from django.conf import settings
from celery import shared_task
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_order_confirmation(order_id, customer_email):
    """
    Sends an order confirmation email asynchronously.
    """
    try:
        subject = f'Order #{order_id} Confirmation'
        message = f'Thank you for your order! Your order ID is {order_id}. We are processing it now.'
        from_email = settings.DEFAULT_FROM_EMAIL
        
        send_mail(
            subject,
            message,
            from_email,
            [customer_email],
            fail_silently=False,
        )
        logger.info(f"Successfully sent order confirmation for Order #{order_id}")
    except Exception as e:
        logger.error(f"Error sending order confirmation for Order #{order_id}: {str(e)}")
