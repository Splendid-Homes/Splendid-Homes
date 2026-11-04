import { Icon } from '@/components/icons';
import { Price } from '@/components/ui/Price';
import { data } from '@/lib/cms';
import { waHref } from '@/lib/site';
import { ViewingButton } from './ModalTriggers';

/**
 * Upgrade 8 (mobile first): bottom action bar on phones and tablets with the price,
 * WhatsApp and "Book a viewing". Desktop uses the sticky sidebar instead.
 * While it is on the page, the global WhatsApp bubble is hidden and the page gets
 * bottom padding (globals.css, via :has([data-sticky-cta])).
 */
export async function StickyCta({ price, perYear, waText, viewingCta, whatsappCta }: { price: number; perYear: boolean; waText: string; viewingCta: string; whatsappCta: string }) {
  const { site } = await data();
  return (
    <div data-sticky-cta className="fixed inset-x-0 bottom-0 z-[95] border-t border-line bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_rgba(18,38,26,0.08)] backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-[640px] items-center gap-2.5">
        <div className="mr-auto min-w-0 leading-tight max-[379px]:hidden">
          <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted">{perYear ? 'Per year' : 'Price'}</span>
          <Price aed={price} compact className="text-[1.05rem] font-extrabold text-forest" />
        </div>
        <a href={waHref(site.whatsapp, waText)} target="_blank" rel="noopener" aria-label="WhatsApp the agent"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full shadow-btn bg-[#127A3F] px-4 font-bold text-white max-[379px]:flex-1">
          <Icon name="wa" className="size-5" /><span className="max-sm:sr-only">{whatsappCta}</span>
        </a>
        <ViewingButton className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-forest px-5 font-bold text-white shadow-btn sm:flex-none">
          <Icon name="cal" className="size-5" /> {viewingCta}
        </ViewingButton>
      </div>
    </div>
  );
}
