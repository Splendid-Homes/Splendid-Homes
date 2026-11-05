import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/icons';
import type { Agent } from '@/data/types';
import { data } from '@/lib/cms';
import { agentHref } from '@/lib/data';
import { telHref, waHref } from '@/lib/site';
import { EnquiryForm } from './EnquiryForm';
import { ViewingButton } from './ModalTriggers';
import type { PropertyPageText } from '@/payload/propertyDefaults';

/** Desktop sticky sidebar (and in-flow block on phones): agent, Book a viewing, WhatsApp, call, enquiry form. */
export async function ContactPanel({ agent, propertyRef, propertyId, waText, text }: {
  agent: Agent; propertyRef: string; propertyId: string; waText: string;
  text: Pick<PropertyPageText, 'viewingCta' | 'whatsappCta' | 'callCta' | 'enquiryTitle' | 'enquiryCta' | 'enquiryMessage'>;
}) {
  const { site } = await data();
  const btn = 'inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-[0.9rem] font-bold transition';
  return (
    <div className="flex flex-col gap-4 rounded-[28px] soft-raised p-[22px]">
      <Link href={agentHref(agent)} className="group flex items-center gap-3.5">
        <Image src={agent.img} alt="" width={60} height={60} className="size-[60px] rounded-full object-cover" />
        <span className="min-w-0">
          <b className="block transition-colors group-hover:text-forest">{agent.name}</b>
          <span className="block text-[0.84rem] text-muted">{agent.title}</span>
          {agent.brn && <small className="block text-[0.76rem] text-muted">BRN {agent.brn} · {agent.languages.join(', ')}</small>}
        </span>
      </Link>
      <ViewingButton className={`${btn} w-full bg-forest py-3.5 text-white shadow-btn hover:brightness-110`}>
        <Icon name="cal" /> {text.viewingCta}
      </ViewingButton>
      <div className="grid grid-cols-2 gap-2.5">
        <a href={waHref(site.whatsapp, waText)} target="_blank" rel="noopener" className={`${btn} bg-[#127A3F] text-white shadow-btn hover:brightness-110`}>
          <Icon name="wa" /> {text.whatsappCta}
        </a>
        <a href={telHref(agent.phone)} className={`${btn} soft-raised hover:text-forest active:soft-pressed`}>
          <Icon name="phone" /> {text.callCta}
        </a>
      </div>
      <hr className="border-line" />
      <EnquiryForm propertyRef={propertyRef} propertyId={propertyId} title={text.enquiryTitle} cta={text.enquiryCta} message={text.enquiryMessage} />
    </div>
  );
}
