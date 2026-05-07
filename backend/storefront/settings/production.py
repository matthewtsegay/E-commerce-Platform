from .common import *

DEBUG = False

SECRET_KEY = env('SECRET_KEY')

# Strictly define ALLOWED_HOSTS from environment variables
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=[])

DATABASES = {
    'default': env.db('DATABASE_URL')
}

# Ensure connection pooling is active
DATABASES['default']['CONN_MAX_AGE'] = 600
DATABASES['default']['CONN_HEALTH_CHECKS'] = True

# Security settings
SECURE_HSTS_SECONDS = 31536000 # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = env.bool('SECURE_SSL_REDIRECT', default=True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"

# Let Django treat proxied HTTPS requests as secure when behind a reverse proxy.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

EMAIL_USE_TLS = env.bool('EMAIL_USE_TLS', default=True)