# py-runner

Self-hosted **Python code execution API**. Deploy one Docker Compose stack and you get:

- Node.js API + worker (JavaScript)
- Redis job queue (bundled container)
- Postgres submission store (bundled container)
- Sandboxed Python runs in ephemeral `python:3.12-alpine` containers

Anyone who needs a Python compiler/executor deploys this image stack on their server.

## Quick start

```bash
# 1. Pull the Python runtime used for sandboxed execution
docker pull python:3.12-alpine

# 2. Build & start everything
docker compose up -d --build

# 3. Health check
curl http://localhost:3000/health
```

## API

### Execute (async — poll for result)

```bash
curl -s -X POST http://localhost:3000/execute \
  -H 'Content-Type: application/json' \
  -d '{"source_code":"print(2+2)"}'
```

Response `202`:

```json
{
  "id": "...",
  "status": "queued",
  "poll_url": "/submissions/<id>"
}
```

```bash
curl -s http://localhost:3000/submissions/<id>
```

### Execute (sync — wait for result)

```bash
curl -s -X POST http://localhost:3000/execute \
  -H 'Content-Type: application/json' \
  -d '{"source_code":"name=input(); print(f\"hi {name}\")","stdin":"Ada\n","wait":true}'
```

### List recent submissions

```bash
curl -s http://localhost:3000/submissions
```

## Status values

| Status | Meaning |
|--------|---------|
| `queued` | Waiting in Redis |
| `running` | Worker executing |
| `accepted` | Exit code 0 |
| `runtime_error` | Non-zero exit |
| `time_limit_exceeded` | Over `MAX_EXECUTION_MS` |
| `internal_error` | System failure |

## Architecture

```
Client → API (Express) → Redis (BullMQ) → Worker
                              ↓                ↓
                         Postgres         Docker (python container)
```

- **API** accepts code, stores a submission in Postgres, enqueues a Redis job
- **Worker** runs code in a fresh, network-disabled Python container with CPU/memory/PID limits
- **Redis** + **Postgres** are part of the compose stack — no external services required

## Configuration

Environment variables (see `.env.example` / `docker-compose.yml`):

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | API port |
| `DATABASE_URL` | compose default | Postgres URL |
| `REDIS_URL` | compose default | Redis URL |
| `PYTHON_IMAGE` | `python:3.12-alpine` | Sandbox image |
| `MAX_EXECUTION_MS` | `5000` | Time limit |
| `MAX_MEMORY_MB` | `128` | Memory limit |
| `MAX_OUTPUT_BYTES` | `65536` | stdout/stderr cap |
| `WORKER_CONCURRENCY` | `2` | Parallel jobs |

## Security notes

Untrusted code runs in ephemeral containers with:

- Network disabled
- Memory + CPU + PID limits
- `CapDrop: ALL` + `no-new-privileges`
- Runs as `nobody`
- Hard wall-clock timeout

Still treat this as a sandbox for demos / internal tools — harden further for public multi-tenant production.

## Local development (without full compose)

```bash
npm install
# start only redis + postgres
docker compose up -d postgres redis
# export env from .env.example, then:
npm start          # API
npm run worker     # Worker (needs Docker socket)
```

## Stop

```bash
docker compose down
```
