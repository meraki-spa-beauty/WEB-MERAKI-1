import { MapPin, Phone, Clock, Gift } from 'lucide-react';
import { SPA_INFO } from '../../data/spaData';

interface TopBarProps {
  onOpenGiftCardModal?: () => void;
}

export function TopBar({ onOpenGiftCardModal }: TopBarProps) {
  return (
    <div className="w-full bg-[#5E765E] text-[#FFF2DE] text-xs font-['Montserrat',sans-serif] tracking-wider py-2 px-4 border-b border-[#5E765E]/40 z-40 hidden md:block">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
            <MapPin className="w-3.5 h-3.5 text-[#D5A688]" />
            <span>{SPA_INFO.coverage}</span>
          </div>
          <div className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
            <Clock className="w-3.5 h-3.5 text-[#D5A688]" />
            <span>{SPA_INFO.hours.weekdays}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <a
            href={SPA_INFO.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#D5A688] transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#D5A688]" />
            <span>WhatsApp: {SPA_INFO.whatsappDisplay}</span>
          </a>
          <button
            type="button"
            onClick={onOpenGiftCardModal}
            className="flex items-center gap-1.5 hover:text-[#D5A688] transition-colors text-xs font-medium uppercase tracking-widest cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5 text-[#D5A688]" />
            <span>Gift Cards</span>
          </button>
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
