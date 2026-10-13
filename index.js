#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const out = { profile: "default" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--profile" && argv[i + 1]) {
      out.profile = argv[++i];
    }
  }
  return out;
}

const cli = parseArgs(process.argv.slice(2));
const notePath = process.env.NOTE_PATH || "";

const server = new McpServer({ name: "airlock-env-args-mcp", version: "0.1.0" });

server.tool(
  "whoami",
  "Report the runtime profile flag and NOTE_PATH env (proves env + args reached the process)",
  {},
  async () => {
    const note = notePath && fs.existsSync(notePath)
      ? fs.readFileSync(notePath, "utf8").trim()
      : "(missing or unset)";
    const text = JSON.stringify({
      profile: cli.profile,
      NOTE_PATH: notePath || null,
      note,
      cwd: process.cwd(),
    }, null, 2);
    return { content: [{ type: "text", text }] };
  },
);

server.tool(
  "append_note",
  "Append a line to NOTE_PATH (requires NOTE_PATH env and a writable shared path)",
  { line: z.string() },
  async ({ line }) => {
    if (!notePath) {
      return { content: [{ type: "text", text: "NOTE_PATH is not set" }], isError: true };
    }
    fs.mkdirSync(path.dirname(notePath), { recursive: true });
    fs.appendFileSync(notePath, line + "\n");
    return { content: [{ type: "text", text: `appended to ${notePath}` }] };
  },
);

await server.connect(new StdioServerTransport());
