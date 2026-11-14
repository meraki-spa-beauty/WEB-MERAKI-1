import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { BookingProvider } from '../context/BookingContext';
import { AuthProvider } from '../context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <RouterProvider router={router} />
      </BookingProvider>
    </AuthProvider>
  );
}
