from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from ..models import Customer

'''@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def Create_customer_for_new_user(sender, **Kwargs):
    if Kwargs['created']:
        Customer.objects.create(user=Kwargs['instance'])'''
        
from . import order_created
from ..tasks import send_order_confirmation
        
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_customer_for_new_user(sender, instance, created, **kwargs):
    if created:
        Customer.objects.get_or_create(user=instance)

@receiver(order_created)
def on_order_created(sender, **kwargs):
    """
    Triggers background email dispatch when an order is created.
    """
    order = kwargs.get('order')
    if order and order.customer and order.customer.user.email:
        send_order_confirmation.delay(order.id, order.customer.user.email)
