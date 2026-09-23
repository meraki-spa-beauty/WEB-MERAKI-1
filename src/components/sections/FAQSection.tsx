import { useState } from 'react';
import { FAQ_ITEMS } from '../../data/spaData';
import { ChevronDown } from 'lucide-react';

export function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id || null);

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-20 md:py-28 bg-[#FFFFFF] border-b border-[#5E765E]/15">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <span className="text-xs font-['Montserrat',sans-serif] uppercase font-bold tracking-[0.24em] text-[#5E765E] block mb-2">
            Información Útil
          </span>
          <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl md:text-6xl font-normal text-[#111111] leading-tight">
            Preguntas Frecuentes
          </h2>
          <p className="font-['Montserrat',sans-serif] text-sm sm:text-base text-[#111111]/70 mt-3 font-light leading-relaxed">
            Todo lo que necesitas saber antes de tu cita en Meraki Spa.
          </p>
        </div>

        <div className="space-y-4 text-left">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-[#5E765E]/15 overflow-hidden transition-all bg-[#FFF2DE]/20 hover:bg-[#FFF2DE]/40"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-['Cormorant_Garamond',serif] text-xl sm:text-2xl text-[#111111] font-normal leading-snug">
                    {item.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'bg-[#5E765E] text-[#FFF2DE] rotate-180' : 'bg-[#5E765E]/10 text-[#5E765E]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm font-['Montserrat',sans-serif] text-[#111111]/75 font-light leading-relaxed border-t border-[#5E765E]/10">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
