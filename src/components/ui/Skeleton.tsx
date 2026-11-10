import { useState, useEffect, useRef, type ReactNode } from 'react';

export interface SkeletonBlockProps {
  className?: string;
  variant?: 'default' | 'warm' | 'dark';
}

export function SkeletonBlock({ className = '', variant = 'default' }: SkeletonBlockProps) {
  const variantClass =
    variant === 'dark'
      ? 'meraki-skeleton-dark'
      : variant === 'warm'
        ? 'meraki-skeleton-warm'
        : 'meraki-skeleton';

  return (
    <div
      aria-hidden="true"
      className={`rounded-xl ${variantClass} ${className}`}
    />
  );
}

export interface SkeletonImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  variant?: 'default' | 'warm' | 'dark';
  fetchPriority?: 'high' | 'low' | 'auto';
  loading?: 'eager' | 'lazy';
  width?: number;
  height?: number;
  showSpinner?: boolean;
  children?: ReactNode;
}

export function SkeletonImage({
  src,
  alt,
  className = '',
  containerClassName = '',
  variant = 'default',
  fetchPriority = 'auto',
  loading = 'lazy',
  width,
  height,
  showSpinner = true,
  children,
}: SkeletonImageProps) {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [trackedSrc, setTrackedSrc] = useState<string>(src);
  const imgRef = useRef<HTMLImageElement | null>(null);

  if (trackedSrc !== src) {
    setTrackedSrc(src);
    setIsLoaded(false);
  }

  useEffect(() => {
    const imgEl = imgRef.current;

    if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src]);

  const handleImgRef = (el: HTMLImageElement | null) => {
    imgRef.current = el;

    if (el && el.complete && el.naturalWidth > 0 && !isLoaded) {
      setIsLoaded(true);
    }
  };

  const skeletonClass =
    variant === 'dark'
      ? 'meraki-skeleton-dark'
      : variant === 'warm'
        ? 'meraki-skeleton-warm'
        : 'meraki-skeleton';

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {!isLoaded && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-200 ${skeletonClass}`}
        >
          {showSpinner && (
            <progress
              aria-label={`Cargando ${alt}`}
              className={`loading-spinner ${variant === 'dark' ? 'loading-spinner-light' : ''}`}
            />
          )}
        </div>
      )}

      <img
        ref={handleImgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
        referrerPolicy="no-referrer"
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {children}
    </div>
  );
}

export interface CatalogGridSkeletonProps {
  count?: number;
}

export function CatalogGridSkeleton({ count = 6 }: CatalogGridSkeletonProps) {
  const items = Array.from({ length: count }, (_, idx) => idx);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Cargando servicios del catálogo"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {items.map((itemIndex) => (
        <div
          key={itemIndex}
          className="bg-white rounded-2xl border border-[#5E765E]/15 shadow-sm flex flex-col justify-between overflow-hidden text-left"
        >
          {/* Aspect 16:9 Image Header Skeleton */}
          <div className="relative aspect-[16/9] w-full meraki-skeleton">
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <div className="h-5 w-24 rounded-md bg-white/75" />
              {itemIndex % 2 === 0 && (
                <div className="h-5 w-14 rounded-md bg-[#5E765E]/35" />
              )}
            </div>
            <div className="absolute bottom-3 right-3 h-7 w-16 rounded-lg bg-[#5E765E]/40" />
          </div>

          {/* Card Content Skeleton */}
          <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <SkeletonBlock className="h-7 w-3/4 rounded-lg" />
              <div className="space-y-2">
                <SkeletonBlock className="h-3.5 w-full rounded-md" />
                <SkeletonBlock className="h-3.5 w-5/6 rounded-md" />
              </div>

              {/* Variant Selector Placeholder on alternating cards */}
              {itemIndex % 3 === 0 && (
                <div className="p-2.5 rounded-xl bg-[#FFF2DE]/50 border border-[#5E765E]/10 space-y-2">
                  <SkeletonBlock className="h-2.5 w-36 rounded" variant="warm" />
                  <div className="flex gap-2">
                    <SkeletonBlock className="h-7 w-24 rounded-lg" />
                    <SkeletonBlock className="h-7 w-24 rounded-lg" />
                  </div>
                </div>
              )}

              {/* Includes List Placeholder */}
              <div className="space-y-2 pt-1">
                <SkeletonBlock className="h-2.5 w-16 rounded" />
                <div className="flex items-center gap-2">
                  <SkeletonBlock className="w-3.5 h-3.5 rounded-full shrink-0" />
                  <SkeletonBlock className="h-3 w-4/5 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <SkeletonBlock className="w-3.5 h-3.5 rounded-full shrink-0" />
                  <SkeletonBlock className="h-3 w-2/3 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <SkeletonBlock className="w-3.5 h-3.5 rounded-full shrink-0" />
                  <SkeletonBlock className="h-3 w-3/4 rounded" />
                </div>
              </div>
            </div>

            {/* Footer Action Buttons Placeholder */}
            <div className="pt-4 border-t border-[#5E765E]/10 flex gap-2">
              <SkeletonBlock className="h-10 flex-1 rounded-xl" />
              <SkeletonBlock className="h-10 w-10 rounded-xl shrink-0" variant="warm" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BookingModalSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Preparando formulario de reserva"
      className="space-y-6 py-1"
    >
      {/* Step 1 Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-3.5 w-48 rounded" />
          <SkeletonBlock className="h-3 w-28 rounded" variant="warm" />
        </div>
        <div className="flex items-center gap-1.5 overflow-hidden">
          {[1, 2, 3, 4, 5].map((pill) => (
            <SkeletonBlock key={pill} className="h-7 w-24 rounded-full shrink-0" />
          ))}
        </div>
        <SkeletonBlock className="h-11 w-full rounded-xl" />
      </div>

      {/* Step 2 Skeleton */}
      <div className="border-t border-[#5E765E]/15 pt-5 space-y-3">
        <SkeletonBlock className="h-3.5 w-44 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <SkeletonBlock className="h-11 rounded-xl" />
          <SkeletonBlock className="h-11 rounded-xl" />
          <SkeletonBlock className="h-11 rounded-xl" />
        </div>
        <SkeletonBlock className="h-20 w-full rounded-2xl" variant="warm" />
      </div>

      {/* Step 3 Skeleton */}
      <div className="border-t border-[#5E765E]/15 pt-5 space-y-3">
        <SkeletonBlock className="h-3.5 w-40 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SkeletonBlock className="h-10 rounded-xl" />
          <SkeletonBlock className="h-10 rounded-xl" />
        </div>
      </div>

      {/* Step 4 Skeleton */}
      <div className="border-t border-[#5E765E]/15 pt-5 space-y-3">
        <SkeletonBlock className="h-3.5 w-36 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SkeletonBlock className="h-10 rounded-xl" />
          <SkeletonBlock className="h-10 rounded-xl" />
        </div>
        <SkeletonBlock className="h-16 w-full rounded-xl" />
      </div>

      {/* Footer Submit Skeleton */}
      <div className="pt-4 border-t border-[#5E765E]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1.5 w-full sm:w-auto">
          <SkeletonBlock className="h-5 w-36 rounded" />
          <SkeletonBlock className="h-3.5 w-48 rounded" variant="warm" />
        </div>
        <SkeletonBlock className="h-12 w-full sm:w-56 rounded-full" />
      </div>
    </div>
  );
}

export interface RouteInterfaceSkeletonProps {
  pathname: string;
}

export function RouteInterfaceSkeleton({ pathname }: RouteInterfaceSkeletonProps) {
  if (pathname.startsWith('/catalogo') || pathname.startsWith('/catalog') || pathname.startsWith('/tratamientos')) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Cargando catálogo de servicios"
        className="flex-1"
      >
        {/* Subpage Header Banner Skeleton */}
        <section className="bg-gradient-to-b from-[#5E765E]/15 to-transparent pt-12 lg:pt-28 pb-10 border-b border-[#5E765E]/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-4">
            <SkeletonBlock className="h-7 w-56 rounded-full" variant="warm" />
            <SkeletonBlock className="h-12 sm:h-14 w-80 sm:w-[460px] max-w-full rounded-2xl" />
            <SkeletonBlock className="h-4 w-96 max-w-full rounded-lg" />
            <SkeletonBlock className="h-10 w-[520px] max-w-full rounded-2xl" />
          </div>
        </section>

        {/* Filter Bar Skeleton */}
        <section className="py-4 border-b border-[#5E765E]/15 bg-[#FFF2DE]/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-hidden w-full md:w-auto">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <SkeletonBlock key={i} className="h-8 w-28 rounded-full shrink-0" />
              ))}
            </div>
            <SkeletonBlock className="h-9 w-full md:w-72 rounded-full" />
          </div>
        </section>

        {/* Cards Grid Skeleton */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CatalogGridSkeleton count={6} />
          </div>
        </section>
      </div>
    );
  }

  if (pathname.startsWith('/como-reservar') || pathname.startsWith('/reservas')) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Cargando guía de reserva"
        className="flex-1"
      >
        <section className="bg-gradient-to-b from-[#5E765E]/15 to-transparent pt-14 lg:pt-28 pb-12 border-b border-[#5E765E]/15">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-4">
            <SkeletonBlock className="h-7 w-44 rounded-full" variant="warm" />
            <SkeletonBlock className="h-12 sm:h-14 w-80 sm:w-[500px] max-w-full rounded-2xl" />
            <SkeletonBlock className="h-4 w-[420px] max-w-full rounded-lg" />
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <SkeletonBlock className="h-11 w-56 rounded-full" />
              <SkeletonBlock className="h-11 w-52 rounded-full" variant="warm" />
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-[#5E765E]/15 shadow-sm flex flex-col md:flex-row items-start gap-6"
              >
                <SkeletonBlock className="w-14 h-14 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-3 w-full">
                  <SkeletonBlock className="h-7 w-64 max-w-full rounded-lg" />
                  <SkeletonBlock className="h-4 w-full rounded" />
                  <SkeletonBlock className="h-4 w-4/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (pathname.startsWith('/nosotros')) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Cargando historia de Meraki"
        className="flex-1"
      >
        <section className="bg-gradient-to-b from-[#5E765E]/15 to-transparent pt-14 lg:pt-28 pb-12 border-b border-[#5E765E]/15">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <SkeletonBlock className="h-7 w-48 rounded-full" variant="warm" />
              <SkeletonBlock className="h-12 w-3/4 rounded-2xl" />
              <SkeletonBlock className="h-8 w-5/6 rounded-xl" variant="warm" />
              <SkeletonBlock className="h-4 w-full rounded" />
              <SkeletonBlock className="h-4 w-11/12 rounded" />
              <div className="flex gap-4 pt-2">
                <SkeletonBlock className="h-11 w-52 rounded-full" />
                <SkeletonBlock className="h-11 w-48 rounded-full" variant="warm" />
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-8 border border-[#5E765E]/20 shadow-md space-y-4">
                <SkeletonBlock className="w-20 h-20 rounded-2xl" />
                <SkeletonBlock className="h-3 w-36 rounded" variant="warm" />
                <SkeletonBlock className="h-8 w-48 rounded-lg" />
                <SkeletonBlock className="h-4 w-full rounded" />
                <SkeletonBlock className="h-4 w-5/6 rounded" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((pillar) => (
              <div key={pillar} className="bg-white rounded-3xl p-8 border border-[#5E765E]/15 space-y-4">
                <SkeletonBlock className="w-12 h-12 rounded-2xl" variant="warm" />
                <SkeletonBlock className="h-7 w-44 rounded-lg" />
                <SkeletonBlock className="h-3.5 w-full rounded" />
                <SkeletonBlock className="h-3.5 w-4/5 rounded" />
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (pathname.startsWith('/contacto')) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Cargando canales de contacto"
        className="flex-1"
      >
        <section className="bg-gradient-to-b from-[#5E765E]/15 to-transparent pt-14 lg:pt-28 pb-12 border-b border-[#5E765E]/15">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-4">
            <SkeletonBlock className="h-7 w-44 rounded-full" variant="warm" />
            <SkeletonBlock className="h-12 w-80 sm:w-[440px] max-w-full rounded-2xl" />
            <SkeletonBlock className="h-4 w-96 max-w-full rounded" />
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-[#5E765E]/15 space-y-5">
                <SkeletonBlock className="h-7 w-44 rounded-lg" />
                {[1, 2, 3, 4, 5].map((channel) => (
                  <div key={channel} className="flex items-start gap-4">
                    <SkeletonBlock className="w-12 h-12 rounded-2xl shrink-0" />
                    <div className="space-y-2 flex-1">
                      <SkeletonBlock className="h-3 w-28 rounded" variant="warm" />
                      <SkeletonBlock className="h-4 w-48 max-w-full rounded" />
                      <SkeletonBlock className="h-3 w-36 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-8 border border-[#5E765E]/20 shadow-md space-y-5">
                <div className="flex items-center gap-3">
                  <SkeletonBlock className="w-10 h-10 rounded-2xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <SkeletonBlock className="h-3 w-28 rounded" variant="warm" />
                    <SkeletonBlock className="h-6 w-72 max-w-full rounded-lg" />
                  </div>
                </div>
                <SkeletonBlock className="h-11 w-full rounded-xl" />
                <SkeletonBlock className="h-11 w-full rounded-xl" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <SkeletonBlock className="h-11 rounded-xl" />
                  <SkeletonBlock className="h-11 rounded-xl" />
                  <SkeletonBlock className="h-11 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SkeletonBlock className="h-11 rounded-xl" />
                  <SkeletonBlock className="h-11 rounded-xl" />
                </div>
                <SkeletonBlock className="h-13 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return <HomeInterfaceSkeleton />;
}

export function HomeHeroCenterpieceSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col items-center justify-center gap-4 w-64 sm:w-72 md:w-80 max-w-[78vw] py-2"
    >
      {/* Botanical Isotype Medallion Skeleton */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-white/20 bg-white/[0.06] backdrop-blur-xs flex items-center justify-center shadow-inner">
        <div className="w-16 h-20 sm:w-20 sm:h-22 rounded-t-full rounded-b-2xl border border-[#D5A688]/30 bg-white/[0.05] flex items-center justify-center">
          <progress
            aria-label="Cargando identidad visual Meraki"
            className="loading-spinner loading-spinner-light"
          />
        </div>
      </div>

      {/* Editorial Wordmark & Subtitle Bars */}
      <div className="w-full flex flex-col items-center gap-2.5 pt-1">
        <div className="h-6 sm:h-7 w-48 sm:w-56 rounded-lg bg-white/15 animate-pulse" />
        <div className="flex items-center gap-2.5 w-40 sm:w-48 justify-center">
          <span className="h-[1px] flex-1 bg-[#D5A688]/35" />
          <div className="h-2.5 w-24 rounded-full bg-[#D5A688]/35 animate-pulse" />
          <span className="h-[1px] flex-1 bg-[#D5A688]/35" />
        </div>
      </div>
    </div>
  );
}

export function HomeBodySectionsSkeleton() {
  return (
    <>
      {/* 2. CÓMO FUNCIONA EL SERVICIO (3 Steps Skeleton) */}
      <section className="py-16 md:py-20 bg-white/70 border-b border-[#5E765E]/15 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 flex flex-col items-center space-y-3">
            <SkeletonBlock className="h-3 w-36 rounded-full" variant="warm" />
            <SkeletonBlock className="h-10 sm:h-12 w-72 sm:w-[440px] max-w-full rounded-2xl" />
            <SkeletonBlock className="h-3.5 w-80 sm:w-[480px] max-w-full rounded-md" />
            <SkeletonBlock className="h-3.5 w-64 sm:w-80 max-w-full rounded-md" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['01', '02', '03'].map((stepNum) => (
              <div
                key={stepNum}
                className="bg-[#FFF2DE] rounded-3xl p-8 border border-[#5E765E]/15 shadow-sm relative space-y-4"
              >
                <span
                  aria-hidden="true"
                  className="font-['Cormorant_Garamond',serif] text-5xl font-bold text-[#5E765E]/15 absolute top-6 right-6 select-none"
                >
                  {stepNum}
                </span>
                <SkeletonBlock className="w-12 h-12 rounded-2xl" />
                <SkeletonBlock className="h-7 w-48 rounded-lg" />
                <div className="space-y-2 pt-1">
                  <SkeletonBlock className="h-3 w-full rounded" />
                  <SkeletonBlock className="h-3 w-11/12 rounded" />
                  <SkeletonBlock className="h-3 w-4/5 rounded" />
                </div>
                <div className="pt-2">
                  <SkeletonBlock className="h-4 w-32 rounded-md" variant="warm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. NUESTRAS 6 ESPECIALIDADES (6 Category Cards Skeleton) */}
      <section className="py-16 md:py-20 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2.5">
              <SkeletonBlock className="h-3 w-28 rounded-full" variant="warm" />
              <SkeletonBlock className="h-10 sm:h-12 w-64 sm:w-80 rounded-2xl" />
            </div>
            <SkeletonBlock className="h-4 w-64 rounded-md" variant="warm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((card) => (
              <div
                key={card}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-[#5E765E]/15 shadow-sm flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <SkeletonBlock className="w-12 h-12 rounded-2xl" variant="warm" />
                    <SkeletonBlock className="h-6 w-24 rounded-full" />
                  </div>
                  <SkeletonBlock className="h-7 w-3/5 rounded-lg" />
                  <div className="space-y-2">
                    <SkeletonBlock className="h-3 w-full rounded" />
                    <SkeletonBlock className="h-3 w-5/6 rounded" />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#5E765E]/10 flex items-center justify-between">
                  <SkeletonBlock className="h-3.5 w-36 rounded" />
                  <SkeletonBlock className="w-4 h-4 rounded-full" variant="warm" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <SkeletonBlock className="h-12 w-64 rounded-full" />
          </div>
        </div>
      </section>

      {/* 4. BIENVENIDA & CONOCE A ANA MARIA DÍAZ (5/7 Asymmetric Grid Skeleton) */}
      <section className="py-16 md:py-20 bg-white/70 border-y border-[#5E765E]/15 text-left">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <div className="bg-[#FFF2DE] rounded-3xl p-8 border border-[#5E765E]/20 shadow-md space-y-4">
                <SkeletonBlock className="w-16 h-16 rounded-2xl" />
                <SkeletonBlock className="h-3 w-36 rounded-full" variant="warm" />
                <SkeletonBlock className="h-8 w-48 rounded-lg" />
                <SkeletonBlock className="h-3.5 w-56 rounded" />
                <div className="space-y-2 pt-1">
                  <SkeletonBlock className="h-3 w-full rounded" />
                  <SkeletonBlock className="h-3 w-11/12 rounded" />
                  <SkeletonBlock className="h-3 w-3/4 rounded" />
                </div>
                <div className="pt-4 border-t border-[#5E765E]/15 flex items-center justify-between">
                  <SkeletonBlock className="h-3 w-44 rounded" />
                  <SkeletonBlock className="h-3.5 w-24 rounded" variant="warm" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <SkeletonBlock className="h-3 w-36 rounded-full" variant="warm" />
              <div className="space-y-2.5">
                <SkeletonBlock className="h-9 sm:h-11 w-full rounded-xl" />
                <SkeletonBlock className="h-9 sm:h-11 w-4/5 rounded-xl" />
              </div>
              <div className="space-y-2 pt-2">
                <SkeletonBlock className="h-3.5 w-full rounded" />
                <SkeletonBlock className="h-3.5 w-11/12 rounded" />
                <SkeletonBlock className="h-3.5 w-full rounded" />
                <SkeletonBlock className="h-3.5 w-3/4 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                {[1, 2, 3, 4].map((feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <SkeletonBlock className="w-4 h-4 rounded-full shrink-0" />
                    <SkeletonBlock className="h-3.5 w-40 max-w-full rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. POLÍTICAS CLAVE DE ATENCIÓN (2x2 Policy Box Skeleton) */}
      <section className="py-16 text-left">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#5E765E]/20 shadow-md space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-2">
                <SkeletonBlock className="h-3 w-36 rounded-full" variant="warm" />
                <SkeletonBlock className="h-8 w-64 rounded-xl" />
              </div>
              <SkeletonBlock className="h-4 w-48 rounded" variant="warm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((policy) => (
                <div
                  key={policy}
                  className="p-4 rounded-2xl bg-[#FFF2DE] border border-[#5E765E]/15 flex items-start gap-3"
                >
                  <SkeletonBlock className="w-5 h-5 rounded-md shrink-0 mt-0.5" variant="warm" />
                  <div className="space-y-2 flex-1">
                    <SkeletonBlock className="h-3.5 w-44 rounded" />
                    <SkeletonBlock className="h-3 w-full rounded" />
                    <SkeletonBlock className="h-3 w-4/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIOS REALES (3 Cards Skeleton) */}
      <section className="py-16 bg-white/70 border-t border-[#5E765E]/15 text-left">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 flex flex-col items-center space-y-2.5">
            <SkeletonBlock className="h-3 w-44 rounded-full" variant="warm" />
            <SkeletonBlock className="h-9 w-72 sm:w-80 rounded-xl" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((testimonial) => (
              <div
                key={testimonial}
                className="bg-[#FFF2DE] rounded-3xl p-6 sm:p-8 border border-[#5E765E]/15 shadow-sm flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <SkeletonBlock key={star} className="w-4 h-4 rounded-sm" variant="warm" />
                    ))}
                  </div>
                  <div className="space-y-2">
                    <SkeletonBlock className="h-4 w-full rounded" />
                    <SkeletonBlock className="h-4 w-11/12 rounded" />
                    <SkeletonBlock className="h-4 w-3/4 rounded" />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#5E765E]/15 space-y-1.5">
                  <SkeletonBlock className="h-3.5 w-32 rounded" />
                  <SkeletonBlock className="h-3 w-40 rounded" variant="warm" />
                  <SkeletonBlock className="h-2.5 w-36 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CTA FINAL BANNER SKELETON */}
      <section className="py-20 bg-[#5E765E] text-[#FFF2DE] text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center space-y-5">
          <div className="h-3 w-48 rounded-full bg-[#D5A688]/40 animate-pulse" />
          <div className="h-10 sm:h-12 w-80 sm:w-[540px] max-w-full rounded-2xl bg-white/15 animate-pulse" />
          <div className="h-4 w-72 sm:w-[440px] max-w-full rounded bg-white/15 animate-pulse" />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3 w-full sm:w-auto">
            <div className="h-13 w-full sm:w-64 rounded-full bg-[#FFF2DE]/25 animate-pulse" />
            <div className="h-13 w-full sm:w-56 rounded-full border border-white/25 bg-white/10 animate-pulse" />
          </div>
        </div>
      </section>
    </>
  );
}

export function HomeInterfaceSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Cargando página principal de Meraki"
      className="flex-1"
    >
      {/* 1. EDITORIAL HERO FEED SKELETON */}
      <section className="relative overflow-hidden min-h-[82vh] lg:min-h-[88vh] flex flex-col justify-between meraki-skeleton-dark">
        {/* Subtle Editorial Vignette & Warm Ambient Glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none"
        />

        {/* Centerpiece Isotype & Wordmark Skeleton */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 md:pt-44 md:pb-36 flex flex-col items-center justify-center flex-1">
          <HomeHeroCenterpieceSkeleton />
        </div>

        {/* 4-Column Trust Badges Bar Skeleton */}
        <div className="relative z-10 w-full border-t border-white/15 bg-black/40 backdrop-blur-md py-5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((badge) => (
              <div key={badge} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D5A688]/20 border border-[#D5A688]/30 shrink-0 animate-pulse" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-24 max-w-full rounded bg-white/25 animate-pulse" />
                  <div className="h-2.5 w-32 max-w-full rounded bg-white/12 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeBodySectionsSkeleton />
    </div>
  );
}

