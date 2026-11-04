'use client';

import { SoftSelect } from '@/components/ui/SoftSelect';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Consent, FieldError, LeadForm, Req, SubmitButton } from '@/components/forms/LeadForm';
import { Icon, type IconName } from '@/components/icons';

const field = 'w-full rounded-field border-0 soft-inset px-[0.95em] py-[0.8em] text-ink outline-none transition-shadow focus:outline-solid focus:outline-2 focus:outline-gold/60';
const label = 'mb-1.5 block text-[0.78rem] font-semibold tracking-[0.04em] text-muted';
const STEPS = ['Property', 'Details', 'Contact'];
const TYPES: [string, IconName][] = [['Apartment', 'tower'], ['Villa', 'villa'], ['Townhouse', 'townhouse'], ['Penthouse', 'building']];
const BEDS = ['Studio', '1', '2', '3', '4', '5', '6+'];
// A radio drawn as a soft control: raised, pressed in once chosen.
const pick = 'cursor-pointer soft-raised-sm transition-[box-shadow,color] duration-300 has-[:checked]:soft-inset has-[:checked]:text-forest has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold';

const noop = () => () => {};

/**
 * Homepage valuation request (F19) in three steps: sell or let + community, property type +
 * bedrooms, then contact details. One form throughout, so everything is sent together as a
 * valuation lead. Without JS (before hydration) all three steps show as one form.
 */
export function ValuationForm({ communities }: { communities: string[] }) {
  const [step, setStep] = useState(0);
  const ready = useSyncExternalStore(noop, () => true, () => false);
  const heading = useRef<HTMLLegendElement>(null);
  const moved = useRef(false);
  useEffect(() => { if (moved.current) heading.current?.focus(); }, [step]);
  const go = (n: number) => { moved.current = true; setStep(n); };
  const show = (n: number) => !ready || step === n;

  return (
    <div className="relative rounded-[30px] soft-raised p-[clamp(18px,2.4vw,28px)] text-ink">
      <LeadForm type="valuation" hidden={{ subject: 'Homepage valuation request' }}
        success={message => (
          <div role="status" className="py-10 text-center motion-safe:animate-[sh-fade-up_.5s_cubic-bezier(.16,1,.3,1)]">
            <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full soft-raised-sm text-gold"><Icon name="check" className="size-7" /></span>
            <h3 className="mb-1 text-xl">Thank you!</h3>
            <p className="text-muted">{message}</p>
          </div>
        )}>
        {ready && (
          <ol className="mb-6 flex gap-1.5 rounded-full soft-inset p-1.5">
            {STEPS.map((s, i) => {
              const done = i < step, on = i === step;
              return (
                <li key={s} className="flex-1">
                  <button type="button" disabled={!done} onClick={() => go(i)} aria-current={on ? 'step' : undefined}
                    className={`flex w-full items-center justify-center gap-2 rounded-full p-2.5 text-[0.88rem] font-bold transition-[box-shadow,color] duration-300 ${on ? 'soft-raised-sm text-forest' : done ? 'text-ink-2 hover:text-forest' : 'text-muted'}`}>
                    <span className={`grid size-[22px] shrink-0 place-items-center rounded-full text-[0.74rem] ${done ? 'bg-gold text-white' : 'soft-inset-sm'}`}>
                      {done ? <Icon name="check" className="size-3" /> : i + 1}
                    </span>
                    <span className="max-[420px]:sr-only">{s}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        <fieldset hidden={!show(0)} className="grid gap-5">
          <legend ref={step === 0 ? heading : undefined} tabIndex={-1} className="mb-1 text-[1.1rem] font-bold outline-none">Selling or letting?</legend>
          <div className="grid grid-cols-2 gap-1.5 rounded-full soft-inset p-1.5">
            {['Sell', 'Let'].map((v, i) => (
              <label key={v} className="cursor-pointer rounded-full py-2.5 text-center font-bold text-ink-2 transition-[box-shadow,color] duration-300 has-[:checked]:soft-raised-sm has-[:checked]:text-forest has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold">
                <input type="radio" name="d_intent" value={v} defaultChecked={i === 0} className="sr-only" />{v === 'Sell' ? 'Selling' : 'Letting'}
              </label>
            ))}
          </div>
          <SoftSelect variant="field" label="Community" labelClassName={label} name="d_community"
            options={[{ value: '', label: 'Not sure yet' }, ...[...communities, 'Other'].map(c => ({ value: c, label: c }))]} />
        </fieldset>

        <fieldset hidden={!show(1)} className={`grid gap-4 ${ready ? '' : 'mt-6'}`}>
          <legend ref={step === 1 ? heading : undefined} tabIndex={-1} className="mb-1 text-[1.1rem] font-bold outline-none">What type of property?</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TYPES.map(([t, icon], i) => (
              <label key={t} className={`group grid justify-items-center gap-2.5 rounded-[20px] px-2 py-4 text-[0.92rem] font-bold ${pick}`}>
                <input type="radio" name="d_propertyType" value={t} defaultChecked={i === 0} className="sr-only" />
                <span className="grid size-11 place-items-center rounded-full soft-raised-sm text-forest group-has-[:checked]:text-gold"><Icon name={icon} className="size-5" /></span>{t}
              </label>
            ))}
          </div>
          <p className="mt-1 font-bold">Bedrooms</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Bedrooms">
            {BEDS.map((b, i) => (
              <label key={b} className={`min-w-11 rounded-full px-4 py-2 text-center text-[0.9rem] font-bold ${pick}`}>
                <input type="radio" name="d_beds" value={b} defaultChecked={i === 2} className="sr-only" />{b}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset hidden={!show(2)} className={`grid gap-3 ${ready ? '' : 'mt-6'}`}>
          <legend ref={step === 2 ? heading : undefined} tabIndex={-1} className="mb-1 text-[1.1rem] font-bold outline-none">Where should we send it?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label htmlFor="v-name" className={label}>Full name<Req /></label><input id="v-name" name="name" required autoComplete="name" className={field} placeholder="Your name" /><FieldError name="name" /></div>
            <div><label htmlFor="v-phone" className={label}>Phone<Req /></label><input id="v-phone" name="phone" type="tel" required autoComplete="tel" className={field} placeholder="+971 50 000 0000" /><FieldError name="phone" /></div>
          </div>
          <div><label htmlFor="v-email" className={label}>Email</label><input id="v-email" name="email" type="email" autoComplete="email" className={field} placeholder="you@email.com" /><FieldError name="email" /></div>
          <Consent className="mt-1" />
        </fieldset>

        <div className="mt-6 flex gap-2.5">
          {ready && step > 0 && (
            <button type="button" onClick={() => go(step - 1)} className="rounded-full soft-raised-sm px-5 py-3.5 font-bold text-forest active:soft-pressed">Back</button>
          )}
          {ready && step < 2 ? (
            <button type="button" onClick={() => go(step + 1)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 font-bold text-white shadow-btn transition hover:brightness-110">
              Next: {STEPS[step + 1].toLowerCase()} <Icon name="arrow" className="size-4" />
            </button>
          ) : (
            <SubmitButton className="btn-sweep flex-1 rounded-full bg-forest px-6 py-3.5 font-bold text-white shadow-btn hover:text-deep">Get my free valuation</SubmitButton>
          )}
        </div>
      </LeadForm>
    </div>
  );
}
