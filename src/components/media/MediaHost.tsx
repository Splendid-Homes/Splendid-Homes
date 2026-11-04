'use client';

import dynamic from 'next/dynamic';
import { useMedia } from './mediaStore';

const MediaModal = dynamic(() => import('./MediaModal'), { ssr: false });

/** Mounted once in the layout; the player code loads only when a media button is used. */
export function MediaHost() {
  const media = useMedia();
  return media ? <MediaModal media={media} /> : null;
}
