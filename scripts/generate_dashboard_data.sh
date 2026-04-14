#!/usr/bin/env bash

set -euo pipefail

API_BASE_URL="${API_BASE_URL:-http://127.0.0.1:4000}"
REQUEST_COUNT="${REQUEST_COUNT:-3}"
SUFFIX="${SUFFIX:-$(date +%s)}"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_DIR"
}

trap cleanup EXIT

info() {
  printf '[info] %s\n' "$1"
}

fail() {
  printf '[fail] %s\n' "$1" >&2
  exit 1
}

json_get() {
  local expr="$1"
  node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(0,'utf8')); const value=${expr}; if (value === undefined || value === null) process.exit(1); if (typeof value === 'object') console.log(JSON.stringify(value)); else console.log(String(value));"
}

request_json() {
  local method="$1"
  local path="$2"
  local payload="${3:-}"
  local cookie_file="${4:-}"

  local url="${API_BASE_URL}${path}"
  local response_body
  local status

  if [[ -n "$payload" && -n "$cookie_file" ]]; then
    response_body="$(curl -sS -X "$method" "$url" -H 'Content-Type: application/json' -b "$cookie_file" -c "$cookie_file" -d "$payload" -w '\n%{http_code}')"
  elif [[ -n "$payload" ]]; then
    response_body="$(curl -sS -X "$method" "$url" -H 'Content-Type: application/json' -d "$payload" -w '\n%{http_code}')"
  elif [[ -n "$cookie_file" ]]; then
    response_body="$(curl -sS -X "$method" "$url" -b "$cookie_file" -c "$cookie_file" -w '\n%{http_code}')"
  else
    response_body="$(curl -sS -X "$method" "$url" -w '\n%{http_code}')"
  fi

  status="$(printf '%s' "$response_body" | tail -n1)"
  BODY="$(printf '%s' "$response_body" | sed '$d')"
  STATUS="$status"
}

register_user() {
  local username="$1"
  local email="$2"
  local role="$3"
  local cookie_file="$4"

  request_json "POST" "/auth/register" "$(cat <<EOF
{"username":"$username","email":"$email","password":"Passw0rd!","first_name":"Demo","last_name":"$role","role":"$role"}
EOF
)" "$cookie_file"

  if [[ "$STATUS" != "201" ]]; then
    fail "could not register user $username: $BODY"
  fi
}

create_course() {
  local cookie_file="$1"
  local slug="observability-course-${SUFFIX}"

  request_json "POST" "/courses" "$(cat <<EOF
{"title":"Observability Demo Course ${SUFFIX}","slug":"$slug","description":"Course used to generate Grafana dashboard metrics.","category":"SRE","level":"beginner","is_published":true}
EOF
)" "$cookie_file"

  if [[ "$STATUS" != "201" ]]; then
    fail "could not create course: $BODY"
  fi

  printf '%s' "$BODY" | json_get 'data.course && (data.course._id || data.course.id)'
}

create_assignment() {
  local course_id="$1"
  local cookie_file="$2"

  request_json "POST" "/courses/${course_id}/assignments" "$(cat <<EOF
{"title":"Metrics Assignment ${SUFFIX}","description":"Assignment used to generate submission metrics.","max_score":100,"type":"essay","estimated_time_minutes":15}
EOF
)" "$cookie_file"

  if [[ "$STATUS" != "201" ]]; then
    fail "could not create assignment: $BODY"
  fi

  printf '%s' "$BODY" | json_get 'data.assignment && (data.assignment._id || data.assignment.id)'
}

hit_read_traffic() {
  local course_id="$1"
  request_json "GET" "/courses"
  request_json "GET" "/courses/${course_id}"
  request_json "GET" "/courses/${course_id}/assignments"
}

main() {
  command -v curl >/dev/null 2>&1 || fail "curl is required"
  command -v node >/dev/null 2>&1 || fail "node is required"

  request_json "GET" "/health"
  [[ "$STATUS" == "200" ]] || fail "backend health check failed at ${API_BASE_URL}/health"

  local instructor_cookie="$TMP_DIR/instructor.cookie"
  local student_cookie
  local course_id
  local assignment_id

  info "Registering demo instructor"
  register_user "instructor_${SUFFIX}" "instructor_${SUFFIX}@example.com" "instructor" "$instructor_cookie"

  info "Creating demo course"
  course_id="$(create_course "$instructor_cookie")"

  info "Creating demo assignment"
  assignment_id="$(create_assignment "$course_id" "$instructor_cookie")"

  info "Generating enrollment and submission traffic"
  for i in $(seq 1 "$REQUEST_COUNT"); do
    student_cookie="$TMP_DIR/student_${i}.cookie"
    register_user "student_${SUFFIX}_${i}" "student_${SUFFIX}_${i}@example.com" "student" "$student_cookie"

    request_json "POST" "/courses/${course_id}/enroll" '{}' "$student_cookie"
    [[ "$STATUS" == "201" ]] || fail "enroll request failed: $BODY"

    request_json "POST" "/assignments/${assignment_id}/submissions" "$(cat <<EOF
{"submission_content":"Demo submission ${i} for dashboard metrics.","attempt_number":1,"time_spent_minutes":10}
EOF
)" "$student_cookie"
    [[ "$STATUS" == "201" ]] || fail "submission request failed: $BODY"

    hit_read_traffic "$course_id"
  done

  info "Generating one extra submission burst for latency and traffic panels"
  for i in $(seq 1 "$REQUEST_COUNT"); do
    student_cookie="$TMP_DIR/student_${i}.cookie"
    request_json "POST" "/assignments/${assignment_id}/submissions" "$(cat <<EOF
{"submission_content":"Repeat submission ${i} for dashboard metrics.","attempt_number":2,"time_spent_minutes":12}
EOF
)" "$student_cookie"
    [[ "$STATUS" == "201" ]] || fail "repeat submission request failed: $BODY"
  done

  printf '\nGenerated dashboard data successfully.\n'
  printf 'Course ID: %s\n' "$course_id"
  printf 'Assignment ID: %s\n' "$assignment_id"
  printf 'Wait 15-30 seconds for Prometheus/Grafana panels to refresh.\n'
}

main "$@"
