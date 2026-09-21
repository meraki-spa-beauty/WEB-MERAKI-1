import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Home } from '../routes/Home';
import { Catalogo } from '../routes/Catalogo';
import { ComoReservar } from '../routes/ComoReservar';
import { Nosotros } from '../routes/Nosotros';
import { Contacto } from '../routes/Contacto';
import { Privacy } from '../routes/Privacy';
import { NotFound } from '../routes/NotFound';

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/catalogo', element: <Catalogo /> },
  { path: '/catalog', element: <Navigate to="/catalogo" replace /> },
  { path: '/tratamientos', element: <Navigate to="/catalogo" replace /> },
  { path: '/como-reservar', element: <ComoReservar /> },
  { path: '/reservas', element: <Navigate to="/como-reservar" replace /> },
  { path: '/nosotros', element: <Nosotros /> },
  { path: '/contacto', element: <Contacto /> },
  { path: '/privacy', element: <Privacy /> },
  { path: '*', element: <NotFound /> },
]);
