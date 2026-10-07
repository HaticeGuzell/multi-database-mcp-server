import "reflect-metadata";

import {
  createAdapter
} from "../src/adapters/index.js";

import {
  config
} from "../src/config.js";

async function testSelectedAdapter(): Promise<void> {
  const databaseLabel =
    config.database.type === "mysql"
      ? "MySQL"
      : "PostgreSQL";

  const adapter = createAdapter(
    config.database.type,
    config.database.url
  );

  try {
    await adapter.connect();

    console.log(
      `${databaseLabel} adapter bağlantısı başarılı!`
    );

    const tables = await adapter.getTables();

    if (tables.length === 0) {
      throw new Error(
        `${databaseLabel} adapter hiçbir tablo bulamadı.`
      );
    }

    console.log(
      `\n${databaseLabel} veritabanında ${tables.length} tablo bulundu:`
    );

    for (const table of tables) {
      console.log(
        `- ${table.table} (${table.fields.length} kolon)`
      );
    }

    const customersTable = tables.find(
      (table) => table.table === "customers"
    );

    if (customersTable === undefined) {
      throw new Error(
        "customers tablosu bulunamadı."
      );
    }

    console.log(
      `\ncustomers tablosu ${customersTable.fields.length} kolon içeriyor.`
    );

    const result = await adapter.query(`
      SELECT *
      FROM customers
      LIMIT 5
    `);

    if (result.rowCount !== 5) {
      throw new Error(
        `5 satır bekleniyordu, ${result.rowCount} satır döndü.`
      );
    }

    console.log("\nSorgu sonucu:");
    console.log(
      `Satır sayısı: ${result.rowCount}`
    );
    console.log(
      `Çalışma süresi: ${result.executionTimeMs} ms`
    );

    console.table(result.rows);
  } finally {
    await adapter.disconnect();

    console.log(
      `${databaseLabel} bağlantısı kapatıldı.`
    );
  }
}

testSelectedAdapter().catch(
  (error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      "Adapter testi başarısız:",
      message
    );

    process.exit(1);
  }
);