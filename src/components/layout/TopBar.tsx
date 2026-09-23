import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, BookOpen, ShieldCheck } from 'lucide-react';
import { SPA_INFO } from '../../data/spaData';

export function TopBar() {
  return (
    <div className="w-full bg-[#5E765E] text-[#FFF2DE] text-xs font-['Montserrat',sans-serif] tracking-wider py-2 px-4 border-b border-[#5E765E]/40 z-40 hidden md:block">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 opacity-90">
            <MapPin className="w-3.5 h-3.5 text-[#D5A688]" />
            <span>Estudio en Pueblo Libre (C. Agustín Gamarra 515) &amp; A Domicilio</span>
          </div>
          <div className="flex items-center gap-1.5 opacity-90">
            <Clock className="w-3.5 h-3.5 text-[#D5A688]" />
            <span>{SPA_INFO.hours.weekdays}</span>
          </div>
          <div className="flex items-center gap-1.5 opacity-90">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D5A688]" />
            <span>Protocolos de Bioseguridad</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link
            to="/catalogo"
            className="flex items-center gap-1.5 hover:text-[#D5A688] transition-colors text-xs font-medium uppercase tracking-widest cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#D5A688]" />
            <span>Ver Catálogo</span>
          </Link>
          <a
            href={SPA_INFO.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#D5A688] transition-colors font-medium"
          >
            <Phone className="w-3.5 h-3.5 text-[#D5A688]" />
            <span>WhatsApp: {SPA_INFO.whatsappDisplay}</span>
          </a>
          <a
            href={SPA_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FFF2DE] hover:text-[#D5A688] transition-colors text-[11px] tracking-widest font-light"
          >
            {SPA_INFO.instagram}
          </a>
        </div>
      </div>
    </div>
  );
}
