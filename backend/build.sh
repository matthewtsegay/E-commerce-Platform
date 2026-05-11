#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install --upgrade pip
pip install pipenv
pipenv install --deploy --system

# Convert static asset files
# We ensure the static directory exists before running collectstatic
mkdir -p static
python manage.py collectstatic --no-input

# Apply any outstanding database migrations
python manage.py migrate
