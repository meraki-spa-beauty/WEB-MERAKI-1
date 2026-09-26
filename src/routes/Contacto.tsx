import { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FloatingWhatsAppButton } from '../components/common/FloatingWhatsAppButton';
import { SPA_INFO } from '../data/spaData';
import { CATALOG_SERVICES } from '../data/catalog';
import { trackMetaLead } from '../utils/metaPixel';
import { trackTikTokSubmitForm } from '../utils/tiktokPixel';
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
  Briefcase
} from 'lucide-react';

const LIMA_DISTRICTS = [
  'Miraflores',
  'San Isidro',
  'Surco',
  'San Borja',
  'Barranco',
  'La Molina',
  'Jesús María',
  'Lince',
  'Magdalena',
  'Pueblo Libre',
  'San Miguel',
  'Surquillo',
  'Chorrillos',
  'Otro distrito en Lima'
];

export function Contacto() {
  const [selectedServiceId, setSelectedServiceId] = useState(CATALOG_SERVICES[0].id);
  const [clientName, setClientName] = useState('');
  const [district, setDistrict] = useState(LIMA_DISTRICTS[0]);
  const [locationType, setLocationType] = useState<'estudio' | 'casa' | 'trabajo'>('estudio');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [customNote, setCustomNote] = useState('');

  const selectedService = CATALOG_SERVICES.find((s) => s.id === selectedServiceId) || CATALOG_SERVICES[0];

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();

    const nameText = clientName ? `Mi nombre es ${clientName}. ` : '';
    const dateText = preferredDate ? `para el día ${preferredDate}` : '';
    const timeText = preferredTime ? ` a las ${preferredTime}` : '';
    const noteText = customNote ? `\nNota adicional: ${customNote}` : '';
    const isStudio = locationType === 'estudio';

    const placeText = isStudio
      ? 'Atención presencial en Estudio (Calle Agustín Gamarra 515, Pueblo Libre, Lima)'
      : `Atención en mi ${locationType === 'casa' ? 'Casa / Domicilio' : 'Lugar de trabajo / Oficina'}`;

    const message = `Hola Meraki Spa 👋
${nameText}Quisiera consultar disponibilidad y agendar el siguiente servicio:

• *Servicio:* ${selectedService.name} (${selectedService.categoryLabel})
• *Lugar:* ${placeText}
${!isStudio ? `• *Distrito:* ${district}\n` : ''}• *Fecha y Hora tentativa:* ${dateText || 'A coordinar'}${timeText}${noteText}

${isStudio ? '¿Me podrían confirmar disponibilidad para atención en su estudio de Pueblo Libre? Muchas gracias.' : '¿Me podrían confirmar disponibilidad y el costo de movilidad para mi distrito? Muchas gracias.'}`;

    const encoded = encodeURIComponent(message);
    trackMetaLead({
      content_name: `Consulta Contacto - ${selectedService.name}`,
      content_category: 'Cita Spa',
      value: selectedService.price,
      currency: 'PEN',
    });
    trackTikTokSubmitForm({
      content_name: `Consulta Contacto - ${selectedService.name}`,
      content_category: 'Cita Spa',
      value: selectedService.price,
      currency: 'PEN',
    });
    window.open(`https://wa.me/${SPA_INFO.whatsappNumber}?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FFF2DE] text-[#111111] font-['Montserrat',sans-serif] flex flex-col selection:bg-[#5E765E] selection:text-[#FFF2DE]">
      <Header />

      <main className="flex-1">
        {/* Banner Hero */}
        <section className="bg-gradient-to-b from-[#5E765E]/15 to-transparent pt-14 pb-12 border-b border-[#5E765E]/15 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5E765E]/10 border border-[#5E765E]/20 text-[#5E765E] text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              <Phone className="w-3.5 h-3.5 text-[#D5A688]" />
              <span>Canales Oficiales</span>
            </div>
            <h1 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl md:text-6xl font-normal text-[#111111] leading-tight mb-4">
              Ponte en Contacto con Meraki
            </h1>
            <p className="font-['Montserrat',sans-serif] text-sm sm:text-base text-[#111111]/75 max-w-xl mx-auto font-light leading-relaxed mb-6">
              ¿Deseas consultar disponibilidad, cotizar movilidad según tu distrito o agendar una cita? Escríbenos directamente o utiliza nuestro asistente rápido de WhatsApp.
            </p>
          </div>
        </section>

        {/* Contact Info & Interactive Assistant Grid */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left Column: Direct Info Cards */}
              <div className="lg:col-span-5 space-y-6 text-left">
                <div className="bg-white rounded-3xl p-8 border border-[#5E765E]/15 shadow-sm">
                  <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111] mb-6">
                    Canales Directos
                  </h3>

                  <div className="space-y-6">
                    {/* WhatsApp */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#5E765E]/10 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-6 h-6 text-[#5E765E]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E] block">
                          Atención Inmediata
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
                          Enlace directo: wa.link/86seuh
                        </p>
                      </div>
                    </div>

                    {/* Instagram */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#D5A688]/15 flex items-center justify-center shrink-0">
                        <Instagram className="w-6 h-6 text-[#D5A688]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#D5A688] block">
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

                    {/* Horarios */}
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

                    {/* Estudio Presencial */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#5E765E] text-[#FFF2DE] flex items-center justify-center shrink-0 shadow-sm">
                        <MapPin className="w-6 h-6 text-[#D5A688]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E] block">
                          Estudio Presencial (Previa Cita)
                        </span>
                        <p className="font-semibold text-xs text-[#111111]">
                          Calle Agustín Gamarra 515, Pueblo Libre, Lima
                        </p>
                        <p className="text-xs text-[#111111]/60 font-light mt-0.5">
                          Atención en cabina privada • Sin costo de movilidad
                        </p>
                      </div>
                    </div>

                    {/* Cobertura a Domicilio */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#FFF2DE] border border-[#5E765E]/20 flex items-center justify-center shrink-0">
                        <Home className="w-6 h-6 text-[#5E765E]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E] block">
                          Servicio a Domicilio y Oficina
                        </span>
                        <p className="font-semibold text-xs text-[#111111]">
                          Atención en distritos seleccionados de Lima
                        </p>
                        <p className="text-xs text-[#111111]/60 font-light mt-0.5">
                          Costo de movilidad se cotiza según tu distrito
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick note on WhatsApp booking */}
                <div className="p-6 rounded-3xl bg-[#5E765E] text-[#FFF2DE] shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#D5A688]" />
                    <span className="font-semibold text-xs uppercase tracking-wider">
                      Reserva Rápida
                    </span>
                  </div>
                  <p className="text-xs font-light text-[#FFF2DE]/90 leading-relaxed mb-4">
                    Para agendar una cita oficial se requiere el 40% de adelanto de la reserva. ¡Nos aseguramos de reservar el bloque horario exclusivamente para ti!
                  </p>
                  <a
                    href={SPA_INFO.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#FFF2DE] text-[#5E765E] px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors"
                  >
                    <span>Abrir Chat de WhatsApp</span>
                    <Send className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Right Column: Interactive WhatsApp Booking Message Generator */}
              <div className="lg:col-span-7 text-left">
                <div className="bg-white rounded-3xl p-8 border border-[#5E765E]/20 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-[#5E765E] text-[#FFF2DE] flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#D5A688]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E]">
                        Asistente Rápido
                      </span>
                      <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111]">
                        Generar Consulta de Reserva para WhatsApp
                      </h3>
                    </div>
                  </div>

                  <form onSubmit={handleSendWhatsApp} className="space-y-5">
                    {/* Nombre */}
                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                        Tu Nombre (Opcional):
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Ej. María Pérez"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/20 text-xs text-[#111111] focus:outline-none focus:border-[#5E765E] bg-[#FFF2DE]/30"
                      />
                    </div>

                    {/* Servicio del Catálogo */}
                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                        Servicio Deseado del Catálogo:
                      </label>
                      <select
                        value={selectedServiceId}
                        onChange={(e) => setSelectedServiceId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/20 text-xs text-[#111111] focus:outline-none focus:border-[#5E765E] bg-white cursor-pointer"
                      >
                        {CATALOG_SERVICES.map((s) => (
                          <option key={s.id} value={s.id}>
                            [{s.categoryLabel}] {s.name} - {s.pricePEN ? `S/ ${s.pricePEN}` : 'Varias opciones'}
                          </option>
                        ))}
                      </select>
                      <span className="text-[11px] text-[#5E765E] mt-1 block">
                        Subcategoría: {selectedService.subcategory}
                      </span>
                    </div>

                    {/* Modalidad de Atención: Estudio vs Casa vs Trabajo */}
                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                        Lugar de Atención:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setLocationType('estudio');
                            setDistrict('Pueblo Libre');
                          }}
                          className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            locationType === 'estudio'
                              ? 'bg-[#5E765E] text-[#FFF2DE] border-[#5E765E] font-semibold'
                              : 'bg-white text-[#111111]/80 border-[#5E765E]/20 hover:bg-[#FFF2DE]'
                          }`}
                        >
                          <MapPin className="w-4 h-4 text-[#D5A688]" />
                          <span>En Estudio (Pueblo Libre)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setLocationType('casa')}
                          className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            locationType === 'casa'
                              ? 'bg-[#5E765E] text-[#FFF2DE] border-[#5E765E] font-semibold'
                              : 'bg-white text-[#111111]/80 border-[#5E765E]/20 hover:bg-[#FFF2DE]'
                          }`}
                        >
                          <Home className="w-4 h-4" />
                          <span>En Casa / Domicilio</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setLocationType('trabajo')}
                          className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            locationType === 'trabajo'
                              ? 'bg-[#5E765E] text-[#FFF2DE] border-[#5E765E] font-semibold'
                              : 'bg-white text-[#111111]/80 border-[#5E765E]/20 hover:bg-[#FFF2DE]'
                          }`}
                        >
                          <Briefcase className="w-4 h-4" />
                          <span>En Oficina / Trabajo</span>
                        </button>
                      </div>
                    </div>

                    {locationType === 'estudio' && (
                      <div className="p-3.5 rounded-xl bg-[#5E765E]/10 border border-[#5E765E]/20 text-xs">
                        <div className="flex items-center gap-2 text-[#5E765E] font-semibold mb-1">
                          <MapPin className="w-4 h-4 text-[#D5A688]" />
                          <span>Estudio Meraki — Pueblo Libre</span>
                        </div>
                        <p className="text-[11px] text-[#111111]/80">
                          Dirección: <strong>Calle Agustín Gamarra 515, Pueblo Libre, Lima</strong> (Previa cita • Sin costo de movilidad).
                        </p>
                      </div>
                    )}

                    {/* Distrito y Fecha */}
                    <div className={`grid grid-cols-1 ${locationType === 'estudio' ? 'sm:grid-cols-1' : 'sm:grid-cols-2'} gap-4`}>
                      {locationType !== 'estudio' && (
                        <div>
                          <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                            Distrito en Lima:
                          </label>
                          <select
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/20 text-xs text-[#111111] focus:outline-none focus:border-[#5E765E] bg-white cursor-pointer"
                          >
                            {LIMA_DISTRICTS.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                          Fecha Tentativa:
                        </label>
                        <input
                          type="date"
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/20 text-xs text-[#111111] focus:outline-none focus:border-[#5E765E] bg-white"
                        />
                      </div>
                    </div>

                    {/* Hora y Nota adicional */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                          Hora Preferida:
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. 10:30 AM o 4:00 PM"
                          value={preferredTime}
                          onChange={(e) => setPreferredTime(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/20 text-xs text-[#111111] focus:outline-none focus:border-[#5E765E] bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                          Detalles adicionales:
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Deseo retiro de sistema anterior"
                          value={customNote}
                          onChange={(e) => setCustomNote(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#5E765E]/20 text-xs text-[#111111] focus:outline-none focus:border-[#5E765E] bg-white"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="w-full bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] py-4 rounded-2xl text-xs font-semibold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-[#D5A688]" />
                        <span>Abrir WhatsApp con Mensaje Prellenado</span>
                      </button>
                      <p className="text-[11px] text-[#111111]/60 text-center mt-2.5 font-light">
                        Te conectará directamente con el número oficial <strong>+51 993 067 291</strong>
                      </p>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingWhatsAppButton />
    </div>
  );
}
