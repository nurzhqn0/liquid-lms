#!/usr/bin/env bash

set -euo pipefail

GRAFANA_PORT="${GRAFANA_PORT:-3001}"
PROMETHEUS_PORT="${PROMETHEUS_PORT:-9091}"

echo "Applying UFW rules to keep Grafana and Prometheus private."
echo "This keeps SSH open and denies public access to ${GRAFANA_PORT} and ${PROMETHEUS_PORT}."

ufw allow OpenSSH
ufw deny "${GRAFANA_PORT}/tcp"
ufw deny "${PROMETHEUS_PORT}/tcp"
ufw reload
ufw status numbered
