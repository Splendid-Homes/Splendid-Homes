import { LogoMark } from '@/components/brand/Logo';

/**
 * Brand curtain that lifts off the first page view of a session (upgrade 7).
 * Server-rendered but `display: none` unless the inline head script set `html.intro`
 * (motion allowed + first view this session), so repeat views never flash it.
 * Pure CSS (globals.css); its content is kept small so it never becomes the LCP element.
 */
export function IntroCurtain() {
  return (
    <div className="intro-curtain" aria-hidden="true">
      <LogoMark size={56} className="text-white" />
      <span className="text-[0.78rem] font-bold uppercase tracking-[0.42em] text-[#D5E7DA]">Splendid Homes</span>
    </div>
  );
}
