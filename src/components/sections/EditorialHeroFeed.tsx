import { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  MapPin 
} from 'lucide-react';
import { HomeHeroCenterpieceSkeleton } from '../ui/Skeleton';

interface EditorialHeroFeedProps {
  onOpenBooking?: () => void;
}

export function EditorialHeroFeed({ onOpenBooking: _onOpenBooking }: EditorialHeroFeedProps) {
  const [customDesktopBg, setCustomDesktopBg] = useState<string | null>(null);
  const [customMobileBg, setCustomMobileBg] = useState<string | null>(null);
  const [isHeroBgLoaded, setIsHeroBgLoaded] = useState<boolean>(false);
  const [isLogoLoaded, setIsLogoLoaded] = useState<boolean>(false);

  const handleHeroImgRef = useCallback((el: HTMLImageElement | null) => {
    if (el && el.complete && el.naturalWidth > 0) {
      setIsHeroBgLoaded(true);
    }
  }, []);

  const handleLogoImgRef = useCallback((el: HTMLImageElement | null) => {
    if (el && el.complete && el.naturalWidth > 0) {
      setIsLogoLoaded(true);
    }
  }, []);

  useEffect(() => {
    try {
      // Clear any legacy test background caches to guarantee official Drive assets are displayed
      localStorage.removeItem('meraki_bg_desktop');
      localStorage.removeItem('meraki_bg_mobile');
    } catch (e) {
      console.warn('Could not clear test cache:', e);
    }
  }, []);

  const showHeroBg = isHeroBgLoaded;
  const showLogo = isLogoLoaded;

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
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#232A23]">
        {!showHeroBg && (
          <div
            aria-hidden="true"
            className="absolute inset-0 z-10 meraki-skeleton-dark"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none" />
          </div>
        )}
        <picture className="w-full h-full block">
          {/* Mobile background (< 768px) */}
          <source media="(max-width: 767px)" srcSet={mobileBgSrc} />
          {/* Desktop background (>= 768px) */}
          <source media="(min-width: 768px)" srcSet={desktopBgSrc} />
          {/* Fallback image - Natural on mobile, subdued on desktop */}
          <img
            ref={handleHeroImgRef}
            src={desktopBgSrc}
            alt="Meraki Spa & Beauty"
            fetchPriority="high"
            loading="eager"
            onLoad={() => setIsHeroBgLoaded(true)}
            onError={() => setIsHeroBgLoaded(true)}
            className={`w-full h-full object-cover object-center scale-100 transition-opacity duration-300 ease-out brightness-100 contrast-100 md:brightness-[0.82] md:contrast-[0.95] ${
              showHeroBg ? 'opacity-100' : 'opacity-0'
            }`}
            referrerPolicy="no-referrer"
          />
        </picture>

        {/* Mobile scrim (Natural lighting with subtle bottom gradient for trust badges) */}
        <div className="block md:hidden absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15 pointer-events-none" />

        {/* Desktop scrim (Deeper, richer scrim for seamless desktop header integration) */}
        <div className="hidden md:block absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/65 pointer-events-none" />
      </div>

      {/* Main Hero Content: Original padding on mobile, extended on desktop */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 md:pt-44 md:pb-36 flex flex-col items-center justify-center text-center flex-1">
        <div className="flex flex-col items-center justify-center relative">
          {!showLogo && <HomeHeroCenterpieceSkeleton />}
          <img
            ref={handleLogoImgRef}
            src="/assets/brand/meraki-logo-official-white.png"
            alt="Meraki Spa & Beauty"
            fetchPriority="high"
            loading="eager"
            onLoad={() => setIsLogoLoaded(true)}
            onError={() => setIsLogoLoaded(true)}
            className={`w-56 sm:w-64 md:w-72 lg:w-80 max-w-[76vw] h-auto object-contain select-none pointer-events-none transition-opacity duration-300 ${
              showLogo ? 'opacity-90 md:opacity-90' : 'opacity-0 absolute'
            }`}
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Trust Badges Bar */}
      <div className="relative z-10 w-full border-t border-white/15 bg-black/40 backdrop-blur-md py-5 px-4 sm:px-6 lg:px-8">
        {!showHeroBg ? (
          <div
            aria-hidden="true"
            className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left"
          >
            {[1, 2, 3, 4].map((badge) => (
              <div key={badge} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D5A688]/20 border border-[#D5A688]/30 shrink-0 animate-pulse" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-24 max-w-full rounded bg-white/25 animate-pulse" />
                  <div className="h-2.5 w-32 max-w-full rounded bg-white/12 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
}
