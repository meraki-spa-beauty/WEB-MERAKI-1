import { Link } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FloatingWhatsAppButton } from '../components/common/FloatingWhatsAppButton';
import { SPA_INFO, TESTIMONIALS } from '../data/spaData';
import {
  Sparkles,
  Award,
  Heart,
  Home,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Star
} from 'lucide-react';

export function Nosotros() {
  return (
    <div className="min-h-screen bg-[#FFF2DE] text-[#111111] font-['Montserrat',sans-serif] flex flex-col selection:bg-[#5E765E] selection:text-[#FFF2DE]">
      <TopBar />
      <Header />

      <main className="flex-1">
        {/* Banner Hero */}
        <section className="bg-gradient-to-b from-[#5E765E]/15 to-transparent pt-14 pb-12 border-b border-[#5E765E]/15 text-left">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5E765E]/10 border border-[#5E765E]/20 text-[#5E765E] text-xs font-semibold uppercase tracking-[0.2em] mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-[#D5A688]" />
                  <span>Conoce Nuestra Esencia</span>
                </div>
                <h1 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl md:text-6xl font-normal text-[#111111] leading-tight mb-6">
                  ¡Bienvenid@ a Meraki Spa!
                </h1>
                <p className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl text-[#5E765E] italic mb-6">
                  “Tenemos como principal objetivo que te sientas feliz y empoderad@.”
                </p>
                <p className="text-sm sm:text-base text-[#111111]/80 font-light leading-relaxed mb-6">
                  Somos una marca liderada por <strong>Ana Maria Díaz</strong>, profesional con más de 10 años de experiencia en el mundo de la belleza, la estética integral y el bienestar.
                </p>
                <p className="text-sm sm:text-base text-[#111111]/80 font-light leading-relaxed mb-8">
                  Nos acomodamos a tu ritmo y estilo de vida, recibiéndote en nuestro acogedor estudio en Pueblo Libre (Calle Agustín Gamarra 515) o llegando con todo lo que necesitas para disfrutar de una sesión de spa, uñas, pestañas, depilación, masajes o faciales en la comodidad de tu casa y/o lugar de trabajo.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/catalogo"
                    className="bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all shadow-md inline-flex items-center gap-2"
                  >
                    <span>Ver Catálogo de Servicios</span>
                    <ArrowRight className="w-4 h-4 text-[#D5A688]" />
                  </Link>
                  <a
                    href={SPA_INFO.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/80 hover:bg-white text-[#5E765E] border border-[#5E765E]/20 px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all shadow-sm inline-flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-[#D5A688]" />
                    <span>Contactar por WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Founder Profile Box */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-3xl p-8 border border-[#5E765E]/20 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#5E765E]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                  
                  <div className="w-20 h-20 rounded-2xl bg-[#5E765E] text-[#FFF2DE] flex items-center justify-center font-['Cormorant_Garamond',serif] text-3xl font-bold mb-6 shadow-md">
                    AMD
                  </div>

                  <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#D5A688] block mb-1">
                    Fundadora &amp; Especialista
                  </span>
                  <h3 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#111111] mb-2">
                    Ana Maria Díaz
                  </h3>
                  <p className="text-xs text-[#5E765E] font-semibold mb-4">
                    Más de 10 años de trayectoria profesional
                  </p>

                  <div className="space-y-3 text-xs text-[#111111]/80 font-light border-t border-[#5E765E]/15 pt-4">
                    <div className="flex items-start gap-2.5">
                      <Award className="w-4 h-4 text-[#5E765E] shrink-0 mt-0.5" />
                      <span>Especialista certificada en estética facial, manicura avanzada, extensiones de pestañas y masoterapia.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-[#5E765E] shrink-0 mt-0.5" />
                      <span>Riguroso protocolo de esterilización y bioseguridad en cada servicio en estudio o a domicilio/oficina.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Heart className="w-4 h-4 text-[#D5A688] shrink-0 mt-0.5" />
                      <span>Vocación de servicio, calidez humana y enfoque en potenciar tu autoestima y descanso.</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Pillars / Values */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E]">
                Nuestros Pilares
              </span>
              <h2 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl font-bold text-[#111111] mt-1">
                La Experiencia Meraki
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-8 border border-[#5E765E]/15 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF2DE] border border-[#5E765E]/20 flex items-center justify-center mb-6">
                  <Home className="w-6 h-6 text-[#5E765E]" />
                </div>
                <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111] mb-2">
                  En tu Casa u Oficina
                </h3>
                <p className="text-xs text-[#111111]/75 font-light leading-relaxed">
                  Evita el tráfico y el estrés de desplazarte. Llevamos todo el equipamiento profesional necesario para que disfrutes de tu momento especial donde estés.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-[#5E765E]/15 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF2DE] border border-[#5E765E]/20 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6 text-[#5E765E]" />
                </div>
                <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111] mb-2">
                  Máxima Bioseguridad
                </h3>
                <p className="text-xs text-[#111111]/75 font-light leading-relaxed">
                  Cumplimos rigurosamente todas las normas sanitarias: instrumental esterilizado, kits descartables y desinfección meticulosa antes de cada sesión.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-[#5E765E]/15 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF2DE] border border-[#5E765E]/20 flex items-center justify-center mb-6">
                  <Sparkles className="w-6 h-6 text-[#D5A688]" />
                </div>
                <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111] mb-2">
                  Empoderamiento y Bienestar
                </h3>
                <p className="text-xs text-[#111111]/75 font-light leading-relaxed">
                  Cuidar de ti no es un lujo, es una necesidad. Cada servicio está pensado para que te sientas renovada, feliz, segura de ti misma y lista para conquistar tus metas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-white/70 border-t border-[#5E765E]/15">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E]">
                Testimonios Reales
              </span>
              <h2 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl font-bold text-[#111111] mt-1">
                Lo que dicen nuestras clientas
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.id}
                  className="bg-[#FFF2DE] rounded-3xl p-8 border border-[#5E765E]/15 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 text-[#D5A688] mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="font-['Cormorant_Garamond',serif] text-lg text-[#111111] italic leading-relaxed mb-6">
                      “{t.comment}”
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#5E765E]/15">
                    <span className="font-semibold text-xs text-[#111111] block">
                      {t.author}
                    </span>
                    <span className="text-[11px] text-[#5E765E] block">
                      {t.role} • {t.location}
                    </span>
                    <span className="text-[10px] text-[#111111]/50 block mt-1">
                      Servicio: {t.service}
                    </span>
                  </div>
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
