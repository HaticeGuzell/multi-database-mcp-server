import {
  McpServer
} from "@modelcontextprotocol/server";

import * as z from "zod/v4";

import type {
  DBAdapter
} from "../types/Adapter.js";

import type {
  MCPTool
} from "../types/Tool.js";

export class GetTablesTool
  implements MCPTool {
  constructor(
    private readonly adapter: DBAdapter
  ) {}

  register(server: McpServer): void {
    server.registerTool(
      "get_tables",
      {
        description:
          "Bağlı veritabanındaki tabloları ve kolon bilgilerini getirir.",

        inputSchema: z.object({})
      },
      async () => this.execute()
    );
  }

  async execute() {
    try {
      const tables =
        await this.adapter.getTables();

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              tables,
              null,
              2
            )
          }
        ]
      };
    } catch (error: unknown) {
      return {
        isError: true,
        content: [
          {
            type: "text" as const,
            text:
              "Tablolar alınamadı: " +
              this.getErrorMessage(error)
          }
        ]
      };
    }
  }

  private getErrorMessage(
    error: unknown
  ): string {
    return error instanceof Error
      ? error.message
      : String(error);
  }
}
