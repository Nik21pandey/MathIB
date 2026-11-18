#!/usr/bin/env bash
python manage.py migrate
python manage.py seed_learn
python manage.py populate_categories
python manage.py populate_filters
python manage.py createsuperuser --noinput || true
exec gunicorn core.wsgi:application --bind 0.0.0.0:$PORT
