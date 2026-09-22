import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '../brand/Logo';
import { useBooking } from '../../context/BookingContext';
import {
  Menu,
  X,
  Calendar,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Hand,
  Footprints,
  Eye,
  Scissors,
  Flame,
  Smile
} from 'lucide-react';
import { SPA_INFO } from '../../data/spaData';

export interface HeaderCategoryItem {
  id: string;
  label: string;
  categoryKey: string;
  shortDesc: string;
  startingPrice: string;
  icon: 'manos' | 'pies' | 'pestanas' | 'depilacion' | 'masajes' | 'faciales';
}

export const HEADER_CATEGORIES: HeaderCategoryItem[] = [
  {
    id: 'cat-manos',
    label: 'Manos & Uñas',
    categoryKey: 'manos',
    shortDesc: 'Básica, Gel, Rubber, Acrílicos y Esculpidas',
    startingPrice: 'Desde S/ 60',
    icon: 'manos'
  },
  {
    id: 'cat-pies',
    label: 'Cuidado de Pies',
    categoryKey: 'pies',
    shortDesc: 'Pedicura básica, gel y jellyparafina spa',
    startingPrice: 'Desde S/ 70',
    icon: 'pies'
  },
  {
    id: 'cat-pestanas',
    label: 'Pestañas',
    categoryKey: 'pestanas',
    shortDesc: 'Lifting y extensiones (clásicas, rímel, volumen, híbrido)',
    startingPrice: 'Desde S/ 100',
    icon: 'pestanas'
  },
  {
    id: 'cat-depilacion',
    label: 'Depilación Cera & Hilo',
    categoryKey: 'depilacion',
    shortDesc: 'Facial (cera/hilo), axilas, piernas y zonas íntimas',
    startingPrice: 'Desde S/ 15',
    icon: 'depilacion'
  },
  {
    id: 'cat-masajes',
    label: 'Masajes & Packs',
    categoryKey: 'masajes',
    shortDesc: 'Relajantes, descontracturantes, drenaje y reductores',
    startingPrice: 'Desde S/ 60',
    icon: 'masajes'
  },
  {
    id: 'cat-faciales',
    label: 'Faciales Profesionales',
    categoryKey: 'faciales',
    shortDesc: 'Facial básico, intermedio y profundo con máscara LED',
    startingPrice: 'Desde S/ 120',
    icon: 'faciales'
  }
];

export function Header() {
  const { openBooking } = useBooking();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [catalogDropdownOpen, setCatalogDropdownOpen] = useState(false);
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
    setCatalogDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target;

      if (dropdownRef.current && target instanceof Node && !dropdownRef.current.contains(target)) {
        setCatalogDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCatalogDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setCatalogDropdownOpen(false);
    }, 200);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
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

  const renderIcon = (iconName: HeaderCategoryItem['icon']) => {
    switch (iconName) {
      case 'manos':
        return <Hand className="w-4 h-4 text-[#5E765E]" />;
      case 'pies':
        return <Footprints className="w-4 h-4 text-[#D5A688]" />;
      case 'pestanas':
        return <Eye className="w-4 h-4 text-[#5E765E]" />;
      case 'depilacion':
        return <Scissors className="w-4 h-4 text-[#D5A688]" />;
      case 'masajes':
        return <Flame className="w-4 h-4 text-[#5E765E]" />;
      case 'faciales':
        return <Smile className="w-4 h-4 text-[#D5A688]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#5E765E]" />;
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }

    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }

    return false;
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FFFFFF]/95 backdrop-blur-md shadow-sm border-b border-[#5E765E]/15 py-3'
          : 'bg-[#FFF2DE]/90 backdrop-blur-sm py-4 border-b border-[#5E765E]/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo variant="horizontal" color="dark" />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-['Montserrat',sans-serif] uppercase tracking-[0.14em] text-[#111111]/85 font-medium">
          <Link
            to="/"
            className={`py-1 transition-colors relative hover:text-[#5E765E] ${
              isActive('/') ? 'text-[#5E765E] font-semibold' : ''
            }`}
          >
            Inicio
          </Link>

          {/* Catálogo con Menú Desplegable */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              to="/catalogo"
              className={`inline-flex items-center gap-1.5 py-1 transition-colors relative cursor-pointer hover:text-[#5E765E] ${
                isActive('/catalogo') ? 'text-[#5E765E] font-semibold' : ''
              }`}
            >
              <span>Catálogo</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  catalogDropdownOpen ? 'rotate-180 text-[#5E765E]' : 'text-[#111111]/50'
                }`}
              />
            </Link>

            {/* Submenú Flotante */}
            {catalogDropdownOpen && (
              <div
                id="menu-catalog-dropdown"
                role="menu"
                className="absolute top-full left-0 mt-3 w-96 rounded-2xl bg-white/98 backdrop-blur-md border border-[#5E765E]/20 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-left"
              >
                <div className="px-3 py-2 border-b border-[#5E765E]/10 mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E]">
                    Servicios Oficiales
                  </span>
                  <Link
                    to="/catalogo"
                    className="text-[10px] text-[#D5A688] font-semibold hover:underline"
                  >
                    Ver Todo
                  </Link>
                </div>

                <div className="space-y-1">
                  {HEADER_CATEGORIES.map((item) => (
                    <Link
                      key={item.id}
                      to={`/catalogo?cat=${item.categoryKey}`}
                      role="menuitem"
                      onClick={() => setCatalogDropdownOpen(false)}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-[#FFF2DE]/70 transition-all flex items-start gap-3 group cursor-pointer"
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
                    </Link>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-[#5E765E]/10 px-3 py-1.5 flex items-center justify-between text-[11px] text-[#5E765E] font-semibold tracking-normal normal-case">
                  <span className="text-[#111111]/60 font-normal">A domicilio y oficina</span>
                  <Link
                    to="/catalogo"
                    onClick={() => setCatalogDropdownOpen(false)}
                    className="inline-flex items-center gap-1 text-[#5E765E] hover:underline"
                  >
                    <span>Explorar catálogo completo</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            to="/como-reservar"
            className={`py-1 transition-colors relative hover:text-[#5E765E] ${
              isActive('/como-reservar') ? 'text-[#5E765E] font-semibold' : ''
            }`}
          >
            Cómo Reservar
          </Link>

          <Link
            to="/nosotros"
            className={`py-1 transition-colors relative hover:text-[#5E765E] ${
              isActive('/nosotros') ? 'text-[#5E765E] font-semibold' : ''
            }`}
          >
            Nosotros
          </Link>

          <Link
            to="/contacto"
            className={`py-1 transition-colors relative hover:text-[#5E765E] ${
              isActive('/contacto') ? 'text-[#5E765E] font-semibold' : ''
            }`}
          >
            Contacto
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            id="btn-header-booking"
            type="button"
            onClick={() => openBooking()}
            className="inline-flex items-center gap-2 bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] px-5 py-2.5 rounded-full text-xs font-['Montserrat',sans-serif] font-medium uppercase tracking-[0.14em] transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#D5A688]" />
            <span>Agendar Cita</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => openBooking()}
            className="bg-[#5E765E] text-[#FFF2DE] p-2 rounded-full text-xs cursor-pointer"
            aria-label="Agendar Cita"
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
          <div className="flex flex-col gap-5 pt-2">
            <div className="flex justify-center pb-4 border-b border-[#5E765E]/20">
              <Logo variant="stacked" color="dark" />
            </div>

            <nav className="flex flex-col gap-2 text-left">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="font-['Cormorant_Garamond',serif] text-2xl text-[#111111] hover:text-[#5E765E] transition-colors py-2 border-b border-[#5E765E]/15 flex items-center justify-between"
              >
                <span>Inicio</span>
                <ArrowRight className="w-4 h-4 text-[#5E765E]/60" />
              </Link>

              {/* Mobile Submenu for Catálogo */}
              <div className="py-2 border-b border-[#5E765E]/15">
                <button
                  type="button"
                  onClick={() => setMobileCatalogOpen(!mobileCatalogOpen)}
                  className="w-full flex items-center justify-between font-['Cormorant_Garamond',serif] text-2xl text-[#111111]"
                >
                  <span>Catálogo de Servicios</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#5E765E] transition-transform duration-200 ${
                      mobileCatalogOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {mobileCatalogOpen && (
                  <div className="mt-3 space-y-2 pl-2">
                    <Link
                      to="/catalogo"
                      onClick={() => setIsOpen(false)}
                      className="block p-2 rounded-xl bg-white/80 font-medium text-xs text-[#5E765E]"
                    >
                      Ver Catálogo Completo (36 Servicios) →
                    </Link>
                    {HEADER_CATEGORIES.map((item) => (
                      <Link
                        key={item.id}
                        to={`/catalogo?cat=${item.categoryKey}`}
                        onClick={() => setIsOpen(false)}
                        className="w-full text-left p-2.5 rounded-xl bg-white/60 hover:bg-white border border-[#5E765E]/15 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded bg-[#5E765E]/10 flex items-center justify-center">
                            {renderIcon(item.icon)}
                          </div>
                          <span className="font-['Montserrat',sans-serif] text-xs font-medium text-[#111111]">
                            {item.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#5E765E] font-semibold">
                          {item.startingPrice}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/como-reservar"
                onClick={() => setIsOpen(false)}
                className="font-['Cormorant_Garamond',serif] text-2xl text-[#111111] hover:text-[#5E765E] transition-colors py-2 border-b border-[#5E765E]/15 flex items-center justify-between"
              >
                <span>Cómo Reservar</span>
                <ArrowRight className="w-4 h-4 text-[#5E765E]/60" />
              </Link>

              <Link
                to="/nosotros"
                onClick={() => setIsOpen(false)}
                className="font-['Cormorant_Garamond',serif] text-2xl text-[#111111] hover:text-[#5E765E] transition-colors py-2 border-b border-[#5E765E]/15 flex items-center justify-between"
              >
                <span>Nosotros</span>
                <ArrowRight className="w-4 h-4 text-[#5E765E]/60" />
              </Link>

              <Link
                to="/contacto"
                onClick={() => setIsOpen(false)}
                className="font-['Cormorant_Garamond',serif] text-2xl text-[#111111] hover:text-[#5E765E] transition-colors py-2 border-b border-[#5E765E]/15 flex items-center justify-between"
              >
                <span>Contacto</span>
                <ArrowRight className="w-4 h-4 text-[#5E765E]/60" />
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t border-[#5E765E]/20 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openBooking();
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#5E765E] text-[#FFF2DE] py-3.5 rounded-full font-['Montserrat',sans-serif] text-xs font-semibold uppercase tracking-widest shadow-md cursor-pointer hover:bg-[#4d634d] transition-colors"
            >
              <Sparkles className="w-4 h-4 text-[#D5A688]" />
              <span>Agendar Cita (Formulario)</span>
            </button>

            <div className="text-xs font-['Montserrat',sans-serif] text-[#111111]/70 pt-1">
              WhatsApp Directo: <span className="font-semibold text-[#5E765E]">{SPA_INFO.whatsappDisplay}</span>
            </div>

            <div className="flex justify-center gap-4 text-[11px] uppercase tracking-wider text-[#111111]/60 pt-2">
              <Link to="/privacy" onClick={() => setIsOpen(false)}>
                Políticas de Privacidad
              </Link>
              <span>•</span>
              <span>A Domicilio &amp; Oficina</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
