# airlock-env-args-mcp

Integration fixture for Airlock env allowlists and CLI arg passthrough.

## Env (two names)

| Name | Purpose |
|---|---|
| `NOTE_PATH` | Path to a notes file the tool may read/write |
| `SECRET_TOKEN` | Second secret — leave **off** the approval to prove it never enters the container |

## Args (two flags)

```bash
node index.js --profile work --region ap-south-1
```

`probe_runtime` echoes both flags and whether each env name is present.
