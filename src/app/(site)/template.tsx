import { PageFade } from '@/components/motion/PageFade';

/** Remounts on navigation between top-level sections, giving each new page a soft fade-in. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageFade>{children}</PageFade>;
}
