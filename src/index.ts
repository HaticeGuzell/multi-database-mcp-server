import "reflect-metadata";

import {
  McpServer
} from "@modelcontextprotocol/server";

import {
  StdioServerTransport
} from "@modelcontextprotocol/server/stdio";

import {
  createAdapter
} from "./adapters/index.js";

import {
  config
} from "./config.js";

import {
  GetTablesTool
} from "./tools/getTables.js";

import {
  QueryTool
} from "./tools/query.js";

import type {
  DBAdapter
} from "./types/Adapter.js";

import type {
  MCPTool
} from "./types/Tool.js";

const server = new McpServer({
  name: "multi-database-mcp-server",
  version: "1.0.0"
});

const adapter: DBAdapter = createAdapter(
  config.database.type,
  config.database.url
);

const databaseLabel =
  config.database.type === "mysql"
    ? "MySQL"
    : "PostgreSQL";

const tools: MCPTool[] = [
  new GetTablesTool(adapter),
  new QueryTool(adapter)
];

for (const tool of tools) {
  tool.register(server);
}

function getErrorMessage(
  error: unknown
): string {
  return error instanceof Error
    ? error.message
    : String(error);
}

async function main(): Promise<void> {
  await adapter.connect();

  console.error(
    `${databaseLabel} veritabanı bağlantısı kuruldu.`
  );

  const transport =
    new StdioServerTransport();

  await server.connect(transport);

  console.error(
    `MCP Server stdio üzerinden ${databaseLabel} ile çalışıyor.`
  );
}

main().catch(
  (error: unknown) => {
    console.error(
      "MCP Server başlatılamadı:",
      getErrorMessage(error)
    );

    process.exit(1);
  }
);
