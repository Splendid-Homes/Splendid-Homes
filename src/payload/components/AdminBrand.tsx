import Link from 'next/link';

const Mark = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" fill="none" style={{ color: '#C8A96A' }}>
    <path d="M6 54L50 14l8-3 34 40-8 1-29-33-33 35z" fill="currentColor" />
    <path d="M24 52v34h52V52" stroke="currentColor" strokeWidth="7" strokeLinejoin="round" />
    <path d="M42 86V66h16v20" stroke="currentColor" strokeWidth="7" strokeLinejoin="round" />
  </svg>
);

/** Login screen logo. */
export function AdminLogo() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
      <Mark size={44} />
      <span style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.24em', fontSize: 20, color: '#F2F5F0', fontWeight: 600 }}>SPLENDID HOMES</span>
    </span>
  );
}

/** Nav icon (top-left). */
export function AdminIcon() {
  return <Mark size={26} />;
}

/** Shortcut to the lead board under the nav links (admins and agents). */
export function LeadBoardLink() {
  return (
    <Link href="/admin/lead-board" style={{ display: 'block', padding: '6px 0', fontWeight: 600 }}>
      Lead board
    </Link>
  );
}
