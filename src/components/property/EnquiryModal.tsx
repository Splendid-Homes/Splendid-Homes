'use client';

import { EnquiryForm } from '@/components/property/EnquiryForm';
import { Modal } from '@/components/ui/Modal';
import type { EnquiryInfo } from './enquiryStore';

/** Enquiry dialog opened from a property card: the listing's enquiry form, saved as a property lead. */
export default function EnquiryModal({ info, onClose }: { info: EnquiryInfo | null; onClose: () => void }) {
  return (
    <Modal open={!!info} onClose={onClose} label="Enquire about this property">
      {info && (
        <div className="[&_h2]:pr-12">
          <span className="eyebrow mb-2">Ref {info.ref} · {info.agentName}</span>
          {/* key: a fresh form (and success state) for every listing */}
          <EnquiryForm key={info.propertyId} propertyId={info.propertyId} propertyRef={`${info.title} (ref ${info.ref})`}
            title={`Enquire about ${info.title}`} cta="Send enquiry" />
        </div>
      )}
    </Modal>
  );
}
