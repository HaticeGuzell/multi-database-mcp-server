
# Multi-Database MCP Server

[English](README.md) | [Türkçe](docs/README_TR.md)

A read-only Model Context Protocol (MCP) server built with TypeScript and TypeORM, providing a standardized way for AI applications to interact with MySQL and PostgreSQL databases.

The server enables AI clients to discover database schemas and execute validated SQL queries through two MCP tools.

## Features

- **Multi-database support:** MySQL and PostgreSQL.
- **Dynamic schema discovery:** Retrieve table and column information without hardcoding database schemas.
- **Read-only querying:** Execute validated SELECT statements.
- **SQL validation:** Restrict modification commands, dangerous operations, and multiple statements.
- **Result limits:** Automatically limit query results to a maximum of 100 rows.
- **Database-level protection:** Dedicated read-only users for the included Docker databases.
- **Docker support:** Run both databases and the MCP server without installing database servers locally.

## MCP Tools

| Tool | Description |
|---|---|
| `get_tables` | Returns the tables and column metadata of the connected database. |
| `query` | Validates and executes read-only SELECT queries. |

The `query` tool returns:

- `rows`: Query results.
- `rowCount`: Number of returned rows.
- `executionTimeMs`: Query execution time in milliseconds.

The server connects to one configured database per instance.

Natural-language processing is handled by the connected AI application, not by the MCP server itself.

## Architecture

```text
User
  |
AI Application / LLM
  |
MCP Server
  |-- get_tables
  |-- query
  |     |
  |   SQL Validator
  |
Database Adapter
  |
MySQL / PostgreSQL
```

The project uses TypeORM for database connection and query management, with separate adapters for MySQL and PostgreSQL.

## Requirements

- Docker Desktop or Docker Engine with Compose
- Node.js 22+ and npm for local tests and MCP Inspector

Local installation of MySQL or PostgreSQL is not required when using Docker.

## Quick Start

The following commands are intended for Windows PowerShell. Run them from the repository root.

### 1. Configure the environment

Copy the example configuration:

```powershell
Copy-Item .env.docker.example .env.docker
```

Open `.env.docker` and replace the four example passwords with your own local test passwords. Use letters, numbers, and underscores for simplest database URL compatibility. Never commit this private file.


### 2. Start the databases

```powershell
docker compose --env-file .env.docker up -d --wait
```

Check their status:

```powershell
docker compose --env-file .env.docker ps
```

Both MySQL and PostgreSQL should report a healthy status. Host ports default to `127.0.0.1:3307` (MySQL) and `127.0.0.1:5433` (PostgreSQL); adjust the optional ports in `.env.docker` if already occupied. The MCP containers use Docker-internal ports.

### 3. Build the MCP Docker image

```powershell
docker compose --env-file .env.docker --profile mcp build mcp-postgres
```

Both MCP services use the same application image.

### 4. Connect using MCP Inspector

For PostgreSQL:

```powershell
npx.cmd -y @modelcontextprotocol/inspector docker compose -f .\compose.yaml --env-file .\.env.docker --profile mcp run --rm -T mcp-postgres
```

Open the local Inspector URL displayed in your terminal.

Select **List Tools** to discover `get_tables` and `query`.

Run `get_tables`, then test `query` using:

```sql
SELECT COUNT(*) AS total_customers
FROM customers;
```

Expected PostgreSQL result: **91 customers**.

To test MySQL, close the current Inspector session and run:

```powershell
npx.cmd -y @modelcontextprotocol/inspector docker compose -f .\compose.yaml --env-file .\.env.docker --profile mcp run --rm -T mcp-mysql
```

Expected MySQL result for the same COUNT query: **29 customers**.

For additional setup instructions, see the [Reviewer Quick Start](docs/REVIEWER_QUICKSTART.md).

## Included Sample Databases

Two Northwind sample database variants are provided for testing:

| Database | Tables | Customers | Orders | Products |
|---|---:|---:|---:|---:|
| PostgreSQL | 14 | 91 | 830 | 77 |
| MySQL | 20 | 29 | 48 | 45 |

These datasets use different schemas and sample records. Queries written for one database may require adjustments for the other.

See [Northwind Datasets](docs/NORTHWIND_DATASETS.md) for additional information.

## Running Tests

Install project dependencies:

```powershell
npm.cmd ci
```

Run the automated checks:

```powershell
npm.cmd test
npm.cmd run build
```

`npm.cmd test` runs TypeScript, SQL security, and offline fixture-integrity checks; `npm.cmd run build` compiles the project. For macOS/Linux, use `npm` and `npx` in place of the `.cmd` executables and adjust the Windows-style paths.

Live database integration tests are also available. They require a separately configured read-only database connection.

## Using Your Own Database

The MCP server is not limited to the included Northwind samples.

To connect to an existing MySQL or PostgreSQL database, copy `.env.example` to `.env` and configure:

- `DB_TYPE`: `mysql` or `postgres`
- `DB_URL`: Connection URL for an authorized read-only database user

The server discovers the connected database's schema dynamically. Each process uses one configured database connection. The MCP server does not itself include an LLM or convert natural language into SQL.

Use appropriate database permissions and review the security configuration before connecting external data sources.

## Connecting an AI Application

The MCP server can be used with compatible MCP clients, including MCP Inspector and AnythingLLM.

A sample AnythingLLM configuration is available in:

[AnythingLLM configuration example](docs/anythingllm_mcp_servers.example.json)

Update the local file paths to match your installation. The MCP services use local **stdio** rather than a hosted HTTP endpoint.

Example natural-language questions are available in [Demo Queries](docs/DEMO_QUERIES.md).

## Stopping the Environment

To stop the Docker services while preserving database data:

```powershell
docker compose --env-file .env.docker down
```

Database data is stored in Docker volumes and remains available when the services are restarted. Initialization SQL runs only when a database volume is new/empty: changing a seed file does not replace existing stored data. Avoid `down -v` unless you intend to erase the demo databases.

## Security

This project is designed as a read-only proof of concept.

It includes SQL validation, result limits, and dedicated database reader accounts. However, these controls do not replace production-grade authentication, authorization, query resource limits, monitoring, or a comprehensive security review.

Do not expose sensitive production databases through this demonstration setup. The 100-row output cap does not limit query cost or execution time.

See [Security Notes](docs/SECURITY_NOTES.md).

## License

The original application code and project documentation are released under the [MIT License](LICENSE).

The included Northwind sample datasets retain their respective third-party licenses and attribution notices, available in [docs/third_party/](docs/third_party/).
