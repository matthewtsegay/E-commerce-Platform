#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies from requirements.txt or Pipfile
pip install pipenv
pipenv install --deploy --system

# Convert static asset files
mkdir -p static
python manage.py collectstatic --no-input

# Apply any outstanding database migrations
python manage.py migrate
