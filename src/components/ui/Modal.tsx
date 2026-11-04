'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/icons';

type Props = {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
  /** 'sheet': bottom sheet on phones, centered card from sm up. 'full': dark full-screen (lightbox). */
  variant?: 'sheet' | 'full';
};

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog (Motion is allowed here per the motion brief: modal + AnimatePresence).
 * Portaled to <body>, Escape closes, Tab is kept inside, the page behind is inert.
 * Only ever imported from lazily loaded modules, so Motion stays out of the page bundle.
 */
export function Modal({ open, onClose, label, children, variant = 'sheet' }: Props) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const siblings = Array.from(document.body.children).filter((el): el is HTMLElement => el instanceof HTMLElement && !el.contains(panel.current));
    siblings.forEach(el => el.setAttribute('inert', ''));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key !== 'Tab' || !panel.current) return;
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); siblings.forEach(el => el.removeAttribute('inert')); };
  }, [open, onClose]);

  const full = variant === 'full';
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={`fixed inset-0 z-[400] flex ${full ? '' : 'items-end justify-center sm:items-center sm:p-6'}`} role="dialog" aria-modal="true" aria-label={label}>
          <motion.div className={`absolute inset-0 ${full ? 'bg-deep/95' : 'bg-ink/50 backdrop-blur-[2px]'}`} onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} />
          <motion.div ref={panel} data-lenis-prevent
            className={full
              ? 'relative flex w-full flex-col'
              : 'relative max-h-[92svh] w-full overflow-auto rounded-t-[28px] bg-white p-[clamp(22px,4vw,34px)] shadow-float sm:max-w-[560px] sm:rounded-[28px]'}
            initial={full ? { opacity: 0, scale: 0.98 } : { y: 40, opacity: 0 }}
            animate={full ? { opacity: 1, scale: 1 } : { y: 0, opacity: 1 }}
            exit={full ? { opacity: 0, scale: 0.98 } : { y: 40, opacity: 0 }}
            transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.45 }}>
            <button type="button" onClick={onClose} aria-label="Close" autoFocus
              className={`absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full border transition-colors ${full ? 'border-white/25 text-white hover:bg-white/10' : 'border-line hover:border-forest hover:text-forest'}`}>
              <Icon name="close" />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
