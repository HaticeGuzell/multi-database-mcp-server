import assert from "node:assert/strict";

import {
  validateReadOnlyQuery
} from "../src/security/validateQuery.js";

// LIMIT yazılmadığında varsayılan LIMIT 100 eklenmeli.
assert.equal(
  validateReadOnlyQuery(
    "SELECT * FROM customers"
  ),
  "SELECT * FROM customers LIMIT 100"
);

// İstenirse farklı bir satır sınırı verilebilmeli.
assert.equal(
  validateReadOnlyQuery(
    "SELECT * FROM customers",
    50
  ),
  "SELECT * FROM customers LIMIT 50"
);

// Kullanıcının yazdığı sınır 100'den küçükse korunmalı.
assert.equal(
  validateReadOnlyQuery(
    "SELECT * FROM customers LIMIT 5"
  ),
  "SELECT * FROM customers LIMIT 5"
);

// Kullanıcının yazdığı sınır 100'ü aşarsa 100'e indirilmeli.
assert.equal(
  validateReadOnlyQuery(
    "SELECT * FROM customers LIMIT 500"
  ),
  "SELECT * FROM customers LIMIT 100"
);

// PostgreSQL LIMIT ... OFFSET biçimi kontrol edilmeli.
assert.equal(
  validateReadOnlyQuery(
    "SELECT * FROM customers LIMIT 500 OFFSET 20"
  ),
  "SELECT * FROM customers LIMIT 100 OFFSET 20"
);

// MySQL LIMIT offset, satırSayısı biçimi kontrol edilmeli.
assert.equal(
  validateReadOnlyQuery(
    "SELECT * FROM customers LIMIT 20, 500"
  ),
  "SELECT * FROM customers LIMIT 20, 100"
);

// Sondaki tek noktalı virgül kaldırılmalı.
assert.equal(
  validateReadOnlyQuery(
    "SELECT COUNT(*) FROM customers;"
  ),
  "SELECT COUNT(*) FROM customers LIMIT 100"
);

// Veri değiştiren sorgular reddedilmeli.
assert.throws(
  () =>
    validateReadOnlyQuery(
      "UPDATE customers SET company = 'Test'"
    ),
  /yalnızca SELECT/i
);

// Birden fazla sorgu reddedilmeli.
assert.throws(
  () =>
    validateReadOnlyQuery(
      "SELECT * FROM customers; SELECT * FROM orders"
    ),
  /birden fazla/i
);

// SQL yorumları reddedilmeli.
assert.throws(
  () =>
    validateReadOnlyQuery(
      "SELECT * FROM customers -- yorum"
    ),
  /yorum/i
);

// MySQL tehlikeli fonksiyonu reddedilmeli.
assert.throws(
  () =>
    validateReadOnlyQuery(
      "SELECT SLEEP(10)"
    ),
  /fonksiyon/i
);

const forbiddenPostgreSQLFunctionQueries = [
  "SELECT pg_sleep(10)",
  'SELECT pg_catalog."pg_sleep"(10)',
  "SELECT pg_read_file('/tmp/example')",
  "SELECT * FROM pg_ls_waldir()",
  "SELECT set_config('search_path', 'public', false)",
  "SELECT pg_advisory_lock(1)",
  "SELECT pg_try_advisory_xact_lock(1)",
  "SELECT pg_reload_conf()",
  "SELECT nextval('orders_order_id_seq')",
  "SELECT lo_import('/tmp/example')",
  "SELECT dblink_connect('connection')"
] as const;

for (const sql of forbiddenPostgreSQLFunctionQueries) {
  assert.throws(
    () => validateReadOnlyQuery(sql),
    /fonksiyon/i,
    `${sql} sorgusu reddedilmeliydi.`
  );
}

console.log(
  "MySQL ve PostgreSQL read-only güvenlik testleri başarıyla geçti."
);