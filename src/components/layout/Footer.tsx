import { Link } from 'react-router-dom';
import { Logo } from '../brand/Logo';
import { SPA_INFO } from '../../data/spaData';
import { Phone, Mail, MapPin, Instagram, Shield, CheckCircle2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#5E765E] text-[#FFF2DE] pt-16 pb-10 border-t border-[#AEC2AE]/20 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-[#AEC2AE]/20">
          
          {/* Brand Col */}
          <div className="lg:col-span-4">
            <Logo variant="stacked" color="light" className="items-start" />
            <p className="font-['Montserrat',sans-serif] text-xs text-[#FFF2DE]/85 mt-6 leading-relaxed max-w-sm font-light">
              Marca liderada por <strong className="font-semibold text-white">Ana Maria Díaz</strong> con más de 10 años de experiencia. Llegamos con todo lo necesario a la comodidad de tu casa y/o trabajo para que disfrutes de un momento especial y te sientas feliz y empoderada.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href={SPA_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#FFF2DE]/10 hover:bg-[#FFF2DE]/20 flex items-center justify-center text-[#FFF2DE] transition-colors"
                aria-label="Instagram de Meraki"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={SPA_INFO.whatsappLink}
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

          {/* Catalog Categories */}
          <div className="lg:col-span-3">
            <h4 className="font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-[0.2em] text-[#D5A688] mb-5">
              Catálogo de Servicios
            </h4>
            <ul className="space-y-3 font-['Montserrat',sans-serif] text-xs font-light text-[#FFF2DE]/85">
              <li>
                <Link to="/catalogo?cat=manos" className="hover:text-[#D5A688] transition-colors">
                  Manos, Acrílicos &amp; Esculpidas
                </Link>
              </li>
              <li>
                <Link to="/catalogo?cat=pies" className="hover:text-[#D5A688] transition-colors">
                  Cuidado de Pies &amp; Jellyparafina
                </Link>
              </li>
              <li>
                <Link to="/catalogo?cat=pestanas" className="hover:text-[#D5A688] transition-colors">
                  Lifting &amp; Extensiones de Pestaña
                </Link>
              </li>
              <li>
                <Link to="/catalogo?cat=depilacion" className="hover:text-[#D5A688] transition-colors">
                  Depilación Facial &amp; Corporal (Cera/Hilo)
                </Link>
              </li>
              <li>
                <Link to="/catalogo?cat=masajes" className="hover:text-[#D5A688] transition-colors">
                  Masajes Relajantes &amp; Reductores
                </Link>
              </li>
              <li>
                <Link to="/catalogo?cat=faciales" className="hover:text-[#D5A688] transition-colors">
                  Faciales Básico, Intermedio &amp; Profundo
                </Link>
              </li>
            </ul>
          </div>

          {/* Subpages Navigation */}
          <div className="lg:col-span-2">
            <h4 className="font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-[0.2em] text-[#D5A688] mb-5">
              Navegación
            </h4>
            <ul className="space-y-3 font-['Montserrat',sans-serif] text-xs font-light text-[#FFF2DE]/85">
              <li>
                <Link to="/" className="hover:text-[#D5A688] transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/catalogo" className="hover:text-[#D5A688] transition-colors">
                  Catálogo Completo
                </Link>
              </li>
              <li>
                <Link to="/como-reservar" className="hover:text-[#D5A688] transition-colors">
                  ¿Cómo Reservar?
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="hover:text-[#D5A688] transition-colors">
                  Sobre Ana Maria Díaz
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="hover:text-[#D5A688] transition-colors">
                  Contacto &amp; WhatsApp
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#D5A688] transition-colors">
                  Políticas del Servicio
                </Link>
              </li>
            </ul>
          </div>

          {/* Attention & Booking Info */}
          <div className="lg:col-span-3">
            <h4 className="font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-[0.2em] text-[#D5A688] mb-5">
              Atención en Estudio &amp; Domicilio
            </h4>
            <div className="space-y-3 font-['Montserrat',sans-serif] text-xs font-light text-[#FFF2DE]/85">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D5A688] shrink-0 mt-0.5" />
                <span><strong>Estudio:</strong> Calle Agustín Gamarra 515, Pueblo Libre, Lima</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D5A688] shrink-0 mt-0.5" />
                <span><strong>A Domicilio:</strong> En tu casa u oficina en Lima (movilidad según distrito)</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#D5A688] shrink-0 mt-0.5" />
                <a
                  href={SPA_INFO.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D5A688] transition-colors"
                >
                  WhatsApp: {SPA_INFO.whatsappDisplay}
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#D5A688] shrink-0 mt-0.5" />
                <span>Reserva con 40% de adelanto</span>
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
          <p>© {new Date().getFullYear()} Meraki Spa • Liderado por Ana Maria Díaz</p>
          
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-[#FFF2DE] transition-colors">
              Términos &amp; Políticas de Reserva
            </Link>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#D5A688]" />
              <span>Protocolos de Bioseguridad</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
