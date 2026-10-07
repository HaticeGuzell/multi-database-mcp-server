#!/usr/bin/env bash
set -euo pipefail

: "${POSTGRES_READER_PASSWORD:?POSTGRES_READER_PASSWORD is required}"

psql \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --set=ON_ERROR_STOP=1 \
  --set=reader_password="$POSTGRES_READER_PASSWORD" <<'SQL'
CREATE ROLE mcp_reader_pg LOGIN PASSWORD :'reader_password';

REVOKE ALL ON DATABASE northwind FROM mcp_reader_pg;
GRANT CONNECT ON DATABASE northwind TO mcp_reader_pg;

REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM mcp_reader_pg;
GRANT USAGE ON SCHEMA public TO mcp_reader_pg;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO mcp_reader_pg;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO mcp_reader_pg;

REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM mcp_reader_pg;

ALTER ROLE mcp_reader_pg IN DATABASE northwind
  SET default_transaction_read_only = on;
SQL
