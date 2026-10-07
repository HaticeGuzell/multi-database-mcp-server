import "reflect-metadata";

import {
  PostgreSQLAdapter
} from "../src/adapters/postgres.js";

import {
  config
} from "../src/config.js";

async function testPostgresAdapter(): Promise<void> {
  if (config.database.type !== "postgres") {
    throw new Error(
      "test:postgres yalnızca DB_TYPE=postgres iken çalıştırılabilir."
    );
  }

  const adapter = new PostgreSQLAdapter(
    config.database.url
  );

  try {
    await adapter.connect();

    console.log(
      "PostgreSQLAdapter bağlantısı başarılı!"
    );

    const connectionInfo = await adapter.query(`
      SELECT
        current_database() AS "databaseName",
        current_user AS "connectedAs",
        current_setting(
          'default_transaction_read_only'
        ) AS "readOnly"
    `);

    console.log("\nBağlantı bilgileri:");
    console.table(connectionInfo.rows);

    const firstConnectionRow =
      connectionInfo.rows[0] as
        (Record<string, unknown> | undefined);

    if (
      firstConnectionRow?.["readOnly"] !== "on"
    ) {
      throw new Error(
        "PostgreSQL bağlantısı read-only modda değil."
      );
    }

    const tables = await adapter.getTables();

    if (tables.length === 0) {
      throw new Error(
        "PostgreSQLAdapter hiçbir tablo bulamadı."
      );
    }

    console.log(
      `\nNorthwind içinde ${tables.length} tablo bulundu:`
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
      `\ncustomers tablosu ${customersTable.fields.length} kolon içeriyor:`
    );

    console.table(customersTable.fields);

    const result = await adapter.query(`
      SELECT
        customer_id,
        company_name,
        country
      FROM customers
      ORDER BY customer_id
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
      "PostgreSQLAdapter bağlantısı kapatıldı."
    );
  }
}

testPostgresAdapter().catch(
  (error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      "PostgreSQLAdapter testi başarısız:",
      message
    );

    process.exit(1);
  }
);