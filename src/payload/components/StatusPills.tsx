import Link from 'next/link';
import type { BeforeListTableServerProps, Field, Where } from 'payload';

type SelectField = { name?: string; type?: string; options?: { label: unknown; value: string }[]; fields?: Field[] };

/** The collection's status options, wherever the field sits (top level or inside a row). */
function statusOptions(fields: Field[]): { label: string; value: string }[] {
  for (const f of fields as SelectField[]) {
    if (f.name === 'status' && f.type === 'select') return (f.options ?? []).map(o => ({ label: String(o.label), value: o.value }));
    if (f.fields) { const inner = statusOptions(f.fields); if (inner.length) return inner; }
  }
  return [];
}

/** One-click status filters with live counts above a list; the numbers respect the signed-in user's access. */
export async function StatusPills({ collectionConfig, payload, user, searchParams }: BeforeListTableServerProps) {
  const options = statusOptions(collectionConfig.fields);
  if (!options.length) return null;
  const collection = collectionConfig.slug as 'leads';
  const count = (where?: Where) => payload.count({ collection, user, overrideAccess: false, where }).then(r => r.totalDocs).catch(() => 0);
  const [all, ...counts] = await Promise.all([count(), ...options.map(o => count({ status: { equals: o.value } }))]);
  const sp = (searchParams ?? {}) as Record<string, unknown>;
  const where = sp.where as { status?: { equals?: string } } | undefined;
  const active = where?.status?.equals ?? (sp['where[status][equals]'] as string | undefined) ?? '';
  const base = `/admin/collections/${collection}`;
  return (
    <nav className="sh-pills" aria-label="Filter by status">
      <Link href={base} className={active ? '' : 'on'} aria-current={active ? undefined : 'true'}>All <b>{all}</b></Link>
      {options.map((o, i) => (
        <Link key={o.value} href={`${base}?where[status][equals]=${encodeURIComponent(o.value)}`} className={active === o.value ? 'on' : ''} aria-current={active === o.value ? 'true' : undefined}>
          {o.label} <b>{counts[i]}</b>
        </Link>
      ))}
    </nav>
  );
}
