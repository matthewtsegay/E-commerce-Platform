from django.urls import path,include
from rest_framework.routers import SimpleRouter,DefaultRouter
from rest_framework_nested import routers
from . import views
from likes.views import ProductLikeViewSet 
from pprint import pprint

app_name = "store"

router = routers.DefaultRouter()

router.register('products', views.ProductViewSet, basename='products')
router.register('collections', views.CollectionViewSet)
router.register('carts', views.CartViewSet, basename='carts')
router.register('customers', views.CustomerViewSet)
router.register('orders', views.OrderViewSet, basename='orders')
router.register('promotions', views.PromoBannerViewSet, basename='promotions')
router.register('payment-methods', views.PaymentMethodConfigViewSet, basename='payment-methods')
router.register('memberships', views.MembershipPlanViewSet, basename='memberships')


product_router = routers.NestedDefaultRouter(router,r'products',lookup='product')
product_router.register('reviews',views.ReviewViewSet,basename='product-reviews')
product_router.register('images',views.ProductImageViewSet,basename='product-images')
product_router.register('likes', ProductLikeViewSet, basename='product-likes')

cart_router = routers.NestedDefaultRouter(router,r'carts',lookup='cart')
cart_router.register('items',views.CartItemViewSet,basename='cart-items')

urlpatterns = router.urls + product_router.urls + cart_router.urls + [
    path('admin-stats/', views.AdminStatsView.as_view(), name='admin-stats'),
    path('recommended-products/', views.RecommendedProductsView.as_view(), name='recommended-products'),
]