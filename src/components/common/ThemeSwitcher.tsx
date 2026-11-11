import { useState, useEffect } from 'react';
import { Sparkles, Leaf } from 'lucide-react';
import { WatercolorCanvas } from './WatercolorCanvas';

export type BackgroundThemeOption = 'editorial' | 'organico';

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<BackgroundThemeOption>(() => {
    if (typeof window !== 'undefined') {
      const urlParam = new URLSearchParams(window.location.search).get('theme');

      if (urlParam === 'editorial' || urlParam === 'organico') {
        return urlParam;
      }

      const stored = localStorage.getItem('meraki_bg_theme');

      if (stored === 'editorial' || stored === 'organico') {
        return stored;
      }
    }

    return 'editorial';
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('meraki_bg_theme', theme);
  }, [theme]);

  return (
    <>
      {/* If organic theme is active, mount the watercolor canvas with botanical washes */}
      {theme === 'organico' && <WatercolorCanvas />}

      {/* Floating Theme Switcher Widget */}
      <div
        className="fixed bottom-24 left-4 z-40 font-['Montserrat',sans-serif]"
        role="region"
        aria-label="Selector de opciones de fondo"
      >
        {isOpen ? (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-[#5E765E]/20 shadow-xl max-w-xs space-y-2.5 animate-fade-in text-left">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#5E765E]/15">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E765E]">
                Comparar Fondos Premium
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[10px] text-[#111111]/50 hover:text-[#111111] px-1 cursor-pointer"
                aria-label="Cerrar panel de temas"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setTheme('editorial')}
                className={`w-full p-2.5 rounded-xl text-xs text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  theme === 'editorial'
                    ? 'bg-[#5E765E] text-[#FFF2DE] shadow-xs font-semibold'
                    : 'bg-[#FFF2DE]/50 hover:bg-[#FFF2DE] text-[#111111] border border-[#5E765E]/15'
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[#D5A688]" />
                <div>
                  <span className="block font-bold">Opción A: Papelería Editorial</span>
                  <span className="block text-[10px] opacity-80 font-light leading-tight">
                    Papel algodón 300g con luz cenital de estudio y sombras cálidas
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('organico')}
                className={`w-full p-2.5 rounded-xl text-xs text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  theme === 'organico'
                    ? 'bg-[#5E765E] text-[#FFF2DE] shadow-xs font-semibold'
                    : 'bg-[#FFF2DE]/50 hover:bg-[#FFF2DE] text-[#111111] border border-[#5E765E]/15'
                }`}
              >
                <Leaf className="w-4 h-4 shrink-0 mt-0.5 text-[#D5A688]" />
                <div>
                  <span className="block font-bold">Opción C: Acuarelas Botánicas</span>
                  <span className="block text-[10px] opacity-80 font-light leading-tight">
                    Veladuras etéreas en verde salvia y tarjetas en frosted glass
                  </span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 hover:bg-white text-[#111111] border border-[#5E765E]/20 shadow-md text-xs font-medium backdrop-blur-sm transition-all cursor-pointer hover:scale-105"
            title="Cambiar entre Opción A (Editorial) y Opción C (Orgánico)"
          >
            {theme === 'editorial' ? (
              <Sparkles className="w-3.5 h-3.5 text-[#D5A688]" />
            ) : (
              <Leaf className="w-3.5 h-3.5 text-[#5E765E]" />
            )}
            <span className="text-[11px] font-semibold text-[#5E765E]">
              {theme === 'editorial' ? 'Fondo: Papelería Editorial' : 'Fondo: Acuarela Botánica'}
            </span>
          </button>
        )}
      </div>
    </>
  );
}
