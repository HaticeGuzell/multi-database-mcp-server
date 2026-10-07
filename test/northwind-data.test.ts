import "reflect-metadata";

import { createAdapter } from "../src/adapters/index.js";
import { config } from "../src/config.js";

// Integration test for the *supplied Docker Northwind datasets* only.
// DB_TYPE and DB_URL are read from the process environment / local .env;
// neither the URL nor its secret is logged.
const expected = config.database.type === "postgres"
  ? { tables: 14, customers: 91, orders: 830, order_details: 2155, products: 77 }
  : { tables: 20, customers: 29, orders: 48, order_details: 58, products: 45, inventory_transactions: 102 };

async function main(): Promise<void> {
  const dbName = new URL(config.database.url).pathname.replace(/^\//, "").split("/")[0];
  if (dbName !== "northwind") {
    throw new Error("This dataset-specific integration test is only for a database named northwind.");
  }

  const adapter = createAdapter(config.database.type, config.database.url);
  try {
    await adapter.connect();
    const tables = await adapter.getTables();
    if (tables.length !== expected.tables) {
      throw new Error(`Expected ${expected.tables} tables, found ${tables.length}. Is an old Docker volume still in use?`);
    }
    console.log(`${config.database.type}: ${tables.length} tables: OK`);

    for (const [table, count] of Object.entries(expected)) {
      if (table === "tables") continue;
      if (!tables.some((t) => t.table === table)) {
        throw new Error(`Missing expected table: ${table}`);
      }
      const result = await adapter.query(`SELECT COUNT(*) AS record_count FROM ${table}`);
      const row = result.rows[0] as Record<string, unknown> | undefined;
      const actual = Number(row?.["record_count"]);
      if (actual !== count) {
        throw new Error(`${table}: expected ${count}, found ${actual}. Check Docker init logs and volume freshness.`);
      }
      console.log(`${table}: ${actual} records: OK`);
    }
  } finally {
    await adapter.disconnect();
  }
  console.log("Northwind dataset integration test passed.");
}

main().catch((error: unknown) => {
  console.error("Northwind dataset integration test failed:", error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
