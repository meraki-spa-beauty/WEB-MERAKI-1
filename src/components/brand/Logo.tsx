import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'horizontal' | 'stacked' | 'monogram';
  color?: 'dark' | 'light';
  className?: string;
  _showSubtitle?: boolean;
}

export function Logo({
  variant = 'horizontal',
  color = 'dark',
  className = '',
  _showSubtitle = true
}: LogoProps) {
  const isLight = color === 'light';

  if (variant === 'monogram') {
    return (
      <Link to="/" className={`inline-flex items-center justify-center ${className}`} aria-label="Meraki Inicio">
        <img
          src={isLight ? '/assets/brand/official-monogram-white.png' : '/assets/brand/official-monogram-dark.png'}
          alt="Meraki Monograma"
          className="h-10 w-10 object-contain"
          referrerPolicy="no-referrer"
        />
      </Link>
    );
  }

  if (variant === 'stacked') {
    return (
      <Link to="/" className={`inline-flex flex-col items-center gap-2 text-center ${className}`} aria-label="Meraki Inicio">
        <img
          src={isLight ? '/assets/brand/meraki-logo-official-white.png' : '/assets/brand/meraki-logo-official-dark.png'}
          alt="Meraki"
          className="h-20 sm:h-24 w-auto object-contain"
          referrerPolicy="no-referrer"
        />
      </Link>
    );
  }

  // Default: Horizontal brand lockup using official Drive assets
  return (
    <Link to="/" className={`inline-flex items-center group ${className}`} aria-label="Meraki Inicio">
      <img
        src={isLight ? '/assets/brand/official-horizontal-white.png' : '/assets/brand/official-horizontal-dark.png'}
        alt="Meraki Spa & Beauty"
        className="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
        referrerPolicy="no-referrer"
      />
    </Link>
  );
}
