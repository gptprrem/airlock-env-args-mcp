# airlock-env-args-mcp

Tiny MCP for Airlock integration tests.

- Env: `NOTE_PATH` — path to a notes file
- Arg: `--profile <name>` — echoed by the `whoami` tool

```bash
NOTE_PATH=/tmp/notes.txt node index.js --profile work
```
