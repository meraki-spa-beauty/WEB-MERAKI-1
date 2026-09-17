import { ArrowLink } from '../ui/ArrowLink';

export function ContactSection() {
  return (
    <section id="contacto" className="contact section-pad">
      <div className="container contact-grid">
        <div>
          <span className="eyebrow">CONTACTO</span>
          <h2>
            Hablemos
            <br />
            de tu momento.
          </h2>
        </div>
        <div className="contact-copy">
          <p className="contact-placeholder">[INSERTAR DIRECCIÓN DEFINITIVA]</p>
          <p className="contact-placeholder">[INSERTAR HORARIO DEFINITIVO]</p>
          <ArrowLink href="mailto:hello@meraki.spa.pe">Escribir a Meraki</ArrowLink>
        </div>
      </div>
    </section>
  );
}
