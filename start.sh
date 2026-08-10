#!/usr/bin/env bash
# Serve the course to your tailnet, with shared progress.
#
#   ./start.sh            # https://<this-machine>.<tailnet>.ts.net:8443/
#   PORT=9000 ./start.sh  # change the local port
#   TS_PORT=9443 ./start.sh
#
# Runs in the foreground. Ctrl-C stops the server and removes only the
# tailscale serve mount this script created — any other mounts you already
# have are left alone.

set -euo pipefail

cd "$(dirname "$0")"

PORT="${PORT:-8730}"
TS_PORT="${TS_PORT:-8443}"

command -v node >/dev/null || { echo "node is required" >&2; exit 1; }

cleanup() {
  trap - INT TERM EXIT
  echo
  if [ -n "${NODE_PID:-}" ] && kill -0 "$NODE_PID" 2>/dev/null; then
    echo "stopping course server (pid $NODE_PID)"
    kill "$NODE_PID" 2>/dev/null || true
    wait "$NODE_PID" 2>/dev/null || true
  fi
  if [ "${TS_UP:-0}" = "1" ]; then
    echo "removing tailscale serve mount on :$TS_PORT"
    tailscale serve --https="$TS_PORT" off >/dev/null 2>&1 || true
  fi
  echo "stopped. progress.json is kept."
}
trap cleanup INT TERM EXIT

echo "starting course server on 127.0.0.1:$PORT"
node serve.js &
NODE_PID=$!

# Wait for it to accept connections before advertising it.
for _ in $(seq 1 40); do
  if curl -fsS -o /dev/null "http://127.0.0.1:$PORT/" 2>/dev/null; then break; fi
  sleep 0.25
done
curl -fsS -o /dev/null "http://127.0.0.1:$PORT/" || { echo "server did not come up" >&2; exit 1; }

if command -v tailscale >/dev/null && tailscale status >/dev/null 2>&1; then
  HOSTNAME_TS="$(tailscale status --json 2>/dev/null \
    | python3 -c 'import json,sys; print(json.load(sys.stdin)["Self"]["DNSName"].rstrip("."))' 2>/dev/null || true)"
  echo "publishing to your tailnet on port $TS_PORT"
  if tailscale serve --bg --https="$TS_PORT" "http://127.0.0.1:$PORT" >/dev/null 2>&1; then
    TS_UP=1
    echo
    echo "  Open on any device signed into your tailnet:"
    echo "    https://${HOSTNAME_TS:-<this-machine>}:$TS_PORT/"
    echo
  else
    echo "  tailscale serve failed — the course is still at http://127.0.0.1:$PORT/" >&2
  fi
else
  echo "  tailscale not available — serving locally only at http://127.0.0.1:$PORT/"
fi

echo "  Ctrl-C to stop."
wait "$NODE_PID"
