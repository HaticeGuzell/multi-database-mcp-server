export interface FieldInfo {
  name: string;
  type: string;
  nullable: boolean;
}

export interface TableInfo {
  table: string;
  fields: FieldInfo[];
}

export interface QueryResult {
  rows: unknown[];
  rowCount: number;
  executionTimeMs: number;
}

export interface DBAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getTables(): Promise<TableInfo[]>;
  query(sql: string): Promise<QueryResult>;
}