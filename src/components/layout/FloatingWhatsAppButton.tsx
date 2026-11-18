import { MessageCircle } from 'lucide-react';
import { SPA_INFO } from '../../data/spaData';
import { trackMetaContact } from '../../utils/metaPixel';
import { trackTikTokContact } from '../../utils/tiktokPixel';

interface FloatingWhatsAppButtonProps {
  customMessage?: string;
}

export function FloatingWhatsAppButton({ customMessage }: FloatingWhatsAppButtonProps) {
  const defaultMessage = 'Hola Meraki Spa, deseo solicitar información y reservar una experiencia.';
  const message = customMessage || defaultMessage;
  const whatsappUrl = `${SPA_INFO.whatsappLink}?text=${encodeURIComponent(message)}`;

  return (
    <aside aria-label="Contacto directo por WhatsApp" className="fixed bottom-6 right-6 z-40">
      <a
        id="btn-floating-whatsapp"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          trackMetaContact({ content_name: 'Botón Flotante WhatsApp' });
          trackTikTokContact({ content_name: 'Botón Flotante WhatsApp' });
        }}
        aria-label={`Contactar por WhatsApp al ${SPA_INFO.whatsappDisplay}`}
        className="group relative flex items-center gap-3 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_24px_rgba(37,211,102,0.35)] focus:outline-none focus:ring-4 focus:ring-[#25D366]/40 cursor-pointer"
      >
        <span className="relative flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-white drop-shadow-sm" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FFF2DE] rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FFF2DE] rounded-full" />
        </span>

        <span className="hidden sm:inline-block font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-wider text-white">
          Chatea con nosotros
        </span>
      </a>
    </aside>
  );
}
