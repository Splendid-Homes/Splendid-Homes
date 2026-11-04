'use client';

import { Modal } from '@/components/ui/Modal';
import { isSample, toEmbed } from '@/lib/mediaEmbed';
import { closeMedia, type MediaState } from './mediaStore';

const TITLES = { video: 'Video', tour: '360° virtual tour', floor: 'Floor plan' } as const;

/** Full-screen player for a listing's video, 360° tour or floor plan (lazy loaded). */
export default function MediaModal({ media }: { media: MediaState }) {
  const embed = media ? toEmbed(media.src) : null;
  const label = media ? `${TITLES[media.kind]}: ${media.title}` : 'Media';
  return (
    <Modal open={Boolean(media)} onClose={closeMedia} label={label} variant="full">
      {media && (
        <div className="flex h-svh flex-col items-center justify-center gap-4 px-4 py-16 sm:px-10">
          <p className="max-w-[min(1100px,100%)] self-center text-center text-[0.95rem] font-semibold text-white/85">
            {TITLES[media.kind]} · {media.title}
            {isSample(media.src) && <span className="ml-2 rounded-full bg-gold px-2.5 py-0.5 align-middle text-[0.7rem] font-bold text-deep">Sample, for illustration</span>}
          </p>
          <div className={`relative w-full max-w-[1100px] overflow-hidden rounded-[18px] bg-black shadow-float ${media.kind === 'floor' && embed?.as === 'image' ? 'max-h-[78svh] bg-white' : 'aspect-video max-h-[78svh]'}`}>
            {!embed && <p className="grid h-full place-items-center p-10 text-center text-white/80">This link can&rsquo;t be shown here. Please check it in the CMS.</p>}
            {embed?.as === 'iframe' && (
              <iframe src={embed.src} title={label} className="absolute inset-0 size-full" loading="eager"
                allow="autoplay; fullscreen; picture-in-picture; xr-spatial-tracking; gyroscope; accelerometer" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
            )}
            {embed?.as === 'video' && <video src={embed.src} controls autoPlay playsInline className="absolute inset-0 size-full bg-black" />}
            {embed?.as === 'pdf' && <iframe src={embed.src} title={label} className="absolute inset-0 size-full bg-white" />}
            {embed?.as === 'image' && (
              // Floor plans are drawings (often SVG) shown at their natural size, so a plain img is right here.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={embed.src} alt={label} className="mx-auto max-h-[78svh] w-auto object-contain p-4" />
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
