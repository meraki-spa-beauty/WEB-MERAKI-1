import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../brand/Logo';
import {
  Menu,
  X,
  Calendar,
  Sparkles,
  ChevronDown,
  ArrowRight,
  Flame,
  Droplet,
  Heart,
  Scissors,
  Layers
} from 'lucide-react';
import { SPA_INFO } from '../../data/spaData';

export interface ServiceSubMenuItem {
  id: string;
  label: string;
  categoryKey: string;
  shortDesc: string;
  startingPrice: string;
  icon: 'flame' | 'droplet' | 'heart' | 'scissors' | 'layers';
}

export const SERVICES_MENU: ServiceSubMenuItem[] = [
  {
    id: 'todos-rituales',
    label: 'Carta Completa',
    categoryKey: 'todos',
    shortDesc: 'Todos los rituales y experiencias de autor',
    startingPrice: 'Desde S/. 190',
    icon: 'layers'
  },
  {
    id: 'masajes-rituales',
    label: 'Masajes & Rituales',
    categoryKey: 'masajes',
    shortDesc: 'Técnicas holísticas con piedras volcánicas andinas',
    startingPrice: 'Desde S/. 190',
    icon: 'flame'
  },
  {
    id: 'faciales-cosmetica',
    label: 'Faciales Botánicos',
    categoryKey: 'faciales',
    shortDesc: 'Alta cosmética celular, hidratación y luminosidad',
    startingPrice: 'Desde S/. 210',
    icon: 'droplet'
  },
  {
    id: 'experiencias-parejas',
    label: 'Experiencias Dúo',
    categoryKey: 'parejas',
    shortDesc: 'Rituales privados en cabina doble para dos',
    startingPrice: 'Desde S/. 450',
    icon: 'heart'
  },
  {
    id: 'corporales-circuito',
    label: 'Corporales & Exfoliación',
    categoryKey: 'corporales',
    shortDesc: 'Renovación de sales marinas y envolturas botánicas',
    startingPrice: 'Desde S/. 220',
    icon: 'layers'
  },
  {
    id: 'salon-belleza',
    label: 'Salón & Manicura Spa',
    categoryKey: 'salon',
    shortDesc: 'Cuidado de manos y pies con parafina botánica',
    startingPrice: 'Desde S/. 95',
    icon: 'scissors'
  }
];

interface HeaderProps {
  onOpenBookingModal?: (treatmentId?: string) => void;
  onSelectCategory?: (categoryKey: string) => void;
}

export function Header({ onOpenBookingModal, onSelectCategory }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleBookingClick = () => {
    if (onOpenBookingModal) {
      onOpenBookingModal();
    } else {
      window.location.href = '/#tratamientos';
    }
  };

  const handleSelectServiceCategory = (categoryKey: string) => {
    setServicesDropdownOpen(false);
    setIsOpen(false);

    if (onSelectCategory) {
      onSelectCategory(categoryKey);
    }

    const treatmentsSection = document.getElementById('tratamientos');

    if (treatmentsSection) {
      treatmentsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#tratamientos';
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target;

      if (dropdownRef.current && target instanceof Node && !dropdownRef.current.contains(target)) {
        setServicesDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setServicesDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setServicesDropdownOpen(false);
    }, 200);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const renderIcon = (iconName: ServiceSubMenuItem['icon']) => {
    switch (iconName) {
      case 'flame':
        return <Flame className="w-4 h-4 text-[#D5A688]" />;
      case 'droplet':
        return <Droplet className="w-4 h-4 text-[#5E765E]" />;
      case 'heart':
        return <Heart className="w-4 h-4 text-[#D5A688]" />;
      case 'scissors':
        return <Scissors className="w-4 h-4 text-[#5E765E]" />;
      default:
        return <Layers className="w-4 h-4 text-[#5E765E]" />;
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FFFFFF]/95 backdrop-blur-md shadow-sm border-b border-[#5E765E]/15 py-3'
          : 'bg-[#FFF2DE]/85 backdrop-blur-sm py-4 border-b border-[#5E765E]/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo variant="horizontal" color="dark" />

        {/* Desktop Navigation with Interactive Services Submenu */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-['Montserrat',sans-serif] uppercase tracking-[0.14em] text-[#111111]/85 font-medium">
          
          {/* Services with Sub-Menu (Interactive Popover) */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              id="btn-nav-services-submenu"
              type="button"
              onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
              aria-expanded={servicesDropdownOpen}
              aria-haspopup="true"
              className={`inline-flex items-center gap-1.5 py-1 transition-colors relative cursor-pointer ${
                servicesDropdownOpen ? 'text-[#5E765E]' : 'hover:text-[#5E765E]'
              }`}
            >
              <span>Servicios</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  servicesDropdownOpen ? 'rotate-180 text-[#5E765E]' : 'text-[#111111]/50'
                }`}
              />
            </button>

            {/* Interactive Sub-Menu Floating Panel */}
            {servicesDropdownOpen && (
              <div
                id="menu-services-dropdown"
                role="menu"
                className="absolute top-full left-0 mt-3 w-96 rounded-2xl bg-white/95 backdrop-blur-md border border-[#5E765E]/20 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="px-3 py-2 border-b border-[#5E765E]/10 mb-2">
                  <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E]">
                    Menú de Servicios &amp; Experiencias
                  </span>
                </div>

                <div className="space-y-1">
                  {SERVICES_MENU.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="menuitem"
                      onClick={() => handleSelectServiceCategory(item.categoryKey)}
                      className="w-full text-left p-3 rounded-xl hover:bg-[#FFF2DE]/70 transition-all flex items-start gap-3.5 group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#5E765E]/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#5E765E]/20 transition-colors">
                        {renderIcon(item.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-['Cormorant_Garamond',serif] text-base font-semibold text-[#111111] group-hover:text-[#5E765E] transition-colors normal-case">
                            {item.label}
                          </span>
                          <span className="text-[10px] font-['Montserrat',sans-serif] text-[#5E765E] font-medium tracking-normal">
                            {item.startingPrice}
                          </span>
                        </div>
                        <p className="text-[11px] font-['Montserrat',sans-serif] text-[#111111]/60 font-light truncate normal-case mt-0.5">
                          {item.shortDesc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-[#5E765E]/10 px-3 py-1.5 flex items-center justify-between text-[11px] text-[#5E765E] font-semibold tracking-normal normal-case">
                  <span className="text-[#111111]/60 font-normal">¿Citas personalizadas?</span>
                  <a
                    href={SPA_INFO.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#5E765E] hover:underline"
                  >
                    <span>Asesoría directa</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>

          <a
            href="#ritual-bienvenida"
            className="hover:text-[#5E765E] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#5E765E] hover:after:w-full after:transition-all after:duration-300"
          >
            El Ritual
          </a>

          <a
            href="#gift-cards"
            className="hover:text-[#5E765E] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#5E765E] hover:after:w-full after:transition-all after:duration-300"
          >
            Gift Cards
          </a>

          <a
            href="#contacto"
            className="hover:text-[#5E765E] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#5E765E] hover:after:w-full after:transition-all after:duration-300"
          >
            Contacto
          </a>
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            id="btn-header-booking"
            type="button"
            onClick={handleBookingClick}
            className="inline-flex items-center gap-2 bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] px-5 py-2.5 rounded-full text-xs font-['Montserrat',sans-serif] font-medium uppercase tracking-[0.14em] transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#D5A688]" />
            <span>Reservar Cita</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={handleBookingClick}
            className="bg-[#5E765E] text-[#FFF2DE] p-2 rounded-full text-xs"
            aria-label="Reservar cita"
          >
            <Calendar className="w-4 h-4 text-[#D5A688]" />
          </button>
          <button
            id="btn-mobile-nav-toggle"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-[#111111] hover:text-[#5E765E] focus:outline-none"
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 top-[65px] z-50 bg-[#FFF2DE] text-[#111111] flex flex-col justify-between p-6 overflow-y-auto lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menú principal de navegación"
        >
          <div className="flex flex-col gap-6 pt-2">
            <div className="flex justify-center pb-4 border-b border-[#5E765E]/20">
              <Logo variant="stacked" color="dark" />
            </div>

            {/* Mobile Submenu for Services */}
            <div className="text-left">
              <button
                type="button"
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="w-full flex items-center justify-between py-2 text-left font-['Cormorant_Garamond',serif] text-2xl text-[#111111] border-b border-[#5E765E]/15"
              >
                <span>Servicios de Spa</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#5E765E] transition-transform duration-200 ${
                    mobileServicesOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {mobileServicesOpen && (
                <div className="mt-3 space-y-2 pl-2">
                  {SERVICES_MENU.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectServiceCategory(item.categoryKey)}
                      className="w-full text-left p-2.5 rounded-xl bg-white/70 hover:bg-white border border-[#5E765E]/15 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-[#5E765E]/10 flex items-center justify-center">
                          {renderIcon(item.icon)}
                        </div>
                        <span className="font-['Montserrat',sans-serif] text-xs font-medium text-[#111111]">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#5E765E] font-semibold">
                        {item.startingPrice}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <nav className="flex flex-col gap-3 text-left">
              <a
                href="#ritual-bienvenida"
                onClick={() => setIsOpen(false)}
                className="font-['Cormorant_Garamond',serif] text-2xl text-[#111111] hover:text-[#5E765E] transition-colors py-1 border-b border-[#5E765E]/15"
              >
                El Ritual
              </a>

              <a
                href="#gift-cards"
                onClick={() => setIsOpen(false)}
                className="font-['Cormorant_Garamond',serif] text-2xl text-[#111111] hover:text-[#5E765E] transition-colors py-1 border-b border-[#5E765E]/15"
              >
                Gift Cards
              </a>

              <a
                href="#contacto"
                onClick={() => setIsOpen(false)}
                className="font-['Cormorant_Garamond',serif] text-2xl text-[#111111] hover:text-[#5E765E] transition-colors py-1 border-b border-[#5E765E]/15"
              >
                Contacto
              </a>
            </nav>
          </div>

          <div className="flex flex-col gap-4 pt-6 border-t border-[#5E765E]/20 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                handleBookingClick();
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#5E765E] text-[#FFF2DE] py-3.5 rounded-full font-['Montserrat',sans-serif] text-xs font-semibold uppercase tracking-widest shadow-md"
            >
              <Sparkles className="w-4 h-4 text-[#D5A688]" />
              <span>Agendar mi Experiencia</span>
            </button>

            <a
              href={SPA_INFO.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-xs font-['Montserrat',sans-serif] uppercase tracking-wider text-[#5E765E] font-medium"
            >
              <span>WhatsApp: {SPA_INFO.whatsappDisplay}</span>
            </a>

            <div className="flex justify-center gap-4 text-[11px] uppercase tracking-wider text-[#111111]/60 pt-2">
              <Link to="/privacy" onClick={() => setIsOpen(false)}>
                Privacidad
              </Link>
              <span>•</span>
              <span>Atención Personalizada</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
