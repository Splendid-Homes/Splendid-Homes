# Splendid Homes website

Property website and admin for Splendid Homes, Dubai. Next.js 16, Payload CMS 3, Tailwind v4, hosted on Cloudflare Workers (OpenNext) with D1 for data and R2 for files.

## Run locally

1. Copy `.env.example` to `.env.local` and fill it in. Never commit real values.
2. On Windows with Smart App Control on, build and run through WSL: see `docs/local-dev-wsl.md`.
3. The admin is at `/admin`. The seed script creates the first Main admin account and writes its password to `.env.local`.

## Database changes

After editing collections or globals, run `npm run payload migrate:create`. Check the new file for `__new_` table rebuilds before migrating: a rebuild deletes child rows on D1. Rewrite them as `ALTER TABLE` statements. A table can hold at most 49 columns and still save on D1.

## Search engines

The site stays hidden from Google unless `NEXT_PUBLIC_ENV` is `production`.
