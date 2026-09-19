import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { ArrowLeft, Compass } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFF2DE] text-[#111111] font-['Montserrat',sans-serif] flex flex-col selection:bg-[#5E765E] selection:text-[#FFF2DE]">
      <Header />
      <main className="flex-1 flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center bg-[#FFFFFF] p-10 sm:p-12 rounded-3xl border border-[#5E765E]/15 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#5E765E]/10 flex items-center justify-center text-[#5E765E] mb-6">
            <Compass className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#5E765E] block mb-2">
            Página No Encontrada
          </span>
          <div className="font-['Cormorant_Garamond',serif] text-7xl sm:text-8xl font-light text-[#D5A688] leading-none mb-4">
            404
          </div>
          <h1 className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl text-[#111111] font-normal mb-4 leading-snug">
            Este sendero aún no existe en nuestro santuario.
          </h1>
          <p className="text-xs sm:text-sm text-[#111111]/70 mb-8 leading-relaxed font-light">
            Te invitamos a regresar al inicio para descubrir nuestros rituales botánicos y experiencias sensoriales.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] px-7 py-3.5 rounded-full text-xs font-medium uppercase tracking-[0.16em] transition-all shadow-sm hover:shadow-md w-full"
          >
            <ArrowLeft className="w-4 h-4 text-[#D5A688]" />
            <span>Volver a Meraki Inicio</span>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

