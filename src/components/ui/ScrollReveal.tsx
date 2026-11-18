import { type ReactNode, useEffect, useRef, useState } from 'react';

type RevealVariant = 'fade-up' | 'soft-scale';

type RevealDelay = 0 | 100 | 200 | 300 | 400;

export function getStaggerDelay(index: number): 0 | 100 | 200 {
  const mod = index % 3;

  if (mod === 1) return 100;

  if (mod === 2) return 200;

  return 0;
}

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  delay?: RevealDelay;
}

const DELAY_CLASS_MAP: Record<RevealDelay, string> = {
  0: '',
  100: 'meraki-reveal-delay-100',
  200: 'meraki-reveal-delay-200',
  300: 'meraki-reveal-delay-300',
  400: 'meraki-reveal-delay-400',
};

export function ScrollReveal({
  children,
  className = '',
  variant = 'fade-up',
  delay = 0,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const el = containerRef.current;

    if (!el) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);

      return;
    }

    let rafId: number | null = null;
    let isDisposed = false;

    const revealWithPaint = () => {
      rafId = window.requestAnimationFrame(() => {
        if (!isDisposed) {
          setIsVisible(true);
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            revealWithPaint();
            observer.disconnect();
            break;
          }
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -24px 0px',
      },
    );

    observer.observe(el);

    return () => {
      isDisposed = true;
      observer.disconnect();

      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const baseClass =
    variant === 'soft-scale' ? 'meraki-scroll-reveal-soft' : 'meraki-scroll-reveal';

  const delayClass = DELAY_CLASS_MAP[delay];

  const revealedClass = isVisible ? 'is-revealed' : '';

  return (
    <div
      ref={containerRef}
      className={`${baseClass} ${delayClass} ${revealedClass} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
