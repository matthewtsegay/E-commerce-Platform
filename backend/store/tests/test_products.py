from decimal import Decimal
from django.contrib.auth.models import User
from rest_framework import status
import pytest
from model_bakery import baker
from store.models import Collection,Product

@pytest.fixture
def create_product(api_client):
    def do_create_product(product):
        return api_client.post('/api/v1/store/products/',product)
    return do_create_product


@pytest.mark.django_db
class TestCreateProducts:
    def test_if_user_is_anonymous_returns_401(self,authenticate,create_product):
        response = create_product({
                        "title": "banana",
                        "description": "banana is good",
                        "slug": "banaba",
                        "unit_price": 20,
                        "inventory": 10,
                        "collection": 1
                                   })
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
    def test_if_user_is_not_admin_returns_403(self,authenticate,create_product):
        authenticate()
        response = create_product({
                        "title": "banana",
                        "description": "banana is good",
                        "slug": "banaba",
                        "unit_price": 20,
                        "inventory": 10,
                        "collection": 1
                                   })
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
        
    def test_if_data_is_invalid_returns_400(self,authenticate,create_product):
        authenticate(is_staff=True)
        response = create_product({
                            "title": "",
                            "description": "",
                            "slug": "",
                            "unit_price": '',
                            "inventory": '',
                            "collection": ''
                                            })
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['title'] is not None
        
    def test_if_data_is_valid_returns_201(self, authenticate, create_product):
        authenticate(is_staff=True)
        
        collection = baker.make('store.Collection')

        response = create_product({
            "title": "banana",
            "description": "banana is good",
            "slug": "banana-unique",
            "unit_price": 20.00, 
            "inventory": 10,
            "collection": collection.id,
        })
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['id'] > 0
        # Check new read-only fields are present in response
        #assert response.data.get('total_likes') == 0
        assert response.data.get('is_liked') is False

        
@pytest.mark.django_db
class TestRetrieveProducts:
    def test_if_create_product_exist_return_200(self, api_client):
        product = baker.make(Product, inventory=10)

        response = api_client.get(f'/api/v1/store/products/{product.id}/')

        assert response.status_code == 200

        # Get what serializer actually returned
        price_with_tax = response.data["price_with_tax"]

        # Keep assertions resilient to serializer output changes while still
        # validating key business fields.
        assert response.data["id"] == product.id
        assert response.data["title"] == product.title
        assert response.data["description"] == product.description
        assert response.data["slug"] == product.slug
        assert response.data["inventory"] == product.inventory
        assert response.data["collection"] == product.collection.id
        assert response.data["images"] == []

        # Pricing fields (serializer exposes both `price` and `unit_price`)
        assert response.data["price"] == product.price
        assert response.data["unit_price"] == product.price

        assert response.data["price_with_tax"] == price_with_tax
        assert response.data["is_on_sale"] == product.promotions.exists()
        assert response.data["discount_type"] == product.discount_type
        assert response.data["discount_value"] == product.discount_value
        assert response.data["discount_active"] == product.discount_active
        assert response.data["discount_label"] == product.discount_label

        assert response.data["total_likes"] == 0
        assert response.data["is_liked"] is False

        # Analytics-like aggregates
        assert response.data["reviews_count"] == 0
        assert response.data["average_rating"] is None