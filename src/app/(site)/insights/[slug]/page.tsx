import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';
import { notFound } from 'next/navigation';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { CompareTable } from '@/components/community/CompareTable';
import { Icon } from '@/components/icons';
import { InsightsNewsletter } from '@/components/insights/InsightsNewsletter';
import { PostCard } from '@/components/insights/PostCard';
import { ClipReveal } from '@/components/motion/ClipReveal';
import { SplitHeading } from '@/components/motion/SplitHeading';
import { EnquiryForm } from '@/components/property/EnquiryForm';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { FaqBlock } from '@/components/seo/FaqBlock';
import { JsonLd } from '@/components/seo/JsonLd';
import { StatSource } from '@/components/seo/StatSource';
import { num } from '@/lib/data';
import { extrasFor, modifiedDate, readingMinutes, wordCount } from '@/lib/insights';
import { fmtDate } from '@/lib/market';
import { blogPostingJsonLd } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';
import { data } from '@/lib/cms';

export async function generateStaticParams() {
  const __d = await data();
  const { posts } = __d.c;
  return posts.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<'/insights/[slug]'>): Promise<Metadata> {
  const __d = await data();
  const { agentById, postBySlug } = __d;
  const p = postBySlug((await params).slug);
  if (!p) return {};
  const meta = pageMetadata({ title: p.title, description: extrasFor(p)?.summary ?? p.excerpt, path: `/insights/${p.slug}`, image: p.img });
  return {
    ...meta,
    openGraph: { ...meta.openGraph, type: 'article', publishedTime: p.date, modifiedTime: modifiedDate(p), authors: [agentById(p.author).name], section: p.cat },
  };
}

const h2 = 'mb-4 mt-10 text-[clamp(1.35rem,2.2vw,1.75rem)]';
const th = 'px-4 py-3 text-left text-[0.74rem] font-bold uppercase tracking-[0.08em] text-muted';

export default async function ArticlePage({ params }: PageProps<'/insights/[slug]'>) {
  const __d = await data();
  const { agentById, allPosts, communityBySlug, postBySlug } = __d;
  const MARKET_DATA = __d.site.market;
  const I = __d.site.insights, T = I.text;
  const p = postBySlug((await params).slug);
  if (!p) notFound();
  const x = extrasFor(p);
  const a = agentById(p.author);
  const modified = modifiedDate(p);
  const related = allPosts().filter(o => o.slug !== p.slug).sort((m, n) => Number(n.cat === p.cat) - Number(m.cat === p.cat)).slice(0, I.relatedCount);
  const sources = x?.sources ?? [];

  return (
    <article className="pb-[clamp(48px,7vw,96px)]">
      <header className="wrap max-w-[880px] pt-6">
        <Breadcrumbs className="mb-6" items={[{ name: 'Home', href: '/' }, { name: 'Insights', href: '/insights' }, { name: p.title, href: `/insights/${p.slug}` }]} />
        <span className="eyebrow mb-3">{p.cat} · {readingMinutes(p)} {T.minRead}</span>
        <SplitHeading as="h1" trigger="load" segments={[{ text: p.title }]} className="mb-4 text-[clamp(1.9rem,4.2vw,3.1rem)] leading-[1.1]" />
        <p className="mb-6 text-[1.15rem] text-ink-2">{p.excerpt}</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-line py-4">
          <Link href={`/team/${a.slug}`} className="group flex items-center gap-3">
            <Image src={a.img} alt="" width={44} height={44} className="size-11 rounded-full object-cover" />
            <span>
              <span className="block font-bold transition-colors group-hover:text-forest">{a.name}</span>
              <span className="block text-[0.84rem] text-muted">{a.title} · BRN {a.brn}</span>
            </span>
          </Link>
          <dl className="flex gap-6 text-[0.84rem]">
            <div><dt className="text-muted">{T.published}</dt><dd className="font-semibold"><time dateTime={p.date}>{fmtDate(p.date)}</time></dd></div>
            {modified !== p.date && <div><dt className="text-muted">{T.updated}</dt><dd className="font-semibold"><time dateTime={modified}>{fmtDate(modified)}</time></dd></div>}
          </dl>
        </div>
      </header>

      <div className="wrap mt-8 max-w-[1100px]">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[28px] bg-mint max-sm:aspect-[4/3] max-sm:rounded-[20px]">
          <Image src={p.img} alt={p.title} fill preload sizes="(min-width: 1140px) 1100px, 100vw" className="object-cover" />
        </div>
      </div>

      <div className={`wrap mt-[clamp(28px,4vw,48px)] grid gap-[clamp(28px,4vw,56px)] ${I.formShow ? 'max-w-[1100px] lg:grid-cols-[minmax(0,1fr)_320px]' : 'max-w-[880px]'}`}>
        <div className="min-w-0 text-[1.05rem] leading-[1.75] text-ink-2">
          {x?.summary && (
            <section aria-labelledby="in-short" className="mb-8 rounded-[24px] soft-inset p-6">
              <h2 id="in-short" className="mb-2 text-[0.8rem] font-bold uppercase tracking-[0.12em] text-forest">{T.inShort}</h2>
              <p className="text-[1.08rem] leading-relaxed text-ink">{x.summary}</p>
            </section>
          )}
          {x?.sample && (
            <p role="note" className="mb-8 flex gap-3 rounded-[20px] soft-raised-sm p-4 text-[0.9rem] leading-normal text-ink-2">
              <Icon name="doc" className="mt-0.5 size-5 shrink-0 text-forest" />{x.sample}
            </p>
          )}

          {/* Styles sit on a wrapper: RichText drops className when disableContainer is set. */}
          <div className="[&_a]:font-semibold [&_a]:text-forest [&_a]:underline [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-[clamp(1.35rem,2.2vw,1.75rem)] [&_h2]:text-ink [&_strong]:text-ink [&_h3]:mb-2 [&_h3]:mt-6 [&_li]:mb-1.5 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-5 [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6">
            <RichText data={p.body as SerializedEditorState} disableContainer />
          </div>

          {x?.takeaways && (
            <>
              <h2 className={h2}>{T.takeaways}</h2>
              <ul className="flex flex-col gap-3">
                {x.takeaways.map(t => (
                  <li key={t} className="flex gap-3"><span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full soft-raised-sm text-gold"><Icon name="check" className="size-3.5" /></span>{t}</li>
                ))}
              </ul>
            </>
          )}

          {x?.steps && (
            <>
              <h2 className={h2}>{T.steps}</h2>
              <ol className="flex flex-col gap-4">
                {x.steps.map((s, i) => (
                  <li key={s.title} className="flex gap-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-forest font-bold text-white">{i + 1}</span>
                    <p><b className="text-ink">{s.title}.</b> {s.text}</p>
                  </li>
                ))}
              </ol>
            </>
          )}

          {x?.table && (
            <>
              <h2 className={h2}>{x.table.title}</h2>
              <div role="region" aria-label={x.table.caption} tabIndex={0} className="overflow-x-auto rounded-[22px] soft-inset p-2 text-[0.94rem] leading-normal">
                <table className="soft-table w-full min-w-[520px]">
                  <caption className="sr-only">{x.table.caption}</caption>
                  <thead className="bg-mist"><tr>{x.table.head.map((h, i) => <th key={i} scope="col" className={th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {x.table.rows.map(r => (
                      <tr key={r[0]}>
                        <th scope="row" className="px-4 py-3.5 text-left font-semibold text-ink">{r[0]}</th>
                        {r.slice(1).map((c, i) => <td key={i} className="px-4 py-3.5">{c}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {x?.communityRows && (
            <>
              <h2 className={h2}>{x.communityRows.title}</h2>
              <div role="region" aria-label={x.communityRows.caption} tabIndex={0} className="overflow-x-auto rounded-[22px] soft-inset p-2 text-[0.94rem] leading-normal">
                <table className="soft-table w-full min-w-[640px]">
                  <caption className="sr-only">{x.communityRows.caption}</caption>
                  <thead className="bg-mist"><tr>{I.communityCols.map(h => <th key={h} scope="col" className={th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {x.communityRows.rows.map(r => {
                      const c = communityBySlug(r.slug);
                      if (!c) return null;
                      return (
                        <tr key={r.slug}>
                          <th scope="row" className="px-4 py-3.5 text-left font-semibold"><Link href={`/community/${c.slug}`} className="text-forest underline-offset-4 hover:underline">{c.name}</Link></th>
                          <td className="px-4 py-3.5">{r.bestFor}</td>
                          <td className="px-4 py-3.5 tabular-nums">AED {num(c.avgSale)}</td>
                          <td className="px-4 py-3.5 tabular-nums">AED {num(c.avgRent)}</td>
                          <td className="px-4 py-3.5 tabular-nums">{c.roi}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <StatSource className="mt-3" source={MARKET_DATA.source} url={MARKET_DATA.sourceUrl} updated={MARKET_DATA.updated} />
            </>
          )}

          {x?.communityTable && (
            <>
              <h2 className={h2}>{T.compared}</h2>
              <CompareTable caption={T.comparedCaption} />
            </>
          )}

          {sources.length > 0 && (
            <section aria-labelledby="sources" className="mt-10 rounded-[26px] soft-raised p-6 text-[0.92rem] leading-normal">
              <h2 id="sources" className="mb-3 text-[1.1rem] text-ink">{T.sources}</h2>
              <ol className="list-decimal space-y-1.5 pl-5">
                {sources.map(s => (
                  <li key={s.label}>
                    {s.url.startsWith('/')
                      ? <Link href={s.url} className="text-forest underline underline-offset-2">{s.label}</Link>
                      : <a href={s.url} target="_blank" rel="noopener" className="text-forest underline underline-offset-2">{s.label}</a>}
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-[0.8rem] text-muted">{T.sourcesNote.split('{date}').map((part, i) => <Fragment key={i}>{i > 0 && <time dateTime={modified}>{fmtDate(modified)}</time>}{part}</Fragment>)}</p>
            </section>
          )}

          {x?.faqs && <FaqBlock id="article-faq" faqs={x.faqs} title={T.faqTitle} className="mt-10 leading-normal" />}

          <section aria-labelledby="author" className="mt-10 flex flex-col gap-5 rounded-[26px] soft-raised p-6 leading-normal sm:flex-row">
            <Image src={a.img} alt={a.name} width={88} height={88} className="size-[88px] shrink-0 rounded-full object-cover" />
            <div>
              <h2 id="author" className="mb-0.5 text-[0.8rem] font-bold uppercase tracking-[0.12em] text-muted">{T.aboutAuthor}</h2>
              <p className="text-[1.15rem] font-bold text-ink">{a.name}</p>
              <p className="mb-2 text-[0.9rem] text-muted">{a.title} · RERA BRN {a.brn} · {a.languages.join(', ')}</p>
              <p className="mb-3 text-[0.95rem] text-ink-2">{a.bio}</p>
              <Link href={`/team/${a.slug}`} className="inline-flex items-center gap-1.5 font-bold text-forest">{T.viewProfile} <Icon name="arrow" className="size-4" /></Link>
            </div>
          </section>
        </div>

        {I.formShow && (
          <aside aria-label={`Speak to ${a.name}`} className="lg:sticky lg:top-[104px] lg:self-start">
            <div className="rounded-[28px] soft-raised p-[22px]">
              <EnquiryForm type="callback" subject={`Article: ${p.title}`} propertyRef={p.title} title={T.formTitle.replaceAll('{first}', a.name.split(' ')[0])} cta={T.formCta}
                message={T.formMessage.replaceAll('{title}', p.title)} />
            </div>
          </aside>
        )}
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="cv-auto wrap mt-[clamp(48px,7vw,96px)]">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div><span className="eyebrow mb-2">{T.relatedEyebrow}</span><h2 id="related" className="text-[clamp(1.6rem,2.8vw,2.3rem)]">{T.relatedTitle}{T.relatedItalic && <> <em>{T.relatedItalic}</em></>}</h2></div>
            <Link href="/insights" className="font-bold text-forest underline-offset-4 hover:underline">{T.relatedAll}</Link>
          </div>
          <ClipReveal className="grid gap-[clamp(18px,2.4vw,30px)] [grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))]">
            {related.map(r => <PostCard key={r.id} p={r} />)}
          </ClipReveal>
        </section>
      )}

      {I.nlOnArticles && <div className="wrap"><InsightsNewsletter title={T.nlTitle} text={T.nlText} id="article-nl-email" /></div>}

      <JsonLd data={blogPostingJsonLd({
        slug: p.slug, title: p.title, excerpt: p.excerpt, summary: x?.summary, img: p.img, cat: p.cat, date: p.date, modified,
        words: wordCount(p), author: a, sources,
      })} />
    </article>
  );
}
