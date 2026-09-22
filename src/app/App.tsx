import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { BookingProvider } from '../context/BookingContext';

export default function App() {
  return (
    <BookingProvider>
      <RouterProvider router={router} />
    </BookingProvider>
  );
}
