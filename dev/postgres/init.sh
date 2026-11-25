#!/bin/sh
set -eu

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -1 -f /dev-setup/auth.sql \
  -f /dev-setup/migrations/20261125000000_learning_contracts.sql \
  -f /dev-setup/migrations/20261125000100_private_access.sql \
  -f /dev-setup/seed.sql
