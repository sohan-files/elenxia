#!/bin/bash

# Setup PillPall Database
echo "Setting up PillPall database..."

cd "$(dirname "$0")/backend/django"

# Run Django migrations to create all tables
echo "Running Django migrations..."
python manage.py makemigrations
python manage.py migrate

echo "Database setup complete!"
echo "SQLite database created at: backend/django/db.sqlite3"
