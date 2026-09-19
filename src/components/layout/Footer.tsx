import { Link } from 'react-router-dom';
import { Logo } from '../brand/Logo';
import { SPA_INFO } from '../../data/spaData';
import { Phone, Mail, MapPin, Instagram, Heart, Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#5E765E] text-[#FFF2DE] pt-16 pb-10 border-t border-[#AEC2AE]/20 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-[#AEC2AE]/20">
          
          {/* Brand Col */}
          <div className="lg:col-span-4">
            <Logo variant="stacked" color="light" className="items-start" />
            <p className="font-['Montserrat',sans-serif] text-xs text-[#FFF2DE]/80 mt-6 leading-relaxed max-w-sm font-light">
              Un santuario de calma y bienestar sensorial en el corazón de San Isidro, Lima. Rindiendo homenaje a la naturaleza, las terapias botánicas y el autocuidado consciente.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#FFF2DE]/10 hover:bg-[#FFF2DE]/20 flex items-center justify-center text-[#FFF2DE] transition-colors"
                aria-label="Instagram de Meraki"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${SPA_INFO.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#FFF2DE]/10 hover:bg-[#FFF2DE]/20 flex items-center justify-center text-[#FFF2DE] transition-colors"
                aria-label="WhatsApp de Meraki"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${SPA_INFO.email}`}
                className="w-9 h-9 rounded-full bg-[#FFF2DE]/10 hover:bg-[#FFF2DE]/20 flex items-center justify-center text-[#FFF2DE] transition-colors"
                aria-label="Correo de Meraki"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Treatments Navigation */}
          <div className="lg:col-span-3">
            <h4 className="font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-[0.2em] text-[#D5A688] mb-5">
              Tratamientos
            </h4>
            <ul className="space-y-3 font-['Montserrat',sans-serif] text-xs font-light text-[#FFF2DE]/85">
              <li>
                <a href="#masajes" className="hover:text-[#D5A688] transition-colors">
                  Masajes Holísticos &amp; Piedras
                </a>
              </li>
              <li>
                <a href="#faciales" className="hover:text-[#D5A688] transition-colors">
                  Facial Glow Botánico &amp; Kobido
                </a>
              </li>
              <li>
                <a href="#tratamientos" className="hover:text-[#D5A688] transition-colors">
                  Envolturas de Barro &amp; Circuito
                </a>
              </li>
              <li>
                <a href="#experiencias-duo" className="hover:text-[#D5A688] transition-colors">
                  Pausa para Dos (Experiencia Parejas)
                </a>
              </li>
              <li>
                <a href="#tratamientos" className="hover:text-[#D5A688] transition-colors">
                  Manicure &amp; Pedicure Spa
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-[0.2em] text-[#D5A688] mb-5">
              Experiencia
            </h4>
            <ul className="space-y-3 font-['Montserrat',sans-serif] text-xs font-light text-[#FFF2DE]/85">
              <li>
                <a href="#ritual-bienvenida" className="hover:text-[#D5A688] transition-colors">
                  El Ritual de Bienvenida
                </a>
              </li>
              <li>
                <a href="#gift-cards" className="hover:text-[#D5A688] transition-colors">
                  Gift Cards &amp; Luxury Box
                </a>
              </li>
              <li>
                <a href="#contacto" className="hover:text-[#D5A688] transition-colors">
                  Atención &amp; Contacto
                </a>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#D5A688] transition-colors">
                  Políticas &amp; Privacidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Location & Attention */}
          <div className="lg:col-span-3">
            <h4 className="font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-[0.2em] text-[#D5A688] mb-5">
              Atención en Lima
            </h4>
            <div className="space-y-3 font-['Montserrat',sans-serif] text-xs font-light text-[#FFF2DE]/85">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D5A688] shrink-0 mt-0.5" />
                <span>{SPA_INFO.coverage}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#D5A688] shrink-0 mt-0.5" />
                <span>WhatsApp: {SPA_INFO.whatsappDisplay}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#D5A688] shrink-0 mt-0.5" />
                <span>{SPA_INFO.email}</span>
              </div>
              <div className="pt-2 text-[11px] text-[#AEC2AE]">
                <span>{SPA_INFO.hours.weekdays}</span>
                <br />
                <span>{SPA_INFO.hours.weekends}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-['Montserrat',sans-serif] text-[#FFF2DE]/65">
          <p>© {new Date().getFullYear()} Meraki Spa Beauty. Todos los derechos reservados. Lima, Perú.</p>
          
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-[#FFF2DE] transition-colors">
              Políticas de Privacidad
            </Link>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#D5A688]" />
              <span>Libro de Reclamaciones</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
