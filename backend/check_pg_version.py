import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'storefront.settings.developer')
django.setup()

def get_pg_version():
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            row = cursor.fetchone()
            print(row[0])
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_pg_version()
