#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PASS_COUNT=0
FAIL_COUNT=0

info() {
  printf '[info] %s\n' "$1"
}

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  printf '[pass] %s\n' "$1"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  printf '[fail] %s\n' "$1"
}

require_command() {
  local cmd="$1"
  if command -v "$cmd" >/dev/null 2>&1; then
    pass "command available: $cmd"
  else
    fail "missing command: $cmd"
  fi
}

check_file() {
  local path="$1"
  if [[ -f "$path" ]]; then
    pass "file exists: $path"
  else
    fail "missing file: $path"
  fi
}

check_contains() {
  local file="$1"
  local pattern="$2"
  local label="$3"

  if grep -q "$pattern" "$file"; then
    pass "$label"
  else
    fail "$label"
  fi
}

detect_url() {
  local path="$1"
  shift

  local candidate
  for candidate in "$@"; do
    if curl -fsS --max-time 5 "${candidate}${path}" >/dev/null 2>&1; then
      printf '%s' "$candidate"
      return 0
    fi
  done

  return 1
}

check_json_condition() {
  local url="$1"
  local description="$2"
  local expression="$3"

  local payload
  payload="$(curl -fsS --max-time 10 "$url")" || {
    fail "$description"
    return 1
  }

  if command -v jq >/dev/null 2>&1; then
    if printf '%s' "$payload" | jq -e "$expression" >/dev/null 2>&1; then
      pass "$description"
    else
      fail "$description"
    fi
  else
    info "jq not found, skipping JSON assertion: $description"
  fi
}

check_metric_presence() {
  local url="$1"
  local metric="$2"

  if curl -fsS --max-time 10 "$url" | grep -q "$metric"; then
    pass "metric present: $metric"
  else
    fail "metric missing: $metric"
  fi
}

info "Checking local project files"

require_command docker
require_command curl

check_file backend/Dockerfile
check_file client/Dockerfile
check_file client/nginx.conf
check_file docker-compose.yml
check_file docker-stack.yml
check_file monitoring/prometheus/prometheus.yml
check_file monitoring/prometheus/alert_rules.yml
check_file monitoring/grafana/dashboards/liquid-lms-overview.json
check_file backend/server/observability/metrics.js

info "Checking config references"

check_contains docker-compose.yml 'client/Dockerfile' 'compose uses client Dockerfile'
check_contains docker-compose.yml 'prom/prometheus:latest' 'compose uses latest Prometheus image'
check_contains docker-stack.yml 'prom/prometheus:latest' 'swarm uses latest Prometheus image'
check_contains monitoring/prometheus/alert_rules.yml 'LiquidLMSBackendDown' 'critical alert rule exists'
check_contains monitoring/prometheus/alert_rules.yml 'LiquidLMSHighSubmissionLatency' 'warning alert rule exists'

if docker compose config --quiet >/dev/null 2>&1; then
  pass 'docker compose config is valid'
else
  fail 'docker compose config is invalid'
fi

if docker stack config -c docker-stack.yml >/dev/null 2>&1; then
  pass 'docker stack config is valid'
else
  fail 'docker stack config is invalid'
fi

info "Detecting active deployment mode"

DEPLOYMENT_MODE="none"
if docker stack services liquid-lms >/dev/null 2>&1; then
  DEPLOYMENT_MODE="swarm"
  pass 'active deployment detected: swarm'
elif docker compose ps --services >/dev/null 2>&1 && [[ -n "$(docker compose ps --services 2>/dev/null)" ]]; then
  DEPLOYMENT_MODE="compose"
  pass 'active deployment detected: compose'
else
  fail 'no active compose or swarm deployment detected'
fi

if [[ "$DEPLOYMENT_MODE" == "swarm" ]]; then
  info "Checking swarm services"
  docker stack services liquid-lms
  check_json_condition \
    "http://127.0.0.1:9091/api/v1/targets" \
    'prometheus targets are all up (swarm)' \
    '.data.activeTargets | length > 0 and all(.health == "up")'
fi

if [[ "$DEPLOYMENT_MODE" == "compose" ]]; then
  info "Checking compose services"
  docker compose ps
fi

FRONTEND_URL="${FRONTEND_URL:-}"
BACKEND_URL="${BACKEND_URL:-}"
PROMETHEUS_URL="${PROMETHEUS_URL:-}"
GRAFANA_URL="${GRAFANA_URL:-}"

if [[ -z "$FRONTEND_URL" ]]; then
  FRONTEND_URL="$(detect_url "/" "http://127.0.0.1:8080")" || true
fi

if [[ -z "$BACKEND_URL" ]]; then
  BACKEND_URL="$(detect_url "/health" "http://127.0.0.1:4000")" || true
fi

if [[ -z "$PROMETHEUS_URL" ]]; then
  PROMETHEUS_URL="$(detect_url "/api/v1/targets" "http://127.0.0.1:9090" "http://127.0.0.1:9091")" || true
fi

if [[ -z "$GRAFANA_URL" ]]; then
  GRAFANA_URL="$(detect_url "/api/search" "http://admin:admin@127.0.0.1:3000" "http://admin:admin@127.0.0.1:3001")" || true
fi

info "Checking live endpoints"

if [[ -n "$FRONTEND_URL" ]]; then
  pass "frontend reachable at $FRONTEND_URL"
  if curl -fsS --max-time 10 "${FRONTEND_URL}/api/health" >/dev/null 2>&1; then
    pass 'frontend proxy reaches backend health endpoint'
  else
    fail 'frontend proxy cannot reach backend health endpoint'
  fi
else
  fail 'frontend is not reachable on expected ports'
fi

if [[ -n "$BACKEND_URL" ]]; then
  pass "backend reachable at $BACKEND_URL"
  check_json_condition \
    "${BACKEND_URL}/health" \
    'backend health reports ok=true and connected database' \
    '.ok == true and .database.status == "connected"'
  check_metric_presence "${BACKEND_URL}/metrics" 'liquid_lms_http_requests_total'
  check_metric_presence "${BACKEND_URL}/metrics" 'liquid_lms_http_request_duration_seconds'
  check_metric_presence "${BACKEND_URL}/metrics" 'liquid_lms_business_operations_total'
else
  fail 'backend is not reachable on expected ports'
fi

if [[ -n "$PROMETHEUS_URL" ]]; then
  pass "prometheus reachable at $PROMETHEUS_URL"
  check_json_condition \
    "${PROMETHEUS_URL}/api/v1/targets" \
    'prometheus targets are all up' \
    '.data.activeTargets | length > 0 and all(.health == "up")'
  check_json_condition \
    "${PROMETHEUS_URL}/api/v1/rules" \
    'prometheus alert rules are loaded' \
    '.data.groups | any(.name == "liquid-lms-alerts")'
else
  fail 'prometheus is not reachable on expected ports'
fi

if [[ -n "$GRAFANA_URL" ]]; then
  pass "grafana reachable at $GRAFANA_URL"
  search_url="${GRAFANA_URL}/api/search"
  check_json_condition \
    "$search_url" \
    'grafana dashboard is provisioned' \
    'any(.[]; .uid == "liquid-lms-overview")'
else
  fail 'grafana is not reachable on expected ports'
fi

printf '\nSummary: %s passed, %s failed\n' "$PASS_COUNT" "$FAIL_COUNT"

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  exit 1
fi
