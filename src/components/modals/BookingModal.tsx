import { useState, useEffect, useMemo, useRef } from 'react';
import { CATALOG_SERVICES, CATEGORIES_DATA } from '../../data/catalog';
import { SPA_INFO } from '../../data/spaData';
import type { ServicePriceOption } from '../../types';
import { trackMetaLead, trackMetaSchedule } from '../../utils/metaPixel';
import { trackTikTokSubmitForm, trackTikTokCompleteRegistration } from '../../utils/tiktokPixel';
import { syncLeadToGoogleSheets } from '../../utils/googleSheetsSync';
import {
  X,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Building,
  Home as HomeIcon,
  MapPin,
  Plus,
  Trash2,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  Smartphone
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedServiceId?: string;
}

export interface SelectedServiceItem {
  instanceId: string;
  serviceId: string;
  optionIndex: number;
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
  // Wizard 4-Step State: 1 = Servicios, 2 = Modalidad & Fecha, 3 = Datos, 4 = Cómo Reservar & Adelanto Yape
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isYapeCopied, setIsYapeCopied] = useState<boolean>(false);

  // Multi-Service Cart State
  const [selectedServices, setSelectedServices] = useState<SelectedServiceItem[]>(() => {
    const initialId = preselectedServiceId || CATALOG_SERVICES[0]?.id || 'manos-esmalte-gel';

    return [
      {
        instanceId: `item-${Date.now()}-1`,
        serviceId: initialId,
        optionIndex: 0
      }
    ];
  });

  // Selector state for adding another service
  const [addCategoryFilter, setAddCategoryFilter] = useState<string>('todos');
  const [serviceToAddId, setServiceToAddId] = useState<string>(CATALOG_SERVICES[0]?.id || '');
  const [showAddServiceBox, setShowAddServiceBox] = useState<boolean>(false);

  // Logistics & Location state (Step 2)
  const [locationType, setLocationType] = useState<'estudio' | 'casa' | 'trabajo'>('estudio');
  const [district, setDistrict] = useState<string>('Pueblo Libre');
  const [address, setAddress] = useState<string>('');

  // Date and Time state (Step 2)
  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);

    return d.toISOString().split('T')[0];
  });

  const [timeSlot, setTimeSlot] = useState<string>('15:00');

  // Client Details state (Step 3)
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');

  // Submission & UI feedback state
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [stepError, setStepError] = useState<string | null>(null);

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setIsSubmitted(false);
      setStepError(null);

      if (preselectedServiceId) {
        setSelectedServices([
          {
            instanceId: `item-${Date.now()}-initial`,
            serviceId: preselectedServiceId,
            optionIndex: 0
          }
        ]);
      }
    }
  }, [isOpen, preselectedServiceId]);

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

  // Calculation helpers for service items
  const getItemDetails = (item: SelectedServiceItem) => {
    const service = CATALOG_SERVICES.find((s) => s.id === item.serviceId) || CATALOG_SERVICES[0];
    let price = service.pricePEN || 0;
    let optionLabel: string | undefined;

    if (service.priceOptions && service.priceOptions.length > 0) {
      const opt = service.priceOptions[item.optionIndex] || service.priceOptions[0];
      price = opt.pricePEN;
      optionLabel = opt.label;
    }

    return { service, price, optionLabel };
  };

  // Consolidated financial totals for all selected services
  const financialTotals = useMemo(() => {
    let totalPrice = 0;

    const itemsDetailed = selectedServices.map((item) => {
      const details = getItemDetails(item);
      totalPrice += details.price;

      return {
        ...item,
        ...details
      };
    });

    const advancePayment = Math.round(totalPrice * 0.4);
    const balanceRemaining = totalPrice - advancePayment;

    return {
      totalPrice,
      advancePayment,
      balanceRemaining,
      itemsDetailed,
      count: selectedServices.length
    };
  }, [selectedServices]);

  // Services available for the "add service" selector
  const availableServicesToAdd = useMemo(() => {
    if (addCategoryFilter === 'todos') {
      return CATALOG_SERVICES;
    }

    return CATALOG_SERVICES.filter((s) => s.category === addCategoryFilter);
  }, [addCategoryFilter]);

  // Cart actions
  const handleAddService = () => {
    if (!serviceToAddId) {
      return;
    }

    setSelectedServices((prev) => [
      ...prev,
      {
        instanceId: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        serviceId: serviceToAddId,
        optionIndex: 0
      }
    ]);
    setShowAddServiceBox(false);
  };

  const handleRemoveService = (instanceId: string) => {
    if (selectedServices.length <= 1) {
      setStepError('Debes mantener al menos un servicio en tu cita.');

      return;
    }

    setStepError(null);
    setSelectedServices((prev) => prev.filter((item) => item.instanceId !== instanceId));
  };

  const handleUpdateOptionIndex = (instanceId: string, newOptionIndex: number) => {
    setSelectedServices((prev) =>
      prev.map((item) =>
        item.instanceId === instanceId ? { ...item, optionIndex: newOptionIndex } : item
      )
    );
  };

  const handleUpdateServiceId = (instanceId: string, newServiceId: string) => {
    setSelectedServices((prev) =>
      prev.map((item) =>
        item.instanceId === instanceId
          ? { ...item, serviceId: newServiceId, optionIndex: 0 }
          : item
      )
    );
  };

  // Step 1 Validation & Next
  const handleProceedToStep2 = () => {
    if (selectedServices.length === 0) {
      setStepError('Por favor selecciona al menos un servicio para continuar.');

      return;
    }

    setStepError(null);
    setCurrentStep(2);
  };

  // Step 2 Validation & Next
  const handleProceedToStep3 = () => {
    if (!date) {
      setStepError('Por favor selecciona la fecha sugerida para tu cita.');

      return;
    }

    if (locationType !== 'estudio' && !district) {
      setStepError('Por favor selecciona tu distrito en Lima.');

      return;
    }

    setStepError(null);
    setCurrentStep(3);
  };

  // Step 3 Validation & Next to Step 4 (Explicación y Coordinación de Reserva)
  const handleProceedToStep4 = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!clientName.trim()) {
      setStepError('Por favor ingresa tu nombre y apellidos.');

      return;
    }

    if (!clientPhone.trim()) {
      setStepError('Por favor ingresa tu número de WhatsApp para contactarte.');

      return;
    }

    setStepError(null);
    setCurrentStep(4);
  };

  const handleCopyYapeNumber = async () => {
    try {
      await navigator.clipboard.writeText('993067291');
      setIsYapeCopied(true);
      setTimeout(() => setIsYapeCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Build WhatsApp consolidated message text
  const buildConsolidatedMessage = () => {
    const isStudio = locationType === 'estudio';

    const servicesListText = financialTotals.itemsDetailed
      .map(
        (it, idx) =>
          `  ${idx + 1}. *${it.service.name}*${it.optionLabel ? ` (${it.optionLabel})` : ''} — S/ ${it.price}`
      )
      .join('\n');

    const lines = [
      '🌿 *SOLICITUD DE RESERVA — MERAKI SPA* 🌿',
      '━━━━━━━━━━━━━━━━━━━━',
      `✨ *Servicios a agendar (${financialTotals.count}):*`,
      servicesListText,
      '━━━━━━━━━━━━━━━━━━━━',
      `💰 *Inversión Total:* S/ ${financialTotals.totalPrice}`,
      `💳 *Adelanto de confirmación (40%):* S/ ${financialTotals.advancePayment} (Yape al 993 067 291 - Ana Díaz)`,
      `💵 *Saldo al finalizar atención (60%):* S/ ${financialTotals.balanceRemaining}`,
      '━━━━━━━━━━━━━━━━━━━━',
      `📍 *Modalidad:* ${
        isStudio
          ? 'Presencial en Estudio (Pueblo Libre)'
          : locationType === 'casa'
            ? 'En Casa / Domicilio'
            : 'En Oficina / Trabajo'
      }`,
      isStudio
        ? '🏠 *Dirección del Estudio:* Calle Agustín Gamarra 515, Pueblo Libre, Lima'
        : `📌 *Distrito en Lima:* ${district}`,
      !isStudio
        ? address.trim()
          ? `🏠 *Dirección/Ref:* ${address.trim()}`
          : '🏠 *Dirección/Ref:* Por coordinar en chat'
        : '',
      `📅 *Fecha deseada:* ${date}`,
      `⏰ *Horario preferido:* ${timeSlot} hrs`,
      '━━━━━━━━━━━━━━━━━━━━',
      `👤 *Cliente:* ${clientName.trim()}`,
      `📱 *WhatsApp:* ${clientPhone.trim()}`,
      clientEmail.trim() ? `📧 *Correo:* ${clientEmail.trim()}` : '📧 *Correo:* No especificado',
      specialNotes.trim() ? `📝 *Observaciones/Alergias:* ${specialNotes.trim()}` : '',
      '━━━━━━━━━━━━━━━━━━━━',
      isStudio
        ? `¡Hola Ana Díaz / Meraki! Adjunto mi solicitud de cita presencial en su estudio (Calle Agustín Gamarra 515, Pueblo Libre) para verificar disponibilidad. Coordinamos el pago del adelanto de S/ ${financialTotals.advancePayment} por Yape a su número.`
        : `¡Hola Ana Díaz / Meraki! Adjunto mi solicitud de cita a domicilio para verificar disponibilidad de agenda y movilidad. Coordinamos el pago del adelanto de S/ ${financialTotals.advancePayment} por Yape a su número.`
    ].filter(Boolean);

    return lines.join('\n');
  };

  const leadTrackedRef = useRef<boolean>(false);

  const triggerBookingConversion = () => {
    if (leadTrackedRef.current) {
      return;
    }

    leadTrackedRef.current = true;

    const mainTitle = financialTotals.itemsDetailed
      .map((it) => `${it.service.name}${it.optionLabel ? ` (${it.optionLabel})` : ''}`)
      .join(' + ');

    trackMetaLead({
      content_name: `Cita Spa (${financialTotals.count} servicios) - ${mainTitle}`,
      content_category: 'Cita Spa',
      value: financialTotals.totalPrice,
      currency: 'PEN'
    });

    trackMetaSchedule({
      content_name: `Cita Spa - ${mainTitle}`,
      value: financialTotals.totalPrice,
      currency: 'PEN'
    });

    trackTikTokSubmitForm({
      content_name: `Cita Spa - ${mainTitle}`,
      content_category: 'Cita Spa',
      value: financialTotals.totalPrice,
      currency: 'PEN'
    });

    trackTikTokCompleteRegistration({
      content_name: `Cita Spa - ${mainTitle}`,
      content_category: 'Cita Spa',
      value: financialTotals.totalPrice,
      currency: 'PEN'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      setStepError('Por favor ingresa tu nombre completo.');

      return;
    }

    if (!clientPhone.trim()) {
      setStepError('Por favor ingresa tu número de WhatsApp para contactarte.');

      return;
    }

    setStepError(null);
    triggerBookingConversion();

    const servicesSummaryString = financialTotals.itemsDetailed
      .map((it) => `${it.service.name}${it.optionLabel ? ` [${it.optionLabel}]` : ''} (S/ ${it.price})`)
      .join(' + ');

    syncLeadToGoogleSheets({
      formulario: 'Cita Spa',
      cliente: clientName.trim(),
      whatsapp: clientPhone.trim(),
      email: clientEmail.trim() || undefined,
      servicio_detalle: servicesSummaryString,
      modalidad: locationType === 'estudio' ? 'Estudio (Pueblo Libre)' : 'A Domicilio / Oficina',
      distrito: locationType === 'estudio' ? 'Pueblo Libre' : district,
      direccion: locationType === 'estudio' ? SPA_INFO.studioAddress : address.trim() || undefined,
      fecha_preferida: date || 'A coordinar',
      hora_preferida: timeSlot || 'A coordinar',
      monto_total: `S/ ${financialTotals.totalPrice}`,
      monto_adelanto: `S/ ${financialTotals.advancePayment} (40%)`,
      codigo_reserva: `MRK-SPA-${Math.floor(1000 + Math.random() * 9000)}`,
      mensaje_notas: specialNotes.trim() || undefined
    });

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

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/60 backdrop-blur-sm animate-fade-in text-left"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-booking-title"
    >
      <div
        className="relative w-full max-w-2xl bg-[#FFF2DE] rounded-3xl overflow-hidden shadow-2xl border border-[#5E765E]/20 max-h-[92vh] flex flex-col"
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
        <div className="bg-[#5E765E] text-[#FFF2DE] p-5 sm:p-6 relative border-b border-[#D5A688]/30 shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#D5A688]" />
            <span className="text-[10px] font-['Montserrat',sans-serif] uppercase font-bold tracking-[0.22em] text-[#D5A688]">
              Agenda tu Experiencia Personalizada
            </span>
          </div>
          <h2
            id="modal-booking-title"
            className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl font-normal leading-tight text-white"
          >
            Reservar Cita en Meraki
          </h2>
          <p className="font-['Montserrat',sans-serif] text-xs font-light text-[#FFF2DE]/90 mt-0.5">
            Atención en estudio (Pueblo Libre) y a domicilio u oficina en Lima
          </p>

          {/* Stepper Progress Bar (Only visible when not submitted) */}
          {!isSubmitted && (
            <div className="mt-4 pt-3 border-t border-white/15">
              <div className="flex items-center justify-between text-[11px] sm:text-xs font-['Montserrat',sans-serif] mb-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className={`flex items-center gap-1 transition-colors cursor-pointer ${
                    currentStep === 1
                      ? 'text-white font-bold'
                      : currentStep > 1
                        ? 'text-[#D5A688] hover:text-white font-medium'
                        : 'text-white/50'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] ${
                      currentStep === 1
                        ? 'bg-[#D5A688] text-[#111111] font-bold'
                        : currentStep > 1
                          ? 'bg-[#D5A688]/30 text-[#D5A688] font-bold'
                          : 'bg-white/20 text-white/70'
                    }`}
                  >
                    {currentStep > 1 ? '✓' : '1'}
                  </span>
                  <span>1. Servicios</span>
                  {financialTotals.count > 0 && (
                    <span className="text-[10px] opacity-75 hidden sm:inline">({financialTotals.count})</span>
                  )}
                </button>

                <div className="h-[1px] flex-1 mx-1.5 sm:mx-2 bg-white/20" />

                <button
                  type="button"
                  onClick={() => {
                    if (selectedServices.length > 0) setCurrentStep(2);
                  }}
                  className={`flex items-center gap-1 transition-colors cursor-pointer ${
                    currentStep === 2
                      ? 'text-white font-bold'
                      : currentStep > 2
                        ? 'text-[#D5A688] hover:text-white font-medium'
                        : 'text-white/50'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] ${
                      currentStep === 2
                        ? 'bg-[#D5A688] text-[#111111] font-bold'
                        : currentStep > 2
                          ? 'bg-[#D5A688]/30 text-[#D5A688] font-bold'
                          : 'bg-white/20 text-white/70'
                    }`}
                  >
                    {currentStep > 2 ? '✓' : '2'}
                  </span>
                  <span>2. Modalidad</span>
                </button>

                <div className="h-[1px] flex-1 mx-1.5 sm:mx-2 bg-white/20" />

                <button
                  type="button"
                  onClick={() => {
                    if (selectedServices.length > 0 && date) setCurrentStep(3);
                  }}
                  className={`flex items-center gap-1 transition-colors cursor-pointer ${
                    currentStep === 3
                      ? 'text-white font-bold'
                      : currentStep > 3
                        ? 'text-[#D5A688] hover:text-white font-medium'
                        : 'text-white/50'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] ${
                      currentStep === 3
                        ? 'bg-[#D5A688] text-[#111111] font-bold'
                        : currentStep > 3
                          ? 'bg-[#D5A688]/30 text-[#D5A688] font-bold'
                          : 'bg-white/20 text-white/70'
                    }`}
                  >
                    {currentStep > 3 ? '✓' : '3'}
                  </span>
                  <span>3. Datos</span>
                </button>

                <div className="h-[1px] flex-1 mx-1.5 sm:mx-2 bg-white/20" />

                <button
                  type="button"
                  onClick={() => {
                    if (selectedServices.length > 0 && date && clientName.trim() && clientPhone.trim()) {
                      setCurrentStep(4);
                    }
                  }}
                  className={`flex items-center gap-1 transition-colors cursor-pointer ${
                    currentStep === 4
                      ? 'text-white font-bold'
                      : 'text-white/50'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] ${
                      currentStep === 4
                        ? 'bg-[#D5A688] text-[#111111] font-bold'
                        : 'bg-white/20 text-white/70'
                    }`}
                  >
                    4
                  </span>
                  <span>4. Reserva &amp; Yape</span>
                </button>
              </div>

              {/* Progress Line */}
              <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#D5A688] h-full transition-all duration-300 rounded-full"
                  style={{
                    width:
                      currentStep === 1
                        ? '25%'
                        : currentStep === 2
                          ? '50%'
                          : currentStep === 3
                            ? '75%'
                            : '100%'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-5 sm:p-7 flex-1">
          {/* Step Error Notice */}
          {stepError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <span className="font-bold shrink-0">!</span>
              <span>{stepError}</span>
            </div>
          )}

          {isSubmitted ? (
            /* =========================================================================
               CONFIRMATION & WHATSAPP CONSOLIDATED VIEW
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
                  ¡Consolidado de Cita Listo!
                </h3>
                <p className="font-['Montserrat',sans-serif] text-xs text-[#111111]/75 max-w-md mx-auto mt-2 leading-relaxed">
                  Gracias, <strong className="font-semibold text-[#111111]">{clientName}</strong>. Hemos preparado el resumen completo de tu solicitud con los <strong className="font-semibold text-[#5E765E]">{financialTotals.count} servicios</strong> seleccionados. Haz clic en el botón a continuación para abrir WhatsApp y confirmar la disponibilidad de tu agenda.
                </p>
              </div>

              {/* Consolidated Summary Card */}
              <div className="theme-card-surface rounded-2xl p-5 text-left text-xs font-['Montserrat',sans-serif] space-y-3.5 max-w-lg mx-auto">
                <div className="flex items-center justify-between border-b border-[#5E765E]/15 pb-2.5">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[#5E765E]">
                    Resumen de Servicios Agendados ({financialTotals.count})
                  </span>
                  <span className="text-[10px] text-[#111111]/60 font-medium">
                    Lima, Perú
                  </span>
                </div>

                <div className="space-y-2 text-[#111111]">
                  {financialTotals.itemsDetailed.map((it, idx) => (
                    <div
                      key={it.instanceId}
                      className="flex justify-between items-start gap-3 py-1 border-b border-[#5E765E]/10 last:border-b-0"
                    >
                      <div className="flex-1">
                        <span className="font-semibold text-[#111111] block">
                          {idx + 1}. {it.service.name}
                        </span>
                        {it.optionLabel && (
                          <span className="text-[11px] text-[#5E765E] block font-light">
                            {it.optionLabel}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-[#5E765E] shrink-0">
                        S/. {it.price}
                      </span>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-[#5E765E]/15 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#111111]/60">Modalidad:</span>
                      <span className="font-medium text-right">
                        {locationType === 'estudio'
                          ? 'En Estudio (Pueblo Libre)'
                          : locationType === 'casa'
                            ? `A Domicilio • ${district}`
                            : `En Oficina • ${district}`}
                      </span>
                    </div>

                    {locationType === 'estudio' ? (
                      <div className="flex justify-between items-start gap-3">
                        <span className="text-[#111111]/60">Dirección Estudio:</span>
                        <span className="font-semibold text-right max-w-xs text-[#5E765E]">
                          Calle Agustín Gamarra 515, Pueblo Libre
                        </span>
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
                      <span className="font-medium">
                        {clientName} ({clientPhone})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="pt-3 border-t border-[#5E765E]/15 bg-[#FFF2DE]/50 -mx-5 -mb-5 p-4 rounded-b-2xl space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#111111]/70">Inversión total ({financialTotals.count} servicios):</span>
                    <span className="font-bold text-[#111111] text-sm">S/. {financialTotals.totalPrice}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-[#5E765E] font-medium">
                    <span>Adelanto de confirmación (40%):</span>
                    <span className="font-bold">S/. {financialTotals.advancePayment}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-[#111111]/60">
                    <span>Saldo al concluir atención (60%):</span>
                    <span>S/. {financialTotals.balanceRemaining}</span>
                  </div>
                  <p className="text-[10px] text-[#111111]/60 italic pt-1 border-t border-[#5E765E]/10">
                    * Movilidad sujeta a coordinación según distrito en Lima. La reserva se sella con el abono del 40%.
                  </p>
                </div>
              </div>

              {/* Yape Ana Díaz Quick Payment Card */}
              <div className="bg-[#FFFDF9] rounded-2xl p-4 border border-[#722282]/30 max-w-lg mx-auto text-left space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#722282] animate-pulse" />
                    <span className="text-xs font-bold text-[#111111]">
                      Adelanto con Yape al Yape de Ana Díaz
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#722282]">
                    S/. {financialTotals.advancePayment} (40%)
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-[#722282]/15 text-xs">
                  <div>
                    <span className="text-[10px] text-[#111111]/60 block">Titular: <strong>Ana María Díaz (Ana Díaz)</strong></span>
                    <span className="font-mono font-bold text-[#722282]">993 067 291</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyYapeNumber}
                    className="px-2.5 py-1 rounded-lg bg-[#722282]/10 hover:bg-[#722282]/20 text-[#722282] text-[11px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                  >
                    {isYapeCopied ? (
                      <>
                        <Check className="w-3 h-3 text-[#5E765E]" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar Número</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-[#111111]/65 font-light">
                  Abona el 40% de adelanto y comparte la captura de pantalla por WhatsApp para confirmar tu espacio en la agenda.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-lg mx-auto">
                <a
                  id="btn-confirm-send-whatsapp"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerBookingConversion()}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-6 py-4 rounded-full text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Enviar por WhatsApp a Ana Díaz</span>
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
                  onClick={() => {
                    setIsSubmitted(false);
                    setCurrentStep(1);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-[#5E765E] hover:underline font-medium cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Modificar servicios o datos de la reserva</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* =========================================================================
                 ETAPA 1: SERVICIOS A AGENDAR (CON INTEGRACIÓN DE MÚLTIPLES SERVICIOS)
                 ========================================================================= */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-[#5E765E]/15">
                    <div>
                      <span className="text-[10px] font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#5E765E]">
                        Fase 1 de 3: Selección de Servicios
                      </span>
                      <h3 className="font-['Cormorant_Garamond',serif] text-xl sm:text-2xl font-normal text-[#111111]">
                        ¿Qué tratamientos deseas agendar?
                      </h3>
                    </div>
                    <span className="text-[11px] text-[#5E765E] font-medium bg-[#5E765E]/10 px-3 py-1 rounded-full self-start sm:self-auto">
                      {financialTotals.count} {financialTotals.count === 1 ? 'servicio' : 'servicios'} en tu cita
                    </span>
                  </div>

                  {/* List of currently selected services */}
                  <div className="space-y-3">
                    {selectedServices.map((item) => {
                      const { service, price } = getItemDetails(item);

                      return (
                        <div
                          key={item.instanceId}
                          className="theme-card-surface p-4 rounded-2xl space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#5E765E]/10 text-[#5E765E]">
                                  {service.categoryLabel}
                                </span>
                                <span className="text-[10px] text-[#111111]/50 font-light">
                                  {service.subcategory}
                                </span>
                              </div>

                              {/* Dropdown to change this specific service */}
                              <select
                                value={item.serviceId}
                                onChange={(e) => handleUpdateServiceId(item.instanceId, e.target.value)}
                                className="w-full text-xs font-semibold text-[#111111] bg-transparent border-0 border-b border-[#5E765E]/20 py-1 focus:outline-none focus:border-[#5E765E] cursor-pointer"
                              >
                                {CATALOG_SERVICES.map((srv) => (
                                  <option key={srv.id} value={srv.id}>
                                    {srv.name} — Desde S/. {srv.pricePEN || srv.priceOptions?.[0]?.pricePEN}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-base font-bold text-[#5E765E] font-['Montserrat',sans-serif]">
                                S/. {price}
                              </span>

                              {selectedServices.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveService(item.instanceId)}
                                  className="w-7 h-7 rounded-full text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                                  title="Quitar este servicio"
                                  aria-label={`Quitar ${service.name}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Variant / Option selector if available */}
                          {service.priceOptions && service.priceOptions.length > 0 && (
                            <div className="pt-2 border-t border-[#5E765E]/10 space-y-1.5">
                              <span className="block text-[10px] font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#5E765E]/90">
                                Opción / Duración:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {service.priceOptions.map((opt: ServicePriceOption, optIdx: number) => (
                                  <button
                                    key={opt.label}
                                    type="button"
                                    onClick={() => handleUpdateOptionIndex(item.instanceId, optIdx)}
                                    className={`p-2 rounded-lg text-left text-xs border transition-all cursor-pointer ${
                                      item.optionIndex === optIdx
                                        ? 'bg-[#5E765E] text-[#FFF2DE] border-[#5E765E] font-medium shadow-2xs'
                                        : 'bg-[#FFF2DE]/40 text-[#111111] border-[#5E765E]/15 hover:border-[#5E765E]/30'
                                    }`}
                                  >
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span>{opt.label}</span>
                                      <span className={item.optionIndex === optIdx ? 'text-[#D5A688] font-bold' : 'text-[#5E765E] font-bold'}>
                                        S/. {opt.pricePEN}
                                      </span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add another service section */}
                  {showAddServiceBox ? (
                    <div className="p-4 rounded-2xl bg-white border border-[#5E765E]/30 shadow-sm space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#5E765E]">
                          + Selecciona otro servicio para añadir:
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAddServiceBox(false)}
                          className="text-xs text-[#111111]/50 hover:text-[#111111]"
                        >
                          Cancelar
                        </button>
                      </div>

                      {/* Category quick tabs */}
                      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                        {CATEGORIES_DATA.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setAddCategoryFilter(cat.id);

                              const match = CATALOG_SERVICES.find(
                                (s) => cat.id === 'todos' || s.category === cat.id
                              );

                              if (match) {
                                setServiceToAddId(match.id);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                              addCategoryFilter === cat.id
                                ? 'bg-[#5E765E] text-[#FFF2DE] font-semibold'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>

                      {/* Service selector */}
                      <select
                        value={serviceToAddId}
                        onChange={(e) => setServiceToAddId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#5E765E]/20 text-xs text-[#111111] bg-white focus:outline-none focus:border-[#5E765E]"
                      >
                        {availableServicesToAdd.map((srv) => (
                          <option key={srv.id} value={srv.id}>
                            [{srv.categoryLabel}] {srv.name} — S/. {srv.pricePEN || srv.priceOptions?.[0]?.pricePEN} ({srv.subcategory})
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={handleAddService}
                        className="w-full py-2.5 rounded-xl bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Añadir a mi Cita
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddServiceBox(true)}
                      className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-[#5E765E]/30 hover:border-[#5E765E] bg-white/60 hover:bg-white text-[#5E765E] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#D5A688]" />
                      <span>+ Agregar otro servicio a la cita (Manicure, Masaje, Facial, etc.)</span>
                    </button>
                  )}

                  {/* Summary Bar & Navigation */}
                  <div className="pt-4 border-t border-[#5E765E]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-left w-full sm:w-auto">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[10px] text-[#111111]/70 uppercase tracking-wider font-semibold">
                          Subtotal Servicios:
                        </span>
                        <span className="text-lg font-bold font-['Montserrat',sans-serif] text-[#5E765E]">
                          S/. {financialTotals.totalPrice}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#5E765E] font-medium block">
                        Adelanto 40%: <strong>S/. {financialTotals.advancePayment}</strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleProceedToStep2}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-[0.16em] shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <span>Continuar a Modalidad &amp; Fecha</span>
                      <ArrowRight className="w-4 h-4 text-[#D5A688]" />
                    </button>
                  </div>
                </div>
              )}

              {/* =========================================================================
                 ETAPA 2: MODALIDAD, LUGAR Y FECHA/HORARIO
                 ========================================================================= */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="pb-1 border-b border-[#5E765E]/15">
                    <span className="text-[10px] font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#5E765E]">
                      Fase 2 de 3: Logística &amp; Agenda
                    </span>
                    <h3 className="font-['Cormorant_Garamond',serif] text-xl sm:text-2xl font-normal text-[#111111]">
                      ¿Dónde y cuándo te gustaría atenderte?
                    </h3>
                  </div>

                  {/* Modalidad selector: Estudio vs Casa vs Trabajo */}
                  <div className="space-y-3">
                    <label className="block text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#5E765E]">
                      Modalidad de Atención
                    </label>

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
                        <HomeIcon className="w-4 h-4 text-[#D5A688]" />
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
                        <Building className="w-4 h-4 text-[#D5A688]" />
                        <span>En Oficina / Trabajo</span>
                      </button>
                    </div>

                    {locationType === 'estudio' ? (
                      /* Studio details */
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
                            Ambiente privado, relajante y equipado con instrumental esterilizado de grado profesional.
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Home or Office inputs */
                      <div className="space-y-3">
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
                      </div>
                    )}
                  </div>

                  {/* Date and Time */}
                  <div className="border-t border-[#5E765E]/15 pt-4 space-y-3">
                    <label className="block text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#5E765E]">
                      Fecha y Horario Sugerido
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-[#111111]/70 uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#5E765E]" />
                          <span>Fecha deseada *</span>
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
                        <label className="block text-[10px] text-[#111111]/70 uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#5E765E]" />
                          <span>Horario sugerido *</span>
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

                  {/* Navigation Buttons */}
                  <div className="pt-4 border-t border-[#5E765E]/15 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#5E765E]/30 bg-white hover:bg-[#FFF2DE] text-[#111111] text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver a Servicios</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleProceedToStep3}
                      className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-[0.16em] shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <span>Continuar a Tus Datos</span>
                      <ArrowRight className="w-4 h-4 text-[#D5A688]" />
                    </button>
                  </div>
                </div>
              )}

              {/* =========================================================================
                 ETAPA 3: DATOS DE CONTACTO Y CONFIRMACIÓN
                 ========================================================================= */}
              {/* =========================================================================
                 ETAPA 3: DATOS DE CONTACTO
                 ========================================================================= */}
              {currentStep === 3 && (
                <form onSubmit={handleProceedToStep4} className="space-y-5 animate-fade-in">
                  <div className="pb-1 border-b border-[#5E765E]/15">
                    <span className="text-[10px] font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#5E765E]">
                      Fase 3 de 4: Tus Datos de Contacto
                    </span>
                    <h3 className="font-['Cormorant_Garamond',serif] text-xl sm:text-2xl font-normal text-[#111111]">
                      Ingresa tus datos para coordinar
                    </h3>
                  </div>

                  {/* Mini-Review Box of Chosen Plan */}
                  <div className="p-3.5 rounded-2xl bg-white/80 border border-[#5E765E]/20 text-xs space-y-2">
                    <div className="flex items-center justify-between text-[#5E765E] font-bold uppercase text-[10px] tracking-wider border-b border-[#5E765E]/10 pb-1.5">
                      <span>Cita: {financialTotals.count} {financialTotals.count === 1 ? 'servicio' : 'servicios'}</span>
                      <span>Total: S/. {financialTotals.totalPrice}</span>
                    </div>
                    <div className="text-[11px] text-[#111111]/80 space-y-0.5">
                      <p>
                        <strong className="text-[#111111]">Modalidad:</strong>{' '}
                        {locationType === 'estudio' ? 'Estudio (Pueblo Libre)' : `A Domicilio (${district})`} •{' '}
                        <strong className="text-[#111111]">Fecha:</strong> {date} ({timeSlot} hrs)
                      </p>
                    </div>
                  </div>

                  {/* Contact Inputs */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-[#111111]/70 uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#5E765E]" />
                          <span>Nombre y Apellidos *</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Tu nombre completo"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-[#111111]/70 uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#5E765E]" />
                          <span>WhatsApp / Celular *</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="ej: 993 067 291"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#111111]/70 uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#5E765E]" />
                        <span>Correo Electrónico (opcional)</span>
                      </label>
                      <input
                        type="email"
                        placeholder="tu-correo@ejemplo.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#111111]/70 uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#5E765E]" />
                        <span>Observaciones / Requerimientos especiales</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Retiro de sistema acrílico previo, alergias, tipo de piel o indicaciones especiales..."
                        value={specialNotes}
                        onChange={(e) => setSpecialNotes(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs font-['Montserrat',sans-serif] focus:outline-none focus:border-[#5E765E]"
                      />
                    </div>
                  </div>

                  {/* Submission Row with financial note */}
                  <div className="pt-4 border-t border-[#5E765E]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#5E765E]/30 bg-white hover:bg-[#FFF2DE] text-[#111111] text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Volver</span>
                      </button>

                      <div className="text-left">
                        <span className="text-[10px] text-[#111111]/70 uppercase tracking-wider block font-semibold">
                          Total: S/. {financialTotals.totalPrice}
                        </span>
                        <span className="text-[11px] text-[#5E765E] font-medium block">
                          Adelanto 40%: <strong>S/. {financialTotals.advancePayment}</strong>
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-[0.16em] shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <span>Continuar a Cómo Reservar y Pago</span>
                      <ArrowRight className="w-4 h-4 text-[#D5A688]" />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-[#111111]/60 pt-1">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#5E765E] shrink-0" />
                      <span>
                        Tus datos se usan exclusivamente para la coordinación directa de tu cita.
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

              {/* =========================================================================
                 ETAPA 4: CÓMO RESERVAR, ENVÍO DEL MENSAJE Y ADELANTO YAPE A ANA DÍAZ
                 ========================================================================= */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-fade-in text-left">
                  <div className="pb-2 border-b border-[#5E765E]/15">
                    <span className="text-[10px] font-['Montserrat',sans-serif] uppercase font-bold tracking-[0.2em] text-[#5E765E] block mb-1">
                      Fase 4 de 4: Cómo Reservar Correctamente
                    </span>
                    <h3 className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl font-normal text-[#111111]">
                      Pasos Sencillos para Asegurar tu Cita
                    </h3>
                    <p className="font-['Montserrat',sans-serif] text-xs font-light text-[#111111]/75 mt-0.5">
                      Sigue estas 4 sencillas pautas para formalizar tu experiencia en Meraki Spa:
                    </p>
                  </div>

                  {/* 4 Process Guidance Cards */}
                  <div className="space-y-3 font-['Montserrat',sans-serif]">
                    {/* Paso 1: Envío por WhatsApp */}
                    <div className="bg-white rounded-2xl p-4 border border-[#5E765E]/15 shadow-sm flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-full bg-[#25D366]/15 text-[#25D366] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-[#111111] flex items-center gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                          <span>Envío de tu solicitud a WhatsApp</span>
                        </h4>
                        <p className="text-[11px] text-[#111111]/75 leading-relaxed font-light">
                          Al presionar el botón verde inferior, se enviará el mensaje estructurado con tus <strong>{financialTotals.count} {financialTotals.count === 1 ? 'servicio' : 'servicios'}</strong>, fecha seleccionada (<strong>{date} a las {timeSlot} hrs</strong>) y modalidad ({locationType === 'estudio' ? 'Presencial en Estudio Pueblo Libre' : `A Domicilio en ${district}`}).
                        </p>
                      </div>
                    </div>

                    {/* Paso 2: Validación de agenda */}
                    <div className="bg-white rounded-2xl p-4 border border-[#5E765E]/15 shadow-sm flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-full bg-[#5E765E]/15 text-[#5E765E] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-[#111111] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#5E765E]" />
                          <span>Validación rápida de agenda y disponibilidad</span>
                        </h4>
                        <p className="text-[11px] text-[#111111]/75 leading-relaxed font-light">
                          Ana María Díaz o el equipo revisará de inmediato la agenda para confirmarte la disponibilidad del horario o coordinar el traslado según tu distrito.
                        </p>
                      </div>
                    </div>

                    {/* Paso 3: Coordinación del pago del adelanto mediante Yape a Ana Díaz */}
                    <div className="bg-[#FFFDF9] rounded-2xl p-4 sm:p-5 border-2 border-[#722282]/35 shadow-md flex flex-col gap-3">
                      <div className="flex items-start gap-3.5">
                        <div className="w-8 h-8 rounded-full bg-[#722282] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          3
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-[#111111] flex items-center gap-1.5">
                              <Smartphone className="w-3.5 h-3.5 text-[#722282]" />
                              <span>Coordinación del pago del adelanto mediante Yape al Yape de Ana Díaz</span>
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-[#722282]/10 text-[#722282] text-[10px] font-bold uppercase tracking-wider">
                              Cuenta Oficial
                            </span>
                          </div>
                          <p className="text-[11px] text-[#111111]/75 leading-relaxed font-light mt-1">
                            Para bloquear tu turno de forma exclusiva, se abona el <strong>40% de adelanto</strong> al Yape oficial de Ana Díaz. El saldo restante (60%) se abona al finalizar tu atención.
                          </p>
                        </div>
                      </div>

                      {/* Official Yape Data Card */}
                      <div className="bg-gradient-to-br from-[#722282]/10 via-[#722282]/5 to-transparent rounded-xl p-3.5 sm:p-4 border border-[#722282]/25 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                          <div className="bg-white p-3 rounded-xl border border-[#722282]/20 shadow-xs">
                            <span className="text-[10px] text-[#111111]/60 uppercase tracking-wider block font-semibold">
                              Titular del Yape:
                            </span>
                            <strong className="text-sm text-[#111111] font-bold block mt-0.5">
                              Ana María Díaz (Ana Díaz)
                            </strong>
                            <span className="text-[10px] text-[#5E765E] block mt-0.5 font-medium">
                              Fundadora · Meraki Spa &amp; Beauty
                            </span>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-[#722282]/20 shadow-xs flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-[#111111]/60 uppercase tracking-wider block font-semibold">
                                Número de Yape / WhatsApp:
                              </span>
                              <strong className="text-base font-mono text-[#722282] font-bold block mt-0.5 tracking-wide">
                                993 067 291
                              </strong>
                              <span className="text-[10px] text-[#111111]/60 block">
                                (+51 993 067 291)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={handleCopyYapeNumber}
                              className="px-3 py-1.5 rounded-lg bg-[#722282]/10 hover:bg-[#722282]/20 text-[#722282] text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                              title="Copiar número de Yape"
                            >
                              {isYapeCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-[#5E765E]" />
                                  <span>¡Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copiar</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Financial Amounts breakdown */}
                        <div className="pt-2 border-t border-[#722282]/20 flex items-center justify-between flex-wrap gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-[#111111]/60 block uppercase font-medium">Inversión Total:</span>
                            <strong className="text-sm text-[#111111] font-bold">S/ {financialTotals.totalPrice}</strong>
                          </div>
                          <div className="bg-[#722282] text-white px-3.5 py-1.5 rounded-xl shadow-xs text-right">
                            <span className="text-[10px] text-[#FFF2DE] block uppercase tracking-wider font-medium">
                              Adelanto a abonar (40%):
                            </span>
                            <strong className="text-base font-bold">S/ {financialTotals.advancePayment}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#111111]/60 block uppercase font-medium">Saldo al finalizar (60%):</span>
                            <strong className="text-sm text-[#5E765E] font-bold">S/ {financialTotals.balanceRemaining}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paso 4: Envío de comprobante */}
                    <div className="bg-white rounded-2xl p-4 border border-[#5E765E]/15 shadow-sm flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-full bg-[#5E765E]/15 text-[#5E765E] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        4
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-[#111111] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#5E765E]" />
                          <span>Envío del comprobante de Yape por WhatsApp</span>
                        </h4>
                        <p className="text-[11px] text-[#111111]/75 leading-relaxed font-light">
                          Envías la captura o constancia de tu Yape al mismo chat de WhatsApp de Ana Díaz y tu cita queda confirmada al 100%.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Submit to WhatsApp & Back */}
                  <div className="pt-4 border-t border-[#5E765E]/15 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border border-[#5E765E]/30 bg-white hover:bg-[#FFF2DE] text-[#111111] text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver a Datos</span>
                    </button>

                    <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopySummary}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-full border border-[#5E765E]/30 bg-white hover:bg-[#FFF2DE] text-[#111111] text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#5E765E]" />
                            <span>¡Texto Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Resumen</span>
                          </>
                        )}
                      </button>

                      <a
                        id="btn-confirm-send-whatsapp-step4"
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleSubmit}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-7 py-3.5 rounded-full text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02]"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>Enviar Solicitud a WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
