import {
  McpServer
} from "@modelcontextprotocol/server";

import * as z from "zod/v4";

import {
  validateReadOnlyQuery
} from "../security/validateQuery.js";

import type {
  DBAdapter
} from "../types/Adapter.js";

import type {
  MCPTool
} from "../types/Tool.js";

export class QueryTool
  implements MCPTool {
  constructor(
    private readonly adapter: DBAdapter
  ) {}

  register(server: McpServer): void {
    server.registerTool(
      "query",
      {
        description:
          "Yalnızca read-only SELECT sorgularını doğrular ve çalıştırır.",

        inputSchema: z.object({
          sql: z
            .string()
            .trim()
            .min(
              1,
              "SQL sorgusu boş bırakılamaz."
            )
        })
      },
      async ({ sql }) =>
        this.execute(sql)
    );
  }

  async execute(sql: string) {
    try {
      const safeSql =
        validateReadOnlyQuery(sql);

      const result =
        await this.adapter.query(safeSql);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              result,
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
              "Sorgu çalıştırılamadı: " +
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
