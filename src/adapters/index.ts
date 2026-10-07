import type {
  DBAdapter
} from "../types/Adapter.js";

import {
  MySQLAdapter
} from "./mysql.js";

import {
  PostgreSQLAdapter
} from "./postgres.js";

export type SupportedDatabaseType =
  | "mysql"
  | "postgres";

function assertNever(
  value: never
): never {
  throw new Error(
    `Desteklenmeyen veritabanı türü: ${String(value)}`
  );
}

export function createAdapter(
  databaseType: SupportedDatabaseType,
  connectionString: string
): DBAdapter {
  switch (databaseType) {
    case "mysql":
      return new MySQLAdapter(
        connectionString
      );

    case "postgres":
      return new PostgreSQLAdapter(
        connectionString
      );

    default:
      return assertNever(databaseType);
  }
}