import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CENTRAL_OWNER_EMAIL, SPA_INFO } from '../../data/spaData';
import type {
  BookingServiceLine,
  MerakiBooking,
  ScheduleConfig,
  ServicePriceOption,
  SlotLockEntry,
} from '../../types';
import {
  DEFAULT_SCHEDULE_CONFIG,
  LIMA_DISTRICT_NAMES,
  evaluateDaySchedule,
} from '../../utils/scheduleEngine';
import {
  createAtomicBooking,
  fetchActiveSlotLocksForDate,
  fetchScheduleConfig,
} from '../../services/merakiFirestore';
import { useAuth } from '../../context/AuthContext';
import { useCatalog } from '../../context/CatalogContext';
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
  Smartphone,
  AlertCircle,
  Download,
  Printer,
  CreditCard,
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedServiceId?: string;
  preselectedOptionIndex?: number;
}

export interface SelectedServiceItem {
  instanceId: string;
  serviceId: string;
  optionIndex: number;
}

export function BookingModal({
  isOpen,
  onClose,
  preselectedServiceId,
  preselectedOptionIndex,
}: BookingModalProps) {
  const { user, profileName, profileEmail, profilePhone } = useAuth();
  const { activeServices, allServices, categories } = useCatalog();

  // Wizard 4-Step State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isYapeCopied, setIsYapeCopied] = useState<boolean>(false);

  // Schedule config & slot locks from Firestore
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(DEFAULT_SCHEDULE_CONFIG);
  const [activeLocks, setActiveLocks] = useState<SlotLockEntry[]>([]);
  const [loadingAgenda, setLoadingAgenda] = useState<boolean>(false);

  // Multi-Service Cart State
  const [selectedServices, setSelectedServices] = useState<SelectedServiceItem[]>(() => {
    const initialId = preselectedServiceId || activeServices[0]?.id || 'manos-basica';

    return [
      {
        instanceId: `item-${Date.now()}-1`,
        serviceId: initialId,
        optionIndex: preselectedOptionIndex ?? 0,
      },
    ];
  });

  // Selector state for adding another service
  const [addCategoryFilter, setAddCategoryFilter] = useState<string>('todos');
  const [serviceToAddId, setServiceToAddId] = useState<string>(activeServices[0]?.id || '');
  const [showAddServiceBox, setShowAddServiceBox] = useState<boolean>(false);

  // Logistics & Location state (Step 2)
  const [locationType, setLocationType] = useState<'estudio' | 'casa' | 'trabajo'>('estudio');
  const [district, setDistrict] = useState<string>('Pueblo Libre');
  const [address, setAddress] = useState<string>('');

  // Date and Time state (Step 2)
  const todayIso = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(() => {
    const d = new Date();

    d.setDate(d.getDate() + 1);

    return d.toISOString().split('T')[0];
  });

  const [timeSlot, setTimeSlot] = useState<string>('11:00');

  // Client Details & Consent state (Step 3)
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(false);

  // Payment confirmation input (Step 4)
  const [yapeOperationCode, setYapeOperationCode] = useState<string>('');

  // Submission & UI feedback state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [confirmedBookingCode, setConfirmedBookingCode] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [stepError, setStepError] = useState<string | null>(null);

  // Reset or initialize on open
  useEffect(() => {
    if (!isOpen) return;

    setCurrentStep(1);
    setIsSubmitted(false);
    setConfirmedBookingCode('');
    setYapeOperationCode('');
    setStepError(null);

    if (user) {
      const candidateName =
        profileName && profileName !== 'Clienta VIP' ? profileName : user.displayName || '';

      const candidateEmail = profileEmail || user.email || '';

      if (!clientName && candidateName) {
        setClientName(candidateName);
      }

      if (!clientEmail && candidateEmail) {
        setClientEmail(candidateEmail);
      }

      if (!clientPhone && profilePhone) {
        setClientPhone(profilePhone);
      }
    }

    if (preselectedServiceId) {
      setSelectedServices([
        {
          instanceId: `item-${Date.now()}-initial`,
          serviceId: preselectedServiceId,
          optionIndex: preselectedOptionIndex ?? 0,
        },
      ]);
    }
  }, [isOpen, preselectedServiceId, preselectedOptionIndex, user, profileName, profileEmail, profilePhone]);

  // Load real-time schedule config & date slotLocks when modal is open or date changes
  useEffect(() => {
    if (!isOpen || !date) return;

    let cancelled = false;

    const loadAgenda = async () => {
      setLoadingAgenda(true);

      const [cfg, locks] = await Promise.all([
        fetchScheduleConfig(),
        fetchActiveSlotLocksForDate(date),
      ]);

      if (!cancelled) {
        setScheduleConfig(cfg);
        setActiveLocks(locks);
        setLoadingAgenda(false);
      }
    };

    void loadAgenda();

    return () => {
      cancelled = true;
    };
  }, [isOpen, date]);

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

  const getItemDetails = (item: SelectedServiceItem) => {
    const service =
      allServices.find((s) => s.id === item.serviceId) ||
      activeServices[0] ||
      allServices[0];

    let price = service.pricePEN || 0;
    let optionLabel: string | undefined;

    if (service.priceOptions && service.priceOptions.length > 0) {
      const opt = service.priceOptions[item.optionIndex] || service.priceOptions[0];

      price = opt.pricePEN;
      optionLabel = opt.label;
    }

    const formattedPrice = service.priceNote
      ? service.priceNote
      : price > 0
        ? `S/. ${price}`
        : 'Bajo pedido';

    return { service, price, optionLabel, formattedPrice };
  };

  const financialTotals = useMemo(() => {
    let totalPrice = 0;
    let hasUnpriced = false;

    const itemsDetailed = selectedServices.map((item) => {
      const details = getItemDetails(item);

      totalPrice += details.price;

      if (details.price === 0 || details.service.priceNote) {
        hasUnpriced = true;
      }

      return {
        ...item,
        ...details,
      };
    });

    const advancePayment = Math.round(totalPrice * 0.4);
    const balanceRemaining = totalPrice - advancePayment;
    const estimatedDurationMin = Math.min(300, Math.max(75, selectedServices.length * 75));

    return {
      totalPrice,
      advancePayment,
      balanceRemaining,
      itemsDetailed,
      hasUnpriced,
      estimatedDurationMin,
      count: selectedServices.length,
    };
  }, [selectedServices, allServices, activeServices]);

  // Evaluate 06:00-20:00 schedule availability in real time
  const slotEvaluations = useMemo(() => {
    return evaluateDaySchedule({
      date,
      locationType,
      district: locationType === 'estudio' ? 'Pueblo Libre' : district,
      totalPEN: financialTotals.totalPrice,
      estimatedDurationMin: financialTotals.estimatedDurationMin,
      config: scheduleConfig,
      activeLocks,
    });
  }, [
    date,
    locationType,
    district,
    financialTotals.totalPrice,
    financialTotals.estimatedDurationMin,
    scheduleConfig,
    activeLocks,
  ]);

  const selectedSlotEval = useMemo(() => {
    return slotEvaluations.find((ev) => ev.timeSlot === timeSlot) || slotEvaluations[0];
  }, [slotEvaluations, timeSlot]);

  // Keep selected slot aligned to an available slot if rules/date/district changed
  useEffect(() => {
    const current = slotEvaluations.find((ev) => ev.timeSlot === timeSlot);

    if (!current || !current.available) {
      const firstAvailable = slotEvaluations.find((ev) => ev.available);

      if (firstAvailable && firstAvailable.timeSlot !== timeSlot) {
        setTimeSlot(firstAvailable.timeSlot);
      }
    }
  }, [slotEvaluations, timeSlot]);

  const availableServicesToAdd = useMemo(() => {
    if (addCategoryFilter === 'todos') {
      return activeServices;
    }

    return activeServices.filter((s) => s.category === addCategoryFilter);
  }, [activeServices, addCategoryFilter]);

  const handleAddService = () => {
    if (!serviceToAddId) return;

    setSelectedServices((prev) => [
      ...prev,
      {
        instanceId: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        serviceId: serviceToAddId,
        optionIndex: 0,
      },
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
        item.instanceId === instanceId ? { ...item, optionIndex: newOptionIndex } : item,
      ),
    );
  };

  const handleUpdateServiceId = (instanceId: string, newServiceId: string) => {
    setSelectedServices((prev) =>
      prev.map((item) =>
        item.instanceId === instanceId ? { ...item, serviceId: newServiceId, optionIndex: 0 } : item,
      ),
    );
  };

  const handleProceedToStep2 = () => {
    if (selectedServices.length === 0) {
      setStepError('Por favor selecciona al menos un servicio para continuar.');

      return;
    }

    setStepError(null);
    setCurrentStep(2);
  };

  const handleProceedToStep3 = () => {
    if (!date) {
      setStepError('Por favor selecciona la fecha deseada para tu cita.');

      return;
    }

    if (locationType !== 'estudio' && !district) {
      setStepError('Por favor selecciona tu distrito en Lima.');

      return;
    }

    if (!selectedSlotEval || !selectedSlotEval.available) {
      setStepError(
        selectedSlotEval?.reasonText ||
          'El horario elegido no se encuentra disponible. Selecciona otra franja o atiende en estudio.',
      );

      return;
    }

    setStepError(null);
    setCurrentStep(3);
  };

  const handleProceedToStep4 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (clientName.trim().length < 2) {
      setStepError('Por favor ingresa tu nombre y apellidos.');

      return;
    }

    if (!clientPhone.trim() || clientPhone.trim().length < 7) {
      setStepError('Por favor ingresa tu número de WhatsApp para contactarte.');

      return;
    }

    if (!privacyAccepted) {
      setStepError('Debes aceptar la Política de Privacidad y condiciones de cancelación.');

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
      // Ignore clipboard failures
    }
  };

  const buildConsolidatedMessage = (codeOverride?: string) => {
    const isStudio = locationType === 'estudio';
    const bookingRef = codeOverride || confirmedBookingCode || 'POR-GENERAR';

    const serviceLines: string[] = [];

    for (let idx = 0; idx < financialTotals.itemsDetailed.length; idx++) {
      const it = financialTotals.itemsDetailed[idx];

      if (it.service.id === 'manos-press-on-nails') {
        serviceLines.push(`  ${idx + 1}. *${it.service.name}* — Bajo pedido / A cotizar`);
      } else {
        const optText = it.optionLabel ? ` (${it.optionLabel})` : '';
        const priceText = it.price > 0 ? `S/ ${it.price}` : it.service.priceNote || 'Bajo pedido';

        serviceLines.push(`  ${idx + 1}. *${it.service.name}*${optText} — ${priceText}`);
      }
    }

    const totalText = financialTotals.hasUnpriced
      ? financialTotals.totalPrice > 0
        ? `S/ ${financialTotals.totalPrice} (+ servicio bajo pedido)`
        : 'A cotizar bajo pedido'
      : `S/ ${financialTotals.totalPrice}`;

    const advanceText =
      financialTotals.advancePayment > 0
        ? `S/ ${financialTotals.advancePayment} (Yape al 993 067 291 - Ana Díaz)`
        : 'A coordinar por WhatsApp';

    const paymentDetail =
      scheduleConfig.paymentMode === 'gateway_checkout'
        ? 'Pasarela Online Validada'
        : yapeOperationCode.trim()
          ? `Yape Operación #${yapeOperationCode.trim()}`
          : 'Pendiente de abono / envío de captura';

    const lines: string[] = [
      `🌿 *FICHA DE RESERVA MERAKI SPA (${bookingRef})* 🌿`,
      '━━━━━━━━━━━━━━━━━━━━',
      `✨ *Servicios (${financialTotals.count}):*`,
      serviceLines.join('\n'),
      '━━━━━━━━━━━━━━━━━━━━',
      `💰 *Total:* ${totalText}`,
      `💳 *Adelanto (40%):* ${advanceText}`,
      `🧾 *Estado del abono:* ${paymentDetail}`,
      '━━━━━━━━━━━━━━━━━━━━',
      `📍 *Modalidad:* ${
        isStudio
          ? 'Presencial en Estudio (Pueblo Libre)'
          : locationType === 'casa'
            ? 'En Casa / Domicilio'
            : 'En Oficina / Trabajo'
      }`,
      isStudio
        ? `🏠 *Dirección Estudio:* ${SPA_INFO.studioAddress}`
        : `📌 *Distrito:* ${district}`,
      !isStudio ? `🏠 *Dirección/Ref:* ${address.trim() || 'Por coordinar'}` : '',
      `📅 *Fecha:* ${date}`,
      `⏰ *Bloque horario:* ${timeSlot} hrs`,
      '━━━━━━━━━━━━━━━━━━━━',
      `👤 *Clienta:* ${clientName.trim()}`,
      `📱 *WhatsApp:* ${clientPhone.trim()}`,
      clientEmail.trim() ? `📧 *Correo:* ${clientEmail.trim()}` : '',
      specialNotes.trim() ? `📝 *Notas/Alergias:* ${specialNotes.trim()}` : '',
      '━━━━━━━━━━━━━━━━━━━━',
      '¡Hola Ana Díaz / Meraki! Envío mi ficha de reserva registrada en la web para coordinar detalles y confirmar mi cita.',
    ];

    const nonEmpty: string[] = [];

    for (const ln of lines) {
      if (ln) nonEmpty.push(ln);
    }

    return nonEmpty.join('\n');
  };

  const leadTrackedRef = useRef<boolean>(false);

  const triggerBookingConversion = () => {
    if (leadTrackedRef.current) return;

    leadTrackedRef.current = true;

    const titles: string[] = [];

    for (const it of financialTotals.itemsDetailed) {
      titles.push(`${it.service.name}${it.optionLabel ? ` (${it.optionLabel})` : ''}`);
    }

    const mainTitle = titles.join(' + ');

    trackMetaLead({
      content_name: `Cita Spa (${financialTotals.count} servicios) - ${mainTitle}`,
      content_category: 'Cita Spa',
      value: financialTotals.totalPrice,
      currency: 'PEN',
    });

    trackMetaSchedule({
      content_name: `Cita Spa - ${mainTitle}`,
      value: financialTotals.totalPrice,
      currency: 'PEN',
    });

    trackTikTokSubmitForm({
      content_name: `Cita Spa - ${mainTitle}`,
      content_category: 'Cita Spa',
      value: financialTotals.totalPrice,
      currency: 'PEN',
    });

    trackTikTokCompleteRegistration({
      content_name: `Cita Spa - ${mainTitle}`,
      content_category: 'Cita Spa',
      value: financialTotals.totalPrice,
      currency: 'PEN',
    });
  };

  const handleConfirmBookingInWeb = async () => {
    if (!clientName.trim() || !clientPhone.trim()) {
      setStepError('Completa tu nombre y WhatsApp en el Paso 3.');

      return;
    }

    if (!selectedSlotEval || !selectedSlotEval.available) {
      setStepError('El bloque horario seleccionado ya no está disponible.');

      return;
    }

    setStepError(null);
    setIsSubmitting(true);

    const newCode = `MRK-SPA-${Math.floor(10000 + Math.random() * 90000)}`;
    const hasYapeCode = Boolean(yapeOperationCode.trim());
    const isGateway = scheduleConfig.paymentMode === 'gateway_checkout';

    const serviceLines: BookingServiceLine[] = [];
    const summaryParts: string[] = [];

    for (const it of financialTotals.itemsDetailed) {
      serviceLines.push({
        serviceId: it.service.id,
        serviceName: it.service.name,
        optionLabel: it.optionLabel || 'Estándar',
        pricePEN: it.price,
      });
      summaryParts.push(
        `${it.service.name}${it.optionLabel ? ` [${it.optionLabel}]` : ''} (S/ ${it.price})`,
      );
    }

    const servicesSummaryString = summaryParts.join(' + ');
    const resolvedDistrict = locationType === 'estudio' ? 'Pueblo Libre' : district;

    const bookingPayload: MerakiBooking = {
      bookingCode: newCode,
      uid: user?.uid || '',
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim(),
      specialNotes: specialNotes.trim(),
      services: serviceLines,
      servicesSummary: servicesSummaryString,
      locationType,
      district: resolvedDistrict,
      address: locationType === 'estudio' ? SPA_INFO.studioAddress : address.trim(),
      date,
      timeSlot,
      estimatedDurationMin: financialTotals.estimatedDurationMin,
      totalPEN: financialTotals.totalPrice,
      advancePEN: financialTotals.advancePayment,
      paymentMode: scheduleConfig.paymentMode,
      paymentStatus: isGateway
        ? 'gateway_paid'
        : hasYapeCode
          ? 'manual_code_submitted'
          : 'pending_yape',
      yapeOperationCode: isGateway ? 'GATEWAY-OK' : yapeOperationCode.trim(),
      status: isGateway
        ? 'confirmed'
        : hasYapeCode
          ? 'manual_code_submitted'
          : 'pending_yape',
      privacyAccepted: true,
    };

    try {
      await createAtomicBooking(bookingPayload);
      triggerBookingConversion();

      await syncLeadToGoogleSheets({
        formulario: 'Cita Spa',
        cliente: clientName.trim(),
        whatsapp: clientPhone.trim(),
        email: clientEmail.trim() || undefined,
        servicio_detalle: servicesSummaryString,
        modalidad:
          locationType === 'estudio' ? 'Estudio (Pueblo Libre)' : `A Domicilio (${resolvedDistrict})`,
        distrito: resolvedDistrict,
        direccion: locationType === 'estudio' ? SPA_INFO.studioAddress : address.trim() || undefined,
        fecha_preferida: date,
        hora_preferida: timeSlot,
        monto_total: `S/ ${financialTotals.totalPrice}`,
        monto_adelanto: `S/ ${financialTotals.advancePayment} (40%)`,
        estado_pago: isGateway
          ? 'Pagado en Pasarela'
          : hasYapeCode
            ? 'Código Yape Registrado (Por Validar)'
            : 'Pendiente de abono',
        codigo_yape: yapeOperationCode.trim() || undefined,
        codigo_reserva: newCode,
        mensaje_notas: specialNotes.trim() || undefined,
      });

      setConfirmedBookingCode(newCode);
      setIsSubmitted(true);
    } catch {
      setStepError(
        'No pudimos registrar este horario (puede haberse reservado hace unos segundos). Recarga los horarios e intenta nuevamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildConsolidatedMessage());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Fallback ignored
    }
  };

  const handleDownloadReceipt = () => {
    const content = buildConsolidatedMessage(confirmedBookingCode);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `Constancia-${confirmedBookingCode || 'MerakiSpa'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const whatsappUrl = `https://wa.me/${SPA_INFO.whatsappNumber}?text=${encodeURIComponent(
    buildConsolidatedMessage(),
  )}`;

  if (!isOpen) return null;

  const isStudio = locationType === 'estudio';

  const modalContent = (
    <div
      className="meraki-overlay-enter fixed inset-0 z-[99998] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/60 backdrop-blur-sm text-left"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-booking-title"
      onClick={onClose}
    >
      <div
        className="meraki-modal-panel relative w-full max-w-2xl bg-[#FFF2DE] rounded-3xl overflow-hidden shadow-2xl border border-[#5E765E]/20 max-h-[92vh] flex flex-col"
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
              Agenda Inteligente Meraki (06:00 – 20:00)
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

          {/* Unified 4-Step Progress Bar */}
          {!isSubmitted && (
            <div className="mt-4 pt-3 border-t border-white/15">
              <div className="flex items-center justify-between text-[11px] sm:text-xs font-['Montserrat',sans-serif] mb-2">
                {[
                  { step: 1 as const, label: '1. Servicios' },
                  { step: 2 as const, label: '2. Modalidad' },
                  { step: 3 as const, label: '3. Datos' },
                  { step: 4 as const, label: '4. Confirmar' },
                ].map((item, idx) => (
                  <div key={item.step} className="flex items-center flex-1 last:flex-initial">
                    <button
                      type="button"
                      onClick={() => {
                        if (item.step <= currentStep) {
                          setStepError(null);
                          setCurrentStep(item.step);
                        }
                      }}
                      className={`flex items-center gap-1 transition-colors cursor-pointer ${
                        currentStep === item.step
                          ? 'text-white font-bold'
                          : currentStep > item.step
                            ? 'text-[#D5A688] hover:text-white font-medium'
                            : 'text-white/55'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          currentStep === item.step
                            ? 'bg-[#D5A688] text-[#111111] font-bold'
                            : currentStep > item.step
                              ? 'bg-[#D5A688]/30 text-[#D5A688] font-bold'
                              : 'bg-white/20 text-white/75'
                        }`}
                      >
                        {currentStep > item.step ? '✓' : item.step}
                      </span>
                      <span className="hidden sm:inline">{item.label}</span>
                    </button>
                    {idx < 3 && <div className="h-[1px] flex-1 mx-1.5 sm:mx-2 bg-white/20" />}
                  </div>
                ))}
              </div>

              <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#D5A688] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${currentStep * 25}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-7 flex-1">
          {stepError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{stepError}</span>
            </div>
          )}

          {isSubmitted ? (
            /* =====================================================================
               ON-SCREEN OFFICIAL CONFIRMATION + MANDATORY WHATSAPP HANDOFF
               ===================================================================== */
            <div className="py-2 space-y-5 animate-fade-in text-center">
              <div className="w-16 h-16 rounded-full bg-[#5E765E]/15 text-[#5E765E] flex items-center justify-center mx-auto ring-8 ring-[#5E765E]/10">
                <CheckCircle2 className="w-10 h-10 text-[#5E765E]" />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-[#5E765E] block mb-1">
                  Constancia Registrada • {confirmedBookingCode}
                </span>
                <h3 className="font-['Cormorant_Garamond',serif] text-3xl font-normal text-[#111111]">
                  ¡Reserva Registrada en la Web!
                </h3>
                <p className="font-['Montserrat',sans-serif] text-xs text-[#111111]/80 max-w-md mx-auto mt-2 leading-relaxed">
                  Hemos guardado tu cita para el <strong>{date}</strong> a las <strong>{timeSlot} hrs</strong> y enviado notificación automática a <strong>{CENTRAL_OWNER_EMAIL}</strong>
                  {clientEmail.trim() ? ` y a ${clientEmail.trim()}` : ''}.
                </p>
              </div>

              {/* Mandatory WhatsApp Guidance Box while Manual Yape is active */}
              <div className="p-4 rounded-2xl bg-[#25D366]/10 border-2 border-[#25D366]/45 max-w-lg mx-auto text-left space-y-3">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-[#1A8D45] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                      Último Paso Importante: Envía tu Ficha por WhatsApp
                    </h4>
                    <p className="text-[11px] text-[#111111]/80 leading-relaxed mt-1">
                      Para que <strong>Ana Díaz</strong> valide tu abono del 40% (Yape <strong>993 067 291</strong>) y mantenga comunicación directa contigo antes de tu cita, envía ahora tu ficha prellenada por WhatsApp:
                    </p>
                  </div>
                </div>

                <a
                  id="btn-confirm-send-whatsapp"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1EB858] text-white px-6 py-4 rounded-full text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-wider shadow-lg transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Enviar Ficha &amp; Comprobante por WhatsApp</span>
                </a>
              </div>

              {/* Consolidated Receipt */}
              <div className="theme-card-surface rounded-2xl p-5 text-left text-xs font-['Montserrat',sans-serif] space-y-3 max-w-lg mx-auto">
                <div className="flex items-center justify-between border-b border-[#5E765E]/15 pb-2.5">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[#5E765E]">
                    Constancia {confirmedBookingCode}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF2DE] border border-[#D5A688]/40 text-[#9A6342] font-semibold">
                    {scheduleConfig.paymentMode === 'gateway_checkout'
                      ? 'Validación Online'
                      : yapeOperationCode.trim()
                        ? `Yape #${yapeOperationCode.trim()}`
                        : 'Pendiente de abono'}
                  </span>
                </div>

                <div className="space-y-1.5 text-[#111111]">
                  {financialTotals.itemsDetailed.map((it, idx) => (
                    <div key={it.instanceId} className="flex justify-between items-start gap-3">
                      <span className="font-medium">
                        {idx + 1}. {it.service.name}
                        {it.optionLabel ? ` (${it.optionLabel})` : ''}
                      </span>
                      <span className="font-bold text-[#5E765E] shrink-0">{it.formattedPrice}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2.5 border-t border-[#5E765E]/15 space-y-1 text-[11px]">
                  <p>
                    <strong>Clienta:</strong> {clientName} ({clientPhone})
                  </p>
                  <p>
                    <strong>Modalidad:</strong>{' '}
                    {isStudio ? `Estudio (${SPA_INFO.studioAddress})` : `Domicilio • ${district} ${address ? `(${address})` : ''}`}
                  </p>
                  <p>
                    <strong>Total:</strong> S/ {financialTotals.totalPrice} •{' '}
                    <strong className="text-[#5E765E]">Adelanto 40%: S/ {financialTotals.advancePayment}</strong>
                  </p>
                </div>
              </div>

              {/* Download / Print / Copy Row */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-lg mx-auto">
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#5E765E]/30 bg-white hover:bg-[#FFF2DE] text-[#111111] text-xs font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#5E765E]" />
                  <span>Descargar Constancia</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#5E765E]/30 bg-white hover:bg-[#FFF2DE] text-[#111111] text-xs font-semibold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#5E765E]" />
                  <span>Imprimir</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#5E765E]/30 bg-white hover:bg-[#FFF2DE] text-[#111111] text-xs font-semibold cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#5E765E]" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#5E765E]" />
                      <span>Copiar Ficha</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* STEP 1: SERVICES */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-[#5E765E]/15">
                    <div>
                      <span className="text-[10px] font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#5E765E]">
                        Paso 1 de 4: Selección de Servicios
                      </span>
                      <h3 className="font-['Cormorant_Garamond',serif] text-xl sm:text-2xl font-normal text-[#111111]">
                        ¿Qué tratamientos deseas agendar?
                      </h3>
                    </div>
                    <span className="text-[11px] text-[#5E765E] font-medium bg-[#5E765E]/10 px-3 py-1 rounded-full self-start sm:self-auto">
                      {financialTotals.count} {financialTotals.count === 1 ? 'servicio' : 'servicios'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedServices.map((item) => {
                      const { service, formattedPrice } = getItemDetails(item);

                      return (
                        <div key={item.instanceId} className="theme-card-surface p-4 rounded-2xl space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <label htmlFor={`srv-select-${item.instanceId}`} className="sr-only">
                                Seleccionar servicio
                              </label>
                              <select
                                id={`srv-select-${item.instanceId}`}
                                value={item.serviceId}
                                onChange={(e) => handleUpdateServiceId(item.instanceId, e.target.value)}
                                className="w-full text-xs font-semibold text-[#111111] bg-transparent border-0 border-b border-[#5E765E]/20 py-1 focus:outline-none focus:border-[#5E765E] cursor-pointer"
                              >
                                {activeServices.map((srv) => (
                                  <option key={srv.id} value={srv.id}>
                                    {srv.name} —{' '}
                                    {srv.priceNote ||
                                      (srv.pricePEN
                                        ? `S/. ${srv.pricePEN}`
                                        : srv.priceOptions?.[0]?.pricePEN
                                          ? `Desde S/. ${srv.priceOptions[0].pricePEN}`
                                          : 'Bajo pedido')}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-sm sm:text-base font-bold text-[#5E765E] font-['Montserrat',sans-serif]">
                                {formattedPrice}
                              </span>
                              {selectedServices.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveService(item.instanceId)}
                                  className="w-7 h-7 rounded-full text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                                  aria-label={`Quitar ${service.name}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

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
                                        ? 'bg-[#5E765E] text-[#FFF2DE] border-[#5E765E] font-medium'
                                        : 'bg-[#FFF2DE]/40 text-[#111111] border-[#5E765E]/15 hover:border-[#5E765E]/30'
                                    }`}
                                  >
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span>{opt.label}</span>
                                      <span
                                        className={
                                          item.optionIndex === optIdx
                                            ? 'text-[#D5A688] font-bold'
                                            : 'text-[#5E765E] font-bold'
                                        }
                                      >
                                        S/. {opt.pricePEN}
                                      </span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {service.note && (
                            <div className="p-2.5 rounded-xl bg-[#FFF2DE]/90 border border-[#D5A688]/40 text-[11px] text-[#111111]/85 flex items-start gap-2">
                              <AlertCircle className="w-3.5 h-3.5 text-[#9A6342] shrink-0 mt-0.5" />
                              <span className="leading-snug">{service.note}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {showAddServiceBox ? (
                    <div className="p-4 rounded-2xl bg-white border border-[#5E765E]/30 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#5E765E]">
                          + Añadir otro servicio:
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAddServiceBox(false)}
                          className="text-xs text-[#111111]/60 hover:text-[#111111] cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>

                      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setAddCategoryFilter(cat.id);

                              const match = activeServices.find(
                                (s) => cat.id === 'todos' || s.category === cat.id,
                              );

                              if (match) setServiceToAddId(match.id);
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

                      <select
                        value={serviceToAddId}
                        onChange={(e) => setServiceToAddId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#5E765E]/20 text-xs text-[#111111] bg-white focus:outline-none focus:border-[#5E765E]"
                      >
                        {availableServicesToAdd.map((srv) => (
                          <option key={srv.id} value={srv.id}>
                            {srv.name} —{' '}
                            {srv.priceNote ||
                              (srv.pricePEN
                                ? `S/. ${srv.pricePEN}`
                                : srv.priceOptions?.[0]?.pricePEN
                                  ? `Desde S/. ${srv.priceOptions[0].pricePEN}`
                                  : 'Bajo pedido')}
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
                      <span>Agregar otro servicio a la cita</span>
                    </button>
                  )}

                  <div className="pt-4 border-t border-[#5E765E]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-left w-full sm:w-auto">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[10px] text-[#111111]/70 uppercase tracking-wider font-semibold">
                          Subtotal:
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
                      className="meraki-btn-fluid w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] text-xs font-bold uppercase tracking-[0.16em] shadow-md cursor-pointer"
                    >
                      <span>Continuar a Modalidad &amp; Agenda</span>
                      <ArrowRight className="w-4 h-4 text-[#D5A688]" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: MODALITY, GEO LOGISTICS & 06:00-20:00 REAL-TIME AGENDA */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="pb-1 border-b border-[#5E765E]/15">
                    <span className="text-[10px] font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#5E765E]">
                      Paso 2 de 4: Modalidad &amp; Agenda Inteligente
                    </span>
                    <h3 className="font-['Cormorant_Garamond',serif] text-xl sm:text-2xl font-normal text-[#111111]">
                      ¿Dónde y en qué bloque horario (06:00 – 20:00)?
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <span className="block text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#5E765E]">
                      Modalidad de Atención
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setLocationType('estudio');
                          setDistrict('Pueblo Libre');
                        }}
                        className={`py-3 px-3 rounded-xl text-xs border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          locationType === 'estudio'
                            ? 'bg-[#5E765E] text-[#FFF2DE] border-[#5E765E] font-semibold'
                            : 'bg-white border-[#5E765E]/20 text-[#111111]'
                        }`}
                      >
                        <MapPin className="w-4 h-4 text-[#D5A688]" />
                        <span>En Estudio (Pueblo Libre)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLocationType('casa');

                          if (district === 'Pueblo Libre') setDistrict('Miraflores');
                        }}
                        className={`py-3 px-3 rounded-xl text-xs border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          locationType === 'casa'
                            ? 'bg-[#5E765E] text-[#FFF2DE] border-[#5E765E] font-semibold'
                            : 'bg-white border-[#5E765E]/20 text-[#111111]'
                        }`}
                      >
                        <HomeIcon className="w-4 h-4 text-[#D5A688]" />
                        <span>En Casa / Domicilio</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLocationType('trabajo');

                          if (district === 'Pueblo Libre') setDistrict('San Isidro');
                        }}
                        className={`py-3 px-3 rounded-xl text-xs border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          locationType === 'trabajo'
                            ? 'bg-[#5E765E] text-[#FFF2DE] border-[#5E765E] font-semibold'
                            : 'bg-white border-[#5E765E]/20 text-[#111111]'
                        }`}
                      >
                        <Building className="w-4 h-4 text-[#D5A688]" />
                        <span>En Oficina / Trabajo</span>
                      </button>
                    </div>

                    {isStudio ? (
                      <div className="bg-[#5E765E]/10 border border-[#5E765E]/25 rounded-2xl p-4 flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-[#5E765E] shrink-0 mt-0.5" />
                        <div className="text-left text-xs">
                          <p className="font-semibold text-[#111111]">{SPA_INFO.studioAddress}</p>
                          <p className="text-[11px] text-[#111111]/70 font-light mt-0.5">
                            Sin costo adicional de movilidad • Cabina privada biosegura.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="booking-district"
                            className="block text-[10px] text-[#111111]/70 uppercase tracking-wider mb-1 font-semibold"
                          >
                            Distrito en Lima *
                          </label>
                          <select
                            id="booking-district"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs focus:outline-none focus:border-[#5E765E]"
                          >
                            {LIMA_DISTRICT_NAMES.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="booking-address"
                            className="block text-[10px] text-[#111111]/70 uppercase tracking-wider mb-1 font-semibold"
                          >
                            Dirección o Referencia
                          </label>
                          <input
                            id="booking-address"
                            type="text"
                            placeholder="Calle, número, dpto o referencia..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs focus:outline-none focus:border-[#5E765E]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Date & Real-Time Smart Slots (06:00 - 20:00 ONLY) */}
                  <div className="border-t border-[#5E765E]/15 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="booking-date"
                        className="text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#5E765E] flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Fecha de Atención *</span>
                      </label>
                      {loadingAgenda && (
                        <span className="text-[11px] text-[#5E765E]">Verificando agenda...</span>
                      )}
                    </div>

                    <input
                      id="booking-date"
                      type="date"
                      value={date}
                      min={todayIso}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs focus:outline-none focus:border-[#5E765E]"
                      required
                    />

                    <div>
                      <span className="block text-[10px] text-[#111111]/75 uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#5E765E]" />
                        <span>Horarios Disponibles (06:00 a 20:00 hrs)</span>
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {slotEvaluations.map((ev) => {
                          const isSelected = timeSlot === ev.timeSlot && ev.available;

                          return (
                            <button
                              key={ev.timeSlot}
                              type="button"
                              disabled={!ev.available}
                              onClick={() => setTimeSlot(ev.timeSlot)}
                              title={ev.reasonText}
                              className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center justify-center gap-0.5 ${
                                !ev.available
                                  ? 'bg-stone-200/70 border-stone-300/60 text-stone-400 cursor-not-allowed line-through'
                                  : isSelected
                                    ? 'bg-[#5E765E] text-[#FFF2DE] border-[#5E765E] shadow-sm cursor-pointer'
                                    : 'bg-white text-[#111111] border-[#5E765E]/25 hover:border-[#5E765E] cursor-pointer'
                              }`}
                            >
                              <span>{ev.timeSlot}</span>
                              <span
                                className={`text-[9px] font-normal ${
                                  !ev.available
                                    ? 'text-stone-400 no-underline'
                                    : isSelected
                                      ? 'text-[#D5A688]'
                                      : 'text-[#5E765E]'
                                }`}
                              >
                                {!ev.available
                                  ? 'No disp.'
                                  : ev.isConditionalBonus
                                    ? 'Ruta cercana'
                                    : 'Disponible'}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Smart guidance when selected/any slot triggers geo or minimum ticket policy */}
                      {selectedSlotEval && !selectedSlotEval.available && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-2">
                          <p>{selectedSlotEval.reasonText}</p>
                          {!isStudio && selectedSlotEval.reasonCode === 'low_ticket_distant' && (
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setLocationType('estudio');
                                  setDistrict('Pueblo Libre');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-[#5E765E] text-white font-semibold cursor-pointer"
                              >
                                Cambiar a Estudio (Pueblo Libre)
                              </button>
                              <button
                                type="button"
                                onClick={() => setCurrentStep(1)}
                                className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-950 font-semibold cursor-pointer"
                              >
                                Agregar otro tratamiento
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#5E765E]/15 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#5E765E]/30 bg-white hover:bg-[#FFF2DE] text-[#111111] text-xs font-medium uppercase tracking-wider cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleProceedToStep3}
                      className="meraki-btn-fluid inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] text-xs font-bold uppercase tracking-[0.16em] shadow-md cursor-pointer"
                    >
                      <span>Continuar a Tus Datos</span>
                      <ArrowRight className="w-4 h-4 text-[#D5A688]" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: CLIENT CONTACT & MANDATORY PRIVACY CONSENT */}
              {currentStep === 3 && (
                <form onSubmit={handleProceedToStep4} className="space-y-5 animate-fade-in">
                  <div className="pb-1 border-b border-[#5E765E]/15">
                    <span className="text-[10px] font-['Montserrat',sans-serif] uppercase font-bold tracking-wider text-[#5E765E]">
                      Paso 3 de 4: Tus Datos y Consentimiento
                    </span>
                    <h3 className="font-['Cormorant_Garamond',serif] text-xl sm:text-2xl font-normal text-[#111111]">
                      Ingresa tus datos para emitir tu ficha de reserva
                    </h3>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/80 border border-[#5E765E]/20 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[#5E765E] font-bold uppercase text-[10px] tracking-wider border-b border-[#5E765E]/10 pb-1.5">
                      <span>Cita: {financialTotals.count} servicios</span>
                      <span>Total: S/. {financialTotals.totalPrice}</span>
                    </div>
                    <p className="text-[11px] text-[#111111]/80 pt-1">
                      <strong>Modalidad:</strong> {isStudio ? 'Estudio (Pueblo Libre)' : `Domicilio (${district})`} •{' '}
                      <strong>Fecha:</strong> {date} ({timeSlot} hrs)
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="booking-name"
                          className="block text-[10px] text-[#111111]/75 uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5"
                        >
                          <User className="w-3.5 h-3.5 text-[#5E765E]" />
                          <span>Nombre y Apellidos *</span>
                        </label>
                        <input
                          id="booking-name"
                          type="text"
                          placeholder="Tu nombre completo"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs focus:outline-none focus:border-[#5E765E]"
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="booking-phone"
                          className="block text-[10px] text-[#111111]/75 uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#5E765E]" />
                          <span>WhatsApp / Celular *</span>
                        </label>
                        <input
                          id="booking-phone"
                          type="tel"
                          placeholder="ej: 993 067 291"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs focus:outline-none focus:border-[#5E765E]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="booking-email"
                        className="block text-[10px] text-[#111111]/75 uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#5E765E]" />
                        <span>Correo Electrónico (recibe tu constancia automática)</span>
                      </label>
                      <input
                        id="booking-email"
                        type="email"
                        placeholder="tu-correo@ejemplo.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs focus:outline-none focus:border-[#5E765E]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="booking-notes"
                        className="block text-[10px] text-[#111111]/75 uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#5E765E]" />
                        <span>Observaciones / Alergias</span>
                      </label>
                      <textarea
                        id="booking-notes"
                        rows={2}
                        placeholder="Retiro de sistema previo, alergias o detalles adicionales..."
                        value={specialNotes}
                        onChange={(e) => setSpecialNotes(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#5E765E]/20 text-[#111111] text-xs focus:outline-none focus:border-[#5E765E]"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-white/90 border border-[#5E765E]/20 flex items-start gap-2.5">
                      <input
                        id="booking-privacy"
                        type="checkbox"
                        checked={privacyAccepted}
                        onChange={(e) => setPrivacyAccepted(e.target.checked)}
                        className="mt-0.5 rounded border-[#5E765E]/40 text-[#5E765E]"
                      />
                      <label htmlFor="booking-privacy" className="text-[11px] text-[#111111]/80 leading-relaxed">
                        He leído y acepto la{' '}
                        <a
                          href="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-[#5E765E] font-semibold"
                        >
                          Política de Privacidad
                        </a>{' '}
                        y las{' '}
                        <a
                          href="/privacy#terminos-cancelaciones"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-[#5E765E] font-semibold"
                        >
                          Condiciones de Reserva y Cancelación (24h)
                        </a>
                        .
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#5E765E]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#5E765E]/30 bg-white hover:bg-[#FFF2DE] text-[#111111] text-xs font-medium uppercase tracking-wider cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver</span>
                    </button>

                    <button
                      type="submit"
                      className="meraki-btn-fluid w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] text-xs font-bold uppercase tracking-[0.16em] shadow-md cursor-pointer"
                    >
                      <span>Revisar Adelanto y Confirmar</span>
                      <ArrowRight className="w-4 h-4 text-[#D5A688]" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 4: WEB REGISTRATION + DECOUPLED PAYMENT ADAPTER */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-fade-in text-left">
                  <div className="pb-2 border-b border-[#5E765E]/15">
                    <span className="text-[10px] font-['Montserrat',sans-serif] uppercase font-bold tracking-[0.2em] text-[#5E765E] block mb-1">
                      Paso 4 de 4: Confirmación Directa &amp; Adelanto del 40%
                    </span>
                    <h3 className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl font-normal text-[#111111]">
                      Finaliza tu Reserva
                    </h3>
                  </div>

                  {/* Decoupled Payment Mode UI */}
                  {scheduleConfig.paymentMode === 'gateway_checkout' ? (
                    <div className="bg-[#FFFDF9] rounded-2xl p-5 border-2 border-[#5E765E]/35 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[#5E765E]" />
                          <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                            Pasarela de Pago Yape / Tarjeta Online
                          </span>
                        </div>
                        <span className="text-sm font-bold text-[#5E765E]">
                          S/ {financialTotals.advancePayment} (40%)
                        </span>
                      </div>
                      <p className="text-xs text-[#111111]/75 font-light leading-relaxed">
                        La validación automática con pasarela bancaria está activa: no necesitas ingresar código de operación manual. Al confirmar, tu cita se registrará e igualmente te invitaremos a enviar tu ficha por WhatsApp para coordinar detalles con tu especialista.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#FFFDF9] rounded-2xl p-4 sm:p-5 border-2 border-[#722282]/35 shadow-sm space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-[#111111] flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-[#722282]" />
                          <span>Adelanto del 40% mediante Yape a Ana Díaz</span>
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#722282] text-white text-xs font-bold">
                          S/ {financialTotals.advancePayment}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <div className="bg-white p-3 rounded-xl border border-[#722282]/20">
                          <span className="text-[10px] text-[#111111]/60 uppercase block font-semibold">
                            Titular del Yape:
                          </span>
                          <strong className="text-sm text-[#111111] block mt-0.5">
                            Ana María Díaz (Ana Díaz)
                          </strong>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-[#722282]/20 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-[#111111]/60 uppercase block font-semibold">
                              Número Yape:
                            </span>
                            <strong className="text-base font-mono text-[#722282] block">993 067 291</strong>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyYapeNumber}
                            className="px-3 py-1.5 rounded-lg bg-[#722282]/10 hover:bg-[#722282]/20 text-[#722282] text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            {isYapeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isYapeCopied ? '¡Copiado!' : 'Copiar'}</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="booking-yape-code"
                          className="block text-[11px] font-semibold text-[#111111] mb-1"
                        >
                          N° de Operación Yape (opcional si aún vas a realizar el yapeo):
                        </label>
                        <input
                          id="booking-yape-code"
                          type="text"
                          placeholder="Ej. 4829104 (o deja en blanco para marcar Pendiente de abono)"
                          value={yapeOperationCode}
                          onChange={(e) => setYapeOperationCode(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#722282]/25 text-xs text-[#111111] focus:outline-none focus:border-[#722282]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="p-3.5 rounded-2xl bg-[#EDF2EC]/80 border border-[#5E765E]/20 text-[11px] text-[#111111]/80 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#5E765E] shrink-0 mt-0.5" />
                    <span>
                      Al confirmar en la web, reservaremos tu bloque de <strong>{date} ({timeSlot} hrs)</strong>, notificaremos por correo a <strong>{CENTRAL_OWNER_EMAIL}</strong> y te mostraremos el enlace directo a WhatsApp para enviar tu ficha a Ana Díaz.
                    </span>
                  </div>

                  <div className="pt-4 border-t border-[#5E765E]/15 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border border-[#5E765E]/30 bg-white hover:bg-[#FFF2DE] text-[#111111] text-xs font-medium uppercase tracking-wider cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver a Datos</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleConfirmBookingInWeb}
                      className="meraki-btn-fluid w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5E765E] hover:bg-[#4d634d] disabled:opacity-60 text-[#FFF2DE] px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#D5A688]" />
                      <span>
                        {isSubmitting ? 'Registrando Reserva...' : 'Confirmar y Generar Constancia'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return modalContent;
  }

  return createPortal(modalContent, document.body);
}
