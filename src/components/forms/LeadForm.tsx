'use client';

import Link from 'next/link';
import { createContext, startTransition, useActionState, useContext, useSyncExternalStore } from 'react';
import { Icon } from '@/components/icons';
import { submitLead, type LeadState } from '@/lib/leadActions';
import { useSiteInfo } from '@/components/layout/SiteContext';
import { SOURCE_KEY } from '@/payload/leadSources';

const StateCtx = createContext<LeadState>(null);
const PendingCtx = createContext(false);

/**
 * Wraps any website form: posts to the `submitLead` server action (works without JS too),
 * adds the lead type, related record IDs, the page it was sent from and a hidden honeypot,
 * shows field errors next to inputs (<FieldError />) and swaps to a confirmation on success.
 * With JS, the action is dispatched from onSubmit so React does not reset the form: after a
 * validation error the visitor keeps everything they typed (the `action` attribute still
 * covers no-JS submissions).
 */
const noop = () => () => {};

export function LeadForm({ type, hidden = {}, className, encType, success, children }: {
  type: string;
  hidden?: Record<string, string | number | undefined>;
  className?: string;
  encType?: 'multipart/form-data';
  success?: (message: string) => React.ReactNode;
  children: React.ReactNode;
}) {
  const [state, action, pending] = useActionState(submitLead, null);
  // Read in the browser, so the form never blocks prerendering of new CMS pages.
  const path = useSyncExternalStore(noop, () => location.pathname, () => '');
  if (state?.ok) {
    return success ? success(state.message) : (
      <div role="status" className="rounded-card bg-mint/60 px-5 py-7 text-center motion-safe:animate-[sh-fade-up_.5s_cubic-bezier(.16,1,.3,1)]">
        <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-white text-forest"><Icon name="check" className="size-6" /></span>
        <p className="text-ink-2">{state.message}</p>
      </div>
    );
  }
  return (
    <StateCtx value={state}>
      <PendingCtx value={pending}>
      <form action={action} className={className} encType={encType}
        onSubmit={e => {
          e.preventDefault();
          if (pending) return;
          const fd = new FormData(e.currentTarget);
          try { fd.set('leadSource', sessionStorage.getItem(SOURCE_KEY) ?? ''); } catch { /* storage unavailable */ }
          startTransition(() => action(fd));
        }}>
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="sourcePage" value={path} />
        {Object.entries(hidden).map(([k, v]) => v !== undefined && <input key={k} type="hidden" name={k} value={String(v)} />)}
        {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>Company website<input type="text" name="company_website" tabIndex={-1} autoComplete="off" /></label>
        </div>
        {children}
        {state && !state.ok && <p role="alert" className="mt-3 text-[0.86rem] font-semibold text-[#B42318]">{state.message}</p>}
      </form>
      </PendingCtx>
    </StateCtx>
  );
}

/** Red * after a required field's label (the input itself carries `required` for screen readers). */
export function Req() {
  return <span aria-hidden="true" className="ml-0.5 text-[#B42318]">*</span>;
}

/** Inline error for one field, announced to screen readers. */
export function FieldError({ name }: { name: string }) {
  const msg = useContext(StateCtx)?.fieldErrors?.[name];
  return msg ? <p id={`err-${name}`} className="mt-1 text-[0.8rem] font-semibold text-[#B42318]">{msg}</p> : null;
}
export const useFieldInvalid = (name: string) => Boolean(useContext(StateCtx)?.fieldErrors?.[name]);

/** Submit button that disables itself while the request is in flight. */
export function SubmitButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const pending = useContext(PendingCtx);
  return (
    <button type="submit" disabled={pending} aria-disabled={pending} className={`${className ?? ''} disabled:cursor-wait disabled:opacity-70`}>
      {pending ? 'Sending…' : children}
    </button>
  );
}

/** Standard privacy consent checkbox (Document 5: consent recorded with every lead). */
export function Consent({ className = '' }: { className?: string }) {
  const c = useSiteInfo().consent ?? { text: 'I agree to the {link} and to be contacted by Splendid Homes.', link: 'privacy policy', href: '/legal/privacy' };
  const [before, after = ''] = c.text.split('{link}');
  return (
    <div className={className}>
      <label className="flex items-start gap-2.5 text-[0.8rem] text-muted">
        <input type="checkbox" name="consent" required className="mt-0.5 accent-forest" />
        <span>{before}<Link href={c.href} className="underline underline-offset-2 hover:text-forest">{c.link}</Link>{after}</span>
      </label>
      <FieldError name="consent" />
    </div>
  );
}
