type Props = { href: string; children: React.ReactNode; variant?: 'primary' | 'ghost' | 'text' };
export function ArrowLink({ href, children, variant = 'text' }: Props) { return <a className={`arrow-link arrow-link--${variant}`} href={href}><span>{children}</span><span className="arrow-link__arrow" aria-hidden="true">↗</span></a>; }
