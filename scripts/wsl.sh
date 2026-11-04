#!/usr/bin/env bash
# Build and run the site inside WSL Ubuntu (Windows Smart App Control blocks the native
# workerd/swc binaries, so the Windows copy can be edited but not run).
#
# The source of truth for code is the Windows folder; this mirrors it into ~/splendid/website-app
# (Linux node_modules, build output and the local database live only on the WSL side).
#   scripts/wsl.sh sync     copy code over (installs dependencies when package-lock.json changed)
#   scripts/wsl.sh build    sync, then a clean `next build`
#   scripts/wsl.sh start    serve the last build on port 3100 (reachable from Windows at localhost:3100)
#   scripts/wsl.sh <cmd>    sync, then run any npm script, e.g. `scripts/wsl.sh seed`
set -euo pipefail
SRC="/mnt/d/client projects/website/website-app/"
DST="$HOME/splendid/website-app"

sync() {
  mkdir -p "$DST"
  local before after
  before=$(sha1sum "$DST/package-lock.json" 2>/dev/null | cut -d' ' -f1 || true)
  # The local D1/R2 data (.wrangler) stays on the WSL side after the first copy.
  local keep_db=(--exclude .wrangler)
  [ -d "$DST/.wrangler" ] || keep_db=()
  rsync -a --delete --exclude node_modules --exclude .next --exclude .open-next --exclude .git "${keep_db[@]}" "$SRC" "$DST/"
  after=$(sha1sum "$DST/package-lock.json" | cut -d' ' -f1)
  if [ ! -d "$DST/node_modules" ] || [ "$before" != "$after" ]; then (cd "$DST" && npm ci --no-audit --no-fund); fi
}

cd "$DST" 2>/dev/null || true
case "${1:-build}" in
  sync) sync ;;
  # Always a clean build: incremental builds can keep stale CSS from globals.css.
  build) sync; cd "$DST"; rm -rf .next; npm run build ;;
  start) cd "$DST"; exec npm run start -- -p 3100 ;;
  *) sync; cd "$DST"; npm run "$@" ;;
esac
