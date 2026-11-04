/**
 * Turns a CMS media link into something the pop-up player can show: an embeddable iframe URL
 * (YouTube, Vimeo, Matterport, Kuula or any https viewer), a video file, an image or a PDF.
 * Pure function, safe on server and client.
 */
export type Embed = { as: 'iframe' | 'video' | 'image' | 'pdf'; src: string };

export function toEmbed(url: string): Embed | null {
  const raw = url.trim();
  if (!raw) return null;
  if (raw.startsWith('/')) return fileEmbed(raw);
  let u: URL;
  try { u = new URL(raw); } catch { return null; }
  if (u.protocol !== 'https:') return null;
  const host = u.hostname.replace(/^www\./, '').replace(/^m\./, '');
  if (host === 'youtu.be' || host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    const id = host === 'youtu.be' ? u.pathname.slice(1) : u.searchParams.get('v') ?? u.pathname.split('/').filter(Boolean).pop();
    return id && /^[\w-]{6,}$/.test(id) ? { as: 'iframe', src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1` } : null;
  }
  if (host.endsWith('vimeo.com')) {
    const id = u.pathname.split('/').filter(Boolean).find(s => /^\d+$/.test(s));
    return id ? { as: 'iframe', src: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1` } : null;
  }
  if (host.endsWith('matterport.com') && !u.searchParams.has('play')) u.searchParams.set('play', '1');
  return fileEmbed(u.toString()) ?? { as: 'iframe', src: u.toString() };
}

function fileEmbed(src: string): Embed | null {
  const path = src.split('?')[0].toLowerCase();
  if (/\.(mp4|webm|mov)$/.test(path)) return { as: 'video', src };
  if (/\.(png|jpe?g|webp|avif|svg|gif)$/.test(path)) return { as: 'image', src };
  if (path.endsWith('.pdf')) return { as: 'pdf', src };
  return src.startsWith('/') ? { as: 'image', src } : null;
}

/** Sample media shipped with the demo (replaced per property in the CMS). */
export const isSample = (src?: string) => Boolean(src?.startsWith('/samples/'));
