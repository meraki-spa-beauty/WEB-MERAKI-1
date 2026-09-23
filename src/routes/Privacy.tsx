import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { TopBar } from '../components/layout/TopBar';
import { FloatingWhatsAppButton } from '../components/common/FloatingWhatsAppButton';
import { SPA_INFO } from '../data/spaData';

type PrivacySection = {
  id: string;
  title: string;
  content: string;
};

const privacySections: PrivacySection[] = [
  {
    id: 'privacy-1',
    title: 'Información que recopilamos',
    content: 'En Meraki Spa recopilamos datos personales indispensables para la coordinación y prestación segura de nuestros servicios en estudio, a domicilio u oficina: nombres y apellidos, modalidad o dirección de atención, número telefónico, correo electrónico, fecha de nacimiento y observaciones necesarias sobre tu tipo de piel o alergias previas.'
  },
  {
    id: 'privacy-2',
    title: 'Cómo utilizamos la información',
    content: 'Tus datos son utilizados exclusivamente para coordinar tu cita presencial en estudio o a domicilio, confirmar fecha y hora de atención, calcular el costo de movilidad en caso de atención a domicilio en Lima y garantizar protocolos de bioseguridad personalizados.'
  },
  {
    id: 'privacy-3',
    title: 'Políticas de Reserva y Adelanto del 40%',
    content: 'Para garantizar la agenda exclusiva de nuestro personal y transporte, toda cita se confirma con el adelanto del 40% del valor del servicio. Una vez realizado el depósito bancario o por billetera digital, el cliente remite el voucher con sus datos completos para formalizar el agendamiento.'
  },
  {
    id: 'privacy-4',
    title: 'Política de Cancelaciones y Cambios',
    content: 'Cualquier modificación o cancelación de cita debe notificarse con un mínimo de 24 horas de anticipación. De lo contrario, el previo depósito del 40% no será reembolsable, debido a que el bloque horario y transporte han sido reservados en exclusiva.'
  },
  {
    id: 'privacy-5',
    title: 'Uso de Material Audiovisual para Redes Sociales',
    content: 'De acuerdo con las condiciones informadas en nuestro catálogo oficial, los clientes aceptan el uso de fotografías y videos de los procedimientos estéticos y resultados para la difusión en nuestras redes sociales oficiales (@meraki.spa.pe).'
  },
  {
    id: 'privacy-6',
    title: 'Derechos del usuario (ARCO)',
    content: `Tienes derecho a acceder, rectificar o solicitar la actualización de tus datos personales comunicándote directamente a nuestro WhatsApp oficial ${SPA_INFO.whatsappDisplay} o a nuestro correo electrónico oficial.`
  },
  {
    id: 'privacy-7',
    title: 'Seguridad y Bioseguridad',
    content: 'En Meraki cumplimos rigurosos protocolos sanitarios de bioseguridad, esterilización de instrumental y protección de datos para garantizar la total tranquilidad de nuestros clientes.'
  }
];

function SectionNumber({ index }: { index: number }) {
  return String(index + 1).padStart(2, '0');
}

export function Privacy() {
  return (
    <div className="min-h-screen bg-[#FFF2DE] text-[#111111] font-['Montserrat',sans-serif] flex flex-col selection:bg-[#5E765E] selection:text-[#FFF2DE]">
      <TopBar />
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24 border-b border-[#5E765E]/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
            <span className="text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-[0.24em] text-[#5E765E] block mb-3">
              Condiciones &amp; Privacidad
            </span>
            <h1 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl md:text-6xl font-normal text-[#111111] leading-tight">
              Términos del Servicio <br />
              <span className="italic text-[#5E765E]">&amp; Políticas de Reserva</span>
            </h1>
            <p className="font-['Montserrat',sans-serif] text-xs text-[#111111]/60 uppercase tracking-widest mt-6">
              Actualizado conforme al Catálogo Oficial de Meraki Spa
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
              {/* Sidebar Index */}
              <aside className="lg:col-span-4" aria-label="Índice de Políticas">
                <div className="sticky top-28 bg-[#FFFFFF] p-6 rounded-2xl border border-[#5E765E]/15 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#5E765E] mb-4">
                    Contenido
                  </h3>
                  <nav className="flex flex-col gap-2">
                    {privacySections.map((section, index) => (
                      <a
                        href={`#${section.id}`}
                        key={section.id}
                        className="flex items-center gap-3 text-xs text-[#111111]/75 hover:text-[#5E765E] py-1.5 transition-colors"
                      >
                        <span className="font-mono text-[11px] text-[#D5A688] font-medium">
                          <SectionNumber index={index} />
                        </span>
                        <span>{section.title}</span>
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>

              {/* Body Copy */}
              <div className="lg:col-span-8 space-y-8">
                {privacySections.map((section, index) => (
                  <article
                    id={section.id}
                    key={section.id}
                    className="bg-[#FFFFFF] p-8 sm:p-10 rounded-2xl border border-[#5E765E]/15 shadow-sm scroll-mt-28"
                  >
                    <span className="font-mono text-xs text-[#D5A688] font-semibold tracking-widest block mb-2">
                      SECCIÓN <SectionNumber index={index} />
                    </span>
                    <h2 className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl font-medium text-[#111111] mb-4">
                      {section.title}
                    </h2>
                    <p className="text-sm sm:text-base text-[#111111]/75 leading-relaxed font-light">
                      {section.content}
                    </p>
                  </article>
                ))}
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
