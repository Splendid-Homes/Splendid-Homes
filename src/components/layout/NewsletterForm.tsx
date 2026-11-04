'use client';

import { useEffect, useState } from 'react';
import { FieldError, LeadForm, SubmitButton } from '@/components/forms/LeadForm';
import { Icon } from '@/components/icons';

const HINTS = ['new launches', 'price drops', 'Golden Visa news', 'market data'];
const TOPICS = ['New launches', 'Price drops', 'Market data', 'Golden Visa'];

/** Placeholder that types out what subscribers get ("Your email for …"); static with reduced motion. */
function useTypingHint() {
  const [text, setText] = useState('Your email');
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let hint = 0, len = 0, deleting = false, t = 0;
    const tick = () => {
      const full = `Your email for ${HINTS[hint]}`;
      len += deleting ? -1 : 1;
      setText(full.slice(0, Math.max(15, len)));
      if (!deleting && len >= full.length) { deleting = true; t = window.setTimeout(tick, 1800); return; }
      if (deleting && len <= 15) { deleting = false; hint = (hint + 1) % HINTS.length; }
      t = window.setTimeout(tick, deleting ? 28 : 55);
    };
    len = 15;
    t = window.setTimeout(tick, 1200);
    return () => window.clearTimeout(t);
  }, []);
  return text;
}

/** Gold particles bursting from the tick when the sign-up succeeds. */
function Burst() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 motion-reduce:hidden">
      {Array.from({ length: 12 }, (_, n) => {
        const a = (n / 12) * Math.PI * 2;
        return (
          <i key={n} className="absolute left-1/2 top-1/2 size-1.5 rounded-full bg-gold animate-[sh-burst_0.8s_cubic-bezier(.16,1,.3,1)_both]"
            style={{ '--bx': `${Math.cos(a) * 34}px`, '--by': `${Math.sin(a) * 34}px` } as React.CSSProperties} />
        );
      })}
    </span>
  );
}

/** Newsletter sign-up (footer = dark, insights = light), saved as a newsletter lead (F16/F24). */
export function NewsletterForm({ tone = 'dark', id = 'nl-email' }: { tone?: 'dark' | 'light'; id?: string }) {
  const light = tone === 'light';
  const hint = useTypingHint();
  // Footer only: subscribers pick what they want; sent as the lead's "topics" detail.
  const [topics, setTopics] = useState(TOPICS.slice(0, 2));
  const flip = (t: string) => setTopics(on => on.includes(t) ? on.filter(x => x !== t) : [...on, t]);
  return (
    <LeadForm type="newsletter"
      success={() => (
        <div role="status" className={`mt-3 flex items-center gap-3 rounded-[18px] p-3 ${light ? 'bg-mint/60 text-forest' : 'bg-white/8 text-white'}`}>
          <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-gold text-deep motion-safe:animate-[sh-pop_0.5s_cubic-bezier(.16,1,.3,1)_both]">
            <Icon name="check" className="size-5" /><Burst />
          </span>
          <span className="text-[0.88rem]"><b className="block">You&rsquo;re in!</b><span className={light ? 'text-ink-2' : 'text-deep-text'}>Watch your inbox for the next launch.</span></span>
        </div>
      )}>
      {!light && (
        <>
          <p className="text-[0.95rem] font-bold text-white">
            Be first to new launches <span className="font-serif font-medium italic text-gold">&amp; price drops</span>
          </p>
          <div role="group" aria-label="Topics" className="mt-3 flex flex-wrap gap-1.5">
            {TOPICS.map(t => {
              const on = topics.includes(t);
              return (
                <button key={t} type="button" aria-pressed={on} onClick={() => flip(t)}
                  className={`rounded-full px-3 py-1.5 text-[0.76rem] font-bold transition-[box-shadow,color] duration-300 ${on ? 'soft-dark-inset text-gold' : 'soft-dark-raised text-deep-text hover:text-white'}`}>
                  {t}
                </button>
              );
            })}
          </div>
          <input type="hidden" name="d_topics" value={topics.join(', ')} />
        </>
      )}
      <div className={`group mt-3 flex gap-1.5 rounded-full p-[5px] outline-gold focus-within:outline-2 focus-within:outline-solid ${light ? 'soft-inset' : 'bg-white/[0.04] soft-dark-inset'}`}>
        <label htmlFor={id} className="sr-only">Email address</label>
        <input id={id} name="email" type="email" required placeholder={hint} autoComplete="email"
          className={`min-w-0 flex-1 bg-transparent pl-3.5 text-[0.9rem] outline-none ${light ? 'text-ink placeholder:text-muted' : 'text-white placeholder:text-[#8EA596]'}`} />
        <SubmitButton className={`btn-sweep inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-[0.82rem] font-bold hover:text-deep ${light ? 'bg-forest text-white shadow-btn' : 'bg-white text-forest shadow-[-3px_-3px_8px_rgba(255,255,255,0.07),4px_4px_10px_rgba(0,0,0,0.5),inset_1px_1px_0_rgba(255,255,255,0.55)] active:soft-dark-pressed'}`}>
          Get first access <Icon name="arrow" className="size-3.5" />
        </SubmitButton>
      </div>
      <FieldError name="email" />
      <p className={`mt-2 text-[0.74rem] ${light ? 'text-muted' : 'text-[#8EA596]'}`}>{light ? '' : 'Pick topics. '}No spam. Unsubscribe anytime.</p>
    </LeadForm>
  );
}
