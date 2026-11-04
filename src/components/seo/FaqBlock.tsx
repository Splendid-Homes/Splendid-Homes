import { Icon } from '@/components/icons';
import { faqJsonLd, type Faq } from '@/lib/schema';
import { JsonLd } from './JsonLd';

/**
 * Visible FAQ (AEO) with matching FAQPage schema. Native <details>, so every answer is in
 * the server HTML, works without JS and needs no client bundle. Answers lead with the
 * direct answer in the first sentence, then expand.
 */
export function FaqBlock({ faqs, title = 'Frequently asked questions', id = 'faq', className = '' }: { faqs: Faq[]; title?: string; id?: string; className?: string }) {
  return (
    <section aria-labelledby={id} className={className}>
      <h2 id={id} className="mb-5 text-[clamp(1.35rem,2.2vw,1.75rem)]">{title}</h2>
      <div className="grid gap-1.5 rounded-[26px] soft-inset p-2.5">
        {faqs.map((f, i) => (
          <details key={f.q} className="group rounded-[18px] px-5 transition-[box-shadow,background-color] open:soft-raised [&_summary::-webkit-details-marker]:hidden" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-[18px] font-bold leading-snug transition-colors hover:text-forest">
              <h3 className="text-[1rem] font-bold">{f.q}</h3>
              <span className="grid size-8 shrink-0 place-items-center rounded-full soft-raised-sm text-forest transition-transform duration-300 group-open:rotate-45">
                <Icon name="close" className="size-3.5 rotate-45" />
              </span>
            </summary>
            <p className="pb-5 text-[0.95rem] leading-relaxed text-ink-2">{f.a}</p>
          </details>
        ))}
      </div>
      <JsonLd data={faqJsonLd(faqs)} />
    </section>
  );
}
