#!/bin/sh
# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
until pg_isready -h db -p 5432 -U postgres; do
  sleep 1
done

echo "Running Prisma migrations..."
npx prisma migrate deploy
npx prisma db seed

echo "Starting Next.js server..."
node server.js
