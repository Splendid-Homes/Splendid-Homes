import { NewsletterForm } from '@/components/layout/NewsletterForm';

/** "Get the quarterly market report" box (wording from CMS > Insights pages). */
export function InsightsNewsletter({ title, text, id, className = 'mt-[clamp(40px,6vw,72px)]' }: { title: string; text: string; id: string; className?: string }) {
  return (
    <div className={`${className} grid grid-cols-1 items-center gap-6 rounded-[28px] soft-raised px-[clamp(24px,4vw,48px)] py-[clamp(24px,4vw,40px)] lg:grid-cols-[1fr_auto]`}>
      <div>
        <h2 className="mb-1 text-[1.4rem]">{title}</h2>
        <p className="text-ink-2">{text}</p>
      </div>
      <div className="w-full min-w-0 lg:w-[380px]"><NewsletterForm tone="light" id={id} /></div>
    </div>
  );
}
