'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useScrollLock } from '@/components/motion/useScrollLock';
import { closeModal, useModal } from './modalStore';
import type { ViewingInfo } from './ViewingModal';

const ViewingModal = dynamic(() => import('./ViewingModal'), { ssr: false });
const GalleryModal = dynamic(() => import('./GalleryModal'), { ssr: false });

/**
 * Mounts the property page dialogs. Each dialog's code (and Motion) is fetched on first
 * use; Lenis and page scroll are stopped while one is open.
 */
export function PropertyModals({ info, images }: { info: ViewingInfo; images: string[] }) {
  const modal = useModal();
  const [used, setUsed] = useState({ viewing: false, gallery: false });
  if (modal && !used[modal.kind]) setUsed({ ...used, [modal.kind]: true });
  useScrollLock(!!modal);

  return (
    <>
      {used.viewing && <ViewingModal open={modal?.kind === 'viewing'} onClose={closeModal} info={info} />}
      {used.gallery && (
        <GalleryModal open={modal?.kind === 'gallery'} start={modal?.kind === 'gallery' ? modal.index : 0}
          onClose={closeModal} images={images} title={info.title} />
      )}
    </>
  );
}
