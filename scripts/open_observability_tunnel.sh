#!/usr/bin/env bash

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 user@server [remote_grafana_port] [remote_prometheus_port]"
  echo "Example: $0 root@164.92.231.83 3001 9091"
  exit 1
fi

SSH_TARGET="$1"
REMOTE_GRAFANA_PORT="${2:-3001}"
REMOTE_PROMETHEUS_PORT="${3:-9091}"
LOCAL_GRAFANA_PORT="${LOCAL_GRAFANA_PORT:-3001}"
LOCAL_PROMETHEUS_PORT="${LOCAL_PROMETHEUS_PORT:-9091}"

echo "Opening SSH tunnel to ${SSH_TARGET}"
echo "Grafana:    http://127.0.0.1:${LOCAL_GRAFANA_PORT} -> remote 127.0.0.1:${REMOTE_GRAFANA_PORT}"
echo "Prometheus: http://127.0.0.1:${LOCAL_PROMETHEUS_PORT} -> remote 127.0.0.1:${REMOTE_PROMETHEUS_PORT}"

exec ssh -N \
  -L "${LOCAL_GRAFANA_PORT}:127.0.0.1:${REMOTE_GRAFANA_PORT}" \
  -L "${LOCAL_PROMETHEUS_PORT}:127.0.0.1:${REMOTE_PROMETHEUS_PORT}" \
  "${SSH_TARGET}"
