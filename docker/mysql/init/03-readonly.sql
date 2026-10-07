-- The official MySQL image creates MYSQL_USER before running init scripts.
-- Restrict that account to SELECT-only access for the test database.
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'mcp_reader'@'%';
GRANT SELECT ON northwind.* TO 'mcp_reader'@'%';
FLUSH PRIVILEGES;
