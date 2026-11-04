'use client';

import { SoftSelect } from '@/components/ui/SoftSelect';
import { useRef, useState } from 'react';
import { Consent, FieldError, LeadForm, Req, SubmitButton } from './LeadForm';
import { Icon } from '@/components/icons';
import { TYPES } from '@/lib/listings';
import type { SellText } from '@/payload/sellDefaults';

const field = 'w-full rounded-field border-0 soft-inset px-[0.95em] py-[0.8em] text-base text-ink outline-none transition-shadow focus:outline-solid focus:outline-2 focus:outline-gold/60 lg:text-[0.95rem]';
const label = 'mb-1.5 block text-[0.78rem] font-semibold tracking-[0.04em] text-muted';

/**
 * Three-step valuation request (F19). Each step validates before moving on; focus moves to
 * the new step's heading for keyboard and screen-reader users. Saved as a valuation lead.
 */
export function SellForm({ communities, text: T, intents }: { communities: string[]; text: SellText; intents: string[] }) {
  const STEPS = [T.step1, T.step2, T.step3];
  const [step, setStep] = useState(0);
  const form = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  const go = (to: number) => {
    if (to > step) {
      const invalid = form.current?.querySelector<HTMLInputElement>(`[data-step="${step}"] :invalid`);
      if (invalid) { invalid.reportValidity(); return; }
    }
    setStep(to);
    requestAnimationFrame(() => heading.current?.focus());
  };

  const btn = 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-bold transition';
  return (
    <div ref={form} className="rounded-[28px] soft-raised p-[clamp(22px,3vw,32px)]">
      <LeadForm type="valuation" hidden={{ subject: 'Sell / let valuation request' }}
        success={message => (
          <div role="status" className="p-2 text-center">
            <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full soft-raised-sm text-gold"><Icon name="check" className="size-7" /></span>
            <h2 className="mb-1 text-xl">{T.successTitle}</h2>
            <p className="text-muted">{message}</p>
          </div>
        )}>
      <ol className="mb-6 grid grid-cols-3 gap-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? 'step' : undefined} className="text-[0.78rem] font-bold">
            <span className={`mb-2 block h-1 rounded-full transition-colors duration-500 ${i <= step ? 'bg-forest' : 'bg-line'}`} />
            <span className={i <= step ? 'text-forest' : 'text-muted'}>{i + 1}. {s}</span>
          </li>
        ))}
      </ol>

      <fieldset data-step="0" hidden={step !== 0} className="flex flex-col gap-3">
        <legend className="sr-only">{T.step1}</legend>
        <h2 ref={step === 0 ? heading : undefined} tabIndex={-1} className="mb-1 text-[1.3rem] outline-none">{T.step1Title}</h2>
        <SoftSelect variant="field" label={T.intentLabel} labelClassName={label} name="d_intent" defaultValue={intents[0]}
          options={intents.map(v => ({ value: v, label: v }))} />
        <SoftSelect variant="field" label={T.communityLabel} labelClassName={label} name="d_community"
          options={[{ value: '', label: T.communityPlaceholder, disabled: true }, ...[...communities, 'Other'].map(c => ({ value: c, label: c }))]} />
        <div><label htmlFor="s-bld" className={label}>{T.buildingLabel}</label><input id="s-bld" name="d_building" className={field} placeholder={T.buildingHint} /></div>
        <button type="button" onClick={() => go(1)} className={`${btn} mt-2 bg-forest text-white shadow-btn hover:brightness-110`}>{T.continueCta} <Icon name="arrow" /></button>
      </fieldset>

      <fieldset data-step="1" hidden={step !== 1} className="flex flex-col gap-3">
        <legend className="sr-only">{T.step2}</legend>
        <h2 ref={step === 1 ? heading : undefined} tabIndex={-1} className="mb-1 text-[1.3rem] outline-none">{T.step2Title}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <SoftSelect variant="field" label={T.typeLabel} labelClassName={label} name="d_propertyType" defaultValue="Apartment"
            options={TYPES.map(t => ({ value: t, label: t }))} />
          <SoftSelect variant="field" label={T.bedsLabel} labelClassName={label} name="d_beds" defaultValue="2" columns={4} align="right"
            options={['Studio', '1', '2', '3', '4', '5', '6+'].map(b => ({ value: b, label: b }))} />
          <div><label htmlFor="s-size" className={label}>{T.sizeLabel}</label><input id="s-size" name="d_size" type="number" inputMode="numeric" min={100} className={field} placeholder="1,200" /></div>
          <div><label htmlFor="s-price" className={label}>{T.priceLabel}</label><input id="s-price" name="d_expectedPrice" type="number" inputMode="numeric" min={0} className={field} placeholder={T.priceHint} /></div>
        </div>
        <div className="mt-2 flex gap-2.5">
          <button type="button" onClick={() => go(0)} className={`${btn} soft-raised-sm text-forest active:soft-pressed`}>{T.backCta}</button>
          <button type="button" onClick={() => go(2)} className={`${btn} flex-1 bg-forest text-white shadow-btn hover:brightness-110`}>{T.continueCta} <Icon name="arrow" /></button>
        </div>
      </fieldset>

      <fieldset data-step="2" hidden={step !== 2} className="flex flex-col gap-3">
        <legend className="sr-only">{T.step3}</legend>
        <h2 ref={step === 2 ? heading : undefined} tabIndex={-1} className="mb-1 text-[1.3rem] outline-none">{T.step3Title}</h2>
        <div><label htmlFor="s-name" className={label}>Full name<Req /></label><input id="s-name" name="name" required autoComplete="name" className={field} /><FieldError name="name" /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label htmlFor="s-phone" className={label}>Phone<Req /></label><input id="s-phone" name="phone" type="tel" required autoComplete="tel" className={field} placeholder="+971 50 000 0000" /><FieldError name="phone" /></div>
          <div><label htmlFor="s-email" className={label}>Email</label><input id="s-email" name="email" type="email" autoComplete="email" className={field} /><FieldError name="email" /></div>
        </div>
        <Consent />
        <div className="mt-2 flex gap-2.5">
          <button type="button" onClick={() => go(1)} className={`${btn} soft-raised-sm text-forest active:soft-pressed`}>{T.backCta}</button>
          <SubmitButton className={`${btn} flex-1 bg-forest text-white shadow-btn hover:brightness-110`}>{T.submitCta}</SubmitButton>
        </div>
      </fieldset>
      </LeadForm>
    </div>
  );
}
