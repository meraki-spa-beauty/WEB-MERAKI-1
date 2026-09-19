import { Sparkles, Calendar, ArrowRight, ShieldCheck, HeartHandshake, Waves, Wind } from 'lucide-react';

interface HeroProps {
  onOpenBookingModal: () => void;
}

export function Hero({ onOpenBookingModal }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#FFF2DE] pt-8 pb-16 md:pt-14 md:pb-24 border-b border-[#5E765E]/15">
      {/* Background subtle organic gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#AEC2AE]/20 rounded-full blur-3xl pointer-events-none -mr-40 -mt-20" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-[#D5A688]/15 rounded-full blur-3xl pointer-events-none -ml-32 -mb-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#5E765E]/10 border border-[#5E765E]/20 text-[#5E765E] text-[11px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5E765E] animate-pulse" />
              <span>Oasis de Bienestar &amp; Cuidado Consciente</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-['Cormorant_Garamond',serif] text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-normal leading-[0.95] text-[#111111] tracking-tight mb-6">
              Un santuario de calma <br />
              <span className="italic font-light text-[#5E765E]">para volver a ti.</span>
            </h1>

            {/* Refined Subtitle */}
            <p className="font-['Montserrat',sans-serif] text-base sm:text-lg text-[#111111]/75 max-w-xl font-light leading-relaxed mb-8">
              Inspirado en rituales sensoriales de autor. Masajes con piedras volcánicas, tratamientos faciales botánicos y experiencias privadas en pareja diseñadas para desacelerar el ritmo cotidiano.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <button
                type="button"
                onClick={onOpenBookingModal}
                className="inline-flex items-center justify-center gap-2.5 bg-[#5E765E] hover:bg-[#4a5f4a] text-[#FFF2DE] px-8 py-4 rounded-full text-xs font-['Montserrat',sans-serif] font-medium uppercase tracking-[0.16em] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#D5A688]" />
                <span>Reservar Cita Online</span>
              </button>

              <a
                href="#tratamientos"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full border border-[#5E765E]/30 hover:border-[#5E765E] text-[#111111] hover:text-[#5E765E] text-xs font-['Montserrat',sans-serif] uppercase tracking-[0.16em] transition-all bg-white/40 hover:bg-white/80"
              >
                <span>Ver Carta de Rituales</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Quick Signature Stamp */}
            <div className="flex items-center gap-4 pt-6 border-t border-[#5E765E]/15 w-full">
              <img
                src="/assets/brand/meraki-monogram.png"
                alt="Meraki Sello"
                className="w-10 h-10 object-contain opacity-85"
                referrerPolicy="no-referrer"
              />
              <div className="text-xs font-['Montserrat',sans-serif] text-[#111111]/70">
                <span className="block font-semibold text-[#111111] tracking-wider uppercase text-[10px]">
                  El Sello Meraki
                </span>
                <span>Todo ritual incluye de cortesía nuestro baño podal y té botánico de bienvenida.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Frame (Inspired by Heavenly Spa & Meraki Banner) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Ambient Image Frame */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/80 aspect-[4/5] bg-[#EAE2D5]">
                <img
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
                  alt="Atmósfera y Masaje en Meraki Spa"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Overlaid Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/60 via-transparent to-black/10" />

                {/* Floating Bottom Card */}
                <div className="absolute bottom-5 inset-x-5 p-5 rounded-xl bg-white/90 backdrop-blur-md border border-[#5E765E]/20 shadow-lg text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-['Montserrat',sans-serif] font-bold uppercase tracking-[0.2em] text-[#5E765E]">
                      Experiencia Recomendada
                    </span>
                    <span className="text-xs font-['Montserrat',sans-serif] font-semibold text-[#111111]">
                      S/. 280
                    </span>
                  </div>
                  <h3 className="font-['Cormorant_Garamond',serif] text-xl font-normal text-[#111111] leading-tight">
                    Ritual Renovación Meraki
                  </h3>
                  <p className="text-[11px] font-['Montserrat',sans-serif] text-[#111111]/75 mt-1 leading-snug">
                    Piedras volcánicas calientes, aceites orgánicos y 90 minutos de reconexión.
                  </p>
                </div>
              </div>

              {/* Floating Decorative Accent Badge */}
              <div className="absolute -top-4 -left-4 sm:-left-6 bg-[#5E765E] text-[#FFF2DE] px-4 py-3 rounded-xl shadow-lg border border-[#AEC2AE]/30 hidden sm:flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#D5A688]" />
                <div className="text-left font-['Montserrat',sans-serif]">
                  <span className="block text-[11px] font-bold uppercase tracking-wider">Top Spa de Autor</span>
                  <span className="text-[9px] text-[#AEC2AE] tracking-widest uppercase">Bienestar Sensorial</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Four Trust Badges Bar (Heavenly Spa Style) */}
        <div className="mt-14 pt-8 border-t border-[#5E765E]/15 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5E765E]/10 flex items-center justify-center text-[#5E765E] shrink-0">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-['Montserrat',sans-serif] text-xs font-semibold text-[#111111] tracking-wide uppercase">
                Aromaterapia Pura
              </h4>
              <p className="text-[11px] text-[#111111]/70 leading-snug">Aceites esenciales 100% orgánicos</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5E765E]/10 flex items-center justify-center text-[#5E765E] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-['Montserrat',sans-serif] text-xs font-semibold text-[#111111] tracking-wide uppercase">
                Terapeutas Certificadas
              </h4>
              <p className="text-[11px] text-[#111111]/70 leading-snug">Expertas en técnicas orientales y suecas</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5E765E]/10 flex items-center justify-center text-[#5E765E] shrink-0">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-['Montserrat',sans-serif] text-xs font-semibold text-[#111111] tracking-wide uppercase">
                Circuito de Aguas
              </h4>
              <p className="text-[11px] text-[#111111]/70 leading-snug">Hidromasaje y contraste térmico</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5E765E]/10 flex items-center justify-center text-[#5E765E] shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-['Montserrat',sans-serif] text-xs font-semibold text-[#111111] tracking-wide uppercase">
                Rituales en Pareja
              </h4>
              <p className="text-[11px] text-[#111111]/70 leading-snug">Suites privadas con jacuzzi dúo</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
