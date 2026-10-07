
# Reviewer Quick Start

This guide explains how to run and verify the Multi-Database MCP Server using Docker, without installing MySQL or PostgreSQL locally.

For an overview of the project, see the main [README](../README.md).

## Requirements

- Docker Desktop (or Docker Engine with Compose)
- Node.js 22+ and npm
- A terminal opened in the repository root

The commands below use Windows PowerShell.

## 1. Configure the Environment

Create your local Docker environment file:

```powershell
Copy-Item .env.docker.example .env.docker
```

Open `.env.docker` and replace the four example passwords with your own local test passwords.

Do not commit `.env.docker` to Git.

If the default host ports are already in use, you can change `MYSQL_HOST_PORT` and `POSTGRES_HOST_PORT` in this file.

## 2. Start the Databases

```powershell
docker compose --env-file .env.docker up -d --wait
```

Verify that both database containers are healthy:

```powershell
docker compose --env-file .env.docker ps
```

The included Northwind sample datasets are loaded automatically during the first initialization.

## 3. Build the MCP Server

```powershell
docker compose --env-file .env.docker --profile mcp build mcp-postgres
```

The MySQL and PostgreSQL MCP services use the same application image.

## 4. Test PostgreSQL with MCP Inspector

Start Inspector:

```powershell
npx.cmd -y @modelcontextprotocol/inspector docker compose -f .\compose.yaml --env-file .\.env.docker --profile mcp run --rm -T mcp-postgres
```

Open the local Inspector URL displayed in the terminal.

Select **List Tools** and verify that both tools are available:

- `get_tables`
- `query`

First, run `get_tables` to discover the database schema.

Then use `query` to execute:

```sql
SELECT COUNT(*) AS total_customers
FROM customers;
```

Expected result: **91 customers**.

### Verify Read-Only Protection

Submit the following statement to the `query` tool:

```sql
UPDATE customers
SET country = 'Turkey'
WHERE customer_id = 'ALFKI';
```

The MCP server must reject the modification.

You can verify that the record remains unchanged by running:

```sql
SELECT customer_id, company_name, country
FROM customers
WHERE customer_id = 'ALFKI';
```

Expected country: `Germany`.

These security checks must only be performed against the included sample database, not production databases.

## 5. Test MySQL with MCP Inspector

Close the previous Inspector session using `Ctrl + C`.

Start the MySQL MCP service:

```powershell
npx.cmd -y @modelcontextprotocol/inspector docker compose -f .\compose.yaml --env-file .\.env.docker --profile mcp run --rm -T mcp-mysql
```

Run `get_tables` to inspect the MySQL schema.

Then execute:

```sql
SELECT COUNT(*) AS total_customers
FROM customers;
```

Expected result: **29 customers**.

You can also retrieve sample customer records:

```sql
SELECT id, company, country_region
FROM customers
LIMIT 5;
```

The MySQL and PostgreSQL Northwind samples use different schemas and records. Their results are not expected to match.

## 6. Run Automated Tests

Install the project dependencies:

```powershell
npm.cmd ci
```

Run the automated checks:

```powershell
npm.cmd test
npm.cmd run build
```

The `test` script already runs TypeScript checks, SQL security tests, and fixture integrity tests; `build` compiles the application.

To validate the exact dataset counts against a live database, configure `DB_TYPE` and `DB_URL` with an authorized read-only connection, then run:

```powershell
npm.cmd run test:northwind
```

The live dataset test expects the included Northwind sample data.

## 7. Stop the Environment

Close any active Inspector sessions, then stop the Docker services:

```powershell
docker compose --env-file .env.docker down
```

This command preserves the database volumes, so the sample data remains available when the environment is restarted.

## Troubleshooting

If a database container fails to start, check its status and logs:

```powershell
docker compose --env-file .env.docker ps
docker compose --env-file .env.docker logs mysql postgres
```

If a host port is already in use, update the corresponding port in `.env.docker`.

Docker initialization scripts run only when the database data directory is empty. Existing volumes retain their data when containers are restarted.

**Do not delete Docker volumes unless you intentionally want to remove their stored data.**

For dataset details, see [Northwind Sample Databases](NORTHWIND_DATASETS.md).

### macOS / Linux

Replace `Copy-Item` with `cp`, use `npm` and `npx` instead of their `.cmd` equivalents, and adjust Windows-style paths to Unix-style paths.
