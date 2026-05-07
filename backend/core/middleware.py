from django.contrib.auth import login
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

class JWTToSessionMiddleware:
    """
    Middleware that bridges JWT authentication (cookies) to Django Sessions.
    This allows admins logged into the frontend to access the Django Backend Admin
    without logging in again.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Proxy-friendly scheme handling: ensure request.is_secure() reflects
        # the original client scheme when behind a reverse proxy.
        forwarded_proto = request.META.get("HTTP_X_FORWARDED_PROTO")
        if forwarded_proto:
            request.META["wsgi.url_scheme"] = forwarded_proto.split(",")[0].strip()

        # Only try to sync if user is not already session-authenticated
        if not request.user.is_authenticated:
            # Look for the access token in cookies (set by the frontend)
            token = request.COOKIES.get('access_token')
            if token:
                try:
                    # Validate the JWT token
                    jwt_auth = JWTAuthentication()
                    validated_token = jwt_auth.get_validated_token(token)
                    user = jwt_auth.get_user(validated_token)
                    
                    if user and user.is_active:
                        # Log the user into the session automatically
                        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
                except (InvalidToken, TokenError):
                    # Token is expired or invalid, ignore.
                    # We don't want auth middleware to break requests.
                    pass
                except Exception:
                    # Defensive: never block request processing because of auth bridging.
                    pass

        return self.get_response(request)
