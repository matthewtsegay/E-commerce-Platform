from decimal import Decimal

from django.core.management.base import BaseCommand

from store.models import (
    Collection,
    Product,
    PromoBanner,
    PaymentMethodConfig,
    MembershipPlan,
)


class Command(BaseCommand):
    help = "Seed sample collections, products, promos, payment methods and memberships."

    def handle(self, *args, **options):
        # --- Collections ---
        cosmetics, _ = Collection.objects.get_or_create(title="Cosmetics")
        formula, _ = Collection.objects.get_or_create(title="Formula")
        grocery, _ = Collection.objects.get_or_create(title="Grocery items")

        # --- Products (simple examples; images can be added later via admin) ---
        Product.objects.get_or_create(
            title="EOS Moisture Body Lotion",
            defaults={
                "description": "EOS 24H Moisture Body Lotion – Jasmine Peach (473ml)",
                "price": Decimal("3999.00"),
                "inventory": 25,
                "collection": cosmetics,
            },
        )

        Product.objects.get_or_create(
            title="Aptamil No 3 Formula (1+ years)",
            defaults={
                "description": "Follow-on milk formula for toddlers 1+ years",
                "price": Decimal("4700.00"),
                "inventory": 40,
                "collection": formula,
            },
        )

        Product.objects.get_or_create(
            title="Gerber Oatmeal Banana Cereal (227g)",
            defaults={
                "description": "Organic baby cereal with banana flavor",
                "price": Decimal("2000.00"),
                "inventory": 60,
                "collection": grocery,
            },
        )

        # --- Promo banners (use image_url that the serializer exposes as images[]) ---
        PromoBanner.objects.get_or_create(
            title="Weekend Baby Essentials Sale",
            defaults={
                "subtitle": "Up to 20% off baby care must-haves",
                "image_url": "https://images.unsplash.com/photo-1503455637927-730bce8583c0?w=1600&auto=format&fit=crop&q=80",
                "link": "/products?collection=Baby Care",
                "link_type": PromoBanner.LINK_CATEGORY,
                "zone": PromoBanner.ZONE_HERO,
                "animation": PromoBanner.ANIM_SLIDE,
                "active": True,
            },
        )

        PromoBanner.objects.get_or_create(
            title="Skincare Favourites",
            defaults={
                "subtitle": "Hydrating lotions & treatments",
                "image_url": "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=80",
                "link": "/products?collection=Cosmetics",
                "link_type": PromoBanner.LINK_CATEGORY,
                "zone": PromoBanner.ZONE_PROMOTIONS_GRID,
                "animation": PromoBanner.ANIM_FADE,
                "active": True,
            },
        )

        # --- Payment methods ---
        PaymentMethodConfig.objects.get_or_create(
            id="chapa",
            defaults={
                "name": "chapa",
                "display_name": "Chapa",
                "description": "Pay with Chapa - Ethiopia's leading payment gateway",
                "enabled": True,
                "coming_soon": False,
                "icon": "/images/chapa.jpeg",
            },
        )

        PaymentMethodConfig.objects.get_or_create(
            id="telebirr",
            defaults={
                "name": "telebirr",
                "display_name": "TeleBirr",
                "description": "Mobile money payment via TeleBirr",
                "enabled": False,
                "coming_soon": True,
                "eta": "Q1 2025",
                "icon": "/images/telebirr.jpeg",
            },
        )

        # --- Membership plans ---
        MembershipPlan.objects.get_or_create(
            level=MembershipPlan.LEVEL_BRONZE,
            defaults={
                "name": "Bronze Member",
                "discount_percent": 5,
                "perks_description": "Starter perks for loyal customers.",
                "price": Decimal("0.00"),
                "is_active": True,
            },
        )

        MembershipPlan.objects.get_or_create(
            level=MembershipPlan.LEVEL_SILVER,
            defaults={
                "name": "Silver Member",
                "discount_percent": 10,
                "perks_description": "Better discounts and early access to promos.",
                "price": Decimal("199.00"),
                "is_active": True,
            },
        )

        MembershipPlan.objects.get_or_create(
            level=MembershipPlan.LEVEL_GOLD,
            defaults={
                "name": "Gold Member",
                "discount_percent": 15,
                "perks_description": "Premium perks with the best savings.",
                "price": Decimal("399.00"),
                "is_active": True,
            },
        )

        self.stdout.write(self.style.SUCCESS("Seeded sample collections, products, promos, payment methods and memberships."))

