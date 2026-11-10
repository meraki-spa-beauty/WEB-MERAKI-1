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
import { FloatingWhatsAppButton } from '../components/common/FloatingWhatsAppButton';
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
