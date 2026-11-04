# Running the site locally (WSL Ubuntu)

Windows Smart App Control is on for this machine, and it blocks the unsigned native binaries
the site needs locally: Cloudflare's `workerd.exe` (the local D1 database and R2 storage) and
Next's SWC compiler. The code is still edited in the Windows folder, but it is built and run
inside WSL Ubuntu.

## How it is set up

- **Code:** edited here, in `D:\client projects\website\website-app` (the source of truth).
- **WSL copy:** `~/splendid/website-app` inside Ubuntu. It holds its own Linux `node_modules`, the
  build output (`.next`) and **the local database** (`.wrangler/state`: D1 + R2 files).
- `scripts/wsl.sh` mirrors the code across with rsync. It never overwrites the WSL database after the
  first copy, so CMS edits, leads and uploads made on the local site are kept.

## Commands

Run from Windows (PowerShell or Git Bash):

```bash
wsl -d Ubuntu -- "/mnt/d/client projects/website/website-app/scripts/wsl.sh" build
```

| Command | What it does |
| --- | --- |
| `wsl.sh sync` | Copy code changes over (reinstalls dependencies if `package-lock.json` changed) |
| `wsl.sh build` | Sync, then `next build` |
| `wsl.sh start` | Serve the last build on port 3100; open http://localhost:3100 in Windows |
| `wsl.sh <script>` | Sync, then any npm script, e.g. `wsl.sh migrate`, `wsl.sh seed`, `wsl.sh generate:types` |

In Claude Code's preview, the `site-wsl` launch configuration runs `wsl.sh start`.

## Notes

- After changing a collection or global, create the migration inside WSL
  (`wsl.sh payload migrate:create <name>`), then copy the new files from
  `~/splendid/website-app/src/migrations` back to the Windows folder, and run `wsl.sh migrate`.
- The Windows-side `node_modules` and `.wrangler` folders are no longer used to run the site.
- Deployment to Cloudflare (Phase 10) runs from WSL too, using the same `wrangler` commands.
