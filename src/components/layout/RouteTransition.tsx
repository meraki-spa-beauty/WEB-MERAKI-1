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
      return DEFAULT_TRANSITION_META;
  }
}

type CurtainPhase = 'idle' | 'covering' | 'lifting';

interface CurtainState {
  phase: CurtainPhase;
  cycleId: number;
  meta: RouteTransitionMeta;
}

const COVER_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

const LIFT_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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
    }, 560);

    const finishTimer = window.setTimeout(() => {
      setCurtain((prev) =>
        prev.cycleId === nextCycle ? { ...prev, phase: 'idle' } : prev,
      );
    }, 1240);

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
          key="meraki-botanical-curtain"
          aria-hidden="true"
          className="fixed inset-0 z-[9995] pointer-events-none overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          {/* Champagne-Terracotta Leading Silk Veil */}
          <motion.div
            initial={{ y: '108%' }}
            animate={
              curtain.phase === 'covering'
                ? {
                    y: '0%',
                    transition: { duration: 0.42, ease: COVER_EASE },
                  }
                : {
                    y: '-114%',
                    transition: { duration: 0.64, delay: 0.05, ease: LIFT_EASE },
                  }
            }
            className="absolute inset-0 bg-[#D5A688]"
          />

          {/* Main Botanical Sage Silk Curtain with Organic Curved SVG Arch */}
          <motion.div
            initial={{ y: '112%' }}
            animate={
              curtain.phase === 'covering'
                ? {
                    y: '0%',
                    transition: { duration: 0.46, delay: 0.04, ease: COVER_EASE },
                  }
                : {
                    y: '-116%',
                    transition: { duration: 0.62, ease: LIFT_EASE },
                  }
            }
            className="absolute inset-0 bg-[#4A5F4A] flex items-center justify-center"
            style={{
              backgroundImage:
                'var(--meraki-linen-svg), radial-gradient(ellipse 65% 60% at 50% 45%, #5E765E 0%, #445844 75%, #374737 100%)',
              backgroundSize: '120px 120px, 100% 100%',
            }}
          >
            {/* Upper Organic Arch Dome */}
            <svg
              viewBox="0 0 1440 96"
              preserveAspectRatio="none"
              className="absolute -top-[94px] left-0 w-full h-[96px] text-[#4E644E]"
            >
              <motion.path
                fill="currentColor"
                initial={{ d: 'M0,96 Q720,0 1440,96 L1440,96 L0,96 Z' }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,96 Q720,88 1440,96 L1440,96 L0,96 Z',
                        transition: { duration: 0.46, ease: COVER_EASE },
                      }
                    : {
                        d: 'M0,96 Q720,24 1440,96 L1440,96 L0,96 Z',
                        transition: { duration: 0.52, ease: LIFT_EASE },
                      }
                }
              />
            </svg>

            {/* Centered Editorial Monogram & Destination Title */}
            <motion.div
              key={`label-${curtain.cycleId}`}
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={
                curtain.phase === 'covering'
                  ? {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { duration: 0.34, delay: 0.16, ease: LIFT_EASE },
                    }
                  : {
                      opacity: 0,
                      y: -18,
                      scale: 0.98,
                      transition: { duration: 0.28, ease: COVER_EASE },
                    }
              }
              className="relative z-10 text-center px-6 flex flex-col items-center gap-3.5"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-[#D5A688]/45 bg-[#FFF2DE]/8 backdrop-blur-xs flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.22)]">
                <img
                  src="/assets/brand/official-monogram-white.png"
                  alt=""
                  className="w-9 h-9 sm:w-11 sm:h-11 object-contain opacity-95"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-1.5">
                <span className="block font-['Montserrat',sans-serif] text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[#D5A688] font-semibold">
                  {curtain.meta.subtitle}
                </span>
                <p className="font-['Cormorant_Garamond',serif] text-3xl sm:text-5xl italic font-normal text-[#FFF2DE] tracking-wide">
                  {curtain.meta.title}
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#D5A688]/70" />
                <span className="w-1.5 h-1.5 rotate-45 bg-[#D5A688]" />
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#D5A688]/70" />
              </div>
            </motion.div>

            {/* Lower Trailing Curve Skirt with Hairline Terracotta Seam */}
            <svg
              viewBox="0 0 1440 96"
              preserveAspectRatio="none"
              className="absolute -bottom-[94px] left-0 w-full h-[96px] text-[#445844]"
            >
              <motion.path
                fill="currentColor"
                initial={{ d: 'M0,0 L1440,0 L1440,0 Q720,0 0,0 Z' }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,0 L1440,0 L1440,4 Q720,12 0,4 Z',
                        transition: { duration: 0.42, ease: COVER_EASE },
                      }
                    : {
                        d: 'M0,0 L1440,0 L1440,4 Q720,94 0,4 Z',
                        transition: { duration: 0.56, ease: LIFT_EASE },
                      }
                }
              />
              <motion.path
                fill="none"
                stroke="#D5A688"
                strokeOpacity="0.55"
                strokeWidth="2"
                initial={{ d: 'M0,0 Q720,0 1440,0' }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,4 Q720,12 1440,4',
                        transition: { duration: 0.42, ease: COVER_EASE },
                      }
                    : {
                        d: 'M0,4 Q720,94 1440,4',
                        transition: { duration: 0.56, ease: LIFT_EASE },
                      }
                }
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
