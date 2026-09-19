import { useState } from 'react';
import { TREATMENTS, CATEGORIES_CONFIG } from '../../data/treatments';
import type { Treatment, TreatmentCategory } from '../../types';
import { Clock, Sparkles, Eye, Calendar, ArrowRight } from 'lucide-react';

interface TreatmentsCatalogProps {
  onSelectTreatment: (treatment: Treatment) => void;
  onBookTreatment: (treatmentId: string) => void;
}

export function TreatmentsCatalog({ onSelectTreatment, onBookTreatment }: TreatmentsCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<string>('todos');

  const filteredTreatments = activeCategory === 'todos'
    ? TREATMENTS
    : TREATMENTS.filter(t => t.category === activeCategory);

  return (
    <section id="tratamientos" className="py-20 md:py-28 bg-[#FFFFFF] border-b border-[#5E765E]/15 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 text-left">
          <div className="max-w-2xl">
            <span className="text-xs font-['Montserrat',sans-serif] font-bold text-[#5E765E] uppercase tracking-[0.24em] block mb-2">
              Carta de Tratamientos &amp; Rituales
            </span>
            <h2 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl md:text-6xl font-normal text-[#111111] leading-[1.05]">
              Elige cómo deseas <span className="italic text-[#5E765E]">sentirte hoy.</span>
            </h2>
            <p className="font-['Montserrat',sans-serif] text-sm sm:text-base text-[#111111]/70 mt-3 max-w-xl font-light leading-relaxed">
              Cada sesión en Meraki ha sido formulada como una experiencia sensorial completa: aceites templados, maniobras precisas y un entorno de absoluta privacidad.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-['Montserrat',sans-serif] text-[#5E765E] tracking-wider uppercase font-medium">
            <Sparkles className="w-4 h-4 text-[#D5A688]" />
            <span>Precios en Soles (PEN) · Incluye Ritual de Bienvenida</span>
          </div>
        </div>

        {/* Filter Tabs (Heavenly Spa Style) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-12 scrollbar-none border-b border-[#5E765E]/15">
          {CATEGORIES_CONFIG.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-['Montserrat',sans-serif] uppercase tracking-[0.14em] transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#5E765E] text-[#FFF2DE] font-semibold shadow-sm'
                    : 'bg-[#FFF2DE]/70 hover:bg-[#FFF2DE] text-[#111111]/80 hover:text-[#111111]'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-[#4d634d] text-[#FFF2DE]' : 'bg-[#5E765E]/15 text-[#5E765E]'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Treatments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTreatments.map((treatment) => (
            <article
              key={treatment.id}
              className="group flex flex-col justify-between bg-[#FFF2DE]/30 hover:bg-[#FFF2DE]/60 rounded-2xl border border-[#5E765E]/15 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#5E765E]/30 text-left"
            >
              {/* Image Frame */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#E5DBCF]">
                <img
                  src={treatment.image}
                  alt={treatment.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Popular Pill */}
                {treatment.isPopular && (
                  <span className="absolute top-3 left-3 bg-[#5E765E] text-[#FFF2DE] text-[10px] font-['Montserrat',sans-serif] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-sm">
                    Recomendado Meraki
                  </span>
                )}

                {/* Duration Badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[11px] font-['Montserrat',sans-serif] text-white/95 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5 text-[#D5A688]" />
                  <span>{treatment.durationLabel}</span>
                </div>

                {/* Price Tag */}
                <div className="absolute bottom-3 right-3 text-sm font-['Montserrat',sans-serif] font-bold text-[#FFF2DE] bg-[#5E765E]/90 backdrop-blur-md px-3.5 py-1 rounded-full shadow">
                  S/. {treatment.pricePEN}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <span className="text-[10px] font-['Montserrat',sans-serif] uppercase font-semibold tracking-[0.2em] text-[#5E765E] block mb-1">
                    {treatment.categoryLabel}
                  </span>
                  <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-normal text-[#111111] leading-tight mb-2 group-hover:text-[#5E765E] transition-colors">
                    {treatment.title}
                  </h3>
                  <p className="font-['Montserrat',sans-serif] text-xs text-[#111111]/75 font-light leading-relaxed line-clamp-3 mb-4">
                    {treatment.shortDescription}
                  </p>

                  {/* Highlights */}
                  <ul className="space-y-1.5 mb-6 border-t border-[#5E765E]/10 pt-4">
                    {treatment.benefits.slice(0, 2).map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] font-['Montserrat',sans-serif] text-[#111111]/80">
                        <span className="text-[#5E765E] font-bold text-xs leading-none">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-[#5E765E]/15">
                  <button
                    type="button"
                    onClick={() => onSelectTreatment(treatment)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full border border-[#5E765E]/30 hover:border-[#5E765E] text-[#111111] hover:text-[#5E765E] text-[11px] font-['Montserrat',sans-serif] uppercase tracking-wider font-medium transition-colors cursor-pointer bg-white/60"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Detalles</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onBookTreatment(treatment.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-[#5E765E] hover:bg-[#4a5f4a] text-[#FFF2DE] text-[11px] font-['Montserrat',sans-serif] uppercase tracking-wider font-semibold transition-all shadow-sm cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#D5A688]" />
                    <span>Reservar</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Section Bottom Banner */}
        <div className="mt-16 p-8 rounded-2xl bg-[#5E765E] text-[#FFF2DE] flex flex-col md:flex-row items-center justify-between gap-6 shadow-md text-left">
          <div className="max-w-xl">
            <span className="text-[11px] font-['Montserrat',sans-serif] uppercase tracking-widest text-[#D5A688] font-bold block mb-1">
              ¿Deseas una experiencia a medida?
            </span>
            <h3 className="font-['Cormorant_Garamond',serif] text-3xl font-normal leading-tight">
              Diseñamos paquetes personalizados para empresas, cumpleaños y novias.
            </h3>
            <p className="font-['Montserrat',sans-serif] text-xs font-light text-[#FFF2DE]/80 mt-2">
              Habla directamente con nuestra coordinadora de bienestar para coordinar horarios exclusivos y atenciones personalizadas.
            </p>
          </div>

          <a
            href="https://wa.me/51987654321?text=Hola%20Meraki,%20deseo%20consultar%20por%20un%20paquete%20personalizado"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#FFF2DE] hover:bg-white text-[#5E765E] px-7 py-3.5 rounded-full text-xs font-['Montserrat',sans-serif] font-bold uppercase tracking-[0.16em] transition-all shrink-0 shadow"
          >
            <span>Consultar por WhatsApp</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
}
