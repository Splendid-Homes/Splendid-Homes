import { Icon } from '@/components/icons';
import { data } from '@/lib/cms';
import { waHref } from '@/lib/site';

export async function WhatsAppFloat() {
  const { site } = await data();
  return (
    <a href={waHref(site.whatsapp)} target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp"
      className="wa-float fixed bottom-5 right-5 z-[90] grid size-[58px] place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_rgba(37,211,102,0.45)] transition-transform duration-300 hover:scale-[1.08]">
      <Icon name="wa" className="size-7" />
    </a>
  );
}
