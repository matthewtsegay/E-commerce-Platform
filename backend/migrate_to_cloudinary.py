import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'storefront.settings.developer')
django.setup()

from django.conf import settings
from store.models import ProductImage
import cloudinary.uploader

def run_migration():
    img_dir = os.path.join(settings.MEDIA_ROOT, 'store', 'images')
    if not os.path.exists(img_dir):
        print(f"Directory not found: {img_dir}")
        return
        
    files = os.listdir(img_dir)
    count = 0
    print(f"Found {len(files)} files in {img_dir}.")
    
    for filename in files:
        local_path = os.path.join(img_dir, filename)
        if not os.path.isfile(local_path):
            continue
            
        # To match the URL: https://res.cloudinary.com/.../media/store/images/photo_2026-03-07_16-10-04.jpg
        # The public_id in Cloudinary should preserve the extension if the URL requests it.
        # Actually, Cloudinary removes the extension from public_id by default, but Next.js adds it back.
        # If we use public_id = media/store/images/filename (without extension)
        public_id = f"media/store/images/{os.path.splitext(filename)[0]}"
        
        print(f"Uploading {filename} -> public_id: {public_id}")
        try:
            response = cloudinary.uploader.upload(
                local_path, 
                public_id=public_id,
                overwrite=True
            )
            print(f"  Success: {response.get('secure_url')}")
            count += 1
        except Exception as e:
            print(f"  Failed: {e}")
            
    print(f"Migration complete. Uploaded {count} images.")

if __name__ == '__main__':
    run_migration()
