export interface BotanicalBackdropProps {
  className?: string;
  variant?: 'subtle' | 'ambient';
}

export function BotanicalBackdrop({ className = '', variant = 'subtle' }: BotanicalBackdropProps) {
  const opacityClass = variant === 'ambient' ? 'opacity-40' : 'opacity-25';

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 overflow-hidden z-0 select-none ${opacityClass} ${className}`}
    >
      {/* Top-Right Eucalyptus Branch */}
      <svg
        className="absolute -top-12 -right-12 w-64 h-64 sm:w-80 sm:h-80 text-[#5E765E] rotate-45 transform"
        viewBox="0 0 200 200"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 10 Q105 50 110 100 Q115 150 120 190"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Leaves */}
        <path d="M105 30 C125 20 145 35 140 50 C135 65 110 50 105 30 Z" />
        <path d="M103 45 C80 35 65 55 75 70 C85 80 105 60 103 45 Z" />
        <path d="M108 75 C130 65 150 85 142 100 C132 112 110 95 108 75 Z" />
        <path d="M107 95 C85 85 70 105 82 120 C92 132 110 110 107 95 Z" />
        <path d="M112 125 C135 115 155 135 145 150 C135 162 115 145 112 125 Z" />
        <path d="M113 145 C90 138 78 158 90 172 C100 182 115 160 113 145 Z" />
      </svg>

      {/* Bottom-Left Olive Leaves Cluster */}
      <svg
        className="absolute -bottom-16 -left-12 w-72 h-72 sm:w-96 sm:h-96 text-[#5E765E] -rotate-12 transform"
        viewBox="0 0 200 200"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 180 Q60 140 110 100 Q150 60 180 20"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <path d="M50 150 C40 130 55 110 75 120 C90 130 70 160 50 150 Z" />
        <path d="M70 130 C90 115 110 130 105 145 C98 160 75 145 70 130 Z" />
        <path d="M100 105 C90 85 105 65 125 75 C140 85 120 115 100 105 Z" />
        <path d="M120 85 C140 70 160 85 155 100 C148 115 125 100 120 85 Z" />
        <path d="M145 60 C138 40 155 25 170 35 C182 45 165 72 145 60 Z" />
      </svg>

      {/* Center Right Subtle Flora Petal Accent */}
      <svg
        className="absolute top-1/2 -right-8 -translate-y-1/2 w-48 h-48 text-[#D5A688] rotate-90 transform"
        viewBox="0 0 100 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M50 15 C65 30 65 50 50 65 C35 50 35 30 50 15 Z" />
        <path d="M50 35 C70 50 70 70 50 85 C30 70 30 50 50 35 Z" opacity="0.6" />
      </svg>
    </div>
  );
}
