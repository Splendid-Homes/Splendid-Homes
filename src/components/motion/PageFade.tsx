'use client';

import { useEffect, useState } from 'react';

let hydrated = false;

/**
 * Fades each new page in after a client-side navigation (upgrade 7).
 * The first, server-rendered view is never wrapped in the animation, so the LCP
 * content is not hidden. Reduced motion: `.page-in` only applies under `.motion-ok`.
 */
export function PageFade({ children }: { children: React.ReactNode }) {
  const [animate] = useState(() => hydrated);
  useEffect(() => { hydrated = true; }, []);
  return <div className={animate ? 'page-in' : undefined}>{children}</div>;
}
