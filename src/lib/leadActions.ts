'use server';

import config from '@payload-config';
import { after } from 'next/server';
import { getPayload, type Where } from 'payload';
import { LEAD_TYPES, type LeadType } from '@/payload/collections/system';
import { isLeadSource, type LeadSource } from '@/payload/leadSources';
import { deliverLead, sendBrochure } from '@/payload/leads/deliver';

export type LeadState = { ok: boolean; message: string; fieldErrors?: Record<string, string> } | null;

/** Extra details accepted per lead type (anything else in the form is ignored). */
const DETAIL_KEYS: Partial<Record<LeadType, string[]>> = {
  viewing: ['day', 'time'],
  valuation: ['intent', 'community', 'building', 'propertyType', 'beds', 'size', 'expectedPrice'],
  mortgage: ['price', 'deposit', 'residency', 'term'],
  alert: ['purpose', 'criteria'],
  newsletter: ['topics'],
  contact: ['interest'],
  interest: ['unitType', 'budget'],
  service: ['service'],
};

const SUCCESS: Record<LeadType, string> = {
  property: 'Thank you. The agent will contact you shortly; we usually reply within 15 minutes in office hours.',
  viewing: 'Viewing requested. The agent will call you to confirm the time.',
  callback: 'Thank you. We will call you back shortly.',
  service: 'Thank you. A specialist will contact you shortly.',
  valuation: 'Valuation requested. A specialist will send it within 24 hours.',
  interest: 'You are registered. Our off-plan desk will send the price list and availability.',
  brochure: 'Thank you. The brochure is on its way to your inbox.',
  mortgage: 'Thank you. Our mortgage advisor will contact you about pre-approval.',
  alert: 'Alert created. We will email you when matching properties are listed.',
  newsletter: "Thank you, you're subscribed.",
  career: 'Application received. Our team will be in touch if your profile matches.',
  contact: 'Message sent. We usually reply within 15 minutes during office hours.',
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+()\d\s-]{7,20}$/;
const MAX_CV = 5 * 1024 * 1024;
const CV_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const str = (v: FormDataEntryValue | null, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const id = (v: FormDataEntryValue | null) => { const n = Number(v); return Number.isInteger(n) && n > 0 ? n : undefined; };

/**
 * Single entry point for every website form (F22–F24, F17, F19, F20, newsletter, alerts).
 * Validates against an allow-list, drops spam quietly (honeypot), stores the lead through
 * Payload with system access, and notifies the team after the response is sent.
 */
export async function submitLead(_prev: LeadState, form: FormData): Promise<LeadState> {
  // Honeypot: real visitors never see or fill this field.
  if (str(form.get('company_website'))) return { ok: true, message: SUCCESS.contact };

  const type = str(form.get('type')) as LeadType;
  if (!LEAD_TYPES.some(t => t.value === type)) return { ok: false, message: 'Something went wrong. Please refresh the page and try again.' };

  const name = str(form.get('name'), 120);
  const email = str(form.get('email'), 160).toLowerCase();
  const phone = str(form.get('phone'), 40);
  const message = str(form.get('message'), 3000);
  const consent = form.get('consent') === 'on' || type === 'newsletter' || type === 'alert';

  const fieldErrors: Record<string, string> = {};
  if (type !== 'newsletter' && type !== 'alert' && name.length < 2) fieldErrors.name = 'Please enter your name.';
  // Name and phone are required everywhere except the email-only forms (newsletter, alerts); email is optional elsewhere.
  if (!EMAIL.test(email) && (email || ['newsletter', 'alert'].includes(type))) fieldErrors.email = 'Please enter a valid email address.';
  if (!['newsletter', 'alert'].includes(type) && !PHONE.test(phone)) fieldErrors.phone = 'Please enter a valid phone number.';
  if (!consent) fieldErrors.consent = 'Please accept the privacy policy.';

  const cv = form.get('cv');
  const cvFile = cv instanceof File && cv.size > 0 ? cv : null;
  if (type === 'career') {
    if (!cvFile) { /* CV is optional */ }
    else if (cvFile.size > MAX_CV) fieldErrors.cv = 'Your CV must be 5 MB or smaller.';
    else if (!CV_TYPES.includes(cvFile.type)) fieldErrors.cv = 'Please upload a PDF or Word document.';
  }
  if (Object.keys(fieldErrors).length) return { ok: false, message: 'Please check the highlighted fields.', fieldErrors };

  const payload = await getPayload({ config });

  // Light rate limit: at most 5 submissions per email address or phone number in 10 minutes.
  const who: Where[] = [];
  if (email) who.push({ email: { equals: email } });
  if (phone) who.push({ phone: { equals: phone } });
  if (who.length) {
    const recent = await payload.count({
      collection: 'leads', overrideAccess: true,
      where: { and: [{ or: who }, { createdAt: { greater_than: new Date(Date.now() - 10 * 60e3).toISOString() } }] },
    });
    if (recent.totalDocs >= 5) return { ok: false, message: 'We have received several requests from you. Our team will be in touch shortly.' };
  }

  // Related records are looked up server-side; the browser only sends IDs.
  const propertyId = id(form.get('propertyId')), projectId = id(form.get('projectId')), jobId = id(form.get('jobId'));
  const [property, project, job] = await Promise.all([
    propertyId ? payload.findByID({ collection: 'properties', id: propertyId, depth: 0, overrideAccess: true, disableErrors: true }) : null,
    projectId ? payload.findByID({ collection: 'projects', id: projectId, depth: 0, overrideAccess: true, disableErrors: true }) : null,
    jobId ? payload.findByID({ collection: 'careers', id: jobId, depth: 0, overrideAccess: true, disableErrors: true }) : null,
  ]);
  const details = Object.fromEntries((DETAIL_KEYS[type] ?? []).map(k => [k, str(form.get(`d_${k}`), 300)]).filter(([, v]) => v));
  const subject = property ? `${property.ref} · ${property.title}` : project ? project.name : job ? job.title : str(form.get('subject'), 160) || undefined;
  const sourcePage = str(form.get('sourcePage'), 300);

  let cvId: number | undefined;
  if (type === 'career' && cvFile) {
    try {
      const doc = await payload.create({
        collection: 'resumes', overrideAccess: true, data: { applicant: name },
        file: { data: Buffer.from(await cvFile.arrayBuffer()), mimetype: cvFile.type, name: cvFile.name.replace(/[^\w.-]+/g, '_'), size: cvFile.size },
      });
      cvId = doc.id;
    } catch {
      // Payload validates the real file content (e.g. a corrupt or disguised PDF is rejected).
      return { ok: false, message: 'Please check the highlighted fields.', fieldErrors: { cv: 'We could not read this file. Please upload a valid PDF or Word document.' } };
    }
  }

  let lead;
  try {
    lead = await payload.create({
    collection: 'leads',
    overrideAccess: true,
    data: {
      type, name: name || email, email: email || undefined, phone: phone || undefined, message: message || undefined, subject,
      details: Object.keys(details).length ? details : undefined,
      property: property?.id, project: project?.id, job: job?.id, cv: cvId,
      assignedAgent: property && typeof property.agent === 'number' ? property.agent : undefined,
      sourcePage: sourcePage.startsWith('/') ? sourcePage : undefined,
      source: isLeadSource(form.get('leadSource')) ? (form.get('leadSource') as LeadSource) : 'direct',
      consentAt: new Date().toISOString(), status: 'new',
    },
    });
  } catch (err) {
    payload.logger.error({ err, type }, 'Could not save lead');
    return { ok: false, message: 'Sorry, we could not send your request just now. Please try again, or call or WhatsApp us.' };
  }
  const leadId = lead.id;

  after(async () => {
    try {
      await deliverLead(payload, leadId);
      if (type === 'brochure' && project?.brochure && email) {
        const media = typeof project.brochure === 'object' ? project.brochure : await payload.findByID({ collection: 'media', id: project.brochure, overrideAccess: true });
        if (media?.url) await sendBrochure(payload, email, project.name, media.url);
      }
    } catch (err) {
      payload.logger.error({ err, leadId }, 'Lead delivery failed');
    }
  });

  // No PDF to email, or no email given (it is optional): the off-plan desk sends it by hand.
  const brochureByHand = type === 'brochure' && (!project?.brochure || !email);
  return { ok: true, message: brochureByHand ? 'Thank you. Our off-plan desk will send you the brochure shortly.' : SUCCESS[type] };
}
