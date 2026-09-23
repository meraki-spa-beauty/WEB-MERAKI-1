import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  ArrowRight, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  MapPin 
} from 'lucide-react';
import { SPA_INFO } from '../../data/spaData';

interface EditorialHeroFeedProps {
  onOpenBooking: () => void;
}

export function EditorialHeroFeed({ onOpenBooking }: EditorialHeroFeedProps) {
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
          {/* Fallback image - Warm, natural, crystal clear */}
          <img
            src={desktopBgSrc}
            alt="Meraki Spa & Beauty"
            className="w-full h-full object-cover object-center scale-100 transition-transform duration-1000 ease-out"
            referrerPolicy="no-referrer"
          />
        </picture>

        {/* Clean, elegant scrim preserving natural warm wood and spa lighting while maintaining WCAG text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/45 pointer-events-none" />
      </div>

      {/* Main Hero Content: Clean, Sophisticated Editorial Layout */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 sm:pt-24 sm:pb-16 flex flex-col items-center text-center">
        
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[#FFF2DE] text-[11px] sm:text-xs font-['Montserrat',sans-serif] uppercase tracking-[0.22em] mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#D5A688]" />
          <span>Atención en Estudio &amp; a Domicilio • Lima</span>
        </div>

        {/* Refined Headline */}
        <h1 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-5xl md:text-6xl lg:text-[64px] font-light text-white leading-[1.1] tracking-tight max-w-3xl mx-auto mb-6 drop-shadow-md">
          Santuario de Calma &amp;{' '}
          <span className="italic font-normal text-[#FFF2DE]">
            Bienestar Consciente
          </span>
        </h1>

        {/* Clear, refined subtitle */}
        <p className="font-['Montserrat',sans-serif] text-sm sm:text-base md:text-lg text-white/90 font-light leading-relaxed max-w-2xl mx-auto mb-10 drop-shadow-sm">
          Rituales de belleza de autor en nuestro estudio de Pueblo Libre o en la comodidad de tu hogar u oficina. Manicura, pedicura spa, masajes y cuidado facial profesional.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button
            id="btn-hero-agendar"
            type="button"
            onClick={onOpenBooking}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#FFF2DE] hover:bg-white text-[#111111] px-8 py-4 rounded-full text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-[0.16em] transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#5E765E]" />
            <span>Agendar Cita Online</span>
          </button>

          <Link
            to="/catalogo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/30 hover:border-white/70 text-white text-xs font-['Montserrat',sans-serif] uppercase tracking-[0.16em] transition-all duration-200 shadow-md hover:-translate-y-0.5"
          >
            <span>Ver Catálogo</span>
            <ArrowRight className="w-4 h-4 text-[#D5A688]" />
          </Link>

          <a
            href={SPA_INFO.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 text-white/90 hover:text-white text-xs font-['Montserrat',sans-serif] tracking-wider py-2.5 px-4 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-[#25D366]" />
            <span>WhatsApp Directo</span>
          </a>
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
