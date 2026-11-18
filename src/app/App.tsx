import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { BookingProvider } from '../context/BookingContext';
import { AuthProvider } from '../context/AuthContext';
import { CatalogProvider } from '../context/CatalogContext';

interface AppErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends Component<{ children: ReactNode }, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Meraki App ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFF2DE] text-[#111111] flex items-center justify-center p-6 font-['Montserrat',sans-serif]">
          <div className="max-w-md w-full bg-[#FFFDF9] rounded-3xl p-8 border border-[#D5A688]/40 shadow-lg text-center space-y-4">
            <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#111111]">
              Ocurrió un inconveniente temporal
            </h1>
            <p className="text-xs text-[#111111]/75 leading-relaxed">
              No pudimos completar esa vista en pantalla. Recarga la página para continuar con tu reserva en Meraki Spa.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-full bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors"
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <CatalogProvider>
          <BookingProvider>
            <RouterProvider router={router} />
          </BookingProvider>
        </CatalogProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}
