import { useState, useEffect } from 'react';
import { TREATMENTS } from '../../data/treatments';
import { SPA_INFO } from '../../data/spaData';
import { X, CheckCircle2, Sparkles, MessageCircle } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTreatmentId?: string;
}

type TherapistPreference = 'any' | 'female' | 'specialist';

export function BookingModal({ isOpen, onClose, preselectedTreatmentId }: BookingModalProps) {
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string>(
    preselectedTreatmentId || TREATMENTS[0]?.id || ''
  );

  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);

    return today.toISOString().split('T')[0];
  });

  const [timeSlot, setTimeSlot] = useState<string>('15:00');
  const [peopleCount, setPeopleCount] = useState<1 | 2>(1);
  const [therapistPref, setTherapistPref] = useState<TherapistPreference>('any');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (preselectedTreatmentId) {
      setSelectedTreatmentId(preselectedTreatmentId);
    }
  }, [preselectedTreatmentId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentTreatment = TREATMENTS.find((t) => t.id === selectedTreatmentId) || TREATMENTS[0];
  const timeSlots = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:00'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const generateWhatsAppMessage = () => {
    const text = `🌿 *SOLICITUD DE RESERVA — MERAKI SPA BEAUTY* 🌿
━━━━━━━━━━━━━━━━━━━━
✨ *Tratamiento:* ${currentTreatment?.title}
⏱ *Duración:* ${currentTreatment?.durationLabel}
💰 *Inversión estimada:* S/. ${currentTreatment?.pricePEN * peopleCount}
📅 *Fecha preferida:* ${date}
⏰ *Hora:* ${timeSlot}
👥 *Personas:* ${peopleCount === 1 ? '1 persona (Individual)' : '2 personas (Experiencia Dúo)'}
👤 *Nombre:* ${clientName}
📱 *Teléfono:* ${clientPhone}
📧 *Email:* ${clientEmail || 'No especificado'}
${specialRequests ? `📝 *Notas/Ocasión:* ${specialRequests}` : ''}
━━━━━━━━━━━━━━━━━━━━
Solicito confirmación de disponibilidad para esta sesión en Lima, Perú.`;

    return encodeURIComponent(text);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-booking-title"
    >
      <div
        className="relative w-full max-w-2xl bg-[#FFF2DE] rounded-3xl overflow-hidden shadow-2xl border border-[#5E765E]/20 max-h-[92vh] flex flex-col text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#111111] flex items-center justify-center shadow transition-colors cursor-pointer"
          aria-label="Cerrar modal de reserva"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-[#5E765E] text-[#FFF2DE] p-6 sm:p-7 relative">
          <span className="text-[10px] font-['Montserrat',sans-serif] uppercase font-bold tracking-[0.24em] text-[#D5A688] block mb-1">
            Agenda tu Experiencia
          </span>
          <h2 id="modal-booking-title" className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl font-normal leading-tight">
            Reservar Cita en Meraki
          </h2>
          <p className="font-['Montserrat',sans-serif] text-xs font-light text-[#FFF2DE]/80 mt-1">
            Atención personalizada en Lima · Sin pago adelantado requerido para solicitar
          </p>
        </div>

        {/* Scrollable Form */}
        <div className="overflow-y-auto p-6 sm:p-8">
          {isSubmitted ? (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#5E765E]/15 text-[#5E765E] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="font-['Cormorant_Garamond',serif] text-3xl font-normal text-[#111111]">
                  ¡Solicitud Registrada con Éxito!
                </h3>
                <p className="font-['Montserrat',sans-serif] text-xs text-[#111111]/75 max-w-md mx-auto mt-2 leading-relaxed">
                  Gracias, <strong className="font-semibold">{clientName}</strong>. Hemos recibido tu solicitud para{' '}
                  <strong className="font-semibold">{currentTreatment?.title}</strong> el día{' '}
                  <strong className="font-semibold">{date}</strong> a las{' '}
                  <strong className="font-semibold">{timeSlot}</strong>.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/70 border border-[#5E765E]/15 max-w-md mx-auto text-left text-xs font-['Montserrat',sans-serif] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#111111]/60">Tratamiento:</span>
                  <span className="font-semibold text-[#111111]">{currentTreatment?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#111111]/60">Duración:</span>
                  <span className="font-semibold text-[#111111]">{currentTreatment?.durationLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#111111]/60">Total Estimado:</span>
                  <span className="font-bold text-[#5E765E]">S/. {currentTreatment?.pricePEN * peopleCount}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={`https://wa.me/${SPA_INFO.whatsappNumber}?text=${generateWhatsAppMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-7 py-3.5 rounded-full text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider shadow-md transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar por WhatsApp a Meraki</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-[#5E765E]/30 text-[#111111] text-xs font-['Montserrat',sans-serif] uppercase tracking-wider font-medium hover:bg-white"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Treatment Selector */}
              <div>
                <label className="block text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#5E765E] mb-2">
                  1. Tratamiento o Ritual
                </label>
                <select
                  value={selectedTreatmentId}
                  onChange={(e) => setSelectedTreatmentId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E]"
                  required
                >
                  {TREATMENTS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} — {t.durationLabel} (S/. {t.pricePEN})
                    </option>
                  ))}
                </select>
              </div>

              {/* People Count & Therapist Preference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#5E765E] mb-2">
                    2. Modalidad
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPeopleCount(1)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-['Montserrat',sans-serif] border transition-colors ${
                        peopleCount === 1
                          ? 'bg-[#5E765E] text-[#FFF2DE] border-[#5E765E] font-medium'
                          : 'bg-white border-[#5E765E]/20 text-[#111111]'
                      }`}
                    >
                      Individual (1)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPeopleCount(2)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-['Montserrat',sans-serif] border transition-colors ${
                        peopleCount === 2
                          ? 'bg-[#5E765E] text-[#FFF2DE] border-[#5E765E] font-medium'
                          : 'bg-white border-[#5E765E]/20 text-[#111111]'
                      }`}
                    >
                      Dúo / Pareja (2)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#5E765E] mb-2">
                    Preferencia de Terapeuta
                  </label>
                  <select
                    value={therapistPref}
                    onChange={(e) => {
                      const val = e.target.value;

                      if (val === 'female' || val === 'specialist') {
                        setTherapistPref(val);
                      } else {
                        setTherapistPref('any');
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E]"
                  >
                    <option value="any">Cualquiera disponible</option>
                    <option value="female">Terapeuta Femenina</option>
                    <option value="specialist">Especialista en Tejido Profundo</option>
                  </select>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#5E765E] mb-2">
                    3. Fecha Deseada
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#5E765E] mb-2">
                    Horario Preferido
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E]"
                    required
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot} hrs
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Client Personal Information */}
              <div className="border-t border-[#5E765E]/15 pt-5 space-y-4">
                <span className="block text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#5E765E]">
                  4. Tus Datos de Contacto
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Nombre y Apellidos *"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E]"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      placeholder="WhatsApp / Teléfono * (ej: 987654321)"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Correo Electrónico (opcional)"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E]"
                  />
                </div>

                <div>
                  <textarea
                    rows={2}
                    placeholder="Observaciones, ocasión especial (cumpleaños, aniversario) o preferencias de presión..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E]"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-[#5E765E]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left">
                  <span className="text-[10px] text-[#111111]/60 uppercase tracking-wider block">
                    Inversión estimada:
                  </span>
                  <span className="text-xl font-bold font-['Montserrat',sans-serif] text-[#5E765E]">
                    S/. {currentTreatment ? currentTreatment.pricePEN * peopleCount : 0}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-[0.16em] shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#D5A688]" />
                  <span>Confirmar Solicitud de Cita</span>
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}
