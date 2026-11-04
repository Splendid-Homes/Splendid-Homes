import Link from 'next/link';
import { Icon } from '@/components/icons';
import { data } from '@/lib/cms';
import { telHref, waHref } from '@/lib/site';

/**
 * Branded "page not found" (Option A, soft UI): heading and text, a search that goes to the Buy
 * results (area, building or reference), quick-link chips and WhatsApp / call, beside big raised
 * "404" tiles in a pressed-in tray. Wording and links: CMS > Not found page.
 */
export async function NotFoundBody() {
  const { site } = await data();
  const N = site.notFound, T = N.text;
  return (
    <section aria-labelledby="nf-title" className="wrap grid items-center gap-[clamp(28px,5vw,64px)] py-[clamp(48px,8vw,110px)] lg:grid-cols-[1fr_1.05fr]">
      <div>
        <span className="eyebrow mb-3">{T.eyebrow}</span>
        <h1 id="nf-title" className="text-[clamp(2rem,4.2vw,3.2rem)] leading-[1.08] tracking-[-0.035em]">
          {T.title}{T.titleItalic && <> <em>{T.titleItalic}</em></>}
        </h1>
        {T.text && <p className="mb-6 mt-4 max-w-[48ch] text-[1.06rem] text-ink-2">{T.text}</p>}
        <form action="/buy" role="search" className="flex max-w-[540px] gap-2 rounded-full soft-inset p-1.5">
          <label htmlFor="nf-q" className="sr-only">{T.searchPlaceholder}</label>
          <input id="nf-q" name="q" type="search" placeholder={T.searchPlaceholder} maxLength={80}
            className="min-w-0 flex-1 bg-transparent px-4 text-base text-ink outline-none placeholder:text-muted" />
          <button type="submit" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-forest px-5 py-3 text-[0.9rem] font-extrabold text-white shadow-btn transition hover:brightness-110">
            <Icon name="search" className="size-4" />{T.searchCta}
          </button>
        </form>
        {N.links.length > 0 && (
          <nav aria-label="Popular pages" className="mt-5 flex flex-wrap gap-2.5">
            {N.links.map(l => (
              <Link key={l.href + l.label} href={l.href} className="rounded-full soft-raised-sm px-4 py-2.5 text-[0.88rem] font-extrabold text-forest transition-[box-shadow] hover:soft-inset-sm">{l.label}</Link>
            ))}
          </nav>
        )}
        {N.showContact && (
          <div className="mt-6 flex flex-wrap gap-2.5">
            <a href={waHref(site.whatsapp)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-[#127A3F] px-5 py-3 font-bold text-white shadow-btn transition hover:brightness-110">
              <Icon name="wa" className="size-5" />{T.whatsappCta}
            </a>
            <a href={telHref(site.phone)} className="inline-flex items-center gap-2 rounded-full soft-raised-sm px-5 py-3 font-bold text-forest active:soft-pressed">
              <Icon name="phone" className="size-4" />{site.phone}
            </a>
          </div>
        )}
      </div>
      <div aria-hidden="true" className="flex justify-center gap-[clamp(10px,2vw,20px)] rounded-[36px] soft-inset p-[clamp(18px,3.5vw,36px)]">
        {['4', '0', '4'].map((d, i) => (
          <span key={i} className={`grid aspect-[3/4] w-[clamp(78px,13vw,150px)] place-items-center rounded-[clamp(18px,2.5vw,28px)] soft-raised text-[clamp(3.6rem,9vw,7rem)] font-extrabold tracking-[-0.06em] ${i === 1 ? 'font-serif font-medium italic text-gold' : 'text-forest'}`}>{d}</span>
        ))}
      </div>
    </section>
  );
}
