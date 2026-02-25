#!/usr/bin/env bash
set -euo pipefail

HOST="${SMOKE_HOST:-127.0.0.1}"
PORT="${SMOKE_PORT:-4173}"
BASE_URL="http://${HOST}:${PORT}"

cleanup() {
  if [[ -n "${PREVIEW_PID:-}" ]] && kill -0 "$PREVIEW_PID" >/dev/null 2>&1; then
    kill "$PREVIEW_PID" >/dev/null 2>&1 || true
    wait "$PREVIEW_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

npm run preview -- --host "$HOST" --port "$PORT" >/tmp/smoke-preview.log 2>&1 &
PREVIEW_PID=$!

for _ in $(seq 1 30); do
  if curl -fsS "${BASE_URL}/" >/tmp/smoke-home.html 2>/dev/null; then
    break
  fi
  sleep 1
done

if ! curl -fsS "${BASE_URL}/" >/tmp/smoke-home.html; then
  echo "[smoke] No se pudo acceder al preview en ${BASE_URL}"
  tail -n 100 /tmp/smoke-preview.log || true
  exit 1
fi

curl -fsS "${BASE_URL}/actualizaciones" >/tmp/smoke-updates.html

grep -q "<div id=\"app\"></div>" /tmp/smoke-home.html
grep -q "type=\"module\"" /tmp/smoke-home.html
grep -q "Madypack" /tmp/smoke-home.html

echo "[smoke] Preview funcional OK en ${BASE_URL}"
