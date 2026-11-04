/** Market statistics provenance now lives in the CMS settings (site.market). Shared formatting here. */

export const LISTINGS_SOURCE = { source: 'Splendid Homes live listings', updated: null } as const;

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
