import { useState } from 'react';
import { SPA_INFO } from '../../data/spaData';
import { MapPin, Phone, Clock, Send, CheckCircle2 } from 'lucide-react';

export function LocationContact() {
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formMsg, setFormMsg] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
  };

  return (
    <section id="contacto" className="py-20 md:py-28 bg-[#FFF2DE] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
          
          {/* Left Column: Coordinates & Hours */}
          <div className="lg:col-span-6">
            <span className="text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-[0.24em] text-[#5E765E] block mb-2">
              Atención en Lima · Previa Reserva
            </span>
            <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl md:text-6xl font-normal text-[#111111] leading-tight mb-6">
              Coordinemos tu próxima <span className="italic text-[#5E765E]">pausa de bienestar.</span>
            </h2>
            <p className="font-['Montserrat',sans-serif] text-sm text-[#111111]/75 font-light leading-relaxed mb-8 max-w-lg">
              Brindamos atención personalizada con cita programada en Lima Metropolitana. Te acompañamos a diseñar una experiencia a tu medida.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#5E765E]/15 text-[#5E765E] flex items-center justify-center shrink-0 mt-1">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-wider text-[#111111]">
                    Cobertura y Modalidad
                  </h4>
                  <p className="text-xs text-[#111111]/75 mt-0.5">{SPA_INFO.coverage}</p>
                  <span className="text-[11px] text-[#5E765E] font-medium block mt-1">
                    Atención exclusiva bajo reserva anticipada
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#5E765E]/15 text-[#5E765E] flex items-center justify-center shrink-0 mt-1">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-wider text-[#111111]">
                    Horarios de Atención
                  </h4>
                  <p className="text-xs text-[#111111]/75 mt-0.5">{SPA_INFO.hours.weekdays}</p>
                  <p className="text-xs text-[#111111]/75">{SPA_INFO.hours.weekends}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#5E765E]/15 text-[#5E765E] flex items-center justify-center shrink-0 mt-1">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-['Montserrat',sans-serif] text-xs font-bold uppercase tracking-wider text-[#111111]">
                    Canal Directo &amp; WhatsApp
                  </h4>
                  <a
                    href={`https://wa.me/${SPA_INFO.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#5E765E] font-medium hover:underline block mt-0.5"
                  >
                    WhatsApp oficial: {SPA_INFO.whatsappDisplay}
                  </a>
                  <a
                    href={SPA_INFO.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#D5A688] font-medium hover:underline block mt-1"
                  >
                    Instagram: {SPA_INFO.instagram}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Message Card */}
          <div className="lg:col-span-6">
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#5E765E]/20 shadow-xl">
              <span className="text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-widest text-[#5E765E] block mb-1">
                Escríbenos
              </span>
              <h3 className="font-['Cormorant_Garamond',serif] text-3xl font-normal text-[#111111] mb-2">
                ¿Tienes alguna consulta especial?
              </h3>
              <p className="font-['Montserrat',sans-serif] text-xs text-[#111111]/70 font-light mb-6">
                Déjanos tu mensaje y una de nuestras coordinadoras de spa te responderá a la brevedad.
              </p>

              {isSent ? (
                <div className="text-center py-10 space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-[#5E765E] mx-auto" />
                  <h4 className="font-['Cormorant_Garamond',serif] text-2xl font-normal text-[#111111]">
                    ¡Mensaje Enviado con Éxito!
                  </h4>
                  <p className="font-['Montserrat',sans-serif] text-xs text-[#111111]/70 max-w-sm mx-auto">
                    Gracias por comunicarte con Meraki Spa Beauty. Te responderemos vía WhatsApp o llamada en menos de 30 minutos hábiles.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSent(false)}
                    className="mt-4 px-6 py-2.5 rounded-full border border-[#5E765E] text-[#5E765E] text-xs font-['Montserrat',sans-serif] uppercase tracking-wider font-semibold"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Tu nombre *"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#FFF2DE]/30 border border-[#5E765E]/20 text-xs font-['Montserrat',sans-serif] text-[#111111] focus:outline-none focus:border-[#5E765E]"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      placeholder="Teléfono / WhatsApp *"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#FFF2DE]/30 border border-[#5E765E]/20 text-xs font-['Montserrat',sans-serif] text-[#111111] focus:outline-none focus:border-[#5E765E]"
                      required
                    />
                  </div>

                  <div>
                    <textarea
                      rows={3}
                      placeholder="¿En qué podemos ayudarte? *"
                      value={formMsg}
                      onChange={(e) => setFormMsg(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#FFF2DE]/30 border border-[#5E765E]/20 text-xs font-['Montserrat',sans-serif] text-[#111111] focus:outline-none focus:border-[#5E765E]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] py-3.5 rounded-full text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-[0.16em] shadow transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-[#D5A688]" />
                    <span>Enviar Mensaje</span>
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
