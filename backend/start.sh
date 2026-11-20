#!/usr/bin/env bash
python manage.py migrate
python manage.py seed_learn
python manage.py populate_categories
python manage.py populate_filters
python create_admin.py
exec gunicorn core.wsgi:application --bind 0.0.0.0:$PORT
