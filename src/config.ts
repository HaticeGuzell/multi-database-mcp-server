import "dotenv/config";

function getRequiredEnvironmentVariable(
  name: string
): string {
  const value = process.env[name];

  if (
    value === undefined ||
    value.trim() === ""
  ) {
    throw new Error(
      `Eksik environment variable: ${name}`
    );
  }

  return value.trim();
}

const databaseType =
  getRequiredEnvironmentVariable("DB_TYPE")
    .toLowerCase();

if (
  databaseType !== "mysql" &&
  databaseType !== "postgres"
) {
  throw new Error(
    "DB_TYPE yalnızca mysql veya postgres olabilir."
  );
}

const databaseUrl =
  getRequiredEnvironmentVariable("DB_URL");

export const config = {
  database: {
    type: databaseType,
    url: databaseUrl
  }
} as const;