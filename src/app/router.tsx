import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Home } from '../routes/Home';
import { Catalogo } from '../routes/Catalogo';
import { ComoReservar } from '../routes/ComoReservar';
import { Nosotros } from '../routes/Nosotros';
import { Contacto } from '../routes/Contacto';
import { Privacy } from '../routes/Privacy';
import { LibroReclamaciones } from '../routes/LibroReclamaciones';
import { Admin } from '../routes/Admin';
import { NotFound } from '../routes/NotFound';
import { trackMetaPageView } from '../utils/metaPixel';
import { trackTikTokPageView } from '../utils/tiktokPixel';

function WorkshopRedirect() {
  if (typeof window !== 'undefined') {
    window.location.replace('/workshop/');
  }

  return null;
}

interface RouteSeoMeta {
  title: string;
  description: string;
  robots?: string;
}

const DEFAULT_SEO_META: RouteSeoMeta = {
  title: 'Meraki Spa | Uñas, Belleza y Spa en Pueblo Libre, Lima',
  description:
    'Meraki Spa en Pueblo Libre, Lima: manicura, soft gel, uñas esculpidas, press on, pedicura, pestañas, masajes y faciales. Atención a domicilio y estudio con reserva previa.',
};

function getRouteSeoMeta(pathname: string): RouteSeoMeta {
  switch (pathname) {
    case '/catalogo':
      return {
        title: 'Catálogo de Uñas, Nails y Spa | Meraki Spa',
        description:
          'Explora uñas soft gel, esculpidas, press on nails, esmalte gel, pedicura, pestañas, masajes y faciales en estudio (Pueblo Libre) y a domicilio en Lima.',
      };
    case '/como-reservar':
      return {
        title: 'Cómo Reservar Uñas, Nails y Spa | Meraki Spa',
        description:
          'Agenda tu cita de uñas, nails o spa con Meraki Spa: elige tu tratamiento, modalidad en estudio o domicilio en Lima y confirma por WhatsApp.',
      };
    case '/nosotros':
      return {
        title: 'Sobre Meraki Spa y Ana Maria Díaz | Meraki Spa',
        description:
          'Conoce a Meraki Spa y a Ana Maria Díaz, especialistas en uñas, estética y bienestar con más de 10 años de experiencia en Pueblo Libre y a domicilio en Lima.',
      };
    case '/contacto':
      return {
        title: 'Contacto Uñas y Spa Pueblo Libre | Meraki Spa',
        description:
          'Agenda tu cita de uñas, nails o spa en Meraki Spa por WhatsApp al +51 993 067 291 o visita Calle Agustín Gamarra 515, Pueblo Libre, Lima.',
      };
    case '/privacy':
      return {
        title: 'Políticas de Privacidad y Términos | Meraki Spa',
        description:
          'Consulta la política de privacidad, protección de datos personales, devoluciones y derechos ARCO de Meraki Spa en Perú.',
      };
    case '/libro-reclamaciones':
      return {
        title: 'Libro de Reclamaciones Virtual | Meraki Spa',
        description:
          'Canal oficial de Libro de Reclamaciones Virtual de Meraki Spa conforme a la Ley N° 29571 (INDECOPI Perú).',
      };
    case '/admin':
      return {
        title: 'Acceso Privado | Meraki Spa',
        description: 'Acceso interno administrativo.',
        robots: 'noindex, nofollow',
      };
    default:
      return DEFAULT_SEO_META;
  }
}

function setMetaTagContent(selector: string, content: string) {
  const el = document.querySelector(selector);

  if (el) {
    el.setAttribute('content', content);
  }
}

function syncRouteSeoMetadata(pathname: string) {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }

  const meta = getRouteSeoMeta(pathname);
  const canonicalUrl = `${window.location.origin}${window.location.pathname}`;

  document.title = meta.title;
  setMetaTagContent('meta[name="description"]', meta.description);
  setMetaTagContent('meta[property="og:title"]', meta.title);
  setMetaTagContent('meta[property="og:description"]', meta.description);
  setMetaTagContent('meta[property="og:url"]', canonicalUrl);
  setMetaTagContent('meta[name="twitter:title"]', meta.title);
  setMetaTagContent('meta[name="twitter:description"]', meta.description);
  setMetaTagContent('meta[name="robots"]', meta.robots || 'index, follow');

  const canonicalLink = document.querySelector('link[rel="canonical"]');

  if (canonicalLink) {
    canonicalLink.setAttribute('href', canonicalUrl);
  }
}

function RootLayout() {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    syncRouteSeoMetadata(location.pathname);

    if (isFirstRender.current) {
      isFirstRender.current = false;

      return;
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    if (location.pathname !== '/admin') {
      trackMetaPageView();
      trackTikTokPageView();
    }
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="meraki-route-enter">
      <Outlet />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/catalogo', element: <Catalogo /> },
      { path: '/catalog', element: <Navigate to="/catalogo" replace /> },
      { path: '/tratamientos', element: <Navigate to="/catalogo" replace /> },
      { path: '/como-reservar', element: <ComoReservar /> },
      { path: '/reservas', element: <Navigate to="/como-reservar" replace /> },
      { path: '/nosotros', element: <Nosotros /> },
      { path: '/contacto', element: <Contacto /> },
      { path: '/privacy', element: <Privacy /> },
      { path: '/libro-reclamaciones', element: <LibroReclamaciones /> },
      { path: '/admin', element: <Admin /> },
      { path: '/workshop', element: <WorkshopRedirect /> },
      { path: '/press-on-workshop', element: <WorkshopRedirect /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
