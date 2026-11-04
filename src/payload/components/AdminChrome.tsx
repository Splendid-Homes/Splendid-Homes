import { Fraunces, Urbanist } from 'next/font/google';
import Link from 'next/link';
import type { ServerProps } from 'payload';
import { Suspense } from 'react';
import { ShNavLink } from './NavLinks';

/**
 * Admin chrome: fonts and the "Splendid Homes" word background, login intro + photo panel, sidebar brand,
 * shortcuts with a new-lead count, and the signed-in user card. Styles live in app/(payload)/custom.scss.
 */

const urbanist = Urbanist({ subsets: ['latin'], variable: '--font-urbanist', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], style: 'italic', weight: '500', variable: '--font-fraunces', display: 'swap' });

// Runs before first paint, so a saved light-mode choice never flashes dark.
const MODE_SCRIPT = "try{if(localStorage.getItem('sh_admin_mode')==='light')document.documentElement.dataset.shMode='light'}catch(e){}";

/** Rows of giant words behind the panels. Still on purpose: moving them forced full-screen redraws and made the admin lag. Decorative. */
const ROWS = ['out', 'gold', 'serif', 'fill', 'out', 'serif', 'gold'];
function WordBackground() {
  return (
    <div className="sh-bg" aria-hidden="true">
      <i className="orb o1" /><i className="orb o2" /><i className="orb o3" /><i className="orb o4" /><i className="orb o5" />
      <div className="sh-words">
        {ROWS.map((style, i) => <div key={i} className={`sh-word-row sh-w-${style}`}>SPLENDID HOMES ✦ SPLENDID HOMES ✦ SPLENDID HOMES ✦ SPLENDID HOMES</div>)}
      </div>
    </div>
  );
}

/** Wraps the whole admin: fonts (self-hosted by next/font), saved light/dark mode and the background. */
export function AdminFonts({ children }: { children: React.ReactNode }) {
  return (
    <div className={`sh-fonts ${urbanist.variable} ${fraunces.variable}`} style={{ display: 'contents' }}>
      <script dangerouslySetInnerHTML={{ __html: MODE_SCRIPT }} />
      <WordBackground />
      {children}
    </div>
  );
}

const LOGIN_IMG = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=70';

/** Above the login form: the photo panel on the left and the welcome heading in the card. */
export function LoginIntro() {
  return (
    <>
      <aside className="sh-login-art" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGIN_IMG} alt="" />
        <div className="cap">
          <span className="tag"><i />Admin · Splendid Homes</span>
          <h2>Manage your <em>splendid</em> listings</h2>
          <p>Listings, off-plan launches, leads and site content in one place.</p>
        </div>
      </aside>
      <div className="sh-login-intro">
        <h1>Welcome back</h1>
        <p>Sign in to the Splendid Homes CMS.</p>
      </div>
    </>
  );
}

/** Top of the sidebar: brand, Dashboard and Lead board (with the number of new leads for admins and agents). */
export async function NavShortcuts({ payload, user }: ServerProps) {
  const role = (user as { role?: string } | null)?.role;
  let fresh = 0;
  if (user && (role === 'admin' || role === 'agent')) {
    const r = await payload.count({ collection: 'leads', user, overrideAccess: false, where: { status: { equals: 'new' } } });
    fresh = r.totalDocs;
  }
  const board = <>Lead board{fresh > 0 && <span className="n" aria-label={`${fresh} new`}>{fresh}</span>}</>;
  return (
    <div className="sh-nav">
      <Link href="/admin" className="sh-brand">
        <span className="mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg></span>
        <span><b>Splendid Homes</b><small>Admin</small></span>
      </Link>
      {/* Plain links until the current page is known, so the sidebar never blocks rendering. */}
      <Suspense fallback={<>
        <Link href="/admin" className="sh-nav-link sh-nav-link--dashboard">Dashboard</Link>
        {(role === 'admin' || role === 'agent') && <Link href="/admin/lead-board" className="sh-nav-link sh-nav-link--board">{board}</Link>}
      </>}>
        <ShNavLink exact href="/admin" className="sh-nav-link sh-nav-link--dashboard">Dashboard</ShNavLink>
        {(role === 'admin' || role === 'agent') && <ShNavLink href="/admin/lead-board" className="sh-nav-link sh-nav-link--board">{board}</ShNavLink>}
      </Suspense>
    </div>
  );
}

const ROLE_LABEL: Record<string, string> = { admin: 'Main admin', editor: 'Editor', agent: 'Sales agent' };

/** Bottom of the sidebar: who is signed in, linking to their account. */
export function NavUser({ user }: ServerProps) {
  if (!user) return null;
  const u = user as { name?: string; email?: string; role?: string };
  const name = u.name || u.email || 'Account';
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <Link href="/admin/account" className="sh-me">
      <span className="av">{initials}</span>
      <span><b>{name}</b><small>{ROLE_LABEL[u.role ?? ''] && ROLE_LABEL[u.role ?? ''] !== name ? ROLE_LABEL[u.role ?? ''] : 'Signed in'}</small></span>
    </Link>
  );
}
