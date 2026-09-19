import { WELCOME_RITUAL_STEPS } from '../../data/spaData';
import { Sparkles, Heart } from 'lucide-react';

export function WelcomeRitual() {
  return (
    <section id="ritual-bienvenida" className="py-20 md:py-28 bg-[#FFF2DE] border-b border-[#5E765E]/15 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-[0.24em] text-[#5E765E] block mb-2">
            La Filosofía Meraki
          </span>
          <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl md:text-6xl font-normal text-[#111111] leading-tight">
            El Ritual de Bienvenida
          </h2>
          <p className="font-['Montserrat',sans-serif] text-sm sm:text-base text-[#111111]/75 mt-4 font-light leading-relaxed">
            Creemos que la relajación no comienza en la camilla, sino desde el primer instante en que cruzas nuestras puertas. Por ello, cada experiencia incluye sin costo adicional nuestro protocolo de acogida sensorial.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-left">
          {WELCOME_RITUAL_STEPS.map((stepItem, idx) => (
            <div
              key={stepItem.step}
              className="relative p-6 rounded-2xl bg-white/60 border border-[#5E765E]/15 hover:border-[#5E765E]/30 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                {/* Step Number */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-['Cormorant_Garamond',serif] text-3xl font-normal text-[#5E765E]">
                    {stepItem.step}
                  </span>
                  <span className="text-[10px] font-['Montserrat',sans-serif] font-bold text-[#D5A688] uppercase tracking-widest bg-[#5E765E]/10 px-2 py-0.5 rounded-full">
                    {stepItem.time}
                  </span>
                </div>

                {/* Step Title */}
                <h3 className="font-['Cormorant_Garamond',serif] text-xl font-normal text-[#111111] leading-snug mb-3 group-hover:text-[#5E765E] transition-colors">
                  {stepItem.title}
                </h3>

                {/* Step Description */}
                <p className="font-['Montserrat',sans-serif] text-xs text-[#111111]/70 font-light leading-relaxed">
                  {stepItem.description}
                </p>
              </div>

              {/* Step indicator footer */}
              <div className="mt-6 pt-4 border-t border-[#5E765E]/10 flex items-center gap-1.5 text-[10px] font-['Montserrat',sans-serif] uppercase tracking-wider text-[#5E765E] font-medium">
                <Sparkles className="w-3 h-3 text-[#D5A688]" />
                <span>Paso {idx + 1} de 5</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sensory Quote Card */}
        <div className="mt-14 max-w-4xl mx-auto p-8 rounded-2xl bg-[#5E765E] text-[#FFF2DE] text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFF2DE]/5 rounded-full blur-2xl" />
          <Heart className="w-6 h-6 text-[#D5A688] mx-auto mb-3" />
          <p className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl font-normal italic leading-relaxed max-w-2xl mx-auto">
            &ldquo;Poner el alma, la creatividad y el amor en todo lo que haces. Eso es Meraki.&rdquo;
          </p>
          <span className="text-[11px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] text-[#D5A688] block mt-3 font-semibold">
            El Significado de Nuestra Marca
          </span>
        </div>

      </div>
    </section>
  );
}
