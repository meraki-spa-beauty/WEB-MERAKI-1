import { useEffect } from 'react';
import type { Treatment } from '../../types';
import { X, Clock, Check, Calendar, Sparkles, Phone } from 'lucide-react';
import { SPA_INFO } from '../../data/spaData';

interface TreatmentDetailModalProps {
  treatment: Treatment | null;
  onClose: () => void;
  onBook: (treatmentId: string) => void;
}

export function TreatmentDetailModal({ treatment, onClose, onBook }: TreatmentDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (treatment) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [treatment, onClose]);

  if (!treatment) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-treatment-title"
    >
      <div
        className="relative w-full max-w-3xl bg-[#FFF2DE] rounded-3xl overflow-hidden shadow-2xl border border-[#5E765E]/20 max-h-[90vh] flex flex-col text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#111111] flex items-center justify-center shadow-md transition-colors cursor-pointer"
          aria-label="Cerrar detalle de tratamiento"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto">
          {/* Header Image with Gradient */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-[#E6DACD]">
            <img
              src={treatment.image}
              alt={treatment.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FFF2DE] via-[#FFF2DE]/20 to-black/30" />

            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#5E765E] text-[#FFF2DE] text-[10px] font-['Montserrat',sans-serif] uppercase font-bold tracking-widest mb-2 shadow">
                  {treatment.categoryLabel}
                </span>
                <h2 id="modal-treatment-title" className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl md:text-5xl font-normal text-[#111111] leading-tight">
                  {treatment.title}
                </h2>
                <p className="font-['Montserrat',sans-serif] text-xs text-[#111111]/75 font-medium mt-1">
                  {treatment.subtitle}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-wider text-[#111111]/60 block">
                  Inversión
                </span>
                <span className="font-['Montserrat',sans-serif] text-2xl sm:text-3xl font-bold text-[#5E765E]">
                  S/. {treatment.pricePEN}
                </span>
              </div>
            </div>
          </div>

          {/* Details Content */}
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-white/70 border border-[#5E765E]/15 text-xs font-['Montserrat',sans-serif]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#5E765E]" />
                <span className="font-semibold text-[#111111]">Duración:</span>
                <span className="text-[#111111]/80">{treatment.durationLabel} ({treatment.durationMin} minutos)</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D5A688]" />
                <span className="font-semibold text-[#111111]">Ritual de Bienvenida:</span>
                <span className="text-[#111111]/80">Incluido de cortesía</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-[0.16em] text-[#5E765E] mb-3">
                Descripción de la Experiencia
              </h3>
              <p className="font-['Montserrat',sans-serif] text-sm text-[#111111]/80 font-light leading-relaxed">
                {treatment.fullDescription}
              </p>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-[0.16em] text-[#5E765E] mb-3">
                Beneficios Principales
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {treatment.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/50 border border-[#5E765E]/10">
                    <div className="w-5 h-5 rounded-full bg-[#5E765E]/10 flex items-center justify-center text-[#5E765E] shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-['Montserrat',sans-serif] text-[#111111]/85 leading-snug">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* What is included */}
            <div>
              <h3 className="font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-[0.16em] text-[#5E765E] mb-3">
                Qué incluye tu sesión
              </h3>
              <ul className="space-y-2">
                {treatment.includes.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-['Montserrat',sans-serif] text-[#111111]/75">
                    <span className="text-[#5E765E] font-bold">•</span>
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Bar */}
            <div className="pt-6 border-t border-[#5E765E]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <a
                href={`https://wa.me/${SPA_INFO.whatsappNumber}?text=Hola%20Meraki,%20deseo%20reservar%20el%20tratamiento:%20${encodeURIComponent(treatment.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-[#5E765E] text-[#5E765E] hover:bg-[#5E765E]/10 text-xs font-['Montserrat',sans-serif] font-semibold uppercase tracking-wider transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Consultar por WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBook(treatment.id);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-[0.16em] shadow-lg transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#D5A688]" />
                <span>Reservar este Ritual</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
