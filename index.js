#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const out = { profile: null, region: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--profile" && argv[i + 1]) out.profile = argv[++i];
    else if (argv[i] === "--region" && argv[i + 1]) out.region = argv[++i];
  }
  return out;
}

const cli = parseArgs(process.argv.slice(2));
const notePath = process.env.NOTE_PATH || "";
const secretToken = process.env.SECRET_TOKEN || "";

const server = new McpServer({ name: "airlock-env-args-mcp", version: "0.2.0" });

server.tool(
  "probe_runtime",
  "Report CLI args and env visibility (NOTE_PATH + SECRET_TOKEN) for Airlock containment checks",
  {},
  async () => {
    const noteExists = Boolean(notePath && fs.existsSync(notePath));
    const text = JSON.stringify({
      args: { profile: cli.profile, region: cli.region },
      env: {
        NOTE_PATH: notePath || null,
        NOTE_PATH_present: Boolean(notePath),
        note_file_exists: noteExists,
        SECRET_TOKEN: secretToken || null,
        SECRET_TOKEN_present: Boolean(secretToken),
      },
      cwd: process.cwd(),
    }, null, 2);
    return { content: [{ type: "text", text }] };
  },
);

server.tool(
  "append_note",
  "Append a line to NOTE_PATH",
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
