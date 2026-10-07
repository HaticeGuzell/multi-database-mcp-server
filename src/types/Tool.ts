import type {
  McpServer
} from "@modelcontextprotocol/server";

export interface MCPTool {
  register(server: McpServer): void;
}
