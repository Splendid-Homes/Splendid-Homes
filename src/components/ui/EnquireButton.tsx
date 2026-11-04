'use client';

import { Icon } from '@/components/icons';
import { openEnquiry, type EnquiryInfo } from '@/components/property/enquiryStore';

/** "Enquire" on a property card: opens the site-wide enquiry dialog for this listing. */
export function EnquireButton({ info, className = '' }: { info: EnquiryInfo; className?: string }) {
  return (
    <button type="button" onClick={() => openEnquiry(info)} aria-haspopup="dialog" aria-label={`Enquire about ${info.title}`}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full soft-raised-sm px-3 py-1.5 text-[0.74rem] font-bold text-forest transition-[box-shadow,color,background-color] hover:bg-forest hover:text-white active:soft-pressed ${className}`}>
      <Icon name="mail" className="size-3.5" />Enquire
    </button>
  );
}
