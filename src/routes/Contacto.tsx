import { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FloatingWhatsAppButton } from '../components/layout/FloatingWhatsAppButton';
import { SPA_INFO } from '../data/spaData';
import { CATALOG_SERVICES } from '../data/catalog';
import { LIMA_DISTRICT_NAMES } from '../utils/scheduleEngine';
import { useBooking } from '../context/BookingContext';
import { trackMetaLead } from '../utils/metaPixel';
import { trackTikTokSubmitForm } from '../utils/tiktokPixel';
import { syncLeadToGoogleSheets } from '../utils/googleSheetsSync';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import {
  Phone,
  Instagram,
  Clock,
  MapPin,
  MessageSquare,
  Sparkles,
  Send,
  Calendar,
  Home,
  CheckCircle2,
  Mail,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function Contacto() {
  const { openBooking } = useBooking();

  const [inquiryType, setInquiryType] = useState<'movilidad' | 'evento' | 'presson' | 'consulta'>('movilidad');
  const [selectedServiceId, setSelectedServiceId] = useState(CATALOG_SERVICES[0].id);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [district, setDistrict] = useState('Miraflores');
  const [preferredDate, setPreferredDate] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [whatsappHandoffUrl, setWhatsappHandoffUrl] = useState<string>(SPA_INFO.whatsappLink);

  const selectedService = CATALOG_SERVICES.find((s) => s.id === selectedServiceId) || CATALOG_SERVICES[0];
  const servicePricePEN = selectedService.pricePEN || selectedService.priceOptions?.[0]?.pricePEN || 0;
  const todayIso = new Date().toISOString().split('T')[0];

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      setFormError('Por favor ingresa tu nombre completo.');

      return;
    }

    if (!clientPhone.trim() || clientPhone.trim().length < 7) {
      setFormError('Por favor ingresa tu número de WhatsApp para poder responderte.');

      return;
    }

    if (!privacyAccepted) {
      setFormError('Debes aceptar la Política de Privacidad para enviar tu consulta.');

      return;
    }

    setFormError(null);

    const inquiryLabels = {
      movilidad: 'Cotización de Movilidad por Distrito',
      evento: 'Cotización Evento / Despedida / Matrimonio',
      presson: 'Cotización Set Press On Nails a Medida',
      consulta: 'Consulta General de Tratamientos',
    };

    const code = `MRK-CONT-${Math.floor(1000 + Math.random() * 9000)}`;

    trackMetaLead({
      content_name: `Cotización Contacto - ${selectedService.name}`,
      content_category: inquiryLabels[inquiryType],
      value: servicePricePEN,
      currency: 'PEN',
    });

    trackTikTokSubmitForm({
      content_name: `Cotización Contacto - ${selectedService.name}`,
      content_category: inquiryLabels[inquiryType],
      value: servicePricePEN,
      currency: 'PEN',
    });

    void syncLeadToGoogleSheets({
      formulario: 'Contacto Web',
      cliente: clientName.trim(),
      whatsapp: clientPhone.trim(),
      email: clientEmail.trim() || undefined,
      servicio_detalle: `${inquiryLabels[inquiryType]} • ${selectedService.name}`,
      modalidad: inquiryType === 'presson' ? 'Envío / Estudio' : `Consulta (${district})`,
      distrito: district,
      fecha_preferida: preferredDate || 'Por definir',
      hora_preferida: 'Por definir',
      monto_total: servicePricePEN > 0 ? `S/ ${servicePricePEN}` : 'A cotizar',
      estado_pago: 'Consulta informativa',
      mensaje_notas: customNote.trim() || undefined,
      codigo_reserva: code,
    });

    const lines = [
      `Hola Meraki Spa (${code})`,
      `Soy *${clientName.trim()}* (${clientPhone.trim()}).`,
      `• *Motivo:* ${inquiryLabels[inquiryType]}`,
      `• *Servicio de interés:* ${selectedService.name}`,
      `• *Distrito:* ${district}`,
      preferredDate ? `• *Fecha estimada:* ${preferredDate}` : '',
      customNote.trim() ? `• *Detalle:* ${customNote.trim()}` : '',
      '¿Me podrían ayudar con esta cotización? Muchas gracias.',
    ];

    const cleanLines: string[] = [];

    for (const line of lines) {
      if (line) {
        cleanLines.push(line);
      }
    }

    const waHref = `https://wa.me/${SPA_INFO.whatsappNumber}?text=${encodeURIComponent(cleanLines.join('\n'))}`;

    setWhatsappHandoffUrl(waHref);
    setSubmittedCode(code);
  };

  return (
    <div className="min-h-screen meraki-editorial-canvas text-[#111111] font-['Montserrat',sans-serif] flex flex-col selection:bg-[#5E765E] selection:text-[#FFF2DE]">
      <Header />

      <main className="flex-1">
        {/* Banner Hero */}
        <section className="meraki-hero-banner pt-10 lg:pt-24 pb-10 border-b border-[#D5A688]/35 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none select-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#D5A688]/35 blur-3xl" />
            <div className="absolute -bottom-24 -right-20 w-96 h-96 rounded-full bg-[#AEC2AE]/45 blur-3xl" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-t-[130px] sm:rounded-t-[200px] rounded-b-3xl border border-[#D5A688]/40 bg-gradient-to-b from-[#FFFDF9]/90 via-[#FFFDF9]/65 to-[#FFF2DE]/30 backdrop-blur-[2px] px-4 sm:px-10 pt-8 sm:pt-10 pb-7 shadow-[0_16px_40px_-12px_rgba(94,118,94,0.08),inset_0_1px_0_#FFFFFF]">
              <div className="meraki-editorial-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[#5E765E] text-[11px] font-semibold uppercase tracking-[0.2em] mb-4">
                <Phone className="w-3.5 h-3.5 text-[#D5A688]" />
                <span>Canales Oficiales</span>
              </div>
              <h1 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl md:text-6xl font-normal text-[#111111] leading-tight mb-3">
                Ponte en Contacto con Meraki
              </h1>
              <div aria-hidden="true" className="flex items-center justify-center gap-3 mb-4">
                <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent via-[#D5A688]/70 to-[#5E765E]/50" />
                <span className="w-1.5 h-1.5 rotate-45 bg-[#D5A688]" />
                <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent via-[#D5A688]/70 to-[#5E765E]/50" />
              </div>
              <p className="font-['Montserrat',sans-serif] text-sm sm:text-base text-[#111111]/75 max-w-xl mx-auto font-light leading-relaxed mb-2">
                ¿Quieres agendar tu cita con disponibilidad real o solicitar una cotización para domicilio, evento o set Press On? Estamos aquí para atenderte.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info & Focused Consultation Form */}
        <section className="py-16 meraki-section-cream">
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column: Direct Info Cards + Primary Booking CTA */}
              <ScrollReveal className="lg:col-span-5 space-y-6 text-left">
                {/* Direct Booking Wizard Card */}
                <div className="p-6 rounded-3xl meraki-section-sage text-[#FFF2DE] shadow-md">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-[#D5A688]" />
                      <span className="font-semibold text-xs uppercase tracking-wider text-[#D5A688]">
                        Reserva Online con Agenda Real
                      </span>
                    </div>
                    <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-normal text-white mb-2">
                      ¿Ya sabes qué día y hora deseas?
                    </h2>
                    <p className="text-xs font-light text-[#FFF2DE]/90 leading-relaxed mb-4">
                      Consulta horarios disponibles de <strong>06:00 a 20:00</strong>, registra tus tratamientos y obtén tu ficha de reserva con Yape al instante.
                    </p>
                    <button
                      type="button"
                      onClick={() => openBooking()}
                      className="meraki-btn-fluid w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFFDF9] text-[#5E765E] px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white shadow-sm cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-[#D5A688]" />
                      <span>Abrir Agenda de Citas</span>
                    </button>
                  </div>
                </div>

                {/* Direct Contact Card */}
                <div className="theme-card-surface rounded-3xl p-8">
                  <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111] mb-6">
                    Canales Directos
                  </h2>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#5E765E]/10 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-6 h-6 text-[#5E765E]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E] block">
                          Atención Directa WhatsApp
                        </span>
                        <a
                          href={SPA_INFO.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-base text-[#111111] hover:text-[#5E765E] transition-colors"
                        >
                          WhatsApp: {SPA_INFO.whatsappDisplay}
                        </a>
                        <p className="text-xs text-[#111111]/60 font-light mt-0.5">
                          Coordinación directa con Ana Díaz
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#D5A688]/15 flex items-center justify-center shrink-0">
                        <Mail className="w-6 h-6 text-[#9A6342]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#9A6342] block">
                          Correo Oficial
                        </span>
                        <a
                          href={`mailto:${SPA_INFO.email}`}
                          className="font-semibold text-sm text-[#111111] hover:text-[#5E765E] transition-colors break-all"
                        >
                          {SPA_INFO.email}
                        </a>
                        <p className="text-xs text-[#111111]/60 font-light mt-0.5">
                          Confirmaciones, eventos y atención al cliente
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#D5A688]/15 flex items-center justify-center shrink-0">
                        <Instagram className="w-6 h-6 text-[#D5A688]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#9A6342] block">
                          Redes Sociales
                        </span>
                        <a
                          href={SPA_INFO.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-base text-[#111111] hover:text-[#5E765E] transition-colors"
                        >
                          {SPA_INFO.instagram}
                        </a>
                        <p className="text-xs text-[#111111]/60 font-light mt-0.5">
                          Mira fotos reales de resultados y sistemas
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#5E765E]/10 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-[#5E765E]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E] block">
                          Horarios de Atención
                        </span>
                        <p className="font-semibold text-xs text-[#111111]">
                          {SPA_INFO.hours.weekdays}
                        </p>
                        <p className="text-xs text-[#111111]/60 font-light mt-0.5">
                          {SPA_INFO.hours.weekends}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#5E765E] text-[#FFF2DE] flex items-center justify-center shrink-0 shadow-sm">
                        <MapPin className="w-6 h-6 text-[#D5A688]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E] block">
                          Estudio Presencial (Previa Cita)
                        </span>
                        <p className="font-semibold text-xs text-[#111111]">
                          {SPA_INFO.studioAddress}
                        </p>
                        <p className="text-xs text-[#111111]/60 font-light mt-0.5">
                          Atención en cabina privada • Sin costo de movilidad
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#FFF2DE] border border-[#5E765E]/20 flex items-center justify-center shrink-0">
                        <Home className="w-6 h-6 text-[#5E765E]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E] block">
                          Servicio a Domicilio y Oficina
                        </span>
                        <p className="font-semibold text-xs text-[#111111]">
                          Atención en distritos de Lima Metropolitana
                        </p>
                        <p className="text-xs text-[#111111]/60 font-light mt-0.5">
                          Movilidad transparente según zona y ruta diaria
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Right Column: Focused Consultation / Quote Form */}
              <ScrollReveal delay={100} className="lg:col-span-7 text-left">
                <div className="theme-card-surface rounded-3xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-[#5E765E] text-[#FFF2DE] flex items-center justify-center shadow-sm">
                      <Sparkles className="w-5 h-5 text-[#D5A688]" />
                    </div>
                    <div>
                      <span className="meraki-editorial-pill inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E] mb-1">
                        Consultas &amp; Cotizaciones
                      </span>
                      <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111]">
                        Solicitar Cotización Personalizada
                      </h2>
                    </div>
                  </div>

                  {submittedCode ? (
                    <div className="py-6 text-center space-y-5 animate-fade-in">
                      <div className="w-16 h-16 rounded-full bg-[#5E765E]/15 text-[#5E765E] flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-9 h-9" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5E765E] block mb-1">
                          Consulta Registrada • {submittedCode}
                        </span>
                        <h3 className="font-['Cormorant_Garamond',serif] text-3xl text-[#111111]">
                          ¡Gracias, {clientName}!
                        </h3>
                        <p className="text-xs text-[#111111]/75 max-w-md mx-auto mt-2 leading-relaxed">
                          Tu consulta quedó registrada en el sistema de Meraki Spa y se notificó a <strong>{SPA_INFO.email}</strong>. Para recibir respuesta inmediata sobre movilidad o diseño, envía tu ficha al WhatsApp oficial:
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <a
                          href={whatsappHandoffUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Continuar en WhatsApp</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setSubmittedCode(null);
                            setCustomNote('');
                          }}
                          className="w-full sm:w-auto px-5 py-3 rounded-full border border-[#5E765E]/25 bg-white text-xs font-semibold text-[#5E765E] hover:bg-[#FFF2DE] cursor-pointer"
                        >
                          Enviar otra consulta
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitInquiry} className="space-y-5">
                      {formError && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                          {formError}
                        </div>
                      )}

                      <div>
                        <span className="block text-xs font-semibold text-[#111111] mb-2">
                          ¿Sobre qué deseas consultar?
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {[
                            { id: 'movilidad' as const, label: 'Tarifa de movilidad a domicilio' },
                            { id: 'evento' as const, label: 'Evento / Cumpleaños / Novia' },
                            { id: 'presson' as const, label: 'Cotizar Press On Nails a medida' },
                            { id: 'consulta' as const, label: 'Dudas sobre un tratamiento' },
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setInquiryType(opt.id)}
                              className={`p-3 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                                inquiryType === opt.id
                                  ? 'bg-[#5E765E] text-[#FFF2DE] border-[#5E765E] font-semibold'
                                  : 'bg-white text-[#111111]/85 border-[#5E765E]/20 hover:bg-[#FFF2DE]'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="contact-name" className="block text-xs font-semibold text-[#111111] mb-1.5">
                            Nombre Completo *
                          </label>
                          <input
                            id="contact-name"
                            type="text"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="Ej. María Pérez"
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/20 text-xs text-[#111111] focus:outline-none focus:border-[#5E765E] bg-white"
                          />
                        </div>

                        <div>
                          <label htmlFor="contact-phone" className="block text-xs font-semibold text-[#111111] mb-1.5">
                            Tu WhatsApp / Celular *
                          </label>
                          <input
                            id="contact-phone"
                            type="tel"
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            placeholder="Ej. 993 067 291"
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/20 text-xs text-[#111111] focus:outline-none focus:border-[#5E765E] bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="contact-email" className="block text-xs font-semibold text-[#111111] mb-1.5">
                            Correo Electrónico (opcional)
                          </label>
                          <input
                            id="contact-email"
                            type="email"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            placeholder="tu-correo@ejemplo.com"
                            className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/20 text-xs text-[#111111] focus:outline-none focus:border-[#5E765E] bg-white"
                          />
                        </div>

                        <div>
                          <label htmlFor="contact-district" className="block text-xs font-semibold text-[#111111] mb-1.5">
                            Distrito en Lima
                          </label>
                          <select
                            id="contact-district"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/20 text-xs text-[#111111] focus:outline-none focus:border-[#5E765E] bg-white cursor-pointer"
                          >
                            {LIMA_DISTRICT_NAMES.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="contact-service" className="block text-xs font-semibold text-[#111111] mb-1.5">
                            Tratamiento de Referencia
                          </label>
                          <select
                            id="contact-service"
                            value={selectedServiceId}
                            onChange={(e) => setSelectedServiceId(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/20 text-xs text-[#111111] focus:outline-none focus:border-[#5E765E] bg-white cursor-pointer"
                          >
                            {CATALOG_SERVICES.map((s) => (
                              <option key={s.id} value={s.id}>
                                [{s.categoryLabel}] {s.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="contact-date" className="block text-xs font-semibold text-[#111111] mb-1.5">
                            Fecha Estimada (opcional)
                          </label>
                          <input
                            id="contact-date"
                            type="date"
                            min={todayIso}
                            value={preferredDate}
                            onChange={(e) => setPreferredDate(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/20 text-xs text-[#111111] focus:outline-none focus:border-[#5E765E] bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="contact-note" className="block text-xs font-semibold text-[#111111] mb-1.5">
                          Cuéntanos qué necesitas *
                        </label>
                        <textarea
                          id="contact-note"
                          rows={3}
                          placeholder="Ej. Somos 3 personas para manicura en San Isidro o quisiera cotizar un set Press On Almendra..."
                          value={customNote}
                          onChange={(e) => setCustomNote(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/20 text-xs text-[#111111] focus:outline-none focus:border-[#5E765E] bg-white"
                        />
                      </div>

                      <div className="flex items-start gap-2.5 pt-1">
                        <input
                          id="contact-privacy-check"
                          type="checkbox"
                          checked={privacyAccepted}
                          onChange={(e) => setPrivacyAccepted(e.target.checked)}
                          className="mt-0.5 rounded border-[#5E765E]/40 text-[#5E765E] focus:ring-[#5E765E]"
                        />
                        <label htmlFor="contact-privacy-check" className="text-[11px] text-[#111111]/75 leading-relaxed">
                          He leído y acepto la{' '}
                          <Link to="/privacy" className="underline text-[#5E765E] font-medium">
                            Política de Privacidad y Tratamiento de Datos
                          </Link>{' '}
                          para recibir respuesta a mi consulta.
                        </label>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="meraki-btn-fluid w-full bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] py-4 rounded-2xl text-xs font-semibold uppercase tracking-widest shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Send className="w-4 h-4 text-[#D5A688]" />
                          <span>Registrar Consulta y Continuar por WhatsApp</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingWhatsAppButton />
    </div>
  );
}
