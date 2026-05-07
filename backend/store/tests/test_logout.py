import pytest
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken


@pytest.mark.django_db
def test_logout_blacklists_refresh_token(api_client, authenticate):
    user = authenticate()

    refresh = str(RefreshToken.for_user(user))
    response = api_client.post("/api/v1/auth/logout/", {"refresh": refresh}, format="json")

    assert response.status_code == status.HTTP_200_OK

    # Ensure the refresh token is now blacklisted (cannot be reused).
    response2 = api_client.post("/api/v1/auth/logout/", {"refresh": refresh}, format="json")
    assert response2.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_logout_requires_refresh_token(api_client, authenticate):
    authenticate()
    response = api_client.post("/api/v1/auth/logout/", {}, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
