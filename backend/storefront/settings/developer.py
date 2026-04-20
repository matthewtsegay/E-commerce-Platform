import os

DEBUG = True


from .common import *
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(os.path.join(BASE_DIR, ".env"))
# SECURITY WARNING: don't run with debug turned on in production!
'''# SECURITY WARNING: keep the secret key used in production secret!
env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))'''

# Provide a safe fallback secret for local dev only
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-insecure-secret-key-do-not-use-in-prod')

# Use PostgreSQL for local development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'ecommerce_db'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'your_password'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5433'),
    }
}
