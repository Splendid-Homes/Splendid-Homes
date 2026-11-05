import type { Metadata, Viewport } from 'next';
import { DriftWatcher } from '@/components/motion/DriftWatcher';
import { Cormorant_Garamond, Fraunces, Manrope } from 'next/font/google';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat';
import { IntroCurtain } from '@/components/motion/IntroCurtain';
import { CompareTray } from '@/components/layout/CompareTray';
import { LeadSourceTracker } from '@/components/layout/LeadSourceTracker';
import { MediaHost } from '@/components/media/MediaHost';
import { EnquiryHost } from '@/components/layout/EnquiryHost';
import { CursorLabel } from '@/components/motion/CursorLabel';
import { Magnetic } from '@/components/motion/Magnetic';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { JsonLd } from '@/components/seo/JsonLd';
import { IS_PRODUCTION, organizationJsonLd } from '@/lib/seo';
import { SiteProvider } from '@/components/layout/SiteContext';
import { data } from '@/lib/cms';
import { BRAND, SITE_URL } from '@/lib/site';
import './globals.css';
import { Suspense } from 'react';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'optional' }); // optional: no font-swap layout shift (CLS 0)
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'optional', style: ['italic'], weight: ['500'] });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], variable: '--font-cormorant', display: 'swap', weight: ['600'] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${BRAND.name} | Real Estate in Dubai`, template: `%s | ${BRAND.name}` },
  description: BRAND.description,
  applicationName: BRAND.name,
  robots: IS_PRODUCTION ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { siteName: BRAND.name, locale: 'en_AE', type: 'website' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: '#1E4D34' };

// Public pages render per request from the cached content snapshot (src/lib/cms.ts). Saved static pages
// cannot be used: rebuilding one hangs on Cloudflare Workers, which took pages down once they expired.
export const dynamic = 'force-dynamic';

// Runs before first paint: allow entrance animations only when JS runs and the
// visitor has not asked for reduced motion. Without it, everything is simply visible.
// The first page view of a session also gets the intro curtain (`html.intro`).
const MOTION_FLAG = `try{var d=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('motion-ok');if(!sessionStorage.getItem('sh_intro')){sessionStorage.setItem('sh_intro','1');d.classList.add('intro')}}}catch(e){}`;

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const { site } = await data();
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning
      className={`${manrope.variable} ${fraunces.variable} ${cormorant.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_FLAG }} />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[999] focus:rounded-full focus:bg-forest focus:px-5 focus:py-3 focus:text-white">
          Skip to content
        </a>
        <SiteProvider value={{ rates: site.rates, phone: site.phone, whatsapp: site.whatsapp,
          compare: { max: site.compare.max, button: site.compare.text.trayButton, full: site.compare.text.trayFull, clearAll: site.compare.text.clearAll, addSlot: site.compare.text.addSlot },
          consent: { text: site.legal.text.consentText.replaceAll('{company}', site.name), link: site.legal.text.consentLink, href: `/legal/${site.legal.text.consentPage}` },
          menu: [...site.menus.mainNav, ...site.menus.mobileExtra] }}>
        <SmoothScroll>
          <Header />
          <main id="main">{children}</main>
          <Suspense fallback={null}><DriftWatcher /></Suspense>
          <Footer />
        </SmoothScroll>
        <WhatsAppFloat />
        <Suspense fallback={null}><CompareTray /></Suspense>
        <LeadSourceTracker />
        <MediaHost />
        <EnquiryHost />
        <IntroCurtain />
        <Magnetic />
        <CursorLabel />
        </SiteProvider>
        <JsonLd data={organizationJsonLd(site)} />
      </body>
    </html>
  );
}
