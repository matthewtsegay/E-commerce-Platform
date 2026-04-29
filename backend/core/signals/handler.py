from django.dispatch import receiver
from store.signals import order_created

import logging
logger = logging.getLogger(__name__)

@receiver(order_created)
def on_order_created(sender, **kwargs):
    order = kwargs.get('order')
    logger.info("Order created signal received: Order ID %s", getattr(order, 'id', 'unknown'))