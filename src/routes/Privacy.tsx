import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

type PrivacySection = {
  id: string;
  title: string;
  content: string;
};

const privacySections: PrivacySection[] = [
  {
    id: 'privacy-1',
    title: 'Información que recopilamos',
    content: 'En Meraki Spa Beauty recopilamos datos personales indispensables para la prestación de nuestros servicios: nombres, números de contacto, correo electrónico, preferencias de aromaterapia y notas de salud relevantes para la personalización segura de tus tratamientos corporales y faciales.'
  },
  {
    id: 'privacy-2',
    title: 'Cómo utilizamos la información',
    content: 'Tus datos son utilizados exclusivamente para coordinar citas, confirmar disponibilidad de cabinas y suites privadas, personalizar protocolos terapéuticos y remitirte información sobre tu Gift Card o promociones especiales, siempre bajo tu expreso consentimiento.'
  },
  {
    id: 'privacy-3',
    title: 'Cookies & Navegación',
    content: 'Nuestro portal emplea cookies técnicas y analíticas para recordar tus preferencias de idioma, navegación y sesión, garantizando una experiencia fluida y segura en todo momento.'
  },
  {
    id: 'privacy-4',
    title: 'Servicios de terceros',
    content: 'No comercializamos ni cedemos tus datos a terceros con fines publicitarios. Las transacciones de Gift Cards y confirmaciones por mensajería se gestionan mediante canales oficiales encriptados.'
  },
  {
    id: 'privacy-5',
    title: 'Conservación de datos',
    content: 'Conservamos tus datos mientras mantengas una relación activa como cliente o durante los plazos legalmente exigidos por la legislación peruana de protección de datos personales.'
  },
  {
    id: 'privacy-6',
    title: 'Derechos del usuario (ARCO)',
    content: 'Tienes derecho a acceder, rectificar, cancelar u oponerte al tratamiento de tus datos personales en cualquier momento comunicándote directamente a nuestro correo oficial hello@meraki.spa.pe.'
  },
  {
    id: 'privacy-7',
    title: 'Seguridad',
    content: 'Implementamos estándares de seguridad física, técnica y organizativa para resguardar la confidencialidad de tu información en nuestras plataformas digitales y canales de atención.'
  },
  {
    id: 'privacy-8',
    title: 'Contacto & Consultas',
    content: 'Para cualquier consulta referente a esta política de privacidad, puedes escribirnos directamente a nuestro correo oficial hello@meraki.spa.pe o por nuestro canal oficial de WhatsApp.'
  },
];

function SectionNumber({ index }: { index: number }) {
  return String(index + 1).padStart(2, '0');
}

export function Privacy() {
  return (
    <div className="min-h-screen bg-[#FFF2DE] text-[#111111] font-['Montserrat',sans-serif] flex flex-col selection:bg-[#5E765E] selection:text-[#FFF2DE]">
      <Header />
      <main className="flex-1">
        <section className="py-20 md:py-28 border-b border-[#5E765E]/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
            <span className="text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-[0.24em] text-[#5E765E] block mb-3">
              Políticas de Privacidad
            </span>
            <h1 className="font-['Cormorant_Garamond',serif] text-5xl sm:text-6xl md:text-7xl font-normal text-[#111111] leading-tight">
              Tu privacidad y confianza <br />
              <span className="italic text-[#5E765E]">son nuestro compromiso.</span>
            </h1>
            <p className="font-['Montserrat',sans-serif] text-xs text-[#111111]/60 uppercase tracking-widest mt-6">
              Actualizado a 2026
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
              {/* Sidebar Index */}
              <aside className="lg:col-span-4" aria-label="Índice de Privacidad">
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
              <div className="lg:col-span-8 space-y-12">
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
    </div>
  );
}

