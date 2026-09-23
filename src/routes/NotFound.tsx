import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { ArrowLeft, Compass, BookOpen } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFF2DE] text-[#111111] font-['Montserrat',sans-serif] flex flex-col selection:bg-[#5E765E] selection:text-[#FFF2DE]">
      <Header />
      <main className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center bg-[#FFFFFF] p-8 sm:p-10 rounded-3xl border border-[#5E765E]/15 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#5E765E]/10 flex items-center justify-center text-[#5E765E] mb-6">
            <Compass className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#5E765E] block mb-2">
            Página No Encontrada
          </span>
          <div className="font-['Cormorant_Garamond',serif] text-7xl font-light text-[#D5A688] leading-none mb-4">
            404
          </div>
          <h1 className="font-['Cormorant_Garamond',serif] text-2xl text-[#111111] font-normal mb-3 leading-snug">
            Esta página no se encuentra disponible.
          </h1>
          <p className="text-xs text-[#111111]/70 mb-8 leading-relaxed font-light">
            Te invitamos a explorar nuestro catálogo de servicios en estudio o a domicilio, o regresar a la página principal.
          </p>
          <div className="space-y-3">
            <Link
              to="/catalogo"
              className="inline-flex items-center justify-center gap-2 bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] px-7 py-3.5 rounded-full text-xs font-semibold uppercase tracking-[0.16em] transition-all shadow-sm w-full"
            >
              <BookOpen className="w-4 h-4 text-[#D5A688]" />
              <span>Ver Catálogo de Servicios</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-[#FFF2DE] hover:bg-white text-[#5E765E] border border-[#5E765E]/20 px-7 py-3 rounded-full text-xs font-semibold uppercase tracking-[0.16em] transition-all w-full"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Inicio</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
