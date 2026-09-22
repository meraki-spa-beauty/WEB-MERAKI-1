import { Link } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FloatingWhatsAppButton } from '../components/common/FloatingWhatsAppButton';
import { EditorialHeroFeed } from '../components/sections/EditorialHeroFeed';
import { TESTIMONIALS } from '../data/spaData';
import { CATEGORIES_DATA } from '../data/catalog';
import { useBooking } from '../context/BookingContext';
import {
  Sparkles,
  ArrowRight,
  MessageSquare,
  Home as HomeIcon,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Clock,
  Star,
  Hand,
  Footprints,
  Eye,
  Scissors,
  Flame,
  Smile,
  Calendar
} from 'lucide-react';

export function Home() {
  const { openBooking } = useBooking();

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'manos':
        return <Hand className="w-5 h-5 text-[#5E765E]" />;
      case 'pies':
        return <Footprints className="w-5 h-5 text-[#D5A688]" />;
      case 'pestanas':
        return <Eye className="w-5 h-5 text-[#5E765E]" />;
      case 'depilacion':
        return <Scissors className="w-5 h-5 text-[#D5A688]" />;
      case 'masajes':
        return <Flame className="w-5 h-5 text-[#5E765E]" />;
      case 'faciales':
        return <Smile className="w-5 h-5 text-[#D5A688]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#5E765E]" />;
    }
  };

  const categoriesPreview = CATEGORIES_DATA.filter((c) => c.id !== 'todos');

  return (
    <div className="min-h-screen bg-[#FFF2DE] text-[#111111] font-['Montserrat',sans-serif] flex flex-col selection:bg-[#5E765E] selection:text-[#FFF2DE]">
      <TopBar />
      <Header />

      <main className="flex-1">
        {/* =========================================================================
            1. EDITORIAL HERO FEED: Full-bleed photo, moody gray filter, centered semitransparent isotype
            (Inspired by Heavenly Spa by Westin reference & Meraki brand identity)
           ========================================================================= */}
        <EditorialHeroFeed onOpenBooking={() => openBooking()} />

        {/* =========================================================================
            2. CÓMO FUNCIONA EL SERVICIO A DOMICILIO (Para quien recién conoce la marca)
           ========================================================================= */}
        <section className="py-16 md:py-20 bg-white/70 border-b border-[#5E765E]/15 text-left">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E]">
                Fácil, Cómodo y Seguro
              </span>
              <h2 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl md:text-5xl font-bold text-[#111111] mt-2 mb-4">
                ¿Cómo funciona el servicio de Meraki?
              </h2>
              <p className="text-xs sm:text-sm text-[#111111]/75 font-light leading-relaxed">
                Olvídate del tráfico y las salas de espera. Disfruta de un servicio de estética profesional sin salir de tu espacio personal o laboral.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-[#FFF2DE] rounded-3xl p-8 border border-[#5E765E]/15 shadow-sm relative">
                <span className="font-['Cormorant_Garamond',serif] text-5xl font-bold text-[#5E765E]/20 absolute top-6 right-6">
                  01
                </span>
                <div className="w-12 h-12 rounded-2xl bg-[#5E765E] text-[#FFF2DE] flex items-center justify-center mb-6">
                  <Sparkles className="w-6 h-6 text-[#D5A688]" />
                </div>
                <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111] mb-2">
                  Elige tu Tratamiento
                </h3>
                <p className="text-xs text-[#111111]/75 font-light leading-relaxed">
                  Explora nuestro catálogo oficial de manicura, pedicura, pestañas, depilación cera/hilo, masajes o faciales con tarifas claras.
                </p>
                <div className="mt-4">
                  <Link
                    to="/catalogo"
                    className="text-xs font-semibold text-[#5E765E] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Ver catálogo</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-[#FFF2DE] rounded-3xl p-8 border border-[#5E765E]/15 shadow-sm relative">
                <span className="font-['Cormorant_Garamond',serif] text-5xl font-bold text-[#5E765E]/20 absolute top-6 right-6">
                  02
                </span>
                <div className="w-12 h-12 rounded-2xl bg-[#5E765E] text-[#FFF2DE] flex items-center justify-center mb-6">
                  <MessageSquare className="w-6 h-6 text-[#D5A688]" />
                </div>
                <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111] mb-2">
                  Escríbenos por WhatsApp
                </h3>
                <p className="text-xs text-[#111111]/75 font-light leading-relaxed">
                  Indícanos qué servicio deseas, fecha, hora y distrito. Aseguras tu horario con el 40% de adelanto de la reserva.
                </p>
                <div className="mt-4">
                  <Link
                    to="/como-reservar"
                    className="text-xs font-semibold text-[#5E765E] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Ver pasos de reserva</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-[#FFF2DE] rounded-3xl p-8 border border-[#5E765E]/15 shadow-sm relative">
                <span className="font-['Cormorant_Garamond',serif] text-5xl font-bold text-[#5E765E]/20 absolute top-6 right-6">
                  03
                </span>
                <div className="w-12 h-12 rounded-2xl bg-[#5E765E] text-[#FFF2DE] flex items-center justify-center mb-6">
                  <HomeIcon className="w-6 h-6 text-[#D5A688]" />
                </div>
                <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111] mb-2">
                  Llegamos a tu Espacio
                </h3>
                <p className="text-xs text-[#111111]/75 font-light leading-relaxed">
                  Llegamos a tu casa u oficina con instrumental esterilizado, cosmética de alta gama y lámparas portátiles. ¡Tú solo relájate!
                </p>
                <div className="mt-4">
                  <span className="text-xs text-[#5E765E] font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Bioseguridad hospitalaria</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. NUESTRAS 6 ESPECIALIDADES (Preview sin saturar la página)
           ========================================================================= */}
        <section className="py-16 md:py-20 text-left">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E]">
                  Catálogo Oficial
                </span>
                <h2 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl md:text-5xl font-bold text-[#111111] mt-1">
                  Nuestras Especialidades
                </h2>
              </div>
              <Link
                to="/catalogo"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#5E765E] uppercase tracking-wider hover:underline"
              >
                <span>Explorar los 36 servicios con tarifas</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoriesPreview.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/catalogo?cat=${cat.id}`}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-[#5E765E]/15 shadow-sm hover:shadow-md hover:border-[#5E765E]/30 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#FFF2DE] border border-[#5E765E]/20 flex items-center justify-center group-hover:bg-[#5E765E] group-hover:text-[#FFF2DE] transition-colors">
                        {getCategoryIcon(cat.id)}
                      </div>
                      <span className="text-xs font-bold text-[#5E765E] px-3 py-1 rounded-full bg-[#5E765E]/10">
                        {cat.count} servicios
                      </span>
                    </div>

                    <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111] mb-2 group-hover:text-[#5E765E] transition-colors">
                      {cat.label}
                    </h3>
                    <p className="text-xs text-[#111111]/75 font-light leading-relaxed mb-6">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#5E765E]/10 flex items-center justify-between text-xs font-semibold text-[#5E765E]">
                    <span>Ver servicios y precios</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                to="/catalogo"
                className="inline-flex items-center gap-2 bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all shadow-md"
              >
                <span>Abrir Catálogo Completo</span>
                <ArrowRight className="w-4 h-4 text-[#D5A688]" />
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. BIENVENIDA & CONOCE A ANA MARIA DÍAZ
           ========================================================================= */}
        <section className="py-16 md:py-20 bg-white/70 border-y border-[#5E765E]/15 text-left">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-5">
                <div className="bg-[#FFF2DE] rounded-3xl p-8 border border-[#5E765E]/20 shadow-md">
                  <div className="w-16 h-16 rounded-2xl bg-[#5E765E] text-[#FFF2DE] flex items-center justify-center font-['Cormorant_Garamond',serif] text-2xl font-bold mb-6">
                    AMD
                  </div>
                  <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#D5A688] block">
                    Fundadora de Meraki
                  </span>
                  <h3 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#111111] mb-2">
                    Ana Maria Díaz
                  </h3>
                  <p className="text-xs text-[#5E765E] font-medium mb-4">
                    Más de 10 años de experiencia profesional
                  </p>
                  <p className="text-xs text-[#111111]/80 font-light leading-relaxed mb-6">
                    Especialista en estética integral, cuidado de uñas, pestañas, masoterapia y faciales. Con el compromiso de que cada sesión sea un momento de desconexión y alegría personal.
                  </p>
                  <div className="pt-4 border-t border-[#5E765E]/15 flex items-center justify-between text-xs">
                    <span className="text-[#111111]/70">Atención a domicilio y oficinas</span>
                    <Link to="/nosotros" className="font-semibold text-[#5E765E] hover:underline">
                      Conoce más →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E]">
                  Propósito de Marca
                </span>
                <h2 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl md:text-5xl font-bold text-[#111111] mt-2 mb-6">
                  “Tenemos como principal objetivo que te sientas feliz y empoderada”
                </h2>
                <p className="text-xs sm:text-sm text-[#111111]/80 font-light leading-relaxed mb-4">
                  Sabemos lo valioso que es tu tiempo. En medio del tráfico, las obligaciones laborales o el cuidado de la familia, encontrar horas para trasladarse a un spa suele ser difícil.
                </p>
                <p className="text-xs sm:text-sm text-[#111111]/80 font-light leading-relaxed mb-8">
                  Por eso nació Meraki: para llevar un servicio de calidad premium, con protocolos estrictos de higiene y aparatología profesional portátil hasta la puerta de tu hogar o lugar de trabajo.
                </p>

                <div className="grid grid-cols-2 gap-4 text-xs font-light text-[#111111]/85">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5E765E] shrink-0" />
                    <span>Aparatos portátiles certificados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5E765E] shrink-0" />
                    <span>Material descartable estéril</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5E765E] shrink-0" />
                    <span>Cosmética de alta gama</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5E765E] shrink-0" />
                    <span>Puntualidad y calidez humana</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            5. CONDICIONES CLAVE PARA CLIENTES NUEVOS (Transparencia Total)
           ========================================================================= */}
        <section className="py-16 text-left">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#5E765E]/20 shadow-md">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                <div>
                  <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E]">
                    Para Clientes Nuevos
                  </span>
                  <h3 className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl font-bold text-[#111111] mt-1">
                    Políticas Clave de Atención
                  </h3>
                </div>
                <Link
                  to="/como-reservar"
                  className="text-xs font-semibold text-[#5E765E] hover:underline inline-flex items-center gap-1"
                >
                  <span>Ver guía completa de reserva</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-[#111111]/85 font-light">
                <div className="p-4 rounded-2xl bg-[#FFF2DE] border border-[#5E765E]/15 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#5E765E] shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block text-[#111111] mb-0.5">Reserva Previa con 40%:</strong>
                    <span>Se solicita un adelanto del 40% para apartar y reservar el bloque horario y transporte exclusivamente para ti.</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF2DE] border border-[#5E765E]/15 flex items-start gap-3">
                  <Truck className="w-5 h-5 text-[#D5A688] shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block text-[#111111] mb-0.5">Movilidad según Distrito:</strong>
                    <span>Los precios de catálogo no incluyen la movilidad. El costo depende de tu distrito en Lima y se informa al escribirnos.</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF2DE] border border-[#5E765E]/15 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#5E765E] shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block text-[#111111] mb-0.5">Bioseguridad Rigurosa:</strong>
                    <span>En Meraki cumplimos todos los protocolos de bioseguridad para garantizar una experiencia higiénica y segura.</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF2DE] border border-[#5E765E]/15 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#D5A688] shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block text-[#111111] mb-0.5">Cancelaciones con 24h:</strong>
                    <span>Cambios o cancelaciones con mínimo 24h de anticipación; de lo contrario el depósito previo no es reembolsable.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. TESTIMONIOS REALES A DOMICILIO
           ========================================================================= */}
        <section className="py-16 bg-white/70 border-t border-[#5E765E]/15 text-left">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E]">
                Opiniones de Nuestras Clientas
              </span>
              <h2 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl font-bold text-[#111111] mt-1">
                La comodidad de cuidarte en casa
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.id}
                  className="bg-[#FFF2DE] rounded-3xl p-6 sm:p-8 border border-[#5E765E]/15 shadow-sm flex flex-col justify-between"
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

        {/* =========================================================================
            7. CTA FINAL DIRECTO A WHATSAPP Y CATÁLOGO
           ========================================================================= */}
        <section className="py-20 bg-[#5E765E] text-[#FFF2DE] text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#D5A688] block mb-3">
              ¿Lista para tu momento especial?
            </span>
            <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-normal leading-tight mb-6">
              Agenda tu cita hoy y déjanos consentirte donde estés
            </h2>
            <p className="text-xs sm:text-sm text-[#FFF2DE]/85 font-light max-w-xl mx-auto mb-10 leading-relaxed">
              Consulta disponibilidad para hoy o programa tu cita con anticipación. Respondemos tus consultas de inmediato por WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => openBooking()}
                className="w-full sm:w-auto bg-[#FFF2DE] text-[#5E765E] hover:bg-white px-8 py-4 rounded-full text-xs font-semibold uppercase tracking-widest transition-all shadow-lg inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#D5A688]" />
                <span>Agendar Cita en el Formulario</span>
              </button>

              <Link
                to="/catalogo"
                className="w-full sm:w-auto bg-transparent hover:bg-[#FFF2DE]/10 text-[#FFF2DE] border border-[#FFF2DE]/30 px-8 py-4 rounded-full text-xs font-semibold uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2"
              >
                <span>Ver Catálogo Completo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingWhatsAppButton />
    </div>
  );
}
