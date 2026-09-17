import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../brand/Logo';

export function Header() {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="container header-inner"><Logo/><nav className="desktop-nav" aria-label="Navegación principal"><a href="#experiencias">Experiencias</a><a href="#filosofia">Nosotros</a><button className="menu-trigger" onClick={() => setOpen(true)}>Menú ↗</button></nav><button className="mobile-menu-trigger" aria-label="Abrir menú" aria-expanded={open} onClick={() => setOpen(true)}><span/><span/></button></div>{open && <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menú principal"><div className="mobile-menu__top container"><Logo/><button className="mobile-close" aria-label="Cerrar menú" onClick={() => setOpen(false)}>×</button></div><div className="mobile-menu__body container"><nav className="mobile-links"><a href="#experiencias" onClick={() => setOpen(false)}>Experiencias</a><a href="#filosofia" onClick={() => setOpen(false)}>Nosotros</a><a href="#contacto" onClick={() => setOpen(false)}>Contacto</a></nav><div className="mobile-menu__legal"><Link to="/privacy" onClick={() => setOpen(false)}>Privacidad</Link></div></div></div>}</header>;
}
