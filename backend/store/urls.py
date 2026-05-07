from django.urls import path
from rest_framework_nested import routers  # pyright: ignore[reportMissingImports]
from . import views
from likes.views import ProductLikeViewSet 

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
router.register('payments', views.PaymentViewSet, basename='payments')



product_router = routers.NestedDefaultRouter(router,r'products',lookup='product')
product_router.register('likes', ProductLikeViewSet, basename='product-likes')

cart_router = routers.NestedDefaultRouter(router,r'carts',lookup='cart')
cart_router.register('items',views.CartItemViewSet,basename='cart-items')

urlpatterns = router.urls + product_router.urls + cart_router.urls + [
    # Explicit typed nested routes for better schema generation.
    path(
        "products/<int:product_pk>/reviews/",
        views.ReviewViewSet.as_view({"get": "list", "post": "create"}),
        name="product-reviews-list",
    ),
    path(
        "products/<int:product_pk>/reviews/<int:pk>/",
        views.ReviewViewSet.as_view(
            {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
        ),
        name="product-reviews-detail",
    ),
    path(
        "products/<int:product_pk>/images/",
        views.ProductImageViewSet.as_view({"get": "list", "post": "create"}),
        name="product-images-list",
    ),
    path(
        "products/<int:product_pk>/images/<int:pk>/",
        views.ProductImageViewSet.as_view(
            {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
        ),
        name="product-images-detail",
    ),
    path('admin-stats/', views.AdminStatsView.as_view(), name='admin-stats'),
    path('recommended-products/', views.RecommendedProductsView.as_view(), name='recommended-products'),
]