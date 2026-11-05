import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { Icon, type IconName } from '@/components/icons';
import { data } from '@/lib/cms';
import { telHref, waHref } from '@/lib/site';
import { CtaHook } from './CtaHook';
import { BackToTop, FooterLinks, OfficeStatus } from './FooterParts';
import { FooterWordmark } from './FooterWordmark';
import { NewsletterForm } from './NewsletterForm';

const pill = 'inline-flex items-center justify-center gap-1.5 rounded-full soft-dark-raised px-2 py-2.5 text-[0.82rem] font-bold text-white transition-[color,box-shadow] hover:text-gold active:soft-dark-pressed';


/** Footer contact cards (CMS > Menus & footer). {whatsapp} / {phone} in a link open WhatsApp / a call; {phone} in a note is the number. */
const TONE = { green: 'bg-[#127A3F]', forest: 'bg-forest', gold: 'bg-gold' } as const;
function ways(s: { whatsapp: string; phone: string; menus: { ways: { title: string; note: string; icon: string; href: string; tone: keyof typeof TONE }[] } }) {
  return s.menus.ways.map(w => {
    const href = w.href === '{whatsapp}' ? waHref(s.whatsapp) : w.href === '{phone}' ? telHref(s.phone) : w.href;
    return { title: w.title, note: w.note.replaceAll('{phone}', s.phone), icon: w.icon as IconName, href, tone: TONE[w.tone] ?? TONE.forest, external: /^https?:/.test(href) };
  });
}

export async function Footer() {
  const { site: SITE, c: { agents } } = await data();
  const SOCIAL: [IconName, string, string][] = [
    ['ig', 'Instagram', SITE.socials.instagram], ['in', 'LinkedIn', SITE.socials.linkedin], ['yt', 'YouTube', SITE.socials.youtube],
    ['tt', 'TikTok', SITE.socials.tiktok], ['fb', 'Facebook', SITE.socials.facebook],
  ];
  const T = SITE.menus.text;
  const directions = SITE.googleBusinessProfile || `https://www.google.com/maps/dir/?api=1&destination=${SITE.geo.lat},${SITE.geo.lng}`;
  return (
    <footer>
      <div className="wrap">
        {/* Call to action (soft UI): headline and proof on the left, three ways to get in touch in a pressed-in tray. */}
        <div className="relative z-[1] -mb-[60px] mt-[clamp(40px,6vw,80px)] grid items-center gap-[clamp(20px,3vw,32px)] rounded-[36px] bg-mist p-[clamp(22px,3.4vw,42px)] shadow-[0_30px_60px_-30px_rgba(15,36,24,.45),-6px_-6px_14px_#fff] lg:grid-cols-[1fr_1.2fr]">
          <CtaHook hours={SITE.hours} clients={SITE.showFigures ? SITE.stats.clients : ''} sold={SITE.showFigures ? SITE.stats.sold : ''} showFigures={SITE.showFigures} faces={agents.slice(0, 4).map(a => a.img)} text={T} words={SITE.menus.ctaWords} />
          <ul className="grid gap-3 rounded-[28px] soft-inset p-2.5 sm:grid-cols-3">
            {ways(SITE).map(w => (
              <li key={w.title}>
                <Link href={w.href} prefetch={false} {...(w.external ? { target: '_blank', rel: 'noopener' } : {})}
                  className="group grid h-full items-center gap-x-3.5 sm:content-start gap-y-1 rounded-[20px] soft-raised-sm p-4 transition-[translate,box-shadow] duration-300 ease-[cubic-bezier(.16,1,.3,1)] max-sm:grid-cols-[auto_1fr] sm:gap-y-2.5 pointer-fine:hover:-translate-y-1 pointer-fine:hover:soft-raised active:soft-pressed">
                  <span className={`grid size-[46px] place-items-center rounded-full text-white shadow-btn max-sm:row-span-2 ${w.tone}`}><Icon name={w.icon} className="size-5" /></span>
                  <b className="text-ink transition-colors group-hover:text-forest">{w.title}</b>
                  <span className="text-[0.8rem] font-semibold text-muted">{w.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grain drift-dark relative bg-deep pt-[120px] text-[#C9D8CD]">
        <div className="wrap grid grid-cols-1 items-start gap-[clamp(22px,3vw,32px)] pb-10 lg:grid-cols-[1.3fr_2fr]">
          {/* Office card. NAP block: must match schema and Google Business Profile exactly (GEO). */}
          <div className="grid min-w-0 gap-4 rounded-[28px] soft-dark-raised p-[clamp(18px,2.2vw,24px)]">
            <Link href="/" className="inline-block justify-self-start text-[14px] text-white"><Logo size={46} /></Link>
            <OfficeStatus hours={SITE.hours} />
            <address className="grid gap-1.5 not-italic">
              <span className="text-[1.05rem] font-bold leading-snug text-white">{SITE.address.full}</span>
              <span className="text-[0.86rem] text-deep-text">{SITE.hours}</span>
              <span className="sr-only">Phone {SITE.phone}, email {SITE.email}</span>
            </address>
            <div className="grid grid-cols-3 gap-2">
              <a href={directions} target="_blank" rel="noopener" className="inline-flex items-center justify-center gap-1.5 rounded-full bg-mist px-2 py-2.5 text-[0.82rem] font-bold text-forest transition hover:brightness-105">
                <Icon name="nav" className="size-4" />{T.directions}
              </a>
              <a href={telHref(SITE.phone)} aria-label={`Call ${SITE.phone}`} className={pill}><Icon name="phone" className="size-4" />{T.callLabel}</a>
              <a href={`mailto:${SITE.email}`} aria-label={`Email ${SITE.email}`} className={pill}><Icon name="mail" className="size-4" />{T.emailLabel}</a>
            </div>
            <div className="flex gap-2">
              {SOCIAL.map(([icon, label, href]) => (
                <a key={icon} href={href} aria-label={label} className="grid size-[38px] place-items-center rounded-full soft-dark-raised transition-[color,box-shadow] hover:text-gold active:soft-dark-pressed"><Icon name={icon} className="size-4" /></a>
              ))}
            </div>
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-[clamp(20px,2.6vw,28px)]">
            <FooterLinks cols={SITE.menus.footerCols.map(c => [c.title, c.links.map(l => [l.label, l.href] as [string, string])])} />
            <div className="rounded-[24px] soft-dark-raised p-[clamp(16px,2vw,22px)]"><NewsletterForm /></div>
          </div>
        </div>
        <div className="wrap flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pb-7 pt-5 text-[0.8rem] text-[#8EA596]">
          <span className="inline-flex items-center gap-2 rounded-full soft-dark-inset px-3 py-1.5 font-semibold text-deep-text">
            <Icon name="shield" className="size-3.5 text-gold" />RERA ORN {SITE.orn} · © {new Date().getFullYear()} {SITE.legalName}
          </span>
          <span className="flex items-center gap-4">
            {SITE.legal.pages.filter(p => p.inFooter).map(p => (
              <Link key={p.slug} href={`/legal/${p.slug}`} className="hover:text-white">{p.footerLabel || p.title}</Link>
            ))}
            <BackToTop />
          </span>
        </div>
        <FooterWordmark />
      </div>
    </footer>
  );
}
