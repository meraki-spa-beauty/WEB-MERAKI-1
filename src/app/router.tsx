import { createBrowserRouter, Link, Navigate, useLocation, useOutlet } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { RouteCurtainOverlay } from '../components/layout/RouteTransition';
import { BookingModal } from '../components/modals/BookingModal';
import { useBooking } from '../context/BookingContext';
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

function FrozenRouteOutlet() {
  const outlet = useOutlet();
  const [capturedOutlet] = useState(outlet);

  return <>{capturedOutlet}</>;
}

const ROUTE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function BookingModalHost() {
  const { isBookingOpen, closeBooking, preselectedServiceId, preselectedOptionIndex } = useBooking();

  return (
    <BookingModal
      isOpen={isBookingOpen}
      onClose={closeBooking}
      preselectedServiceId={preselectedServiceId}
      preselectedOptionIndex={preselectedOptionIndex}
    />
  );
}

function RootLayout() {
  const location = useLocation();
  const prevPathRef = useRef<string>(location.pathname);
  const prevSearchRef = useRef<string>(location.search);

  useEffect(() => {
    syncRouteSeoMetadata(location.pathname);

    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      prevSearchRef.current = location.search;

      if (location.pathname !== '/admin') {
        trackMetaPageView();
        trackTikTokPageView();
      }

      return;
    }

    if (prevSearchRef.current !== location.search) {
      prevSearchRef.current = location.search;

      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [location.pathname, location.search]);

  const handleExitComplete = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <RouteCurtainOverlay pathname={location.pathname} />
      <BookingModalHost />

      <AnimatePresence mode="wait" initial={false} onExitComplete={handleExitComplete}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0.82 }}
          animate={{ opacity: 1, transition: { duration: 0.72, ease: ROUTE_EASE } }}
          exit={{ opacity: 0.3, transition: { duration: 0.68, ease: [0.65, 0, 0.24, 1] } }}
        >
          <FrozenRouteOutlet />
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}

function RouteErrorFallback() {
  return (
    <div className="min-h-screen bg-[#FFF2DE] text-[#111111] flex items-center justify-center p-6 font-['Montserrat',sans-serif]">
      <div className="max-w-md w-full bg-[#FFFDF9] rounded-3xl p-8 border border-[#D5A688]/40 shadow-lg text-center space-y-4">
        <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#111111]">
          Ocurrió un inconveniente temporal
        </h1>
        <p className="text-xs text-[#111111]/75 leading-relaxed">
          No pudimos cargar esta vista por completo. Puedes recargar la página o volver al inicio sin perder tu avance.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-full bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors"
          >
            Recargar Página
          </button>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-full border border-[#5E765E]/30 bg-white hover:bg-[#FFF2DE] text-[#111111] text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorFallback />,
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
