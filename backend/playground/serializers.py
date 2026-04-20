from django.contrib import admin, messages
from django.db.models.aggregates import Count
from django.urls import reverse
from django.utils.html import format_html,urlencode
from decimal import Decimal
from rest_framework import serializers
from store.models import Product,Collection
from store.admin import CollectionAdmin


'''class CollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = ['id','title','products_count']
    products_count = serializers.IntegerField()
    id = serializers.IntegerField()
    title = serializers.CharField(max_length=255)
    
    
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id','title','description','slug','inventory','unit_price','price_with_tax','collection']
   
    unit_price = serializers.DecimalField(max_digits=6,decimal_places=2,source='price')
    price_with_tax = serializers.SerializerMethodField(method_name='calculate_tax')
   
    def calculate_tax(self, product: Product):
        return product.price * Decimal(1.1) ''' 
    
class SimpleCollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = ['id', 'title']
class ProductSerializer(serializers.ModelSerializer):
    collection = SimpleCollectionSerializer()  # instead of plain ID
    unit_price = serializers.DecimalField(max_digits=6, decimal_places=2, source='price')
    price_with_tax = serializers.SerializerMethodField(method_name='calculate_tax')

    class Meta:
        model = Product
        fields = [
            'id','title','description','slug',
            'inventory','unit_price','price_with_tax','collection'
        ]

    def calculate_tax(self, product: Product):
        return product.price * Decimal(1.1)