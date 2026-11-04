import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Fragment } from 'react';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { fmtDate } from '@/lib/market';
import { pageMetadata } from '@/lib/seo';
import { data } from '@/lib/cms';
import { hasText } from '@/payload/legalDefaults';

// Pages added in the CMS after a build (slugs not in generateStaticParams) render on their first visit,
// then are cached. A blocking first render keeps real 404s for unknown slugs (instead of a streamed shell).
export const instant = false;

export async function generateStaticParams() {
  return (await data()).site.legal.pages.map(p => ({ page: p.slug }));
}

/** Legal pages from CMS > Legal pages. Until a page has text it shows a notice and is not indexed. */
export async function generateMetadata({ params }: PageProps<'/legal/[page]'>): Promise<Metadata> {
  const SITE = (await data()).site;
  const slug = (await params).page;
  const p = SITE.legal.pages.find(x => x.slug === slug);
  if (!p) return {};
  const meta = pageMetadata({ title: p.title, description: p.about ? `${SITE.name} ${p.title.toLowerCase()}: ${p.about}.` : `${SITE.name} ${p.title.toLowerCase()}.`, path: `/legal/${slug}` });
  return hasText(p.body) ? meta : { ...meta, robots: { index: false, follow: true } };
}

/** Replaces {tokens} in a sentence with text or links. */
function fill(s: string, parts: Record<string, React.ReactNode>) {
  return s.split(/(\{\w+\})/).map((bit, i) => <Fragment key={i}>{bit.startsWith('{') && bit.slice(1, -1) in parts ? parts[bit.slice(1, -1)] : bit}</Fragment>);
}

export default async function LegalPage({ params }: PageProps<'/legal/[page]'>) {
  const SITE = (await data()).site;
  const L = SITE.legal, T = L.text;
  const slug = (await params).page;
  const p = L.pages.find(x => x.slug === slug);
  if (!p) notFound();
  const ready = hasText(p.body);
  const link = 'font-semibold text-forest underline-offset-4 hover:underline';
  return (
    <article className="wrap max-w-[760px] py-[clamp(32px,5vw,64px)]">
      <Breadcrumbs className="mb-6" items={[{ name: 'Home', href: '/' }, { name: p.title, href: `/legal/${slug}` }]} />
      <h1 className="mb-6 text-[clamp(2rem,4vw,2.8rem)]">{p.title}</h1>
      {p.updated && <p className="-mt-3 mb-6 text-[0.9rem] text-muted">{T.updatedLabel}: <time dateTime={p.updated}>{fmtDate(p.updated)}</time></p>}
      {ready ? (
        /* Styles sit on a wrapper: RichText drops className when disableContainer is set. */
        <div className="mb-8 leading-[1.75] text-ink-2 [&_a]:font-semibold [&_a]:text-forest [&_a]:underline [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-[1.4rem] [&_h2]:text-ink [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-ink [&_li]:mb-1.5 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_strong]:text-ink [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6">
          <RichText data={p.body as SerializedEditorState} disableContainer />
        </div>
      ) : (
        <p role="note" className="mb-6 rounded-[20px] soft-inset p-5 text-ink-2">{fill(T.notice, { about: p.about || p.title.toLowerCase(), company: SITE.name })}</p>
      )}
      {L.showRera && <p className="mb-4 text-ink-2">{fill(T.reraLine, { legalName: SITE.legalName, orn: SITE.orn, company: SITE.name })}</p>}
      {L.showContact && (
        <p className="text-ink-2">{fill(T.contactLine, {
          contact: <Link href="/contact" className={link}>{T.contactLink}</Link>,
          email: <a href={`mailto:${SITE.email}`} className="font-semibold text-forest">{SITE.email}</a>,
        })}</p>
      )}
    </article>
  );
}
