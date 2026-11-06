/**
 * Weekly backup of the live site, run by Cloudflare on a schedule (see wrangler.jsonc). It has no web address.
 *
 * - Database: one SQL file per run at db/YYYY-MM-DD.sql, which rebuilds every table. The newest KEEP_RUNS are kept.
 * - Uploaded files: copied to media/<same name> when new or changed. A file deleted from the site stays here.
 * - last-run.json records each result. ALERT_TO gets an email after every run, so silence means it did not run.
 *
 * The bucket holds leads and staff password hashes, so it must stay private.
 */
const KEEP_RUNS = 12;
const PAGE_ROWS = 500;

const quoteName = name => `"${String(name).replaceAll('"', '""')}"`;

function sqlValue(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number' || typeof value === 'bigint') return String(value);
  if (value instanceof ArrayBuffer || Array.isArray(value)) {
    const bytes = new Uint8Array(value);
    return `X'${[...bytes].map(b => b.toString(16).padStart(2, '0')).join('')}'`;
  }
  return `'${String(value).replaceAll("'", "''")}'`;
}

async function dumpDatabase(db) {
  const { results: objects } = await db.prepare(
    "SELECT type, name, sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'd1_%' ORDER BY CASE type WHEN 'table' THEN 0 ELSE 1 END, name",
  ).all();
  const tables = objects.filter(o => o.type === 'table');
  const parts = ['PRAGMA foreign_keys=OFF;', 'BEGIN TRANSACTION;'];
  const counts = {};
  for (const table of tables) {
    parts.push(`${table.sql};`);
    counts[table.name] = 0;
    for (let offset = 0; ; offset += PAGE_ROWS) {
      const { results: rows } = await db.prepare(`SELECT * FROM ${quoteName(table.name)} LIMIT ${PAGE_ROWS} OFFSET ${offset}`).all();
      for (const row of rows) {
        const columns = Object.keys(row);
        parts.push(`INSERT INTO ${quoteName(table.name)} (${columns.map(quoteName).join(',')}) VALUES (${columns.map(c => sqlValue(row[c])).join(',')});`);
      }
      counts[table.name] += rows.length;
      if (rows.length < PAGE_ROWS) break;
    }
  }
  for (const other of objects.filter(o => o.type !== 'table')) parts.push(`${other.sql};`);
  parts.push('COMMIT;');
  return { sql: parts.join('\n') + '\n', counts };
}

async function copyMedia(media, backup) {
  const kept = new Map();
  for (let cursor; ;) {
    const page = await backup.list({ prefix: 'media/', cursor, include: ['customMetadata'] });
    for (const o of page.objects) kept.set(o.key.slice('media/'.length), o.customMetadata?.sourceEtag);
    if (!page.truncated) break;
    cursor = page.cursor;
  }
  let total = 0, copied = 0;
  for (let cursor; ;) {
    const page = await media.list({ cursor });
    for (const o of page.objects) {
      total++;
      if (kept.get(o.key) === o.etag) continue;
      const source = await media.get(o.key);
      if (!source) continue; // deleted while the backup was running
      await backup.put(`media/${o.key}`, source.body, { httpMetadata: source.httpMetadata, customMetadata: { sourceEtag: o.etag } });
      copied++;
    }
    if (!page.truncated) break;
    cursor = page.cursor;
  }
  return { total, copied };
}

async function dropOldRuns(backup) {
  const page = await backup.list({ prefix: 'db/' });
  const runs = page.objects.map(o => o.key).sort().reverse();
  for (const key of runs.slice(KEEP_RUNS)) await backup.delete(key);
  return Math.min(runs.length, KEEP_RUNS);
}

async function runBackup(env) {
  if (env.FAIL_TEST) throw new Error('Test failure requested');
  const day = new Date().toISOString().slice(0, 10);
  const { sql, counts } = await dumpDatabase(env.DB);
  const key = `db/${day}.sql`;
  await env.BACKUP.put(key, sql, { httpMetadata: { contentType: 'application/sql' } });
  const check = await env.BACKUP.head(key);
  const bytes = new TextEncoder().encode(sql).length;
  if (!check || check.size !== bytes) throw new Error(`Saved database file has the wrong size (${check?.size} of ${bytes} bytes)`);
  const media = await copyMedia(env.MEDIA, env.BACKUP);
  const runsKept = await dropOldRuns(env.BACKUP);
  return { key, bytes, tables: Object.keys(counts).length, rows: Object.values(counts).reduce((a, b) => a + b, 0), media, runsKept };
}

async function email(env, subject, text) {
  if (!env.RESEND_API_KEY) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: env.ALERT_TO,
      subject,
      text,
    }),
  });
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil((async () => {
      const at = new Date().toISOString();
      try {
        const result = await runBackup(env);
        await env.BACKUP.put('last-run.json', JSON.stringify({ at, ok: true, ...result }, null, 2));
        console.log('backup ok', JSON.stringify(result));
        await email(env, 'Splendid Homes website: weekly backup completed',
          `The weekly website backup finished.\n\nDatabase: ${result.tables} tables, ${result.rows} rows, ${(result.bytes / 1048576).toFixed(1)} MB.\nUploaded files: ${result.media.total} in total, ${result.media.copied} new or changed.\nWeekly copies kept: ${result.runsKept}.\n\nNo action is needed. If this email does not arrive on a Monday, please ask your developer to check the splendid-homes-backup Worker on Cloudflare.`);
      } catch (error) {
        const message = String(error?.message ?? error).slice(0, 500);
        console.error('backup failed', message);
        await env.BACKUP.put('last-run.json', JSON.stringify({ at, ok: false, error: message }, null, 2)).catch(() => {});
        await email(env, 'Splendid Homes website: weekly backup failed',
          `The weekly website backup did not complete.\n\nReason: ${message}\n\nThe website itself is not affected. Please ask your developer to check the splendid-homes-backup Worker on Cloudflare.`);
      }
    })());
  },
  fetch() {
    return new Response('Not found', { status: 404 });
  },
};
