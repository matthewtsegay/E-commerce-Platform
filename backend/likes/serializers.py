from rest_framework import serializers
from .models import LikedItem
from django.contrib.contenttypes.models import ContentType

class LikedItemSerializer(serializers.ModelSerializer):
    object_id = serializers.IntegerField(read_only=True)   # readonly when using nested viewset

    class Meta:
        model = LikedItem
        fields = ("id", "object_id", "created_at")
        read_only_fields = ("id", "object_id", "created_at")
