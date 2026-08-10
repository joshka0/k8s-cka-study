#!/usr/bin/env bash
# Switch which narration variant drives the render.
#   ./scripts/use-speed.sh 0.7   -> restores the slower set, then re-measure + render
set -euo pipefail
cd "$(dirname "$0")/.."
v="narration/variants/speed-${1:?usage: use-speed.sh <0.7|1.0>}"
[ -d "$v" ] || { echo "no such variant: $v"; ls narration/variants; exit 1; }
rm -f narration/*.mp3
cp "$v"/*.mp3 narration/
npm run measure
echo "now on speed $1 — run: npm run render -- IntentToPacket out/intent-to-packet.mp4 --codec=h264 --crf=18"
