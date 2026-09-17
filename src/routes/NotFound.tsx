import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <main className="not-found">
      <span className="eyebrow">MERAKI</span>
      <div className="not-found__number">404</div>
      <h1>
        Este espacio
        <br />
        no existe.
      </h1>
      <Link className="arrow-link arrow-link--primary" to="/">
        <span>Volver a Meraki</span>
        <span aria-hidden="true">↗</span>
      </Link>
    </main>
  );
}
