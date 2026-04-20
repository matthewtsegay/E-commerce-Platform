from django.contrib import admin

# Register your models here.
# like/admin.py
from django.contrib import admin
from .models import LikedItem

@admin.register(LikedItem)
class LikedItemAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "content_type", "object_id", "created_at")
    list_filter = ("content_type", "created_at")
    search_fields = ("user__username",)

