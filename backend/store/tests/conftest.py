import pytest
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def authenticate(api_client):
    """
    Usage in tests:
        authenticate()              -> normal user
        authenticate(is_staff=True) -> staff user
    """
    def do_authenticate(is_staff=False):
        User = get_user_model()
        user = User(username="testuser")
        user.set_password("pass123")
        user.is_staff = bool(is_staff)
        user.save()  # <-- important
        api_client.force_authenticate(user=user)
        return user
    return do_authenticate