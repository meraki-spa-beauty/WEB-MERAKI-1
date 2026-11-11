import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { BookingProvider } from '../context/BookingContext';
import { ThemeSwitcher } from '../components/common/ThemeSwitcher';

export default function App() {
  return (
    <BookingProvider>
      <RouterProvider router={router} />
      <ThemeSwitcher />
    </BookingProvider>
  );
}
