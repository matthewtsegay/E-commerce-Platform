from locust import HttpUser, task, between
from random import choice

class WebsiteUser(HttpUser):
    wait_time = between(1, 5)
    
    # Store valid IDs to avoid 404s
    product_ids = []
    collection_ids = []
    cart_id = None

    def on_start(self):
        """
        Setup: Create a cart and discover valid product/collection IDs.
        """
        print('--- Locust Session Starting: Discovering Data ---')
        
        # 1. Discover Collections
        response = self.client.get('/store/collections/')
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', []) if isinstance(data, dict) else data
            self.collection_ids = [c.get('id') for c in results]
            print(f'Discovered {len(self.collection_ids)} collections.')
        
        # 2. Discover Products
        response = self.client.get('/store/products/')
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', []) if isinstance(data, dict) else data
            self.product_ids = [p.get('id') for p in results]
            print(f'Discovered {len(self.product_ids)} products.')

        # 3. Create a Guest Cart
        response = self.client.post('/store/carts/')
        if response.status_code == 201:
            self.cart_id = response.json().get('id')
            print(f'Created Guest Cart: {self.cart_id}')
        else:
            print(f'Failed to create cart: {response.status_code} - {response.text[:100]}')

    @task(2)
    def view_products(self):
        if self.collection_ids:
            collection_id = choice(self.collection_ids)
            self.client.get(f'/store/products/?collection_id={collection_id}', name='/store/products')
        else:
            self.client.get('/store/products/', name='/store/products')

    @task(4)
    def view_product(self):
        if self.product_ids:
            product_id = choice(self.product_ids)
            self.client.get(f'/store/products/{product_id}/', name='/store/products/:id')

    @task(1)
    def add_to_cart(self):
        if self.cart_id and self.product_ids:
            product_id = choice(self.product_ids)
            self.client.post(
                f'/store/carts/{self.cart_id}/items/',
                name='/store/carts/items',
                json={'product_id': product_id, 'quantity': 1}
            )

    @task
    def say_hello(self):
        self.client.get('/playground/hello/', name='/playground/hello')