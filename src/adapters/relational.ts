import "reflect-metadata";

import {
  DataSource,
  type DataSourceOptions
} from "typeorm";

import type {
  DBAdapter,
  QueryResult,
  TableInfo
} from "../types/Adapter.js";

export abstract class TypeOrmRelationalAdapter
  implements DBAdapter {
  private readonly dataSource: DataSource;

  protected constructor(
    options: DataSourceOptions
  ) {
    this.dataSource = new DataSource(options);
  }

  async connect(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }
  }

  async disconnect(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }

  abstract getTables(): Promise<TableInfo[]>;

  async query(sql: string): Promise<QueryResult> {
    const dataSource = this.getDataSource();
    const startTime = Date.now();

    const rawResult: unknown =
      await dataSource.query(sql);

    const executionTimeMs =
      Date.now() - startTime;

    if (!Array.isArray(rawResult)) {
      throw new Error(
        "Veritabanı sorgusu beklenen satır listesini döndürmedi."
      );
    }

    const containsInvalidRow = rawResult.some(
      (row: unknown) =>
        typeof row !== "object" ||
        row === null ||
        Array.isArray(row)
    );

    if (containsInvalidRow) {
      throw new Error(
        "Veritabanı sorgusu geçersiz bir satır yapısı döndürdü."
      );
    }

    const rows =
      rawResult as Record<string, unknown>[];

    return {
      rows,
      rowCount: rows.length,
      executionTimeMs
    };
  }

  protected getDataSource(): DataSource {
    if (!this.dataSource.isInitialized) {
      throw new Error(
        "Veritabanı bağlantısı kurulmadan işlem yapılamaz."
      );
    }

    return this.dataSource;
  }
}