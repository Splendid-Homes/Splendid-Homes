#!/usr/bin/env bash
# Publishes a finished build to Cloudflare. Run inside WSL from website-app, after `opennextjs-cloudflare build`
# with NEXT_PUBLIC_ENV=production, NEXT_PUBLIC_SITE_URL=https://splendid-homes.com and without .env.local (OpenNext bundles env files).
#
# Order matters: the small front Worker (edge/) keeps saved pages per build id, so it goes second. Until it is
# deployed, visitors keep getting pages from the previous build, whose code files have just been replaced.
set -uo pipefail
export WRANGLER_SEND_METRICS=false CI=1 NEXT_TELEMETRY_DISABLED=1 CF_WORKER_BUILD=true NEXT_PUBLIC_ENV=production NEXT_PUBLIC_SITE_URL=https://splendid-homes.com

for try in 1 2 3; do
  echo "site upload, try $try"
  npx opennextjs-cloudflare deploy --cacheChunkSize 1 > /tmp/cf-site.log 2>&1
  grep -q 'Current Version ID' /tmp/cf-site.log && { uploaded=1; break; }
  sleep 20
done
[ "${uploaded:-}" = 1 ] || { echo 'Site upload failed. Nothing else was changed.'; exit 1; }

for try in 1 2 3 4 5; do
  if npx wrangler deploy --config edge/wrangler.jsonc --var "APP_BUILD:$(cat .next/BUILD_ID)"; then echo 'Deployed.'; exit 0; fi
  sleep 15
done
echo 'Front Worker upload failed: visitors may get broken pages until this step is run again.'
exit 1
