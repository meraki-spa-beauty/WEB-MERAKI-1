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

const SILK_COVER_EASE: [number, number, number, number] = [0.65, 0, 0.24, 1];

const SILK_LIFT_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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
          key="meraki-botanical-curtain"
          aria-hidden="true"
          className="fixed inset-0 z-[9995] pointer-events-none overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.28, ease: SILK_LIFT_EASE } }}
        >
          {/* Veil 1: Warm Cream Organic Mist Wave */}
          <motion.div
            initial={{ y: '132%' }}
            animate={
              curtain.phase === 'covering'
                ? {
                    y: '0%',
                    transition: { duration: 0.78, ease: SILK_COVER_EASE },
                  }
                : {
                    y: '-136%',
                    transition: { duration: 0.96, delay: 0.14, ease: SILK_LIFT_EASE },
                  }
            }
            className="absolute inset-0 bg-[#FFF2DE]"
          >
            <svg
              viewBox="0 0 1440 240"
              preserveAspectRatio="none"
              className="absolute -top-[218px] left-0 w-full h-[220px] text-[#FFF2DE]"
            >
              <motion.path
                fill="currentColor"
                initial={{ d: 'M0,240 C360,20 1080,190 1440,240 L1440,240 L0,240 Z' }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,240 C420,165 1020,225 1440,240 L1440,240 L0,240 Z',
                        transition: { duration: 0.78, ease: SILK_COVER_EASE },
                      }
                    : {
                        d: 'M0,240 C380,45 1060,125 1440,240 L1440,240 L0,240 Z',
                        transition: { duration: 0.85, ease: SILK_LIFT_EASE },
                      }
                }
              />
            </svg>

            <svg
              viewBox="0 0 1440 240"
              preserveAspectRatio="none"
              className="absolute -bottom-[218px] left-0 w-full h-[220px] text-[#FFF2DE]"
            >
              <motion.path
                fill="currentColor"
                initial={{ d: 'M0,0 L1440,0 L1440,24 C1040,36 420,24 0,24 Z' }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,0 L1440,0 L1440,32 C1040,68 420,54 0,32 Z',
                        transition: { duration: 0.76, ease: SILK_COVER_EASE },
                      }
                    : {
                        d: 'M0,0 L1440,0 L1440,18 C1020,230 360,160 0,18 Z',
                        transition: { duration: 0.94, delay: 0.1, ease: SILK_LIFT_EASE },
                      }
                }
              />
            </svg>
          </motion.div>

          {/* Veil 2: Champagne Rose-Terracotta Flowing Silk Ribbon */}
          <motion.div
            initial={{ y: '134%' }}
            animate={
              curtain.phase === 'covering'
                ? {
                    y: '0%',
                    transition: { duration: 0.82, delay: 0.08, ease: SILK_COVER_EASE },
                  }
                : {
                    y: '-138%',
                    transition: { duration: 0.92, delay: 0.08, ease: SILK_LIFT_EASE },
                  }
            }
            className="absolute inset-0 bg-gradient-to-b from-[#DFB89E] via-[#D5A688] to-[#C89677]"
          >
            <svg
              viewBox="0 0 1440 260"
              preserveAspectRatio="none"
              className="absolute -top-[236px] left-0 w-full h-[238px] text-[#DFB89E]"
            >
              <motion.path
                fill="currentColor"
                initial={{ d: 'M0,260 C340,195 1060,-10 1440,260 L1440,260 L0,260 Z' }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,260 C440,220 1000,190 1440,260 L1440,260 L0,260 Z',
                        transition: { duration: 0.82, delay: 0.06, ease: SILK_COVER_EASE },
                      }
                    : {
                        d: 'M0,260 C360,70 1080,40 1440,260 L1440,260 L0,260 Z',
                        transition: { duration: 0.88, ease: SILK_LIFT_EASE },
                      }
                }
              />
              <motion.path
                fill="none"
                stroke="#FFFDF9"
                strokeOpacity="0.55"
                strokeWidth="2.5"
                initial={{ d: 'M0,260 C340,195 1060,-10 1440,260' }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,260 C440,220 1000,190 1440,260',
                        transition: { duration: 0.82, delay: 0.06, ease: SILK_COVER_EASE },
                      }
                    : {
                        d: 'M0,260 C360,70 1080,40 1440,260',
                        transition: { duration: 0.88, ease: SILK_LIFT_EASE },
                      }
                }
              />
            </svg>

            <svg
              viewBox="0 0 1440 260"
              preserveAspectRatio="none"
              className="absolute -bottom-[236px] left-0 w-full h-[238px] text-[#C89677]"
            >
              <motion.path
                fill="currentColor"
                initial={{ d: 'M0,0 L1440,0 L1440,20 C1040,42 400,42 0,20 Z' }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,0 L1440,0 L1440,28 C1040,72 400,72 0,28 Z',
                        transition: { duration: 0.8, ease: SILK_COVER_EASE },
                      }
                    : {
                        d: 'M0,0 L1440,0 L1440,12 C1080,252 340,210 0,12 Z',
                        transition: { duration: 0.9, delay: 0.06, ease: SILK_LIFT_EASE },
                      }
                }
              />
            </svg>
          </motion.div>

          {/* Veil 3: Deep Botanical Sage Linen Sanctuary Curtain */}
          <motion.div
            initial={{ y: '138%' }}
            animate={
              curtain.phase === 'covering'
                ? {
                    y: '0%',
                    transition: { duration: 0.86, delay: 0.14, ease: SILK_COVER_EASE },
                  }
                : {
                    y: '-140%',
                    transition: { duration: 0.9, ease: SILK_LIFT_EASE },
                  }
            }
            className="absolute inset-0 bg-[#4A5F4A] flex items-center justify-center"
            style={{
              backgroundImage:
                'var(--meraki-linen-svg), radial-gradient(circle at 18% 22%, rgba(213, 166, 136, 0.24) 0%, transparent 52%), radial-gradient(ellipse 68% 62% at 50% 45%, #5E765E 0%, #445844 74%, #374737 100%)',
              backgroundSize: '120px 120px, 100% 100%, 100% 100%',
            }}
          >
            {/* Sculpted Botanical Arch Dome Top Crest */}
            <svg
              viewBox="0 0 1440 260"
              preserveAspectRatio="none"
              className="absolute -top-[254px] left-0 w-full h-[256px] text-[#516851]"
            >
              <motion.path
                fill="currentColor"
                initial={{ d: 'M0,260 C340,-10 1100,-10 1440,260 L1440,260 L0,260 Z' }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,260 C420,215 1020,215 1440,260 L1440,260 L0,260 Z',
                        transition: { duration: 0.86, delay: 0.14, ease: SILK_COVER_EASE },
                      }
                    : {
                        d: 'M0,260 C360,40 1080,40 1440,260 L1440,260 L0,260 Z',
                        transition: { duration: 0.86, ease: SILK_LIFT_EASE },
                      }
                }
              />
              <motion.path
                fill="none"
                stroke="#D5A688"
                strokeOpacity="0.65"
                strokeWidth="2.5"
                initial={{ d: 'M0,260 C340,-10 1100,-10 1440,260' }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,260 C420,215 1020,215 1440,260',
                        transition: { duration: 0.86, delay: 0.14, ease: SILK_COVER_EASE },
                      }
                    : {
                        d: 'M0,260 C360,40 1080,40 1440,260',
                        transition: { duration: 0.86, ease: SILK_LIFT_EASE },
                      }
                }
              />
            </svg>

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
                      transition: { duration: 0.52, delay: 0.36, ease: SILK_LIFT_EASE },
                    }
                  : {
                      opacity: 0,
                      y: -26,
                      scale: 0.98,
                      transition: { duration: 0.36, ease: SILK_COVER_EASE },
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

            {/* Sculpted Trailing Sage Arch Skirt with Champagne Gold Seam */}
            <svg
              viewBox="0 0 1440 260"
              preserveAspectRatio="none"
              className="absolute -bottom-[254px] left-0 w-full h-[256px] text-[#374737]"
            >
              <motion.path
                fill="currentColor"
                initial={{ d: 'M0,0 L1440,0 L1440,10 C1060,24 380,24 0,10 Z' }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,0 L1440,0 L1440,16 C1040,48 400,48 0,16 Z',
                        transition: { duration: 0.78, ease: SILK_COVER_EASE },
                      }
                    : {
                        d: 'M0,0 L1440,0 L1440,8 C1080,256 360,256 0,8 Z',
                        transition: { duration: 0.88, ease: SILK_LIFT_EASE },
                      }
                }
              />
              <motion.path
                fill="none"
                stroke="#D5A688"
                strokeOpacity="0.72"
                strokeWidth="2.5"
                initial={{ d: 'M0,10 C380,24 1060,24 1440,10' }}
                animate={
                  curtain.phase === 'covering'
                    ? {
                        d: 'M0,16 C400,48 1040,48 1440,16',
                        transition: { duration: 0.78, ease: SILK_COVER_EASE },
                      }
                    : {
                        d: 'M0,8 C360,256 1080,256 1440,8',
                        transition: { duration: 0.88, ease: SILK_LIFT_EASE },
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
