import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Home } from '../routes/Home';
import { Catalogo } from '../routes/Catalogo';
import { ComoReservar } from '../routes/ComoReservar';
import { Nosotros } from '../routes/Nosotros';
import { Contacto } from '../routes/Contacto';
import { Privacy } from '../routes/Privacy';
import { NotFound } from '../routes/NotFound';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FloatingWhatsAppButton } from '../components/layout/FloatingWhatsAppButton';
import { RouteInterfaceSkeleton } from '../components/ui/Skeleton';
import { trackMetaPageView } from '../utils/metaPixel';
import { trackTikTokPageView } from '../utils/tiktokPixel';

function WorkshopRedirect() {
  if (typeof window !== 'undefined') {
    window.location.replace('/workshop/');
  }

  return null;
}

function PageShellSkeleton({ pathname }: { pathname: string }) {
  return (
    <div className="min-h-screen bg-[#FFF2DE] text-[#111111] font-['Montserrat',sans-serif] flex flex-col selection:bg-[#5E765E] selection:text-[#FFF2DE]">
      <Header />
      <RouteInterfaceSkeleton pathname={pathname} />
      <Footer />
      <FloatingWhatsAppButton />
    </div>
  );
}

interface RouteSeoMeta {
  title: string;
  description: string;
}

const DEFAULT_SEO_META: RouteSeoMeta = {
  title: 'Meraki | Nails, Spa & Bienestar en Lima',
  description:
    'Especialistas en uñas, nails y spa en Pueblo Libre y a domicilio en Lima: manicura, soft gel, esculpidas, press on, pedicura, pestañas, masajes y faciales.',
};

function getRouteSeoMeta(pathname: string): RouteSeoMeta {
  switch (pathname) {
    case '/catalogo':
      return {
        title: 'Catálogo de Uñas, Nails y Spa | Meraki',
        description:
          'Explora uñas soft gel, esculpidas, press on nails, esmalte gel, pedicura, pestañas, masajes y faciales en estudio (Pueblo Libre) y a domicilio en Lima.',
      };
    case '/como-reservar':
      return {
        title: 'Cómo Reservar Uñas, Nails y Spa | Meraki',
        description:
          'Agenda tu cita de uñas, nails o spa con Meraki en 4 pasos: elige tu tratamiento, modalidad en estudio o domicilio en Lima y confirma por WhatsApp.',
      };
    case '/nosotros':
      return {
        title: 'Sobre Meraki y Ana Maria Díaz | Meraki',
        description:
          'Conoce a Meraki y a Ana Maria Díaz, especialistas en uñas, estética y bienestar con más de 10 años de experiencia en Pueblo Libre y a domicilio en Lima.',
      };
    case '/contacto':
      return {
        title: 'Contacto Uñas y Spa Pueblo Libre | Meraki',
        description:
          'Agenda tu cita de uñas, nails o spa en Meraki por WhatsApp al +51 993 067 291 o visita Calle Agustín Gamarra 515, Pueblo Libre, Lima.',
      };
    case '/privacy':
      return {
        title: 'Políticas de Privacidad | Meraki',
        description:
          'Consulta la política de privacidad, protección de datos personales y derechos ARCO de Meraki Spa para servicios de uñas, estética y bienestar en Perú.',
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

  const canonicalLink = document.querySelector('link[rel="canonical"]');

  if (canonicalLink) {
    canonicalLink.setAttribute('href', canonicalUrl);
  }
}

function RootLayout() {
  const location = useLocation();
  const isFirstRender = useRef(true);
  const [activePath, setActivePath] = useState(location.pathname);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Detect route change synchronously during render for 0ms skeleton appearance
  if (activePath !== location.pathname) {
    setActivePath(location.pathname);

    if (location.pathname !== '/') {
      setIsTransitioning(true);
    }
  }

  useEffect(() => {
    syncRouteSeoMetadata(location.pathname);

    if (isFirstRender.current) {
      isFirstRender.current = false;

      return;
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    trackMetaPageView();
    trackTikTokPageView();

    if (location.pathname === '/') {
      setIsTransitioning(false);

      return;
    }

    const timer = window.setTimeout(() => {
      setIsTransitioning(false);
    }, 110);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  if (isTransitioning) {
    return <PageShellSkeleton pathname={location.pathname} />;
  }

  return <Outlet />;
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
      { path: '/workshop', element: <WorkshopRedirect /> },
      { path: '/press-on-workshop', element: <WorkshopRedirect /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
