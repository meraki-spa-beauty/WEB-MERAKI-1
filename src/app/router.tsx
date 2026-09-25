import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Home } from '../routes/Home';
import { Catalogo } from '../routes/Catalogo';
import { ComoReservar } from '../routes/ComoReservar';
import { Nosotros } from '../routes/Nosotros';
import { Contacto } from '../routes/Contacto';
import { Privacy } from '../routes/Privacy';
import { NotFound } from '../routes/NotFound';
import { trackMetaPageView } from '../utils/metaPixel';

function WorkshopRedirect() {
  if (typeof window !== 'undefined') {
    window.location.replace('/workshop/');
  }

  return null;
}

function RootLayout() {
  const location = useLocation();

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      return;
    }

    trackMetaPageView();
  }, [location.pathname]);

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
