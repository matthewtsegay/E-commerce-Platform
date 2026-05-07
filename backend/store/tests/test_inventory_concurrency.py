import pytest
from rest_framework import status
from model_bakery import baker

from store.models import Cart, CartItem, Customer, Order, Product


@pytest.mark.django_db
def test_order_creation_is_inventory_safe(api_client, authenticate):
    """
    Single-process regression test for the DB-conditional inventory deduction.

    Scenario:
      - Product inventory = 1
      - Cart A wants 1 => succeeds, inventory becomes 0
      - Cart B wants 1 => fails, inventory remains 0 and no order is created
    """

    product = baker.make(Product, inventory=1, price=10)

    user_a = baker.make("core.User")
    customer_a, _ = Customer.objects.get_or_create(user=user_a)
    cart_a = baker.make(Cart, customer=customer_a)
    baker.make(CartItem, cart=cart_a, product=product, quantity=1)

    user_b = baker.make("core.User")
    customer_b, _ = Customer.objects.get_or_create(user=user_b)
    cart_b = baker.make(Cart, customer=customer_b)
    baker.make(CartItem, cart=cart_b, product=product, quantity=1)

    # A checkout
    api_client.force_authenticate(user=user_a)
    res_a = api_client.post("/api/v1/store/orders/", {"cart_id": str(cart_a.id)}, format="json")
    assert res_a.status_code == status.HTTP_201_CREATED

    product.refresh_from_db()
    assert product.inventory == 0

    # B checkout should fail
    api_client.force_authenticate(user=user_b)
    res_b = api_client.post("/api/v1/store/orders/", {"cart_id": str(cart_b.id)}, format="json")
    assert res_b.status_code == status.HTTP_400_BAD_REQUEST

    product.refresh_from_db()
    assert product.inventory == 0

    assert Order.objects.count() == 1
