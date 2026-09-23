import { useState, useEffect, useMemo } from 'react';
import { CATALOG_SERVICES, CATEGORIES_DATA } from '../../data/catalog';
import { SPA_INFO } from '../../data/spaData';
import type { CatalogService, ServicePriceOption } from '../../types';
import {
  X,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  Copy,
  Check,
  ArrowLeft,
  ShieldCheck,
  Building,
  Home as HomeIcon,
  MapPin
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedServiceId?: string;
}

const LIMA_DISTRICTS = [
  'Miraflores',
  'San Isidro',
  'Santiago de Surco',
  'San Borja',
  'La Molina',
  'Barranco',
  'Magdalena del Mar',
  'Jesús María',
  'San Miguel',
  'Lince',
  'Pueblo Libre',
  'Surquillo',
  'San Luis',
  'Chorrillos',
  'Breña',
  'Cercado de Lima',
  'Ate',
  'Los Olivos',
  'San Juan de Miraflores',
  'Otro distrito en Lima'
];

const TIME_SLOTS = [
  '09:00',
  '10:30',
  '12:00',
  '13:30',
  '15:00',
  '16:30',
  '18:00',
  '19:30'
];

export function BookingModal({ isOpen, onClose, preselectedServiceId }: BookingModalProps) {
  // Service selection state
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    preselectedServiceId || CATALOG_SERVICES[0]?.id || 'manos-esmalte-gel'
  );

  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);

  // Logistics & Location state
  const [locationType, setLocationType] = useState<'estudio' | 'casa' | 'trabajo'>('estudio');
  const [district, setDistrict] = useState<string>('Pueblo Libre');
  const [address, setAddress] = useState<string>('');

  // Date and Time state
  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);

    return d.toISOString().split('T')[0];
  });

  const [timeSlot, setTimeSlot] = useState<string>('15:00');

  // Client Details state
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');

  // UI state
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Sync preselectedServiceId
  useEffect(() => {
    if (preselectedServiceId) {
      const found = CATALOG_SERVICES.find((s) => s.id === preselectedServiceId);

      if (found) {
        setSelectedServiceId(found.id);
        setSelectedCategory(found.category);
        setSelectedOptionIndex(0);
      }
    }
  }, [preselectedServiceId]);

  // Handle ESC and body scroll lock
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

  // Current active service
  const currentService: CatalogService = useMemo(() => {
    return (
      CATALOG_SERVICES.find((s) => s.id === selectedServiceId) ||
      CATALOG_SERVICES[0]
    );
  }, [selectedServiceId]);

  // Services available for the selected category filter
  const filteredServices = useMemo(() => {
    if (selectedCategory === 'todos') return CATALOG_SERVICES;

    return CATALOG_SERVICES.filter((s) => s.category === selectedCategory);
  }, [selectedCategory]);

  // Price calculations
  const priceCalculation = useMemo(() => {
    let basePrice = 0;
    let optionLabel: string | null = null;

    if (currentService.priceOptions && currentService.priceOptions.length > 0) {
      const opt = currentService.priceOptions[selectedOptionIndex] || currentService.priceOptions[0];
      basePrice = opt.pricePEN;
      optionLabel = opt.label;
    } else if (currentService.pricePEN) {
      basePrice = currentService.pricePEN;
    }

    const advancePayment = Math.round(basePrice * 0.4);
    const balanceRemaining = basePrice - advancePayment;

    return {
      basePrice,
      optionLabel,
      advancePayment,
      balanceRemaining
    };
  }, [currentService, selectedOptionIndex]);

  if (!isOpen) return null;

  // Handle service change
  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedOptionIndex(0);
    const s = CATALOG_SERVICES.find((srv) => srv.id === serviceId);

    if (s && selectedCategory !== 'todos' && s.category !== selectedCategory) {
      setSelectedCategory(s.category);
    }
  };

  // Build WhatsApp consolidated message text
  const buildConsolidatedMessage = () => {
    const isStudio = locationType === 'estudio';

    const lines = [
      '🌿 *SOLICITUD DE RESERVA — MERAKI SPA* 🌿',
      '━━━━━━━━━━━━━━━━━━━━',
      `✨ *Servicio:* ${currentService.name}${priceCalculation.optionLabel ? ` (${priceCalculation.optionLabel})` : ''}`,
      `🏷️ *Categoría:* ${currentService.categoryLabel} — ${currentService.subcategory}`,
      `💰 *Tarifa del servicio:* S/ ${priceCalculation.basePrice}`,
      `💳 *Adelanto de confirmación (40%):* S/ ${priceCalculation.advancePayment}`,
      `💵 *Saldo al finalizar atención (60%):* S/ ${priceCalculation.balanceRemaining}`,
      '━━━━━━━━━━━━━━━━━━━━',
      `📍 *Modalidad:* ${isStudio ? 'Presencial en Estudio (Pueblo Libre)' : locationType === 'casa' ? 'En Casa / Domicilio' : 'En Oficina / Trabajo'}`,
      isStudio
        ? '🏠 *Dirección del Estudio:* Calle Agustín Gamarra 515, Pueblo Libre, Lima'
        : `📌 *Distrito en Lima:* ${district}`,
      !isStudio ? (address.trim() ? `🏠 *Dirección/Ref:* ${address.trim()}` : '🏠 *Dirección/Ref:* Por coordinar en chat') : '',
      `📅 *Fecha deseada:* ${date}`,
      `⏰ *Horario preferido:* ${timeSlot} hrs`,
      '━━━━━━━━━━━━━━━━━━━━',
      `👤 *Cliente:* ${clientName.trim()}`,
      `📱 *WhatsApp:* ${clientPhone.trim()}`,
      clientEmail.trim() ? `📧 *Correo:* ${clientEmail.trim()}` : '📧 *Correo:* No especificado',
      specialNotes.trim() ? `📝 *Observaciones/Alergias:* ${specialNotes.trim()}` : '',
      '━━━━━━━━━━━━━━━━━━━━',
      isStudio
        ? '¡Hola Meraki! Adjunto mi solicitud de cita presencial en su estudio (Calle Agustín Gamarra 515, Pueblo Libre) para verificar disponibilidad de agenda.'
        : '¡Hola Meraki! Adjunto mi solicitud de cita a domicilio para verificar disponibilidad de agenda y coordinar el costo de movilidad a mi distrito.'
    ].filter(Boolean);

    return lines.join('\n');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildConsolidatedMessage());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const whatsappUrl = `https://wa.me/${SPA_INFO.whatsappNumber}?text=${encodeURIComponent(
    buildConsolidatedMessage()
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
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
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#111111] flex items-center justify-center shadow-md transition-all cursor-pointer hover:scale-105"
          aria-label="Cerrar formulario de reserva"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-[#5E765E] text-[#FFF2DE] p-6 sm:p-7 relative border-b border-[#D5A688]/30">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#D5A688]" />
            <span className="text-[10px] font-['Montserrat',sans-serif] uppercase font-bold tracking-[0.24em] text-[#D5A688]">
              Agenda tu Experiencia Personalizada
            </span>
          </div>
          <h2
            id="modal-booking-title"
            className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl font-normal leading-tight text-white"
          >
            Reservar Cita en Meraki
          </h2>
          <p className="font-['Montserrat',sans-serif] text-xs font-light text-[#FFF2DE]/90 mt-1">
            Atención presencial en estudio (Pueblo Libre) y servicio a domicilio u oficina en Lima
          </p>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1">
          {isSubmitted ? (
            /* =========================================================================
               CONFIRMATION / WHATSAPP CONSOLIDATED VIEW
               ========================================================================= */
            <div className="py-4 space-y-6 animate-fade-in text-center">
              <div className="w-16 h-16 rounded-full bg-[#5E765E]/15 text-[#5E765E] flex items-center justify-center mx-auto ring-8 ring-[#5E765E]/10">
                <CheckCircle2 className="w-10 h-10 text-[#5E765E]" />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-[#5E765E] block mb-1">
                  Paso Final: Envío por WhatsApp
                </span>
                <h3 className="font-['Cormorant_Garamond',serif] text-3xl font-normal text-[#111111]">
                  ¡Consolidado Listo para Enviar!
                </h3>
                <p className="font-['Montserrat',sans-serif] text-xs text-[#111111]/75 max-w-md mx-auto mt-2 leading-relaxed">
                  Gracias, <strong className="font-semibold text-[#111111]">{clientName}</strong>. Hemos preparado el resumen completo de tu reserva. Presiona el botón verde a continuación para abrir WhatsApp y enviarnos tu solicitud para confirmar disponibilidad y movilidad.
                </p>
              </div>

              {/* Consolidated Summary Card */}
              <div className="bg-white/80 rounded-2xl border border-[#5E765E]/20 p-5 text-left text-xs font-['Montserrat',sans-serif] space-y-3.5 shadow-sm max-w-lg mx-auto">
                <div className="flex items-center justify-between border-b border-[#5E765E]/15 pb-2.5">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[#5E765E]">
                    Resumen de la Solicitud
                  </span>
                  <span className="text-[10px] text-[#111111]/60 font-medium">
                    Lima, Perú
                  </span>
                </div>

                <div className="space-y-2 text-[#111111]">
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-[#111111]/60">Servicio:</span>
                    <span className="font-semibold text-right text-[#111111]">
                      {currentService.name}
                      {priceCalculation.optionLabel && (
                        <span className="block text-[11px] font-normal text-[#5E765E]">
                          {priceCalculation.optionLabel}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#111111]/60">Modalidad:</span>
                    <span className="font-medium text-right">
                      {locationType === 'estudio' ? 'En Estudio (Pueblo Libre)' : locationType === 'casa' ? `A Domicilio • ${district}` : `En Oficina • ${district}`}
                    </span>
                  </div>

                  {locationType === 'estudio' ? (
                    <div className="flex justify-between items-start gap-3">
                      <span className="text-[#111111]/60">Dirección Estudio:</span>
                      <span className="font-semibold text-right max-w-xs text-[#5E765E]">Calle Agustín Gamarra 515, Pueblo Libre</span>
                    </div>
                  ) : address.trim() ? (
                    <div className="flex justify-between items-start gap-3">
                      <span className="text-[#111111]/60">Dirección / Ref:</span>
                      <span className="font-medium text-right max-w-xs">{address.trim()}</span>
                    </div>
                  ) : null}

                  <div className="flex justify-between items-center">
                    <span className="text-[#111111]/60">Fecha &amp; Hora sugerida:</span>
                    <span className="font-semibold text-[#5E765E]">
                      {date} a las {timeSlot} hrs
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#111111]/60">Cliente:</span>
                    <span className="font-medium">{clientName} ({clientPhone})</span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="pt-3 border-t border-[#5E765E]/15 bg-[#FFF2DE]/40 -mx-5 -mb-5 p-4 rounded-b-2xl space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#111111]/70">Inversión del servicio:</span>
                    <span className="font-semibold text-[#111111]">S/. {priceCalculation.basePrice}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-[#5E765E] font-medium">
                    <span>Adelanto de confirmación (40%):</span>
                    <span className="font-bold">S/. {priceCalculation.advancePayment}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-[#111111]/60">
                    <span>Saldo al concluir atención (60%):</span>
                    <span>S/. {priceCalculation.balanceRemaining}</span>
                  </div>
                  <p className="text-[10px] text-[#111111]/60 italic pt-1 border-t border-[#5E765E]/10">
                    * Movilidad sujeta a coordinación según distrito en Lima. La confirmación se sella con el abono del 40%.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-lg mx-auto">
                <a
                  id="btn-confirm-send-whatsapp"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-6 py-4 rounded-full text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Enviar por WhatsApp a Meraki</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full border border-[#5E765E]/30 bg-white hover:bg-[#FFF2DE] text-[#111111] text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-[#5E765E]" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#5E765E]" />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#5E765E] hover:underline font-medium cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Modificar datos de la reserva</span>
                </button>
              </div>
            </div>
          ) : (
            /* =========================================================================
               BOOKING FORM VIEW (Adapted to Meraki Catalog)
               ========================================================================= */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Select Service from Catalog */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#5E765E]">
                    1. Elige tu Servicio del Catálogo
                  </label>
                  <span className="text-[10px] text-[#111111]/60 font-light">
                    {CATALOG_SERVICES.length} servicios oficiales
                  </span>
                </div>

                {/* Category quick tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-[11px]">
                  {CATEGORIES_DATA.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);

                        if (cat.id !== 'todos') {
                          const firstInCat = CATALOG_SERVICES.find((s) => s.category === cat.id);

                          if (firstInCat) {
                            setSelectedServiceId(firstInCat.id);
                            setSelectedOptionIndex(0);
                          }
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-[#5E765E] text-[#FFF2DE] font-semibold shadow-xs'
                          : 'bg-white/70 hover:bg-white text-[#111111]/80 border border-[#5E765E]/15'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Main Service Selector */}
                <select
                  value={selectedServiceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#5E765E]/25 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E] shadow-2xs font-medium cursor-pointer"
                  required
                >
                  {filteredServices.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      [{srv.categoryLabel}] {srv.name} — S/. {srv.pricePEN || (srv.priceOptions ? srv.priceOptions[0].pricePEN : '')} ({srv.subcategory})
                    </option>
                  ))}
                </select>

                {/* Service Variant / Price Options (if applicable) */}
                {currentService.priceOptions && currentService.priceOptions.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-white/70 border border-[#5E765E]/20 space-y-2">
                    <span className="block text-[10px] font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#5E765E]">
                      Selecciona la opción / duración:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentService.priceOptions.map((opt: ServicePriceOption, idx: number) => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => setSelectedOptionIndex(idx)}
                          className={`p-2.5 rounded-lg text-left text-xs border transition-all cursor-pointer ${
                            selectedOptionIndex === idx
                              ? 'bg-[#5E765E] text-[#FFF2DE] border-[#5E765E] font-medium shadow-2xs'
                              : 'bg-white text-[#111111] border-[#5E765E]/20 hover:border-[#5E765E]/40'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{opt.label}</span>
                            <span className={selectedOptionIndex === idx ? 'text-[#D5A688] font-bold' : 'text-[#5E765E] font-bold'}>
                              S/. {opt.pricePEN}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Location & District */}
              <div className="border-t border-[#5E765E]/15 pt-5 space-y-4">
                <label className="block text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#5E765E]">
                  2. Lugar y Modalidad en Lima
                </label>

                {/* Modalidad selector: Estudio vs Casa vs Trabajo */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setLocationType('estudio');
                      setDistrict('Pueblo Libre');
                    }}
                    className={`py-3 px-3 rounded-xl text-xs font-['Montserrat',sans-serif] border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      locationType === 'estudio'
                        ? 'bg-[#5E765E] text-[#FFF2DE] border-[#5E765E] font-semibold shadow-2xs'
                        : 'bg-white border-[#5E765E]/20 text-[#111111] hover:bg-white/80'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-[#D5A688]" />
                    <span>En Estudio (Pueblo Libre)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocationType('casa')}
                    className={`py-3 px-3 rounded-xl text-xs font-['Montserrat',sans-serif] border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      locationType === 'casa'
                        ? 'bg-[#5E765E] text-[#FFF2DE] border-[#5E765E] font-semibold shadow-2xs'
                        : 'bg-white border-[#5E765E]/20 text-[#111111] hover:bg-white/80'
                    }`}
                  >
                    <HomeIcon className="w-4 h-4" />
                    <span>En Casa / Domicilio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocationType('trabajo')}
                    className={`py-3 px-3 rounded-xl text-xs font-['Montserrat',sans-serif] border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      locationType === 'trabajo'
                        ? 'bg-[#5E765E] text-[#FFF2DE] border-[#5E765E] font-semibold shadow-2xs'
                        : 'bg-white border-[#5E765E]/20 text-[#111111] hover:bg-white/80'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span>En Oficina / Trabajo</span>
                  </button>
                </div>

                {locationType === 'estudio' ? (
                  /* Studio Location Badge */
                  <div className="bg-[#5E765E]/10 border border-[#5E765E]/25 rounded-2xl p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#5E765E] text-[#FFF2DE] flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-[#D5A688]" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E765E]">
                          Sede Principal Meraki
                        </span>
                        <span className="text-[10px] bg-[#5E765E]/15 text-[#5E765E] font-semibold px-2 py-0.5 rounded-full">
                          Sin costo de movilidad
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#111111] mt-1">
                        Calle Agustín Gamarra 515, Pueblo Libre, Lima
                      </p>
                      <p className="text-[11px] text-[#111111]/70 font-light mt-0.5">
                        Te recibimos en un ambiente privado, relajante y equipado con instrumental esterilizado de grado profesional.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* District & Address Grid for Home/Work */
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-[#111111]/70 uppercase tracking-wider mb-1 font-semibold">
                          Distrito en Lima *
                        </label>
                        <select
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E]"
                          required
                        >
                          {LIMA_DISTRICTS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-[#111111]/70 uppercase tracking-wider mb-1 font-semibold">
                          Dirección o Referencia
                        </label>
                        <input
                          type="text"
                          placeholder="Calle, nro, dpto o referencia..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#5E765E] bg-white/60 p-2.5 rounded-xl border border-[#5E765E]/15">
                      <MapPin className="w-4 h-4 shrink-0 text-[#D5A688]" />
                      <span>
                        El costo de movilidad se calcula de forma transparente según tu distrito y se coordina vía WhatsApp.
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Step 3: Preferred Date & Time */}
              <div className="border-t border-[#5E765E]/15 pt-5 space-y-3">
                <label className="block text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#5E765E]">
                  3. Fecha y Horario Sugerido
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#111111]/70 uppercase tracking-wider mb-1 font-semibold">
                      Fecha Deseada *
                    </label>
                    <input
                      type="date"
                      value={date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#111111]/70 uppercase tracking-wider mb-1 font-semibold">
                      Horario Sugerido *
                    </label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E]"
                      required
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot} hrs
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 4: Client Contact Information */}
              <div className="border-t border-[#5E765E]/15 pt-5 space-y-3">
                <label className="block text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#5E765E]">
                  4. Tus Datos de Contacto
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Nombre y Apellidos *"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E]"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      placeholder="WhatsApp / Celular * (ej: 993 067 291)"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E]"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E]"
                  />
                </div>

                <div>
                  <textarea
                    rows={2}
                    placeholder="Observaciones, retiro de sistema previo, tipo de uña/piel o requerimientos especiales..."
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E]"
                  />
                </div>
              </div>

              {/* Step 5: Financial Policy & Submit Button */}
              <div className="pt-4 border-t border-[#5E765E]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#111111]/70 uppercase tracking-wider font-semibold">
                      Tarifa del servicio:
                    </span>
                    <span className="text-lg font-bold font-['Montserrat',sans-serif] text-[#5E765E]">
                      S/. {priceCalculation.basePrice}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#5E765E] font-medium block">
                    Adelanto de confirmación (40%): <strong>S/. {priceCalculation.advancePayment}</strong>
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-[0.16em] shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#D5A688]" />
                  <span>Generar Solicitud de Cita</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-[#111111]/60 pt-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#5E765E] shrink-0" />
                  <span>
                    Sin cobro automático. La reserva se formaliza al abonar el 40% vía WhatsApp.
                  </span>
                </div>
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#5E765E] transition-colors"
                >
                  Políticas &amp; Privacidad
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
