# Liquid LMS

Liquid LMS is a full-stack learning management system built with:

- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express
- Database: MongoDB
- Observability: Prometheus + Grafana + Node Exporter

This repository is structured for the SRE/observability midterm: the app can run with Docker Compose, and a Swarm stack file is included for the bonus deployment.

## Repository Layout

```text
.
├── backend/                 # Express API, Mongo models, auth, metrics
│   ├── Dockerfile
│   ├── package.json
│   └── server/
├── client/                  # React application source + frontend container files
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
├── monitoring/
│   ├── grafana/
│   └── prometheus/
├── docker-compose.yml
└── docker-stack.yml
```

## App Services

- `frontend`: Nginx serving the built React app and proxying `/api/*` to the backend
- `backend`: Express API on port `4000`
- `mongo`: MongoDB for application data
- `prometheus`: metrics scraping and alert evaluation
- `grafana`: dashboards
- `node-exporter`: host/system metrics

## Backend Observability

The backend exposes:

- `GET /health`
  - readiness-style health check
  - returns `200` only when MongoDB is connected
  - returns JSON with service and database status
- `GET /metrics`
  - Prometheus metrics endpoint
  - includes default Node.js metrics
  - includes HTTP request totals and latency histograms
  - includes LMS business metrics for:
    - enrollment operations
    - assignment submission operations

Tracked SLI-related operations:

- `POST /courses/:id/enroll`
- `POST /assignments/:id/submissions`

## Docker Compose

Build and run:

```bash
docker compose build
docker compose up -d
```

Stop and remove:

```bash
docker compose down
```

Rebuild from scratch:

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

Default published ports:

- Frontend: `8080`
- Backend: `4000`
- Prometheus: `127.0.0.1:9090`
- Grafana: `127.0.0.1:3000`
- Node Exporter: `9100`

If `3000` or `9090` are already in use locally, override them when starting the stack:

```bash
PROMETHEUS_PORT=9091 GRAFANA_PORT=3001 docker compose up -d
```

Useful checks:

```bash
docker compose ps
curl -s http://127.0.0.1:4000/health
curl -s http://127.0.0.1:4000/metrics
curl -s http://127.0.0.1:8080/api/health
curl -s http://127.0.0.1:9091/api/v1/targets
curl -s http://admin:admin@127.0.0.1:3001/api/search
```

## Private Observability Access

Prometheus and Grafana should not be exposed publicly on a server.

### Docker Compose

In `docker-compose.yml`, Prometheus and Grafana are bound to `127.0.0.1`, so they are only reachable from the server itself:

- Prometheus: `127.0.0.1:9090`
- Grafana: `127.0.0.1:3000`

Access them through an SSH tunnel from your local machine:

```bash
./scripts/open_observability_tunnel.sh root@YOUR_SERVER_IP 3000 9090
```

Then open locally:

- Grafana: `http://127.0.0.1:3001`
- Prometheus: `http://127.0.0.1:9091`

### Docker Swarm

Docker Swarm published ports do not support the same localhost-only binding pattern as Compose. For Swarm, keep Grafana and Prometheus private by firewalling the published ports and then tunnel in over SSH.

Apply the Ubuntu firewall rules on the server:

```bash
sudo ./scripts/lock_down_observability_ufw.sh
```

This blocks public access to:

- Grafana: `3001`
- Prometheus: `9091`

Then open an SSH tunnel from your local machine:

```bash
./scripts/open_observability_tunnel.sh root@YOUR_SERVER_IP 3001 9091
```

Then access locally:

- Grafana: `http://127.0.0.1:3001`
- Prometheus: `http://127.0.0.1:9091`

Restart observability services after dashboard or alert changes:

```bash
docker compose restart prometheus grafana
```

## Docker Swarm

The Swarm manifest is in [docker-stack.yml](/Users/myrzanizimbetov/Desktop/liquid-lms/docker-stack.yml).

Current replica targets:

- `frontend`: `2`
- `backend`: `2`
- `node-exporter`: global

Deploy:

```bash
docker stack deploy -c docker-stack.yml liquid-lms
```

Inspect:

```bash
docker stack services liquid-lms
docker stack ps liquid-lms
```

Remove:

```bash
docker stack rm liquid-lms
```

If Compose was running before Swarm deploy:

```bash
docker compose down
docker stack deploy -c docker-stack.yml liquid-lms
```

If Swarm was running before Compose:

```bash
docker stack rm liquid-lms
docker compose up -d
```

Note:

- The current Swarm file uses `3001` for Grafana and `9091` for Prometheus to avoid common local port conflicts.
- The monitoring mounts in the Swarm file are absolute paths for reliable local deployment on this machine.

## Grafana and Prometheus

Prometheus config:

- [monitoring/prometheus/prometheus.yml](/Users/myrzanizimbetov/Desktop/liquid-lms/monitoring/prometheus/prometheus.yml)
- [monitoring/prometheus/alert_rules.yml](/Users/myrzanizimbetov/Desktop/liquid-lms/monitoring/prometheus/alert_rules.yml)

Grafana provisioning:

- datasource provisioning
- dashboard provisioning
- `Liquid LMS Overview` dashboard JSON

Dashboard covers:

- traffic
- 5xx error rate
- request latency
- CPU, memory, disk
- enrollment SLI
- submission latency SLI
- backend health

## Alerts

Implemented alerts:

- `LiquidLMSHighSubmissionLatency`
  - warning
  - triggers when p95 submission latency stays above 1 second for 5 minutes
- `LiquidLMSBackendDown`
  - critical
  - triggers when the backend target is down for 1 minute

Manual alert validation:

```bash
docker compose stop backend
curl -s http://127.0.0.1:9091/api/v1/alerts
docker compose start backend
```

For Swarm:

```bash
docker service scale liquid-lms_backend=0
curl -s http://127.0.0.1:9091/api/v1/alerts
docker service scale liquid-lms_backend=2
```

## Useful Commands

Generate demo traffic for Grafana panels:

```bash
./scripts/generate_dashboard_data.sh
```

Generate more traffic:

```bash
REQUEST_COUNT=10 ./scripts/generate_dashboard_data.sh
```

Run all repo and live-stack checks:

```bash
./scripts/check_all.sh
```

Validate Compose file only:

```bash
docker compose config --quiet
```

See live backend metrics:

```bash
curl -s http://127.0.0.1:4000/metrics | less
```

Query Prometheus directly:

```bash
curl -s http://127.0.0.1:9091/api/v1/targets
curl -s http://127.0.0.1:9091/api/v1/rules
curl -s http://127.0.0.1:9091/api/v1/alerts
```

## Environment

Backend example env file:

- [backend/.env.example](/Users/myrzanizimbetov/Desktop/liquid-lms/backend/.env.example)

Frontend example env file:

- [client/.env.example](/Users/myrzanizimbetov/Desktop/liquid-lms/client/.env.example)

Key backend variables:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_ORIGIN`
- `COOKIE_SECURE`

Key frontend variables:

- `VITE_API_BASE_URL`
- `VITE_SITE_URL`

## Midterm Deliverables Covered by This Repo

- frontend and backend Dockerfiles
- Docker Compose stack
- Docker Swarm stack file
- Prometheus scraping and alert rules
- Grafana dashboard provisioning
- backend health and metrics endpoints
- business-oriented SLI metrics for the LMS
