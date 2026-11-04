'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@/components/icons';
import { Consent, FieldError, LeadForm, Req, SubmitButton } from '@/components/forms/LeadForm';
import { Modal } from '@/components/ui/Modal';

const field = 'w-full rounded-field border-0 soft-inset px-[0.95em] py-[0.8em] text-ink outline-none transition-shadow focus:outline-solid focus:outline-2 focus:outline-gold/60';
const label = 'mb-1.5 block text-[0.78rem] font-semibold tracking-[0.04em] text-muted';
const chip = 'rounded-[14px] border px-2 py-2.5 text-center text-[0.84rem] font-semibold transition-colors has-[:checked]:border-forest has-[:checked]:bg-forest has-[:checked]:text-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-forest';
const SLOTS = ['10:00', '12:00', '14:00', '16:00', '18:00'];

/** Next 7 viewing days (Mon–Sat; Sundays skipped), computed on the client when the dialog opens. */
function nextDays() {
  const out: Date[] = [];
  const d = new Date();
  while (out.length < 7) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0) out.push(new Date(d)); }
  return out;
}

export type ViewingInfo = { title: string; ref: string; agentName: string; propertyId?: string; projectId?: string };

/** "Book a viewing" (F23): pick a day and time, leave contact details; saved as a viewing-request lead. */
export default function ViewingModal({ open, onClose, info }: { open: boolean; onClose: () => void; info: ViewingInfo }) {
  const [attempt, setAttempt] = useState(0);
  const days = useMemo(() => (open ? nextDays() : []), [open]);
  const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString('en-GB', o);

  return (
    <Modal open={open} onClose={() => { onClose(); setAttempt(a => a + 1); }} label="Book a viewing">
      <LeadForm key={attempt} type="viewing" hidden={{ propertyId: info.propertyId, projectId: info.projectId }}
        success={message => (
          <div role="status" className="py-10 text-center">
            <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-mint text-forest"><Icon name="check" className="size-7" /></span>
            <h2 className="mb-1.5 text-[1.5rem]">Viewing requested</h2>
            <p className="text-muted">{message} {info.agentName} will be in touch.</p>
          </div>
        )}>
          <span className="eyebrow mb-2">Ref {info.ref}</span>
          <h2 className="mb-1 pr-12 text-[clamp(1.4rem,3vw,1.75rem)]">Book a viewing</h2>
          <p className="mb-5 text-[0.92rem] text-muted">{info.title}</p>

          <fieldset className="mb-4">
            <legend className={label}>Day</legend>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {days.map((d, i) => (
                <label key={i} className={`${chip} cursor-pointer border-line leading-tight`}>
                  <input type="radio" name="d_day" value={fmt(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} defaultChecked={i === 0} className="sr-only" />
                  <span className="block text-[0.7rem] font-bold uppercase tracking-[0.08em] opacity-75">{fmt(d, { weekday: 'short' })}</span>
                  <span className="text-[1.05rem]">{d.getDate()}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="mb-4">
            <legend className={label}>Time</legend>
            <div className="grid grid-cols-5 gap-2">
              {SLOTS.map((t, i) => (
                <label key={t} className={`${chip} cursor-pointer border-line`}>
                  <input type="radio" name="d_time" value={t} defaultChecked={i === 1} className="sr-only" />{t}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-2">
            <div><label htmlFor="bv-name" className={label}>Full name<Req /></label><input id="bv-name" name="name" required autoComplete="name" className={field} placeholder="Your name" /><FieldError name="name" /></div>
            <div><label htmlFor="bv-phone" className={label}>Phone<Req /></label><input id="bv-phone" name="phone" type="tel" required autoComplete="tel" className={field} placeholder="+971 50 000 0000" /><FieldError name="phone" /></div>
          </div>
          <div className="mt-3"><label htmlFor="bv-email" className={label}>Email</label><input id="bv-email" name="email" type="email" autoComplete="email" className={field} placeholder="you@email.com" /><FieldError name="email" /></div>
          <Consent className="my-4" />
          <SubmitButton className="flex w-full items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 font-bold text-white shadow-btn transition hover:brightness-110">
            <Icon name="cal" /> Request viewing
          </SubmitButton>
      </LeadForm>
    </Modal>
  );
}
