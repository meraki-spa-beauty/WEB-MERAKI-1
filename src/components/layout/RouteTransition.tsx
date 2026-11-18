import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

interface RouteTransitionMeta {
  title: string;
  subtitle: string;
}

const DEFAULT_TRANSITION_META: RouteTransitionMeta = {
  title: 'Meraki Spa',
  subtitle: 'Bienestar Botánico · Pueblo Libre',
};

function getRouteTransitionMeta(pathname: string): RouteTransitionMeta {
  switch (pathname) {
    case '/':
      return {
        title: 'Meraki Spa',
        subtitle: 'Uñas, Estética & Bienestar en Lima',
      };
    case '/catalogo':
      return {
        title: 'Catálogo de Servicios',
        subtitle: 'Manos · Pies · Pestañas · Masajes · Faciales',
      };
    case '/como-reservar':
      return {
        title: 'Cómo Reservar',
        subtitle: 'Estudio Pueblo Libre & Atención a Domicilio',
      };
    case '/nosotros':
      return {
        title: 'Nuestra Esencia',
        subtitle: 'Ana Maria Díaz · Más de 10 Años de Oficio',
      };
    case '/contacto':
      return {
        title: 'Contacto & Estudio',
        subtitle: 'Calle Agustín Gamarra 515 · Pueblo Libre',
      };
    case '/privacy':
      return {
        title: 'Privacidad & Términos',
        subtitle: 'Protección de Datos & Condiciones Oficiales',
      };
    case '/libro-reclamaciones':
      return {
        title: 'Libro de Reclamaciones',
        subtitle: 'Canal Oficial INDECOPI Perú',
      };
    case '/admin':
      return {
        title: 'Panel Central Meraki',
        subtitle: 'Agenda · Rutas · Club VIP',
      };
    default:
      if (pathname.startsWith('/catalogo/') || pathname.startsWith('/servicios/')) {
        return {
          title: 'Ficha de Servicio',
          subtitle: 'Detalles, Galería & Reserva Online',
        };
      }

      return DEFAULT_TRANSITION_META;
  }
}

type CurtainPhase = 'idle' | 'covering' | 'lifting';

interface CurtainState {
  phase: CurtainPhase;
  cycleId: number;
  meta: RouteTransitionMeta;
}

const WAVE_SURGE_EASE: [number, number, number, number] = [0.65, 0, 0.24, 1];

const WAVE_EBB_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function RouteCurtainOverlay({ pathname }: { pathname: string }) {
  const prefersReducedMotion = useReducedMotion();
  const prevPathnameRef = useRef<string>(pathname);
  const cycleRef = useRef<number>(0);

  const [curtain, setCurtain] = useState<CurtainState>({
    phase: 'idle',
    cycleId: 0,
    meta: getRouteTransitionMeta(pathname),
  });

  useEffect(() => {
    if (prevPathnameRef.current === pathname) {
      return;
    }

    prevPathnameRef.current = pathname;

    if (prefersReducedMotion) {
      setCurtain({
        phase: 'idle',
        cycleId: cycleRef.current,
        meta: getRouteTransitionMeta(pathname),
      });

      return;
    }

    const nextCycle = cycleRef.current + 1;

    cycleRef.current = nextCycle;

    setCurtain({
      phase: 'covering',
      cycleId: nextCycle,
      meta: getRouteTransitionMeta(pathname),
    });

    const liftTimer = window.setTimeout(() => {
      setCurtain((prev) =>
        prev.cycleId === nextCycle ? { ...prev, phase: 'lifting' } : prev,
      );
    }, 1020);

    const finishTimer = window.setTimeout(() => {
      setCurtain((prev) =>
        prev.cycleId === nextCycle ? { ...prev, phase: 'idle' } : prev,
      );
    }, 2120);

    return () => {
      window.clearTimeout(liftTimer);
      window.clearTimeout(finishTimer);
    };
  }, [pathname, prefersReducedMotion]);

  const isActive = curtain.phase !== 'idle';

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="meraki-beach-wave-curtain"
          aria-hidden="true"
          className="fixed inset-0 z-[9995] pointer-events-none overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.28, ease: WAVE_EBB_EASE } }}
        >
          {/* Veil 1: Leading Seafoam Mist Wave */}
          <motion.div
            initial={{ y: '132%' }}
            animate={
              curtain.phase === 'covering'
                ? {
                    y: '0%',
                    transition: { duration: 0.78, ease: WAVE_SURGE_EASE },
                  }
                : {
                    y: '-136%',
                    transition: { duration: 0.96, delay: 0.14, ease: WAVE_EBB_EASE },
                  }
            }
            className="absolute inset-0 bg-gradient-to-b from-[#FFFDF9] via-[#FFF2DE] to-[#F7E5CA]"
          >
            {/* Leading Multi-Crest Shorefoam Swell */}
            <motion.svg
              viewBox="0 0 1440 280"
              preserveAspectRatio="none"
              className="absolute -top-[252px] -left-[9%] w-[118%] h-[254px] text-[#FFFDF9]"
              initial={{ x: '0%' }}
              animate={
                curtain.phase === 'covering'
                  ? {
                      x: '-2.8%',
                      transition: { duration: 0.85, ease: WAVE_SURGE_EASE },
                    }
                  : {
                      x: '2.2%',
                      transition: { duration: 0.96, ease: WAVE_EBB_EASE },
                    }
              }
            >
              <motion.path
                fill="currentColor"
                initial={{
                  d: 'M0,280 L0,165 C150,45 310,245 480,125 C650,15 810,235 960,115 C1110,20 1280,220 1440,130 L1440,280 Z',
                }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,280 L0,225 C170,185 310,255 480,216 C650,182 810,252 960,214 C1120,184 1280,248 1440,218 L1440,280 Z',
                        transition: { duration: 0.78, ease: WAVE_SURGE_EASE },
                      }
                    : {
                        d: 'M0,280 L0,118 C160,230 310,22 480,148 C650,248 800,25 960,140 C1120,240 1280,40 1440,152 L1440,280 Z',
                        transition: { duration: 0.85, ease: WAVE_EBB_EASE },
                      }
                }
              />
              <motion.path
                fill="none"
                stroke="#FFFFFF"
                strokeOpacity="0.9"
                strokeWidth="4.5"
                initial={{
                  d: 'M0,165 C150,45 310,245 480,125 C650,15 810,235 960,115 C1110,20 1280,220 1440,130',
                }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,225 C170,185 310,255 480,216 C650,182 810,252 960,214 C1120,184 1280,248 1440,218',
                        transition: { duration: 0.78, ease: WAVE_SURGE_EASE },
                      }
                    : {
                        d: 'M0,118 C160,230 310,22 480,148 C650,248 800,25 960,140 C1120,240 1280,40 1440,152',
                        transition: { duration: 0.85, ease: WAVE_EBB_EASE },
                      }
                }
              />
            </motion.svg>

            {/* Receding Seafoam Wash */}
            <motion.svg
              viewBox="0 0 1440 280"
              preserveAspectRatio="none"
              className="absolute -bottom-[252px] -left-[9%] w-[118%] h-[254px] text-[#F7E5CA]"
              initial={{ x: '0%' }}
              animate={
                curtain.phase === 'covering'
                  ? {
                      x: '-2%',
                      transition: { duration: 0.78, ease: WAVE_SURGE_EASE },
                    }
                  : {
                      x: '2.5%',
                      transition: { duration: 0.94, delay: 0.08, ease: WAVE_EBB_EASE },
                    }
              }
            >
              <motion.path
                fill="currentColor"
                initial={{
                  d: 'M0,0 L1440,0 L1440,26 C1260,52 1120,18 960,36 C780,54 640,16 480,34 C300,52 160,18 0,30 Z',
                }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,0 L1440,0 L1440,38 C1260,80 1120,24 960,52 C780,78 640,22 480,50 C300,76 160,24 0,44 Z',
                        transition: { duration: 0.76, ease: WAVE_SURGE_EASE },
                      }
                    : {
                        d: 'M0,0 L1440,0 L1440,95 C1260,240 1120,50 960,180 C780,265 640,55 480,190 C300,260 160,60 0,135 Z',
                        transition: { duration: 0.94, delay: 0.1, ease: WAVE_EBB_EASE },
                      }
                }
              />
            </motion.svg>
          </motion.div>

          {/* Veil 2: Warm Sandy Shoreline Swell with Frothy White Seafoam Rim */}
          <motion.div
            initial={{ y: '134%' }}
            animate={
              curtain.phase === 'covering'
                ? {
                    y: '0%',
                    transition: { duration: 0.82, delay: 0.08, ease: WAVE_SURGE_EASE },
                  }
                : {
                    y: '-138%',
                    transition: { duration: 0.92, delay: 0.08, ease: WAVE_EBB_EASE },
                  }
            }
            className="absolute inset-0 bg-gradient-to-b from-[#E5C1A8] via-[#D5A688] to-[#C69374]"
          >
            {/* Cresting Sandy Wave */}
            <motion.svg
              viewBox="0 0 1440 280"
              preserveAspectRatio="none"
              className="absolute -top-[252px] -left-[9%] w-[118%] h-[254px] text-[#E5C1A8]"
              initial={{ x: '0%' }}
              animate={
                curtain.phase === 'covering'
                  ? {
                      x: '2.6%',
                      transition: { duration: 0.84, delay: 0.06, ease: WAVE_SURGE_EASE },
                    }
                  : {
                      x: '-2.4%',
                      transition: { duration: 0.92, ease: WAVE_EBB_EASE },
                    }
              }
            >
              <motion.path
                fill="currentColor"
                initial={{
                  d: 'M0,280 L0,135 C180,245 340,25 520,145 C700,250 860,15 1040,130 C1200,235 1320,45 1440,140 L1440,280 Z',
                }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,280 L0,218 C180,248 340,185 520,215 C700,245 860,180 1040,214 C1200,244 1320,192 1440,222 L1440,280 Z',
                        transition: { duration: 0.82, delay: 0.06, ease: WAVE_SURGE_EASE },
                      }
                    : {
                        d: 'M0,280 L0,160 C180,25 340,225 520,115 C700,15 860,230 1040,120 C1200,22 1320,210 1440,110 L1440,280 Z',
                        transition: { duration: 0.88, ease: WAVE_EBB_EASE },
                      }
                }
              />
              {/* Soft White Seafoam Outer Glow */}
              <motion.path
                fill="none"
                stroke="#FFFDF9"
                strokeOpacity="0.42"
                strokeWidth="10"
                initial={{
                  d: 'M0,135 C180,245 340,25 520,145 C700,250 860,15 1040,130 C1200,235 1320,45 1440,140',
                }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,218 C180,248 340,185 520,215 C700,245 860,180 1040,214 C1200,244 1320,192 1440,222',
                        transition: { duration: 0.82, delay: 0.06, ease: WAVE_SURGE_EASE },
                      }
                    : {
                        d: 'M0,160 C180,25 340,225 520,115 C700,15 860,230 1040,120 C1200,22 1320,210 1440,110',
                        transition: { duration: 0.88, ease: WAVE_EBB_EASE },
                      }
                }
              />
              {/* Crisp Seafoam Crest Line */}
              <motion.path
                fill="none"
                stroke="#FFFDF9"
                strokeOpacity="0.82"
                strokeWidth="3"
                initial={{
                  d: 'M0,135 C180,245 340,25 520,145 C700,250 860,15 1040,130 C1200,235 1320,45 1440,140',
                }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,218 C180,248 340,185 520,215 C700,245 860,180 1040,214 C1200,244 1320,192 1440,222',
                        transition: { duration: 0.82, delay: 0.06, ease: WAVE_SURGE_EASE },
                      }
                    : {
                        d: 'M0,160 C180,25 340,225 520,115 C700,15 860,230 1040,120 C1200,22 1320,210 1440,110',
                        transition: { duration: 0.88, ease: WAVE_EBB_EASE },
                      }
                }
              />
            </motion.svg>

            {/* Receding Shoreline Swell */}
            <motion.svg
              viewBox="0 0 1440 280"
              preserveAspectRatio="none"
              className="absolute -bottom-[252px] -left-[9%] w-[118%] h-[254px] text-[#C69374]"
              initial={{ x: '0%' }}
              animate={
                curtain.phase === 'covering'
                  ? {
                      x: '2.2%',
                      transition: { duration: 0.8, ease: WAVE_SURGE_EASE },
                    }
                  : {
                      x: '-2.2%',
                      transition: { duration: 0.9, delay: 0.06, ease: WAVE_EBB_EASE },
                    }
              }
            >
              <motion.path
                fill="currentColor"
                initial={{
                  d: 'M0,0 L1440,0 L1440,26 C1260,54 1100,16 920,38 C740,56 580,18 420,36 C260,54 120,18 0,28 Z',
                }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,0 L1440,0 L1440,36 C1260,76 1100,24 920,52 C740,78 580,22 420,50 C260,74 120,24 0,38 Z',
                        transition: { duration: 0.8, ease: WAVE_SURGE_EASE },
                      }
                    : {
                        d: 'M0,0 L1440,0 L1440,110 C1260,245 1100,45 920,190 C740,268 580,55 420,185 C260,255 120,50 0,120 Z',
                        transition: { duration: 0.9, delay: 0.06, ease: WAVE_EBB_EASE },
                      }
                }
              />
              <motion.path
                fill="none"
                stroke="#FFF2DE"
                strokeOpacity="0.65"
                strokeWidth="3"
                initial={{
                  d: 'M0,28 C120,18 260,54 420,36 C580,18 740,56 920,38 C1100,16 1260,54 1440,26',
                }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,38 C120,24 260,74 420,50 C580,22 740,78 920,52 C1100,24 1260,76 1440,36',
                        transition: { duration: 0.8, ease: WAVE_SURGE_EASE },
                      }
                    : {
                        d: 'M0,120 C120,50 260,255 420,185 C580,55 740,268 920,190 C1100,45 1260,245 1440,110',
                        transition: { duration: 0.9, delay: 0.06, ease: WAVE_EBB_EASE },
                      }
                }
              />
            </motion.svg>
          </motion.div>

          {/* Veil 3: Deep Coastal Botanical Ocean Wave */}
          <motion.div
            initial={{ y: '138%' }}
            animate={
              curtain.phase === 'covering'
                ? {
                    y: '0%',
                    transition: { duration: 0.86, delay: 0.14, ease: WAVE_SURGE_EASE },
                  }
                : {
                    y: '-140%',
                    transition: { duration: 0.9, ease: WAVE_EBB_EASE },
                  }
            }
            className="absolute inset-0 bg-[#4A5F4A] flex items-center justify-center"
            style={{
              backgroundImage:
                'var(--meraki-linen-svg), radial-gradient(ellipse 90% 42% at 24% 18%, rgba(255, 242, 222, 0.14) 0%, transparent 56%), radial-gradient(ellipse 85% 48% at 76% 84%, rgba(213, 166, 136, 0.22) 0%, transparent 58%), radial-gradient(ellipse 68% 62% at 50% 45%, #5E765E 0%, #445844 74%, #374737 100%)',
              backgroundSize: '120px 120px, 100% 100%, 100% 100%, 100% 100%',
            }}
          >
            {/* Rolling 3-Crest Ocean Surf Edge with Layered Seafoam Highlight */}
            <motion.svg
              viewBox="0 0 1440 280"
              preserveAspectRatio="none"
              className="absolute -top-[270px] -left-[9%] w-[118%] h-[272px] text-[#556D55]"
              initial={{ x: '0%' }}
              animate={
                curtain.phase === 'covering'
                  ? {
                      x: '-3%',
                      transition: { duration: 0.88, delay: 0.14, ease: WAVE_SURGE_EASE },
                    }
                  : {
                      x: '2.8%',
                      transition: { duration: 0.88, ease: WAVE_EBB_EASE },
                    }
              }
            >
              <motion.path
                fill="currentColor"
                initial={{
                  d: 'M0,280 L0,152 C160,28 320,240 490,118 C660,12 820,232 980,110 C1140,18 1290,224 1440,126 L1440,280 Z',
                }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,280 L0,224 C170,188 320,256 490,218 C660,186 820,252 980,216 C1140,188 1290,250 1440,220 L1440,280 Z',
                        transition: { duration: 0.86, delay: 0.14, ease: WAVE_SURGE_EASE },
                      }
                    : {
                        d: 'M0,280 L0,116 C160,234 320,24 490,144 C660,248 820,20 980,136 C1140,238 1290,34 1440,148 L1440,280 Z',
                        transition: { duration: 0.86, ease: WAVE_EBB_EASE },
                      }
                }
              />
              {/* Soft Translucent Seafoam Wash Aura */}
              <motion.path
                fill="none"
                stroke="#FFF2DE"
                strokeOpacity="0.34"
                strokeWidth="12"
                initial={{
                  d: 'M0,152 C160,28 320,240 490,118 C660,12 820,232 980,110 C1140,18 1290,224 1440,126',
                }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,224 C170,188 320,256 490,218 C660,186 820,252 980,216 C1140,188 1290,250 1440,220',
                        transition: { duration: 0.86, delay: 0.14, ease: WAVE_SURGE_EASE },
                      }
                    : {
                        d: 'M0,116 C160,234 320,24 490,144 C660,248 820,20 980,136 C1140,238 1290,34 1440,148',
                        transition: { duration: 0.86, ease: WAVE_EBB_EASE },
                      }
                }
              />
              {/* Warm Champagne Shorefoam Line */}
              <motion.path
                fill="none"
                stroke="#D5A688"
                strokeOpacity="0.72"
                strokeWidth="3"
                initial={{
                  d: 'M0,152 C160,28 320,240 490,118 C660,12 820,232 980,110 C1140,18 1290,224 1440,126',
                }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,224 C170,188 320,256 490,218 C660,186 820,252 980,216 C1140,188 1290,250 1440,220',
                        transition: { duration: 0.86, delay: 0.14, ease: WAVE_SURGE_EASE },
                      }
                    : {
                        d: 'M0,116 C160,234 320,24 490,144 C660,248 820,20 980,136 C1140,238 1290,34 1440,148',
                        transition: { duration: 0.86, ease: WAVE_EBB_EASE },
                      }
                }
              />
              {/* Delicate Trailing Secondary Surf Ripple Inside the Wave */}
              <motion.path
                fill="none"
                stroke="#FFF2DE"
                strokeOpacity="0.32"
                strokeWidth="1.75"
                initial={{
                  d: 'M0,186 C165,78 325,256 495,152 C665,64 825,248 985,148 C1145,68 1295,242 1440,162',
                }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,244 C175,212 325,264 495,238 C665,210 825,262 985,236 C1145,212 1295,260 1440,242',
                        transition: { duration: 0.86, delay: 0.14, ease: WAVE_SURGE_EASE },
                      }
                    : {
                        d: 'M0,152 C165,250 325,68 495,176 C665,264 825,64 985,170 C1145,256 1295,78 1440,184',
                        transition: { duration: 0.86, ease: WAVE_EBB_EASE },
                      }
                }
              />
            </motion.svg>

            {/* Centered Editorial Halo, Monogram & Destination Title */}
            <motion.div
              key={`label-${curtain.cycleId}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={
                curtain.phase === 'covering'
                  ? {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { duration: 0.52, delay: 0.36, ease: WAVE_EBB_EASE },
                    }
                  : {
                      opacity: 0,
                      y: -26,
                      scale: 0.98,
                      transition: { duration: 0.36, ease: WAVE_SURGE_EASE },
                    }
              }
              className="relative z-10 text-center px-6 flex flex-col items-center gap-4"
            >
              <div className="relative flex items-center justify-center">
                <div
                  aria-hidden="true"
                  className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-[#D5A688]/20"
                />
                <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full border border-[#D5A688]/55 bg-[#FFF2DE]/10 backdrop-blur-xs flex items-center justify-center shadow-[0_12px_36px_rgba(0,0,0,0.24)]">
                  <img
                    src="/assets/brand/official-monogram-white.png"
                    alt=""
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain opacity-95"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <span className="block font-['Montserrat',sans-serif] text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[#D5A688] font-semibold">
                  {curtain.meta.subtitle}
                </span>
                <p className="font-['Cormorant_Garamond',serif] text-3xl sm:text-5xl italic font-normal text-[#FFF2DE] tracking-wide">
                  {curtain.meta.title}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#D5A688]/75" />
                <span className="w-1.5 h-1.5 rotate-45 bg-[#D5A688]" />
                <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#D5A688]/75" />
              </div>
            </motion.div>

            {/* Receding Coastal Wave Skirt with Champagne & Seafoam Edge */}
            <motion.svg
              viewBox="0 0 1440 280"
              preserveAspectRatio="none"
              className="absolute -bottom-[270px] -left-[9%] w-[118%] h-[272px] text-[#374737]"
              initial={{ x: '0%' }}
              animate={
                curtain.phase === 'covering'
                  ? {
                      x: '-2.6%',
                      transition: { duration: 0.78, ease: WAVE_SURGE_EASE },
                    }
                  : {
                      x: '2.6%',
                      transition: { duration: 0.88, ease: WAVE_EBB_EASE },
                    }
              }
            >
              <motion.path
                fill="currentColor"
                initial={{
                  d: 'M0,0 L1440,0 L1440,22 C1260,46 1110,14 940,34 C760,52 600,16 440,32 C280,50 140,16 0,24 Z',
                }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,0 L1440,0 L1440,32 C1260,68 1110,20 940,46 C760,72 600,20 440,46 C280,68 140,20 0,34 Z',
                        transition: { duration: 0.78, ease: WAVE_SURGE_EASE },
                      }
                    : {
                        d: 'M0,0 L1440,0 L1440,104 C1260,248 1110,48 940,188 C760,268 600,54 440,192 C280,258 140,56 0,128 Z',
                        transition: { duration: 0.88, ease: WAVE_EBB_EASE },
                      }
                }
              />
              <motion.path
                fill="none"
                stroke="#FFF2DE"
                strokeOpacity="0.38"
                strokeWidth="9"
                initial={{
                  d: 'M0,24 C140,16 280,50 440,32 C600,16 760,52 940,34 C1110,14 1260,46 1440,22',
                }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,34 C140,20 280,68 440,46 C600,20 760,72 940,46 C1110,20 1260,68 1440,32',
                        transition: { duration: 0.78, ease: WAVE_SURGE_EASE },
                      }
                    : {
                        d: 'M0,128 C140,56 280,258 440,192 C600,54 760,268 940,188 C1110,48 1260,248 1440,104',
                        transition: { duration: 0.88, ease: WAVE_EBB_EASE },
                      }
                }
              />
              <motion.path
                fill="none"
                stroke="#D5A688"
                strokeOpacity="0.78"
                strokeWidth="3"
                initial={{
                  d: 'M0,24 C140,16 280,50 440,32 C600,16 760,52 940,34 C1110,14 1260,46 1440,22',
                }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,34 C140,20 280,68 440,46 C600,20 760,72 940,46 C1110,20 1260,68 1440,32',
                        transition: { duration: 0.78, ease: WAVE_SURGE_EASE },
                      }
                    : {
                        d: 'M0,128 C140,56 280,258 440,192 C600,54 760,268 940,188 C1110,48 1260,248 1440,104',
                        transition: { duration: 0.88, ease: WAVE_EBB_EASE },
                      }
                }
              />
            </motion.svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
