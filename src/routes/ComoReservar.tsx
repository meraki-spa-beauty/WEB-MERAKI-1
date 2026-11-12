import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FloatingWhatsAppButton } from '../components/layout/FloatingWhatsAppButton';
import { BOOKING_STEPS, POLICIES_DATA } from '../data/catalog';
import { FAQ_ITEMS } from '../data/spaData';
import { useBooking } from '../context/BookingContext';
import {
  Calendar,
  MessageSquare,
  CreditCard,
  FileCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Clock,
  HelpCircle,
  Camera
} from 'lucide-react';

export function ComoReservar() {
  const { openBooking } = useBooking();

  const getStepIcon = (num: string) => {
    switch (num) {
      case '1':
        return <Sparkles className="w-5 h-5 text-[#D5A688]" />;
      case '2':
        return <MessageSquare className="w-5 h-5 text-[#D5A688]" />;
      case '3':
        return <CreditCard className="w-5 h-5 text-[#D5A688]" />;
      case '4':
        return <FileCheck className="w-5 h-5 text-[#D5A688]" />;
      case '5':
        return <Calendar className="w-5 h-5 text-[#D5A688]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#D5A688]" />;
    }
  };

  return (
    <div className="min-h-screen meraki-editorial-canvas text-[#111111] font-['Montserrat',sans-serif] flex flex-col selection:bg-[#5E765E] selection:text-[#FFF2DE]">
      <Header />

      <main className="flex-1">
        {/* Banner Hero */}
        <section className="meraki-hero-banner pt-10 lg:pt-24 pb-10 border-b border-[#D5A688]/35">
          <div
            aria-hidden="true"
            className="pointer-events-none select-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#D5A688]/35 blur-3xl" />
            <div className="absolute -bottom-24 -right-20 w-96 h-96 rounded-full bg-[#AEC2AE]/45 blur-3xl" />
            <img
              src="/assets/brand/meraki-monogram.svg"
              alt=""
              className="absolute -right-14 top-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 opacity-[0.045] -rotate-6"
            />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="relative rounded-t-[130px] sm:rounded-t-[220px] rounded-b-3xl border border-[#D5A688]/40 bg-gradient-to-b from-[#FFFDF9]/90 via-[#FFFDF9]/65 to-[#FFF2DE]/30 backdrop-blur-[2px] px-4 sm:px-10 pt-8 sm:pt-10 pb-8 shadow-[0_16px_40px_-12px_rgba(94,118,94,0.08),inset_0_1px_0_#FFFFFF]">
              <div className="meraki-editorial-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[#5E765E] text-[11px] font-semibold uppercase tracking-[0.2em] mb-4">
                <Calendar className="w-3.5 h-3.5 text-[#D5A688]" />
                <span>Paso a Paso Oficial</span>
              </div>
              <h1 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl md:text-6xl font-normal text-[#111111] leading-tight mb-3">
                ¿Cómo Reservas tu Cita en Meraki?
              </h1>
              <div aria-hidden="true" className="flex items-center justify-center gap-3 mb-4">
                <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent via-[#D5A688]/70 to-[#5E765E]/50" />
                <span className="w-1.5 h-1.5 rotate-45 bg-[#D5A688]" />
                <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent via-[#D5A688]/70 to-[#5E765E]/50" />
              </div>
              <p className="font-['Montserrat',sans-serif] text-sm sm:text-base text-[#111111]/75 max-w-2xl mx-auto font-light leading-relaxed mb-8">
                Agenda tu atención presencial en nuestro estudio (Calle Agustín Gamarra 515, Pueblo Libre) o solicita el servicio a domicilio en la comodidad de tu casa u oficina. Sigue estos 5 sencillos pasos para asegurar tu atención.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => openBooking()}
                  className="bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-[#D5A688]" />
                  <span>Agendar Cita en el Formulario</span>
                </button>
                <Link
                  to="/catalogo"
                  className="meraki-editorial-pill hover:bg-white text-[#5E765E] px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all inline-flex items-center gap-2"
                >
                  <span>Ver Catálogo de Servicios</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 5 Steps Section */}
        <section className="py-16 meraki-section-cream">
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              {BOOKING_STEPS.map((step) => (
                <div
                  key={step.number}
                  className="theme-card-surface rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start gap-6 text-left"
                >
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-[#5E765E] text-[#FFF2DE] font-['Cormorant_Garamond',serif] text-2xl font-bold flex items-center justify-center shadow-md">
                      {step.number}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#FFF2DE] border border-[#D5A688]/30 flex items-center justify-center md:hidden">
                      {getStepIcon(step.number)}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111]">
                        {step.title}
                      </h3>
                      <div className="hidden md:flex w-8 h-8 rounded-lg bg-[#FFF2DE] border border-[#D5A688]/30 items-center justify-center">
                        {getStepIcon(step.number)}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-[#111111]/75 font-light leading-relaxed">
                      {step.description}
                    </p>

                    {/* Step 4 details list */}
                    {step.number === '4' && (
                      <div className="mt-4 p-4 rounded-2xl meraki-cream-card">
                        <span className="block text-[11px] font-['Montserrat',sans-serif] font-bold uppercase tracking-wider text-[#5E765E] mb-2">
                          Datos requeridos en el mensaje:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-[#111111]/85">
                          <div className="p-2 rounded-lg bg-white/90 border border-[#D5A688]/25">• Nombre completo</div>
                          <div className="p-2 rounded-lg bg-white/90 border border-[#D5A688]/25">• Modalidad / Dirección (o Estudio Pueblo Libre)</div>
                          <div className="p-2 rounded-lg bg-white/90 border border-[#D5A688]/25">• Hora de atención</div>
                          <div className="p-2 rounded-lg bg-white/90 border border-[#D5A688]/25">• Número de teléfono</div>
                          <div className="p-2 rounded-lg bg-white/90 border border-[#D5A688]/25">• Correo electrónico</div>
                          <div className="p-2 rounded-lg bg-white/90 border border-[#D5A688]/25">• Fecha de nacimiento</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Políticas y Condiciones Destacadas */}
        <section className="py-14 meraki-section-ivory border-t border-[#D5A688]/25">
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="meraki-editorial-pill inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E] mb-2">
                <ShieldCheck className="w-3 h-3 text-[#D5A688]" />
                <span>Claridad y Transparencia</span>
              </span>
              <h2 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl font-bold text-[#111111] mt-1">
                Políticas de Atención en Estudio y a Domicilio
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl meraki-cream-card flex items-start gap-4">
                <Truck className="w-6 h-6 text-[#D5A688] shrink-0 mt-1" />
                <div>
                  <h4 className="font-['Cormorant_Garamond',serif] text-xl font-bold text-[#111111] mb-1">
                    Costo de Movilidad
                  </h4>
                  <p className="text-xs text-[#111111]/75 font-light leading-relaxed">
                    {POLICIES_DATA.mobility}
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl meraki-cream-card flex items-start gap-4">
                <Clock className="w-6 h-6 text-[#5E765E] shrink-0 mt-1" />
                <div>
                  <h4 className="font-['Cormorant_Garamond',serif] text-xl font-bold text-[#111111] mb-1">
                    Cancelaciones con 24h
                  </h4>
                  <p className="text-xs text-[#111111]/75 font-light leading-relaxed">
                    {POLICIES_DATA.cancellation}
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl meraki-cream-card flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-[#5E765E] shrink-0 mt-1" />
                <div>
                  <h4 className="font-['Cormorant_Garamond',serif] text-xl font-bold text-[#111111] mb-1">
                    Protocolos de Bioseguridad
                  </h4>
                  <p className="text-xs text-[#111111]/75 font-light leading-relaxed">
                    {POLICIES_DATA.biosecurity}
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl meraki-cream-card flex items-start gap-4">
                <Camera className="w-6 h-6 text-[#D5A688] shrink-0 mt-1" />
                <div>
                  <h4 className="font-['Cormorant_Garamond',serif] text-xl font-bold text-[#111111] mb-1">
                    Registro Visual para Redes
                  </h4>
                  <p className="text-xs text-[#111111]/75 font-light leading-relaxed">
                    {POLICIES_DATA.socialMedia}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-16 meraki-section-cream border-t border-[#D5A688]/20">
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="meraki-editorial-pill inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E] mb-2">
                <HelpCircle className="w-3 h-3 text-[#D5A688]" />
                <span>Respuestas Rápidas</span>
              </span>
              <h2 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl font-bold text-[#111111] mt-1">
                Preguntas Frecuentes
              </h2>
            </div>

            <div className="space-y-4">
              {FAQ_ITEMS.map((faq) => (
                <div
                  key={faq.id}
                  className="theme-card-surface rounded-2xl p-6"
                >
                  <h4 className="font-['Cormorant_Garamond',serif] text-xl font-bold text-[#111111] mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#5E765E] shrink-0" />
                    <span>{faq.question}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-[#111111]/75 font-light leading-relaxed pl-6">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingWhatsAppButton />
    </div>
  );
}
