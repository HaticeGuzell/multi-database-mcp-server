import type {
  FieldInfo,
  TableInfo
} from "../types/Adapter.js";

import {
  TypeOrmRelationalAdapter
} from "./relational.js";

interface MySQLColumnRow {
  tableName: string;
  columnName: string;
  dataType: string;
  isNullable: "YES" | "NO";
}

export class MySQLAdapter
  extends TypeOrmRelationalAdapter {
  constructor(connectionString: string) {
    super({
      type: "mysql",
      url: connectionString,

      entities: [],
      synchronize: false,
      migrationsRun: false,
      dropSchema: false,
      logging: false,

      poolSize: 5,
      multipleStatements: false
    });
  }

  async getTables(): Promise<TableInfo[]> {
    const dataSource = this.getDataSource();

    const rows =
      await dataSource.query<MySQLColumnRow[]>(
        `
          SELECT
            TABLE_NAME AS tableName,
            COLUMN_NAME AS columnName,
            COLUMN_TYPE AS dataType,
            IS_NULLABLE AS isNullable
          FROM information_schema.columns
          WHERE TABLE_SCHEMA = DATABASE()
          ORDER BY TABLE_NAME, ORDINAL_POSITION
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