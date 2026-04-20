from django.conf import settings
from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils import timezone
from django.db.models import UniqueConstraint, Index


class LikedItemManager(models.Manager):
    def for_object(self, obj):
        ct = ContentType.objects.get_for_model(obj)
        return self.filter(content_type=ct, object_id=obj.pk)

    def is_liked(self, user, obj) -> bool:
        if user.is_anonymous:
            return False
        return self.for_object(obj).filter(user=user).exists()

    def count_for(self, obj) -> int:
        return self.for_object(obj).count()

    def toggle(self, user, obj) -> bool:
        """
        Toggle like for (user, obj).
        Returns True if liked was created, False if it was removed.
        """
        ct = ContentType.objects.get_for_model(obj)
        like, created = self.get_or_create(user=user, content_type=ct, object_id=obj.pk)
        if not created:
            # already existed -> remove it (toggle off)
            like.delete()
            return False
        return True


class LikedItem(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="liked_items"
    )
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField(db_index=True)
    content_object = GenericForeignKey("content_type", "object_id")
    created_at = models.DateTimeField(default=timezone.now)

    objects = LikedItemManager()

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            UniqueConstraint(
                fields=["user", "content_type", "object_id"],
                name="unique_user_content_like",
            )
        ]
        indexes = [
            Index(fields=["content_type", "object_id"]),
            Index(fields=["user", "content_type", "object_id"]),
        ]

    def __str__(self):
        return f"{self.user} likes {self.content_type.app_label}.{self.content_type.model}({self.object_id})"

'''class LikedItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL ,on_delete=models.CASCADE)
    content_type = models.ForeignKey(ContentType,on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey()'''