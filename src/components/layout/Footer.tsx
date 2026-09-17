import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-mark">Me</div>
          <p className="footer-brand">Meraki</p>
          <p className="footer-tagline">Un espacio para volver a ti.</p>
        </div>
        <div className="footer-links">
          <div>
            <span className="footer-label">Explorar</span>
            <a href="#experiencias">Experiencias</a>
            <a href="#filosofia">Nosotros</a>
            <a href="#contacto">Contacto</a>
          </div>
          <div>
            <span className="footer-label">Legal</span>
            <Link to="/privacy">Privacidad</Link>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Meraki</span>
        <span>meraki.spa.pe</span>
      </div>
    </footer>
  );
}
