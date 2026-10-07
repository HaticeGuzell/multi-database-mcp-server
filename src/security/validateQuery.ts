// undefined = otomatik satır sınırı kapalı.
// Örneğin 100 yapılırsa sorgular en fazla 100 satır döndürür.
export const QUERY_ROW_LIMIT: number | undefined =
  100;

const MAX_QUERY_LENGTH = 10_000;

const FORBIDDEN_KEYWORDS = [
  "INSERT",
  "UPDATE",
  "DELETE",
  "DROP",
  "ALTER",
  "TRUNCATE",
  "CREATE",
  "REPLACE",
  "RENAME",
  "GRANT",
  "REVOKE",
  "CALL",
  "EXECUTE",
  "PREPARE",
  "DEALLOCATE",
  "SET",
  "USE",
  "SHOW",
  "DESCRIBE",
  "EXPLAIN",
  "ANALYZE",
  "OPTIMIZE",
  "REPAIR",
  "FLUSH",
  "KILL",
  "LOCK",
  "UNLOCK",
  "INTO",
  "OUTFILE",
  "DUMPFILE",
  "LOAD"
] as const;

const FORBIDDEN_FUNCTION_PATTERNS = [
  // MySQL: bekletme, yüksek CPU kullanımı, dosya ve lock erişimi.
  "SLEEP",
  "BENCHMARK",
  "LOAD_FILE",
  "GET_LOCK",
  "RELEASE_LOCK",
  "(?:MASTER|SOURCE)_POS_WAIT",
  "WAIT_FOR_EXECUTED_GTID_SET",

  // PostgreSQL: bekletme ve sunucu dosyalarına erişim.
  "PG_SLEEP(?:_FOR|_UNTIL)?",
  "PG_(?:READ_FILE|READ_BINARY_FILE|STAT_FILE|LS_[A-Z0-9_]+)",

  // PostgreSQL: backend ve oturum ayarlarına müdahale.
  "PG_(?:CANCEL_BACKEND|TERMINATE_BACKEND|LOG_BACKEND_MEMORY_CONTEXTS|RELOAD_CONF|ROTATE_LOGFILE)",
  "SET_CONFIG",

  // PostgreSQL: advisory lock oluşturma veya kaldırma.
  "PG_(?:TRY_)?ADVISORY_[A-Z0-9_]+",

  // PostgreSQL: sequence, large-object ve harici bağlantı işlemleri.
  "NEXTVAL",
  "SETVAL",
  "LO_[A-Z0-9_]+",
  "DBLINK(?:_[A-Z0-9_]+)?"
] as const;

const FORBIDDEN_FUNCTIONS = new RegExp(
  "\\b(?:" +
    FORBIDDEN_FUNCTION_PATTERNS.join("|") +
    ")\\b[\"`]?\\s*\\(",
  "i"
);

const COMMENT_SYNTAX = /--|#|\/\*|\*\//;

export function validateReadOnlyQuery(
  input: string,
  maxRows: number | undefined = QUERY_ROW_LIMIT
): string {
  let sql = input.trim();

  if (sql.length === 0) {
    throw new Error(
      "SQL sorgusu boş bırakılamaz."
    );
  }

  if (sql.length > MAX_QUERY_LENGTH) {
    throw new Error(
      `SQL sorgusu en fazla ${MAX_QUERY_LENGTH} karakter olabilir.`
    );
  }

  if (COMMENT_SYNTAX.test(sql)) {
    throw new Error(
      "SQL yorum işaretlerine izin verilmez."
    );
  }

  // Sorgunun sonundaki tek bir noktalı virgüle izin veririz
  // fakat MySQL'e göndermeden önce kaldırırız.
  if (sql.endsWith(";")) {
    sql = sql.slice(0, -1).trim();
  }

  // Sorgunun içinde hâlâ noktalı virgül varsa
  // birden fazla sorgu gönderilmeye çalışılıyor olabilir.
  if (sql.includes(";")) {
    throw new Error(
      "Aynı istekte birden fazla SQL sorgusu çalıştırılamaz."
    );
  }

  if (!/^SELECT\b/i.test(sql)) {
    throw new Error(
      "Yalnızca SELECT sorgularına izin verilir."
    );
  }

  for (const keyword of FORBIDDEN_KEYWORDS) {
    const keywordPattern = new RegExp(
      `\\b${keyword}\\b`,
      "i"
    );

    if (keywordPattern.test(sql)) {
      throw new Error(
        `Yasaklı SQL anahtar kelimesi: ${keyword}`
      );
    }
  }

  if (FORBIDDEN_FUNCTIONS.test(sql)) {
    throw new Error(
      "Bu SQL fonksiyonunun kullanılmasına izin verilmez."
    );
  }

  // maxRows undefined ise otomatik LIMIT uygulanmaz.
  if (maxRows === undefined) {
    return sql;
  }

  // Sınır açıldıysa geçerli bir pozitif tam sayı olmalı.
  if (
    !Number.isSafeInteger(maxRows) ||
    maxRows < 1
  ) {
    throw new Error(
      "Satır sınırı pozitif bir tam sayı olmalıdır."
    );
  }

  return enforceRowLimit(sql, maxRows);
}

function enforceRowLimit(
  sql: string,
  maxRows: number
): string {
  // MySQL'in LIMIT offset, satırSayısı biçimi:
  // Örnek: LIMIT 20, 10
  const commaLimitPattern =
    /\bLIMIT\s+(\d+)\s*,\s*(\d+)\s*$/i;

  const commaLimitMatch =
    sql.match(commaLimitPattern);

  if (commaLimitMatch !== null) {
    const offset = Number(commaLimitMatch[1]);
    const requestedRows = Number(
      commaLimitMatch[2]
    );

    const safeRows = Math.min(
      requestedRows,
      maxRows
    );

    return sql.replace(
      commaLimitPattern,
      `LIMIT ${offset}, ${safeRows}`
    );
  }

  // Standart LIMIT biçimleri:
  // LIMIT 10
  // LIMIT 10 OFFSET 20
  const standardLimitPattern =
    /\bLIMIT\s+(\d+)(?:\s+OFFSET\s+(\d+))?\s*$/i;

  const standardLimitMatch =
    sql.match(standardLimitPattern);

  if (standardLimitMatch !== null) {
    const requestedRows = Number(
      standardLimitMatch[1]
    );

    const offset = standardLimitMatch[2];

    const safeRows = Math.min(
      requestedRows,
      maxRows
    );

    const safeLimit =
      offset === undefined
        ? `LIMIT ${safeRows}`
        : `LIMIT ${safeRows} OFFSET ${offset}`;

    return sql.replace(
      standardLimitPattern,
      safeLimit
    );
  }

  if (/\bLIMIT\b/i.test(sql)) {
    throw new Error(
      "Desteklenmeyen veya güvenli olmayan LIMIT kullanımı."
    );
  }

  return `${sql} LIMIT ${maxRows}`;
}