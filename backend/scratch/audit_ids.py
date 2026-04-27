import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'storefront.settings.developer')
django.setup()

from store.models import Product, Collection

def audit():
    p_ids = list(Product.objects.values_list('id', flat=True)[:10])
    c_ids = list(Collection.objects.values_list('id', flat=True)[:10])
    print(f"PRODUCT_IDS = {p_ids}")
    print(f"COLLECTION_IDS = {c_ids}")

if __name__ == "__main__":
    audit()
