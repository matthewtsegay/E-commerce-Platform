'''from locust import HttpUser, task, between
from random import choice


PRODUCT_IDS = [1, 2, 3, 4]
COLLECTION_IDS = [1,2]

class WebsiteUser(HttpUser):
    wait_time = between(1, 5)
    
    def on_start(self):
        response = self.client.post('/store/carts/')
        if response.status_code == 201:
            self.cart_id = response.json().get('id')
        else:
            self.cart_id = None
    
    @task(2)
    def view_products(self):
        collection_id = choice(COLLECTION_IDS)
        self.client.get(f'/store/products/?collection_id={collection_id}', name='/store/products')
    
    @task(4)
    def view_product(self):
        product_id = choice(PRODUCT_IDS)
        self.client.get(f'/store/products/{product_id}', name='/store/products/:id')
    
    @task(1)
    def add_to_carts(self):
        if self.cart_id:
            product_id = choice(PRODUCT_IDS)
            self.client.post(
                f'/store/carts/{self.cart_id}/items/',
                name='/store/carts/items',
                json={'product_id': product_id, 'quantity': 1}
            )'''

from locust import HttpUser, task, between
from random import randint

class WebsiteUser(HttpUser):
     wait_time = between(1,5)

     @task(2)
     def view_products(self):
         print('view all products')
         collection_id = randint(1,2) # nosec B311
         self.client.get(
             f'/store/products/?collection_id={collection_id}',
             name='/store/products')
           
     @task(4) 
     def view_product(self):
         print('view products detail')
         product_id = randint(1,4) # nosec B311
         self.client.get(
             f'/store/products/{product_id}',
             name='/store/products/:id')
             
     @task(1)
     def add_to_cart(self):
         print('add to cart')
         product_id =  randint(1,4) # nosec B311
         self.client.post(
             f'/store/carts/{self.cart_id}/items/',
             name='/store/carts/items',
             json={'product_id':product_id, 'quantity':1})
       
     @task 
     def say_hello(self):
         self.client.get('/playground/hello')
     
     def on_start(self):
        print('created a card_id')
        response = self.client.post('/store/carts/')
        result = response.json()
        self.cart_id = result['id'] 
         