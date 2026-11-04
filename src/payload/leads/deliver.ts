import type { Payload } from 'payload';
import { SITE_URL } from '@/lib/site';
import { LEAD_TYPES } from '../collections/system';
import { appendLeadRow, sheetsConfigured } from './sheets';

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);
const typeLabel = (t: string) => LEAD_TYPES.find(x => x.value === t)?.label ?? t;

/**
 * F26 + F27: notify the team about a new lead (email within a minute) and copy it to Google
 * Sheets. Runs after the visitor's response (next/server `after`). Outcomes are recorded on the
 * lead ("Delivery checks", Document 5), so a failed email is visible in the inbox.
 */
export async function deliverLead(payload: Payload, id: number | string) {
  const lead = await payload.findByID({ collection: 'leads', id, depth: 1, overrideAccess: true });
  const settings = await payload.findGlobal({ slug: 'settings', overrideAccess: true });
  const agent = lead.assignedAgent && typeof lead.assignedAgent === 'object' ? lead.assignedAgent : null;
  const label = typeLabel(lead.type);
  const adminUrl = `${SITE_URL}/admin/collections/leads/${lead.id}`;
  const delivery: { emailSent?: boolean; emailError?: string; sheetsSent?: boolean; sheetsError?: string } = {};

  // Email: office addresses from settings, plus the assigned agent.
  const to = [...new Set([...(settings.leadEmails ?? []), ...(agent?.email ? [agent.email] : [])])].filter(Boolean);
  if (!process.env.RESEND_API_KEY) {
    // Without a provider Payload only logs the email; report that honestly on the lead.
    delivery.emailError = 'Email not configured yet (RESEND_API_KEY missing); alert written to the server log only';
  } else if (to.length) {
    const rows: [string, unknown][] = [
      ['Type', label], ['Name', lead.name], ['Phone', lead.phone], ['Email', lead.email], ['About', lead.subject],
      ['Message', lead.message], ['Assigned agent', agent?.name], ['Page', lead.sourcePage],
      ...Object.entries((lead.details as Record<string, unknown>) ?? {}).map(([k, v]) => [k, v] as [string, unknown]),
    ];
    const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#12261a">
      <h2 style="color:#1E4D34;margin:0 0 12px">New ${esc(label.toLowerCase())}</h2>
      <table cellpadding="6" style="border-collapse:collapse">${rows.filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `<tr><td style="color:#62726a;vertical-align:top">${esc(k)}</td><td><b>${esc(v)}</b></td></tr>`).join('')}</table>
      <p><a href="${adminUrl}" style="background:#1E4D34;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none">Open lead in dashboard</a></p></div>`;
    try {
      await payload.sendEmail({ to, subject: `New ${label.toLowerCase()}: ${lead.name}${lead.subject ? ` (${lead.subject})` : ''}`, html, replyTo: lead.email ?? undefined });
      delivery.emailSent = true;
    } catch (err) {
      delivery.emailError = String((err as Error).message ?? err).slice(0, 200);
    }
  } else {
    delivery.emailError = 'No recipients set in Site settings → Lead alerts';
  }

  // Google Sheets row (F27)
  if (settings.sheetsEnabled && sheetsConfigured()) {
    try {
      await appendLeadRow([
        new Date(lead.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Dubai' }), label, lead.name, lead.phone ?? '', lead.email ?? '',
        lead.subject ?? '', lead.sourcePage ?? '', agent?.name ?? '',
      ]);
      delivery.sheetsSent = true;
    } catch (err) {
      delivery.sheetsError = String((err as Error).message ?? err).slice(0, 200);
    }
  }

  await payload.update({ collection: 'leads', id: lead.id, data: { delivery }, overrideAccess: true });
}

/** F24: email the brochure link to the visitor who asked for it. */
export async function sendBrochure(payload: Payload, to: string, projectName: string, url: string) {
  const link = url.startsWith('http') ? url : `${SITE_URL}${url}`;
  await payload.sendEmail({
    to,
    subject: `${projectName} brochure`,
    html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#12261a"><p>Thank you for your interest in ${esc(projectName)}.</p>
      <p><a href="${esc(link)}" style="background:#1E4D34;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none">Download the brochure</a></p>
      <p>Our off-plan desk will follow up with the latest price list and availability.</p></div>`,
  });
}
