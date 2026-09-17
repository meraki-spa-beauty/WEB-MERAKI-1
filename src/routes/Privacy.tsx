import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

type PrivacySection = {
  id: string;
  title: string;
};

const privacySections: PrivacySection[] = [
  { id: 'privacy-1', title: 'Información que recopilamos' },
  { id: 'privacy-2', title: 'Cómo utilizamos la información' },
  { id: 'privacy-3', title: 'Cookies' },
  { id: 'privacy-4', title: 'Servicios de terceros' },
  { id: 'privacy-5', title: 'Conservación de datos' },
  { id: 'privacy-6', title: 'Derechos del usuario' },
  { id: 'privacy-7', title: 'Seguridad' },
  { id: 'privacy-8', title: 'Contacto' },
];

function SectionNumber({ index }: { index: number }) {
  return String(index + 1).padStart(2, '0');
}

export function Privacy() {
  return (
    <div className="site-shell">
      <Header />
      <main>
        <section className="privacy-hero section-pad">
          <div className="container privacy-hero__inner">
            <span className="eyebrow">PRIVACIDAD</span>
            <h1>
              Tu privacidad
              <br />
              importa.
            </h1>
            <p>Última actualización: [FECHA DE ACTUALIZACIÓN]</p>
          </div>
        </section>

        <section className="privacy-content section-pad">
          <div className="container privacy-grid">
            <aside className="privacy-nav" aria-label="Índice">
              {privacySections.map((section, index) => (
                <a href={`#${section.id}`} key={section.id}>
                  <span>
                    <SectionNumber index={index} />
                  </span>
                  {section.title}
                </a>
              ))}
            </aside>

            <div className="privacy-copy">
              {privacySections.map((section, index) => (
                <section id={section.id} key={section.id}>
                  <span className="privacy-number">
                    <SectionNumber index={index} />
                  </span>
                  <h2>{section.title}</h2>
                  <p>[INSERTAR TEXTO LEGAL DEFINITIVO]</p>
                </section>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
