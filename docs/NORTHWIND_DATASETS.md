
# Northwind Sample Databases

This project includes two Northwind sample databases for testing its MySQL and PostgreSQL adapters.

Both datasets contain publicly available sample data and are intended for demonstration and development purposes only. They do not contain company or production data.

## Included Datasets

| Database | Dataset | Tables | Customers | Orders | Order Details | Products |
|---|---|---:|---:|---:|---:|---:|
| PostgreSQL | Classic Northwind | 14 | 91 | 830 | 2,155 | 77 |
| MySQL | Access 2010 / MyWind-derived Northwind | 20 | 29 | 48 | 58 | 45 |

The two databases use different schemas and sample records.

The MySQL dataset includes placeholder company names such as `Company A`. It is not an identical MySQL copy of the PostgreSQL dataset.

For this reason, queries written for one database may require adjustments when used with the other.

## Database Initialization

The sample schemas and data are automatically loaded when the Docker database containers are initialized for the first time.

The initialization files are located in:

- `docker/postgres/init/`
- `docker/mysql/init/`

Follow the installation instructions in the main [README](../README.md) to start the databases.

**Note:** Docker initialization scripts run only when the corresponding database data directory is empty. Editing an SQL file does not automatically update an existing database volume.

## Third-Party Licenses

The Northwind datasets retain their original license and attribution notices:

- [PostgreSQL Northwind License](third_party/northwind-postgres-LICENSE.txt)
- [MySQL Northwind License](third_party/northwind-mysql-LICENSE.txt)

The project's root [MIT License](../LICENSE) applies to the original application code and documentation. The included third-party datasets remain subject to their respective license terms.
