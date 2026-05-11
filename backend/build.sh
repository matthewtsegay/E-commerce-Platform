#!/usr/bin/env bash
# Exit immediately on any error so Render marks the build as failed
set -o errexit

# Upgrade pip and install all dependencies from requirements.txt
pip install --upgrade pip
pip install -r requirements.txt

# Ensure the staticfiles output directory exists before collectstatic runs
mkdir -p staticfiles

# Collect all static assets (admin, DRF, app static files) into staticfiles/
python manage.py collectstatic --noinput

# Apply any outstanding database migrations
python manage.py migrate
