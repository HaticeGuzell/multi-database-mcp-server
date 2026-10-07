import type {
  FieldInfo,
  TableInfo
} from "../types/Adapter.js";

import {
  TypeOrmRelationalAdapter
} from "./relational.js";

interface PostgreSQLColumnRow {
  tableName: string;
  columnName: string;
  dataType: string;
  isNullable: "YES" | "NO";
}

export class PostgreSQLAdapter
  extends TypeOrmRelationalAdapter {
  constructor(connectionString: string) {
    super({
      type: "postgres",
      url: connectionString,

      schema: "public",
      applicationName: "multi-database-mcp-server",

      entities: [],
      synchronize: false,
      migrationsRun: false,
      dropSchema: false,
      installExtensions: false,
      logging: false,

      connectTimeoutMS: 5000,
      poolSize: 5
    });
  }

  async getTables(): Promise<TableInfo[]> {
    const dataSource = this.getDataSource();

    const rows =
      await dataSource.query<PostgreSQLColumnRow[]>(
        `
          SELECT
            columns.table_name AS "tableName",
            columns.column_name AS "columnName",
            columns.data_type AS "dataType",
            columns.is_nullable AS "isNullable"
          FROM information_schema.columns AS columns
          INNER JOIN information_schema.tables AS tables
            ON tables.table_schema = columns.table_schema
            AND tables.table_name = columns.table_name
          WHERE columns.table_schema = 'public'
            AND tables.table_type = 'BASE TABLE'
          ORDER BY
            columns.table_name,
            columns.ordinal_position
        `
      );

    const tableMap =
      new Map<string, FieldInfo[]>();

    for (const row of rows) {
      if (!tableMap.has(row.tableName)) {
        tableMap.set(row.tableName, []);
      }

      tableMap.get(row.tableName)?.push({
        name: row.columnName,
        type: row.dataType,
        nullable: row.isNullable === "YES"
      });
    }

    return Array.from(
      tableMap.entries()
    ).map(([table, fields]) => ({
      table,
      fields
    }));
  }
}