import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../brand/Logo';
import { Menu, X, Calendar, Phone, Sparkles } from 'lucide-react';
import { SPA_INFO } from '../../data/spaData';

interface HeaderProps {
  onOpenBookingModal?: (treatmentId?: string) => void;
}

export function Header({ onOpenBookingModal }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleBookingClick = () => {
    if (onOpenBookingModal) {
      onOpenBookingModal();
    } else {
      window.location.href = '/#tratamientos';
    }
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

  const navLinks = [
    { label: 'Tratamientos', href: '#tratamientos' },
    { label: 'Masajes', href: '#masajes' },
    { label: 'Faciales', href: '#faciales' },
    { label: 'Experiencias Dúo', href: '#experiencias-duo' },
    { label: 'El Ritual', href: '#ritual-bienvenida' },
    { label: 'Gift Cards', href: '#gift-cards' },
    { label: 'Contacto', href: '#contacto' },
  ];

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

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-['Montserrat',sans-serif] uppercase tracking-[0.14em] text-[#111111]/85 font-medium">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-[#5E765E] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#5E765E] hover:after:w-full after:transition-all after:duration-300"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <button
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
          <div className="flex flex-col gap-6 pt-4">
            <div className="flex justify-center pb-4 border-b border-[#5E765E]/20">
              <Logo variant="stacked" color="dark" />
            </div>

            <nav className="flex flex-col gap-4 text-center">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="font-['Cormorant_Garamond',serif] text-2xl text-[#111111] hover:text-[#5E765E] transition-colors py-1"
                >
                  {link.label}
                </a>
              ))}
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
              href={`https://wa.me/${SPA_INFO.whatsappNumber}?text=Hola%20Meraki,%20deseo%20hacer%20una%20consulta`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-xs font-['Montserrat',sans-serif] uppercase tracking-wider text-[#5E765E]"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp: {SPA_INFO.whatsappDisplay}</span>
            </a>

            <div className="flex justify-center gap-4 text-[11px] uppercase tracking-wider text-[#111111]/60 pt-2">
              <Link to="/privacy" onClick={() => setIsOpen(false)}>
                Privacidad
              </Link>
              <span>•</span>
              <span>{SPA_INFO.city}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
