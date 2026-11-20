#!/usr/bin/env bash
python manage.py migrate
python manage.py seed_learn
python manage.py populate_categories
python manage.py populate_filters
if [ -n "$DJANGO_SUPERUSER_EMAIL" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
    python create_admin.py
fi
exec gunicorn core.wsgi:application --bind 0.0.0.0:$PORT
