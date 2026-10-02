import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  MapPin 
} from 'lucide-react';

interface EditorialHeroFeedProps {
  onOpenBooking?: () => void;
}

export function EditorialHeroFeed({ onOpenBooking: _onOpenBooking }: EditorialHeroFeedProps) {
  const [customDesktopBg, setCustomDesktopBg] = useState<string | null>(null);
  const [customMobileBg, setCustomMobileBg] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Clear any legacy test background caches to guarantee official Drive assets are displayed
      localStorage.removeItem('meraki_bg_desktop');
      localStorage.removeItem('meraki_bg_mobile');
    } catch (e) {
      console.warn('Could not clear test cache:', e);
    }
  }, []);

  const desktopBgSrc = customDesktopBg || '/assets/backgrounds/fondo-desktop.webp';
  const mobileBgSrc = customMobileBg || '/assets/backgrounds/fondo-mobile.webp';

  const processFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      // SAFETY: FileReader.readAsDataURL result is either a base64 data URL string or null
      const result = event.target?.result as string | null;

      if (!result) return;

      const lowerName = file.name.toLowerCase();
      const isMobile = lowerName.includes('movil') || lowerName.includes('mobile');
      const isDesktop = lowerName.includes('web') || lowerName.includes('desk') || lowerName.includes('mrk');

      const apply = (target: 'desktop' | 'mobile') => {
        if (target === 'desktop') {
          setCustomDesktopBg(result);

          try {
            localStorage.setItem('meraki_bg_desktop', result);
          } catch {
            // ignore quota errors
          }
        } else {
          setCustomMobileBg(result);

          try {
            localStorage.setItem('meraki_bg_mobile', result);
          } catch {
            // ignore quota errors
          }
        }
      };

      if (isMobile) {
        apply('mobile');
      } else if (isDesktop) {
        apply('desktop');
      } else {
        const img = new Image();

        img.onload = () => {
          apply(img.naturalWidth >= img.naturalHeight ? 'desktop' : 'mobile');
        };

        img.src = result;
      }
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const files = e.dataTransfer.files;

    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      processFile(files[i]);
    }
  };

  return (
    <section 
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="relative overflow-hidden min-h-[82vh] lg:min-h-[88vh] flex flex-col justify-between text-white select-none"
    >
      {/* Background with responsive Desktop & Mobile sources */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <picture className="w-full h-full block">
          {/* Mobile background (< 768px) */}
          <source media="(max-width: 767px)" srcSet={mobileBgSrc} />
          {/* Desktop background (>= 768px) */}
          <source media="(min-width: 768px)" srcSet={desktopBgSrc} />
          {/* Fallback image - Natural on mobile, subdued on desktop */}
          <img
            src={desktopBgSrc}
            alt="Meraki Spa & Beauty"
            className="w-full h-full object-cover object-center scale-100 transition-transform duration-1000 ease-out brightness-100 contrast-100 md:brightness-[0.82] md:contrast-[0.95]"
            referrerPolicy="no-referrer"
          />
        </picture>

        {/* Mobile scrim (Warm natural lighting with subtle central contrast for logo readability) */}
        <div className="block md:hidden absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/65 pointer-events-none" />

        {/* Desktop scrim (Deeper, richer scrim for seamless desktop header integration) */}
        <div className="hidden md:block absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/65 pointer-events-none" />
      </div>

      {/* Main Hero Content: Original padding on mobile, extended on desktop */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 md:pt-44 md:pb-36 flex flex-col items-center justify-center text-center flex-1">
        <div className="flex flex-col items-center justify-center relative">
          {/* Soft ambient halo behind logo so it reads crisply against light towels & ceramics */}
          <div className="absolute inset-0 -inset-x-12 -inset-y-8 bg-black/40 rounded-full blur-2xl pointer-events-none md:bg-black/30" />
          <img
            src="/assets/brand/meraki-logo-official-white.png"
            alt="Meraki Spa & Beauty"
            className="relative z-10 w-56 sm:w-64 md:w-72 lg:w-80 max-w-[76vw] h-auto object-contain select-none pointer-events-none drop-shadow-[0_4px_22px_rgba(0,0,0,0.85)] drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] opacity-95 filter brightness-100 contrast-105 md:opacity-90 md:brightness-100 md:contrast-100"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Trust Badges Bar */}
      <div className="relative z-10 w-full border-t border-white/15 bg-black/40 backdrop-blur-md py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#D5A688] shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-['Montserrat',sans-serif] text-xs font-semibold text-white tracking-wide block uppercase">
                Puntualidad
              </span>
              <span className="text-[11px] text-white/75 font-light block leading-tight">
                Horarios garantizados
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#D5A688] shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="font-['Montserrat',sans-serif] text-xs font-semibold text-white tracking-wide block uppercase">
                100% Móvil
              </span>
              <span className="text-[11px] text-white/75 font-light block leading-tight">
                En tu casa u oficina en Lima
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#D5A688] shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-['Montserrat',sans-serif] text-xs font-semibold text-white tracking-wide block uppercase">
                Bioseguridad
              </span>
              <span className="text-[11px] text-white/75 font-light block leading-tight">
                Material esterilizado
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#D5A688] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-['Montserrat',sans-serif] text-xs font-semibold text-white tracking-wide block uppercase">
                Productos Premium
              </span>
              <span className="text-[11px] text-white/75 font-light block leading-tight">
                Marcas líderes y aceites puros
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
