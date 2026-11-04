'use client';

import { SoftSelect } from '@/components/ui/SoftSelect';
import { useId, useState } from 'react';
import { Icon } from '@/components/icons';
import { Consent, FieldError, LeadForm, Req, SubmitButton } from './LeadForm';

const field = 'w-full rounded-field border-0 soft-inset px-[0.95em] py-[0.75em] text-base text-ink outline-none transition-shadow focus:outline-solid focus:outline-2 focus:outline-gold/60 lg:text-[0.95rem]';
const label = 'mb-1.5 block text-[0.78rem] font-semibold tracking-[0.04em] text-muted';
const primary = 'inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3 font-bold text-white shadow-btn transition hover:brightness-110';

type Field = 'name' | 'phone' | 'email' | 'message';

/** Compact lead form: a configurable subset of contact fields plus optional extra inputs. */
export function CompactLeadForm({ type, title, subject, hidden, cta, fields = ['name', 'phone', 'email'], messagePlaceholder, extra, encType, consent = true }: {
  type: string; title?: string; subject?: string; hidden?: Record<string, string | number | undefined>; cta: string;
  fields?: Field[]; messagePlaceholder?: string; extra?: React.ReactNode; encType?: 'multipart/form-data'; consent?: boolean;
}) {
  const uid = useId();
  const input = (f: Field) => {
    const id = `${uid}-${f}`;
    if (f === 'message') return (
      <div key={f}><label htmlFor={id} className={label}>Message</label>
        <textarea id={id} name="message" rows={3} className={`${field} resize-y`} placeholder={messagePlaceholder} /></div>
    );
    const meta = { name: ['Full name', 'text', 'name'], phone: ['Phone', 'tel', 'tel'], email: ['Email', 'email', 'email'] }[f];
    const req = f !== 'email'; // name and phone are the only required fields
    return (
      <div key={f}><label htmlFor={id} className={label}>{meta[0]}{req && <Req />}</label>
        <input id={id} name={f} type={meta[1]} required={req} autoComplete={meta[2]} className={field} placeholder={f === 'phone' ? '+971 50 000 0000' : undefined} />
        <FieldError name={f} /></div>
    );
  };
  return (
    <LeadForm type={type} hidden={{ subject, ...hidden }} encType={encType} className="flex flex-col gap-3">
      {title && <h3 className="text-[1.1rem]">{title}</h3>}
      <div className="grid gap-3 sm:grid-cols-2">{fields.filter(f => f !== 'message').map(input)}</div>
      {extra}
      {fields.includes('message') && input('message')}
      {consent && <Consent />}
      <SubmitButton className={primary}>{cta}</SubmitButton>
    </LeadForm>
  );
}

/** F14: "Talk to a specialist" opens a request form, saved as a service lead with the service name. */
export function ServiceRequest({ service, label = 'Talk to a specialist', title, cta = 'Request a call', hint = 'What would you like help with?' }: {
  service: string; label?: string; title?: string; cta?: string; hint?: string;
}) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} aria-expanded={false} className={primary}>
        {label}
      </button>
    );
  }
  return (
    <div className="w-full rounded-[26px] soft-raised p-5">
      <CompactLeadForm type="service" subject={service} hidden={{ d_service: service }} title={title ?? `Talk to a ${service.toLowerCase()} specialist`}
        cta={cta} fields={['name', 'phone', 'email', 'message']} messagePlaceholder={hint} />
    </div>
  );
}

/** F20: "Get pre-approved" request under the mortgage calculator. */
export function MortgageRequest({ cta = 'Get pre-approved in 48h', buyers = ['UAE resident expat', 'UAE national', 'Non-resident'], budgetLabel = 'Property budget (AED)', budgetHint = 'e.g. 3,000,000' }: {
  cta?: string; buyers?: string[]; budgetLabel?: string; budgetHint?: string;
}) {
  const uid = useId();
  return (
    <CompactLeadForm type="mortgage" subject="Mortgage pre-approval" cta={cta}
      extra={
        <div className="grid gap-3 sm:grid-cols-2">
          <SoftSelect variant="field" label="Buyer type" labelClassName={label} name="d_residency" defaultValue={buyers[0]}
            options={buyers.map(r => ({ value: r, label: r }))} />
          <div><label htmlFor={`${uid}-price`} className={label}>{budgetLabel}</label>
            <input id={`${uid}-price`} name="d_price" inputMode="numeric" className={field} placeholder={budgetHint} /></div>
        </div>
      } />
  );
}

/** F24: brochure request on project pages (the PDF is emailed when one is uploaded in the CMS). */
export function BrochureRequest({ projectId, projectName, title = 'Get the brochure', cta = 'Send me the brochure' }: { projectId: string; projectName: string; title?: string; cta?: string }) {
  return (
    <CompactLeadForm type="brochure" hidden={{ projectId }} subject={projectName} title={title} cta={cta} fields={['name', 'phone', 'email']} />
  );
}

/** F02: create a property alert from the current search (empty results state). */
export function AlertRequest({ purpose, criteria, className = 'mx-auto mt-6 max-w-[460px]' }: { purpose: string; criteria: string; className?: string }) {
  const uid = useId();
  return (
    <LeadForm type="alert" hidden={{ d_purpose: purpose, d_criteria: criteria, subject: `Alert: ${criteria || purpose}` }}
      className={`flex flex-col gap-2 text-left ${className}`}>
      <label htmlFor={`${uid}-email`} className={label}>Email me new matches</label>
      <div className="flex gap-2">
        <input id={`${uid}-email`} name="email" type="email" required autoComplete="email" placeholder="you@email.com" className={`${field} flex-1`} />
        <SubmitButton className="rounded-full bg-forest px-5 font-bold text-white">Create alert</SubmitButton>
      </div>
      <FieldError name="email" />
    </LeadForm>
  );
}

/** F17: job application with CV upload, saved as a career-application lead (CV stored privately). */
export function ApplyForm({ jobId, title, text: T = { cta: 'Apply now', title: `Apply: ${title}`, send: 'Send application', hint: 'A few lines about you (optional)', cv: 'CV (PDF or Word, up to 5 MB)' } }: {
  jobId: string; title: string; text?: { cta: string; title: string; send: string; hint: string; cv: string };
}) {
  const [open, setOpen] = useState(false);
  const uid = useId();
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={primary}>
        <Icon name="doc" /> {T.cta}
      </button>
    );
  }
  return (
    <div className="mt-4 w-full rounded-card soft-inset bg-mist/60 p-5">
      <CompactLeadForm type="career" hidden={{ jobId }} subject={title} title={T.title} cta={T.send} encType="multipart/form-data"
        fields={['name', 'phone', 'email', 'message']} messagePlaceholder={T.hint}
        extra={
          <div>
            <label htmlFor={`${uid}-cv`} className={label}>{T.cv}</label>
            <input id={`${uid}-cv`} name="cv" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="block w-full text-[0.9rem] file:mr-3 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:font-bold file:text-white" />
            <FieldError name="cv" />
          </div>
        } />
    </div>
  );
}
