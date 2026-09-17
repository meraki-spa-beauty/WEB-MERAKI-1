import { ArrowLink } from '../ui/ArrowLink';

export function BookingCTA() {
  return (
    <section className="booking-cta section-pad">
      <div className="container booking-cta__inner">
        <span className="eyebrow">TU MOMENTO</span>
        <h2>
          Regálate
          <br />
          una pausa.
        </h2>
        <p>Descubre una experiencia creada para ti.</p>
        <ArrowLink href="#contacto" variant="ghost">
          Reservar experiencia
        </ArrowLink>
      </div>
    </section>
  );
}
