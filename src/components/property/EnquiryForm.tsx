'use client';

import { SoftSelect } from '@/components/ui/SoftSelect';
import { useId } from 'react';
import { Consent, FieldError, LeadForm, Req, SubmitButton } from '@/components/forms/LeadForm';

const field = 'w-full rounded-field border-0 soft-inset px-[0.95em] py-[0.75em] text-ink outline-none transition-shadow focus:outline-solid focus:outline-2 focus:outline-gold/60 aria-[invalid=true]:outline-solid aria-[invalid=true]:outline-2 aria-[invalid=true]:outline-[#B42318]';
const label = 'mb-1.5 block text-[0.78rem] font-semibold tracking-[0.04em] text-muted';

const INTERESTS = ['Buying', 'Renting', 'Selling', 'Off-plan investment', 'Property management', 'Mortgage', 'Other'];

/**
 * Enquiry form used for listings (F22), project interest (F24), contact (F18), commercial
 * requirements and article call-backs. Saved as a lead of `type`, linked to the listing or project.
 */
export function EnquiryForm({ propertyRef, title = 'Enquire about this property', cta = 'Send enquiry', message, type = 'property', propertyId, projectId, subject, withInterest, interests = INTERESTS, interestLabel = "I'm interested in" }: {
  propertyRef: string; title?: string; cta?: string; message?: string;
  type?: 'property' | 'interest' | 'contact' | 'callback' | 'service'; propertyId?: string; projectId?: string; subject?: string; withInterest?: boolean;
  interests?: string[]; interestLabel?: string;
}) {
  const uid = useId();
  return (
    <LeadForm type={type} hidden={{ propertyId, projectId, subject }} className="flex flex-col gap-3">
      <h2 className="text-[1.1rem]">{title}</h2>
      <div><label htmlFor={`${uid}-name`} className={label}>Full name<Req /></label><input id={`${uid}-name`} name="name" required autoComplete="name" className={field} /><FieldError name="name" /></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <div><label htmlFor={`${uid}-phone`} className={label}>Phone<Req /></label><input id={`${uid}-phone`} name="phone" type="tel" required autoComplete="tel" className={field} placeholder="+971 50 000 0000" /><FieldError name="phone" /></div>
        <div><label htmlFor={`${uid}-email`} className={label}>Email</label><input id={`${uid}-email`} name="email" type="email" autoComplete="email" className={field} /><FieldError name="email" /></div>
      </div>
      {withInterest && (
        <SoftSelect variant="field" label={interestLabel} labelClassName={label} name="d_interest" defaultValue={interests[0]}
          options={interests.map(i => ({ value: i, label: i }))} />
      )}
      <div><label htmlFor={`${uid}-msg`} className={label}>Message</label>
        <textarea id={`${uid}-msg`} name="message" rows={3} className={`${field} resize-y`} defaultValue={message ?? `I'm interested in ${propertyRef}. Please send me more details.`} /></div>
      <Consent />
      <SubmitButton className="rounded-full soft-raised px-6 py-3 font-bold text-forest transition-[color,background-color,box-shadow] hover:bg-forest hover:text-white active:soft-pressed">{cta}</SubmitButton>
    </LeadForm>
  );
}
