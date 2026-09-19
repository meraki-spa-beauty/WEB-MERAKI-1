import { TESTIMONIALS } from '../../data/spaData';
import { Star, Quote } from 'lucide-react';

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-[#FFF2DE] border-b border-[#5E765E]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-[0.24em] text-[#5E765E] block mb-2">
            La Voz de Quienes Nos Eligen
          </span>
          <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl md:text-6xl font-normal text-[#111111] leading-tight">
            Experiencias que Inspiran Calma
          </h2>
          <p className="font-['Montserrat',sans-serif] text-sm sm:text-base text-[#111111]/75 mt-3 font-light leading-relaxed">
            Nuestra mayor satisfacción es ver salir a cada persona con la mirada descansada, el cuerpo suelto y la mente en paz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-white/80 p-8 rounded-3xl border border-[#5E765E]/15 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between text-left relative"
            >
              <div>
                <Quote className="w-8 h-8 text-[#D5A688]/60 mb-4" />
                <div className="flex items-center gap-1 mb-4 text-[#D5A688]">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="font-['Montserrat',sans-serif] text-xs sm:text-sm text-[#111111]/80 font-light leading-relaxed italic mb-6">
                  &ldquo;{t.comment}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-[#5E765E]/10">
                <span className="block font-['Montserrat',sans-serif] text-sm font-semibold text-[#111111]">
                  {t.author}
                </span>
                <span className="block text-[11px] font-['Montserrat',sans-serif] text-[#5E765E] font-medium mt-0.5">
                  {t.treatment}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
