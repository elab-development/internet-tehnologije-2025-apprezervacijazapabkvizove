#!/bin/sh
set -e

echo "Waiting for database..."
until nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
done
echo "Database is up!"

python manage.py migrate --noinput


# python manage.py collectstatic --noinput

python manage.py runserver 0.0.0.0:8000