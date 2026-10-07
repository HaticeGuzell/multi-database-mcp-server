
# Security Notes

The Multi-Database MCP Server is designed as a read-only proof of concept for MySQL and PostgreSQL databases.

It includes application-level SQL validation and database-level access restrictions to reduce the risk of unauthorized modifications.

This project is intended for development and demonstration purposes. Additional security measures are required before using it with sensitive or production data.

## Implemented Security Controls

### Read-Only SQL Validation

The `query` tool uses `src/security/validateQuery.ts` to validate SQL statements before execution.

The validator:

- Accepts SELECT statements only.
- Rejects database modification and administrative commands.
- Blocks selected dangerous SQL functions.
- Rejects SQL comments and multiple statements.
- Applies a maximum result limit of 100 rows.

### Database-Level Permissions

The included Docker databases use dedicated read-only accounts:

| Database | User |
|---|---|
| MySQL | `mcp_reader` |
| PostgreSQL | `mcp_reader_pg` |

These users are configured with SELECT-only access to the sample tables.

The PostgreSQL reader also has `default_transaction_read_only` enabled.

### Local Docker Configuration

- Database host ports are bound to `127.0.0.1` by default.
- Local passwords are stored in `.env.docker`, which is excluded from Git.
- The MCP runtime container runs as a non-root user.

## Security Limitations

The current SQL validator uses restrictive pattern-based validation. It is not a complete SQL parser and cannot guarantee that every accepted query is harmless.

The 100-row output limit controls the number of returned rows, but does not limit database scanning, query complexity, or execution time.

The current implementation does not provide:

- Per-user or per-department authorization.
- Row-level or column-level access policies.
- Comprehensive query cost and execution-time limits.
- Centralized audit logging.
- Remote MCP authentication.

The MCP server currently uses local stdio transport. Deploying it as a shared or remotely accessible service requires additional authentication, authorization, and network security controls.

## Data Privacy

MCP tools can return any data accessible to the configured database account.

When connected to an AI application, generated SQL and returned query results may be processed by the selected AI service.

Before connecting non-demo databases, review the relevant organization's data protection and AI usage policies.

Never commit credentials, API keys, private database records, or environment files containing secrets.

## Production Considerations

Before adapting this project for production use, consider implementing:

- A robust SQL parser and dialect-aware validation.
- Fine-grained database permissions.
- Authentication and user-level authorization.
- Query execution timeouts and resource limits.
- Audit logging and monitoring.
- Secure secrets management.
- A security review appropriate to the deployment environment.

Database-level least-privilege permissions should remain in place even when application-level validation is improved.

## Reporting Security Issues

If you discover a security vulnerability, avoid publishing passwords, tokens, or sensitive data in public GitHub issues.

Contact the repository owner privately before disclosing sensitive details.
