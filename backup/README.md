# Backups

The `splendid-homes-backup` Worker runs every Monday at 03:00 Dubai time. It saves into the private R2 bucket `splendid-homes-backups`:

| Path | What it is | Kept |
| --- | --- | --- |
| `db/YYYY-MM-DD.sql` | The whole database, as SQL | Newest 12 runs |
| `media/<name>` | Uploaded photos, videos and files | Until deleted by hand |
| `last-run.json` | Result of the latest run | Replaced each run |

Every run emails the address in `ALERT_TO`, whether it worked or failed, so no email on a Monday means it did not run. The bucket holds leads and staff password hashes, so never make it public.

## Deploy

Run inside WSL from `website-app`:

```bash
npx wrangler deploy --config backup/wrangler.jsonc
```

## Restore the database

1. Download the file you want from the bucket:

```bash
npx wrangler r2 object get splendid-homes-backups/db/YYYY-MM-DD.sql --remote --file restore.sql
```

2. Test it first on a local copy, then check the row counts:

```bash
sqlite3 test.sqlite < restore.sql
```

3. To replace the live data, create a new D1 database, load `restore.sql` into it, and point the `database_id` values in `wrangler.jsonc` and `backup/wrangler.jsonc` at it. Do not load it over the existing database, because its tables already exist.

For a mistake made in the last few weeks, Cloudflare's own D1 restore is often quicker:

```bash
npx wrangler d1 time-travel restore splendid-homes --timestamp=2026-01-01T00:00:00Z
```

That restore replaces the live data, so check the date carefully first.
