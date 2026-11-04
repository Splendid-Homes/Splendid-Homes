'use client';

import Link from 'next/link';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Logo } from '@/components/brand/Logo';
import { Icon } from '@/components/icons';
import { telHref } from '@/lib/site';
import { useSiteInfo } from './SiteContext';
import { CurrencySelect } from './CurrencySelect';

/**
 * Side drawer (Motion). Loaded on demand the first time the menu opens.
 * Portaled to <body>: the header uses transforms/backdrop-filter, which would
 * otherwise become the containing block of this `fixed` overlay.
 */
export default function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { phone, menu = [] } = useSiteInfo();
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[300]" role="dialog" aria-modal="true" aria-label="Menu">
          <motion.div className="absolute inset-0 bg-ink/45" onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} />
          <motion.aside data-lenis-prevent
            className="absolute inset-y-0 right-0 flex w-[min(380px,90vw)] flex-col gap-[18px] overflow-auto bg-white p-[22px]"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.5 }}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-forest"><Logo size={36} /></span>
              <button type="button" onClick={onClose} aria-label="Close menu" autoFocus
                className="grid size-[42px] place-items-center rounded-full soft-raised-sm active:soft-pressed hover:border-forest hover:text-forest">
                <Icon name="close" />
              </button>
            </div>
            <nav aria-label="Mobile">
              {menu.map((n, i) => (
                <motion.div key={n.href + n.label} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + i * 0.025 }}>
                  <Link href={n.href} onClick={onClose} className="flex items-center justify-between border-b border-line px-1 py-[13px] font-semibold hover:text-forest">
                    {n.label}<Icon name="chevR" className="size-4 text-muted" />
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3">
              <CurrencySelect />
              <a href={telHref(phone)} className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 font-bold text-white shadow-btn">
                <Icon name="phone" /> {phone}
              </a>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
