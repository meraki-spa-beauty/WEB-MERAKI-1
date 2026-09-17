import { createBrowserRouter } from 'react-router-dom';
import { Home } from '../routes/Home';
import { Privacy } from '../routes/Privacy';
import { NotFound } from '../routes/NotFound';

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/privacy', element: <Privacy /> },
  { path: '*', element: <NotFound /> },
]);
