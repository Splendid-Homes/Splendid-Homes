'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/icons';

export type SoftOption = { value: string; label: string; meta?: string; disabled?: boolean };

const TRIGGER = {
  // Pressed-in well with the label inside, above the value (hero search).
  well: 'rounded-[16px] soft-inset pb-2.5 pl-3.5 pr-3 pt-[26px]',
  // Same size as the site's text fields; the label sits above (forms, filters).
  field: 'rounded-field soft-inset px-[0.95em] py-[0.75em]',
  // Listing filter bars (taller on touch screens).
  filter: 'rounded-field soft-inset px-3.5 py-3 text-base lg:py-2.5 lg:text-[0.9rem]',
  // Raised pill, for a filter bar inside a pressed-in tray (expert finder).
  pill: 'rounded-full soft-raised-sm py-2.5 pl-4 pr-3',
  // Compact, on the dark header (currency).
  dark: 'rounded-full py-[0.35em] pl-[0.4em] pr-1',
};

/**
 * Soft UI dropdown used for every select on the site (select-only combobox, WAI-ARIA APG pattern).
 * The menu is a raised mist panel; the option in use carries a gold tick, `columns` lays short
 * options out as a grid of chips (e.g. bedrooms), and options can carry a muted `meta` (a count).
 * Keyboard: Enter/Space/↓ opens, ↑↓ Home End move, type letters to jump, Enter picks, Esc closes.
 * The value travels in a hidden input, so the field still submits with its form; `required`
 * uses the browser's own validation and moves focus here when the form is sent empty.
 * Controlled (`value` + `onChange`) or not (`defaultValue`).
 * The menu is portalled to <body> with fixed positioning, so no later section, photo or
 * overflow:hidden parent can cover or clip it; it follows its field on scroll and resize,
 * opens upwards when there is no room below, and lines up right when near the right edge.
 */
export function SoftSelect({ label, labelExtra, labelClassName, name, value, defaultValue = '', onChange, options, disabled, required,
  columns, align = 'left', variant = 'well', triggerClassName = '', className = '' }: {
  label: string;
  labelExtra?: React.ReactNode;
  /** 'field' variant: classes for the visible label above the field ('sr-only' to hide it). */
  labelClassName?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  options: SoftOption[];
  disabled?: boolean;
  required?: boolean;
  columns?: number;
  /** Which edge of the field the menu lines up with (use 'right' for a field at the right edge). */
  align?: 'left' | 'right';
  variant?: keyof typeof TRIGGER;
  triggerClassName?: string;
  className?: string;
}) {
  const id = useId();
  const [own, setOwn] = useState(defaultValue);
  const val = value ?? own;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [invalid, setInvalid] = useState(false);
  const [pos, setPos] = useState<React.CSSProperties | null>(null);
  const [layer, setLayer] = useState<HTMLElement | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: '', at: 0 });
  const found = options.findIndex(o => o.value === val);
  const selected = Math.max(0, found);
  const current = options[selected];
  const well = variant === 'well';
  const dark = variant === 'dark';

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { const t = e.target as Node; if (!root.current?.contains(t) && !list.current?.contains(t)) setOpen(false); };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]);
  // Keep the active option in view in long lists.
  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  // Place the fixed menu next to its field: below (or above when short of room), left or right aligned.
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const r = button.current?.getBoundingClientRect();
      if (!r) return;
      if (r.bottom < 0 || r.top > innerHeight) { setOpen(false); return; }
      // Inside a modal, stay in the dialog layer (the rest of the page is inert there).
      setLayer(root.current?.closest<HTMLElement>('[role=dialog]') ?? null);
      const want = columns ? 300 : 340;
      const right = align === 'right' || (r.left + want > innerWidth - 8 && r.right > want);
      const below = innerHeight - r.bottom - 16, above = r.top - 16;
      const up = below < 220 && above > below;
      setPos({
        ...(right ? { right: innerWidth - r.right } : { left: r.left }),
        ...(up ? { bottom: innerHeight - r.top + 8 } : { top: r.bottom + 8 }),
        maxHeight: Math.max(160, Math.min(320, up ? above : below)),
        minWidth: columns ? undefined : dark ? 120 : r.width,
      });
    };
    place();
    addEventListener('scroll', place, { capture: true, passive: true });
    addEventListener('resize', place);
    return () => { removeEventListener('scroll', place, { capture: true }); removeEventListener('resize', place); };
  }, [open, align, columns, dark]);

  const show = () => { setActive(selected); setOpen(true); };
  const pick = (i: number) => {
    const o = options[i];
    if (!o || o.disabled) return;
    if (value === undefined) setOwn(o.value);
    onChange?.(o.value);
    setInvalid(false);
    setOpen(false);
    button.current?.focus();
  };
  const step = (from: number, d: number) => {
    for (let i = from + d; i >= 0 && i < options.length; i += d) if (!options[i].disabled) return i;
    return from;
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (disabled) return;
    const k = e.key;
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(k)) { e.preventDefault(); show(); }
      return;
    }
    const cols = columns ?? 1;
    if (k === 'Escape') { e.preventDefault(); e.stopPropagation(); setOpen(false); }
    else if (k === 'Tab') setOpen(false);
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); pick(active); }
    else if (k === 'ArrowDown') { e.preventDefault(); setActive(a => step(a, cols)); }
    else if (k === 'ArrowUp') { e.preventDefault(); setActive(a => step(a, -cols)); }
    else if (k === 'ArrowRight' && cols > 1) { e.preventDefault(); setActive(a => step(a, 1)); }
    else if (k === 'ArrowLeft' && cols > 1) { e.preventDefault(); setActive(a => step(a, -1)); }
    else if (k === 'Home') { e.preventDefault(); setActive(step(-1, 1)); }
    else if (k === 'End') { e.preventDefault(); setActive(step(options.length, -1)); }
    else if (k.length === 1 && /\S/.test(k)) {
      const t = typed.current;
      t.text = (Date.now() - t.at < 700 ? t.text : '') + k.toLowerCase();
      t.at = Date.now();
      const hit = options.findIndex(o => !o.disabled && o.label.toLowerCase().startsWith(t.text));
      if (hit >= 0) setActive(hit);
    }
  };

  return (
    <div ref={root} className={`relative min-w-0 ${className}`}>
      {name && (required
        ? <input name={name} value={val} required onChange={() => {}} tabIndex={-1} aria-hidden="true"
            onInvalid={e => { e.preventDefault(); setInvalid(true); button.current?.focus(); }}
            className="pointer-events-none absolute bottom-0 left-1/2 size-px opacity-0" />
        : <input type="hidden" name={name} value={val} />)}
      <span id={`${id}-l`} onClick={() => button.current?.focus()}
        className={well ? 'pointer-events-none absolute inset-x-3.5 top-2.5 z-[1] flex items-baseline justify-between gap-2 whitespace-nowrap text-[0.68rem] font-extrabold uppercase tracking-[0.06em] text-muted'
          : labelClassName ?? 'sr-only'}>
        {label}{labelExtra}
      </span>
      <button ref={button} type="button" role="combobox" aria-labelledby={`${id}-l ${id}-v`} aria-haspopup="listbox" aria-expanded={open}
        aria-controls={`${id}-list`} aria-activedescendant={open ? `${id}-${active}` : undefined} aria-required={required || undefined}
        aria-invalid={invalid || undefined} disabled={disabled}
        onClick={() => (open ? setOpen(false) : show())} onKeyDown={onKey}
        className={`flex w-full cursor-pointer items-center justify-between gap-2 text-left transition-shadow focus-visible:outline-2 focus-visible:outline-solid disabled:cursor-not-allowed disabled:opacity-50 ${dark ? 'focus-visible:outline-gold' : 'focus-visible:outline-gold/60'} ${TRIGGER[variant]} ${open && !dark ? 'outline-2 outline-solid outline-gold/40' : ''} ${invalid ? 'outline-2 outline-solid outline-[#B42318]' : ''} ${triggerClassName}`}>
        <span id={`${id}-v`} className={`truncate ${well ? 'text-[0.95rem] font-bold text-ink' : dark ? 'font-semibold' : variant === 'pill' ? 'font-bold text-forest' : found < 0 || !val ? 'text-ink-2' : 'text-ink'}`}>{current?.label}</span>
        <Icon name="chevron" className={`size-4 shrink-0 transition-transform duration-300 ${dark ? '' : 'text-forest'} ${open ? 'rotate-180' : ''}`} />
      </button>
      {invalid && <p className="mt-1 text-[0.8rem] font-semibold text-[#B42318]">Please choose an option.</p>}
      {open && pos && createPortal(
        <ul ref={list} id={`${id}-list`} role="listbox" aria-labelledby={`${id}-l`}
          className={`fixed ${dark ? 'z-[120]' : 'z-[90]'} overflow-y-auto overscroll-contain rounded-[20px] bg-mist p-1.5 text-ink shadow-[0_18px_40px_-12px_rgba(15,36,24,.35),-4px_-4px_12px_rgba(255,255,255,.9)] motion-safe:animate-[sh-fade-up_.25s_cubic-bezier(.16,1,.3,1)] ${columns ? 'grid w-[min(300px,86vw)] gap-1.5' : 'w-max max-w-[min(340px,86vw)]'}`}
          style={{ ...pos, ...(columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : {}) }}>
          {options.map((o, i) => {
            const on = i === selected && found >= 0;
            return (
              <li key={o.value || '_'} id={`${id}-${i}`} data-i={i} role="option" aria-selected={on} aria-disabled={o.disabled || undefined}
                onPointerEnter={() => !o.disabled && setActive(i)} onClick={() => pick(i)}
                className={`flex items-center gap-2.5 rounded-[13px] text-[0.92rem] font-semibold transition-[box-shadow,color] duration-200 ${columns ? 'justify-center px-2 py-2.5 text-center' : 'justify-between px-3 py-2.5'} ${o.disabled ? 'cursor-default text-muted/60' : columns && on ? 'cursor-pointer soft-inset-sm text-forest' : i === active ? 'cursor-pointer soft-raised-sm text-forest' : 'cursor-pointer text-ink-2'}`}>
                <span className="flex min-w-0 items-center gap-2.5">
                  {!columns && <Icon name="check" className={`size-4 shrink-0 text-gold ${on ? '' : 'invisible'}`} />}
                  <span className="truncate">{o.label}</span>
                </span>
                {o.meta && !columns && <span className="shrink-0 rounded-full soft-inset-sm px-2 py-0.5 text-[0.72rem] font-bold tabular-nums text-muted">{o.meta}</span>}
              </li>
            );
          })}
        </ul>,
        layer ?? document.body,
      )}
    </div>
  );
}
