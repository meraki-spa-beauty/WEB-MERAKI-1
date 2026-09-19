import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'horizontal' | 'stacked' | 'monogram';
  color?: 'dark' | 'light';
  className?: string;
  showSubtitle?: boolean;
}

export function Logo({
  variant = 'horizontal',
  color = 'dark',
  className = '',
  showSubtitle = true
}: LogoProps) {
  const isLight = color === 'light';

  if (variant === 'monogram') {
    return (
      <Link to="/" className={`inline-flex items-center justify-center ${className}`} aria-label="Meraki Inicio">
        <img
          src={isLight ? '/assets/brand/meraki-monogram-white.png' : '/assets/brand/meraki-monogram.png'}
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
          src={isLight ? '/assets/brand/meraki-logo-white.png' : '/assets/brand/meraki-logo.png'}
          alt="Meraki Spa Beauty"
          className="h-24 w-auto object-contain"
          referrerPolicy="no-referrer"
        />
      </Link>
    );
  }

  // Default: Horizontal brand lockup
  return (
    <Link to="/" className={`inline-flex items-center gap-3.5 group ${className}`} aria-label="Meraki Inicio">
      <div className="relative flex items-center justify-center">
        <img
          src={isLight ? '/assets/brand/meraki-monogram-white.png' : '/assets/brand/meraki-monogram.png'}
          alt="Meraki Me Logo"
          className="h-11 w-11 object-contain transition-transform duration-300 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex flex-col justify-center text-left">
        <span
          className={`font-['Montserrat',sans-serif] text-xl font-light tracking-[0.24em] uppercase leading-tight ${
            isLight ? 'text-[#FFF2DE]' : 'text-[#111111]'
          }`}
        >
          MERAKI
        </span>
        {showSubtitle && (
          <span
            className={`font-['Montserrat',sans-serif] text-[9px] font-medium tracking-[0.32em] uppercase leading-none mt-1 ${
              isLight ? 'text-[#D5A688]' : 'text-[#5E765E]'
            }`}
          >
            SPA &amp; BEAUTY
          </span>
        )}
      </div>
    </Link>
  );
}
