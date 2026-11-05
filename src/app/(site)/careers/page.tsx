import { Icon, type IconName } from '@/components/icons';
import { CmsPageHero } from '@/components/layout/CmsPageHero';
import { data } from '@/lib/cms';
import { ApplyForm } from '@/components/forms/RequestForms';
import { cmsPageMetadata } from '@/lib/pageSeo';

export async function generateMetadata() {
  const { c, heroCommunity } = await data();
  return cmsPageMetadata('careers', {
    title: 'Careers at Splendid Homes',
    description: `Join a Dubai real estate team that rewards ambition, integrity and service. ${c.careers.length} open roles in sales, leasing and operations.`,
    path: '/careers',
    image: heroCommunity(4)?.img,
  });
}

/**
 * Open roles. JobPosting schema is deliberately left out until each role has a real posting
 * date, closing date and salary range (Google for Jobs requirements); add them in the CMS.
 */
export default async function CareersPage() {
  const { site: SITE, c, heroCommunity } = await data();
  const { careers } = c;
  const hero = heroCommunity(4);
  const CC = SITE.contactCareers, T = CC.text;
  const careersEmail = CC.careersEmail || SITE.email;
  return (
    <>
      <CmsPageHero page="careers" eyebrow="Careers" img={hero?.img ?? ''} alt={`${hero?.name ?? 'Dubai'}, Dubai`}
        title={[{ text: 'Build your career ' }, { text: 'with Splendid', em: true }]}
        sub="Join a team that rewards ambition, integrity and exceptional service."
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Careers', href: '/careers' }]} />

      <section aria-labelledby="perks" className="wrap py-[clamp(40px,6vw,80px)]">
        <h2 id="perks" className="mb-8 text-[clamp(1.6rem,2.8vw,2.3rem)]">{T.perksTitle}{T.perksItalic && <> <em>{T.perksItalic}</em></>}</h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CC.perks.map(({ icon, title: t, text: d }) => (
            <li key={t} className="rounded-[24px] soft-raised p-6">
              <span className="mb-4 grid size-11 place-items-center rounded-full soft-raised-sm text-gold"><Icon name={icon as IconName} /></span>
              <h3 className="mb-1.5 text-[1.12rem]">{t}</h3>
              <p className="text-[0.94rem] text-ink-2">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="roles" className="cv-auto bg-mist py-[clamp(48px,7vw,90px)]">
        <div className="wrap">
          <h2 id="roles" className="mb-6 text-[clamp(1.6rem,2.8vw,2.3rem)]">{T.rolesTitle}{T.rolesItalic && <> <em>{T.rolesItalic}</em></>}</h2>
          {careers.length === 0 && <p className="mb-2 rounded-[24px] soft-inset px-6 py-8 text-ink-2">{T.noRoles}</p>}
          <ul className="flex flex-col gap-4">
            {careers.map(j => (
              <li key={j.id} className="flex flex-wrap items-center justify-between gap-5 rounded-[24px] soft-raised p-6">
                <div className="max-w-[64ch]">
                  <h3 className="mb-1 text-[1.25rem]">{j.title}</h3>
                  <p className="mb-2 text-ink-2">{j.desc}</p>
                  <p className="text-[0.84rem] text-muted">{j.dept} · {j.type} · {j.location}{CC.showSalary && j.salary ? ` · ${T.salaryLabel}: ${j.salary}` : ''}</p>
                </div>
                <ApplyForm jobId={j.id} title={j.title} text={{ cta: T.applyCta, title: T.applyTitle.replaceAll('{role}', j.title), send: T.applySend, hint: T.applyHint, cv: T.cvLabel }} />
              </li>
            ))}
          </ul>
          <p className="mt-6 text-ink-2">{T.specText} <a href={`mailto:${careersEmail}?subject=${encodeURIComponent(T.specSubject)}`} className="font-semibold text-forest underline-offset-4 hover:underline">{careersEmail}</a>.</p>
        </div>
      </section>
    </>
  );
}
