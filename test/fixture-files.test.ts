import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// Offline/static integrity checks: these do not replace Docker database execution.
const root = process.cwd();
function load(p: string): string { return readFileSync(join(root, p), "utf8"); }
function count(text: string, regex: RegExp): number { return [...text.matchAll(regex)].length; }
function equal(label: string, actual: number, wanted: number): void {
  if (actual !== wanted) throw new Error(`${label}: expected ${wanted}, got ${actual}`);
  console.log(`${label}: ${actual} OK`);
}

const pg = load("docker/postgres/init/01-schema.sql");
const ms = load("docker/mysql/init/01-schema.sql");
const md = load("docker/mysql/init/02-data.sql");
const checks: [string, string, RegExp, number][] = [
  ["postgres tables", pg, /^CREATE TABLE /gm, 14],
  ["postgres customers", pg, /^INSERT INTO customers VALUES/gm, 91],
  ["postgres orders", pg, /^INSERT INTO orders VALUES/gm, 830],
  ["postgres order_details", pg, /^INSERT INTO order_details VALUES/gm, 2155],
  ["postgres products", pg, /^INSERT INTO products VALUES/gm, 77],
  ["mysql tables", ms, /^CREATE TABLE IF NOT EXISTS /gm, 20],
  ["mysql customers", md, /^INSERT INTO `customers` /gm, 29],
  ["mysql orders", md, /^INSERT INTO `orders` /gm, 48],
  ["mysql order_details", md, /^INSERT INTO `order_details` /gm, 58],
  ["mysql products", md, /^INSERT INTO `products` /gm, 45],
  ["mysql inventory_transactions", md, /^INSERT INTO `inventory_transactions` /gm, 102]
];
for (const [label, text, regex, wanted] of checks) equal(label, count(text, regex), wanted);
if (/^\s*SET default_with_oids\s*=/m.test(pg)) throw new Error("PostgreSQL 17 obsolete SET was not disabled.");
if (/^\s*DROP SCHEMA /m.test(ms)) throw new Error("MySQL seed must not drop Docker-created schema.");
for (const p of ["docker/postgres/init/02-readonly.sh", "docker/mysql/init/03-readonly.sql",
  "docs/third_party/northwind-postgres-LICENSE.txt", "docs/third_party/northwind-mysql-LICENSE.txt"]) {
  if (!existsSync(join(root, p))) throw new Error(`Missing ${p}`);
}
console.log("Seed-file static integrity checks passed (live Docker test is separate).");
