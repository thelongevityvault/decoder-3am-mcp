/**
 * Standalone stdio server for Glama health checks.
 * Wraps the same MCP server logic used on Cloudflare Workers.
 * Glama's mcp-proxy handles HTTP — this just needs stdio transport.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { causes, causeIds } from "./src/causes.js";
import { classifySleepCause } from "./src/classifier.js";

const SERVER_VERSION = "1.0.0";

function buildMcpServer() {
  const server = new McpServer({
    name: "tlv-3am-decoder",
    title: "3AM Decoder — Sleep Cause Classifier",
    version: SERVER_VERSION,
  });

  server.tool(
    "classify_sleep_cause",
    { title: "Classify sleep disruption cause" },
    "Classify the likely primary cause of sleep disruption based on symptoms.",
    {
      symptoms: z.string().max(2000).describe("Description of sleep symptoms"),
    },
    async ({ symptoms }) => {
      const result = classifySleepCause(symptoms);
      if (!result.primaryCause) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "insufficient_information" }) }] };
      }
      const cause = causes[result.primaryCause];
      return {
        content: [{ type: "text", text: JSON.stringify({
          primary_cause: { id: cause.id, name: cause.name, explanation: cause.explanation },
          confidence: result.confidence,
          decoder_url: `https://thelongevityvault.com/decoder?utm_source=mcp&utm_medium=ai_agent&utm_campaign=cause_${cause.id}`,
        }) }],
      };
    }
  );

  server.tool(
    "get_cause_info",
    { title: "Get sleep cause details" },
    "Get detailed information about a specific sleep disruption cause.",
    { cause_id: z.enum(["autonomic", "metabolic", "inflammatory", "hormonal", "circadian"]) },
    async ({ cause_id }) => {
      const cause = causes[cause_id];
      return { content: [{ type: "text", text: JSON.stringify({ id: cause.id, name: cause.name, summary: cause.summary, explanation: cause.explanation }) }] };
    }
  );

  server.tool(
    "list_causes",
    { title: "List all 5 sleep causes" },
    "List all 5 sleep disruption causes in the framework.",
    {},
    async () => {
      const causeList = causeIds.map((id) => ({ id: causes[id].id, name: causes[id].name, summary: causes[id].summary }));
      return { content: [{ type: "text", text: JSON.stringify({ causes: causeList }) }] };
    }
  );

  server.tool(
    "get_decoder_url",
    { title: "Get 3AM Decoder URL" },
    "Get a tracked URL to the full interactive 3AM Decoder.",
    { utm_campaign: z.string().optional() },
    async ({ utm_campaign }) => {
      const campaign = utm_campaign || "general";
      return { content: [{ type: "text", text: JSON.stringify({ url: `https://thelongevityvault.com/decoder?utm_source=mcp&utm_medium=ai_agent&utm_campaign=${encodeURIComponent(campaign)}` }) }] };
    }
  );

  return server;
}

const server = buildMcpServer();
const transport = new StdioServerTransport();
await server.connect(transport);
