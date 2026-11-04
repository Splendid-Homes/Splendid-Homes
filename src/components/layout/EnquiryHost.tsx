'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useScrollLock } from '@/components/motion/useScrollLock';
import { closeEnquiry, useEnquiry } from '@/components/property/enquiryStore';

const EnquiryModal = dynamic(() => import('@/components/property/EnquiryModal'), { ssr: false });

/** Mounts the property-card enquiry dialog once per page; its code loads on first use. */
export function EnquiryHost() {
  const info = useEnquiry();
  const [used, setUsed] = useState(false);
  if (info && !used) setUsed(true);
  useScrollLock(!!info);
  return used ? <EnquiryModal info={info} onClose={closeEnquiry} /> : null;
}
