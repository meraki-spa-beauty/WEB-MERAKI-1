import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Expand,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FloatingWhatsAppButton } from '../components/layout/FloatingWhatsAppButton';
import { CatalogImage } from '../components/ui/CatalogImage';
import { POLICIES_DATA } from '../data/catalog';
import { SPA_INFO } from '../data/spaData';
import { useBooking } from '../context/BookingContext';
import { collectServiceGalleryImages, useCatalog } from '../context/CatalogContext';
import type { CatalogService } from '../types';

export function ServicioDetalle() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { openBooking } = useBooking();
  const { activeServices, getServiceById, loadingCatalog } = useCatalog();

  const service = serviceId ? getServiceById(serviceId) : undefined;
  const isAvailable = Boolean(service && service.active !== false);

  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  useEffect(() => {
    setSelectedVariantIndex(0);
    setActivePhotoIndex(0);
    setIsLightboxOpen(false);
  }, [serviceId]);

  const galleryImages = useMemo<string[]>(() => {
    if (!service) return [];

    return collectServiceGalleryImages(service);
  }, [service]);

  useEffect(() => {
    if (galleryImages.length === 0) {
      setActivePhotoIndex(0);
    } else if (activePhotoIndex >= galleryImages.length) {
      setActivePhotoIndex(0);
    }
  }, [galleryImages.length, activePhotoIndex]);

  useEffect(() => {
    if (!service || typeof document === 'undefined') return;

    const cleanDesc = service.description.slice(0, 155);

    document.title = `${service.name} | Catálogo Meraki Spa`;

    const metaDesc = document.querySelector('meta[name="description"]');

    if (metaDesc) {
      metaDesc.setAttribute('content', cleanDesc);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');

    if (ogTitle) {
      ogTitle.setAttribute('content', `${service.name} | Meraki Spa`);
    }
  }, [service]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowRight' && galleryImages.length > 1) {
        setActivePhotoIndex((prev) => (prev + 1) % galleryImages.length);
      } else if (e.key === 'ArrowLeft' && galleryImages.length > 1) {
        setActivePhotoIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
      }
    };

    window.addEventListener('keydown', handleKey);

    return () => window.removeEventListener('keydown', handleKey);
  }, [isLightboxOpen, galleryImages.length]);

  const priceInfo = useMemo(() => {
    if (!service) {
      return {
        isVariant: false,
        selectedIndex: 0,
        pricePEN: 0,
        label: '',
        formattedPrice: 'S/ 0',
      };
    }

    if (service.priceOptions && service.priceOptions.length > 0) {
      const safeIndex =
        selectedVariantIndex >= 0 && selectedVariantIndex < service.priceOptions.length
          ? selectedVariantIndex
          : 0;

      const opt = service.priceOptions[safeIndex];

      return {
        isVariant: true,
        selectedIndex: safeIndex,
        options: service.priceOptions,
        pricePEN: opt.pricePEN,
        label: opt.label,
        sessions: opt.sessions,
        formattedPrice: `S/ ${opt.pricePEN}`,
      };
    }

    const pricePEN = service.pricePEN ?? 0;

    const formattedPrice = service.priceNote
      ? service.priceNote
      : pricePEN > 0
        ? `S/ ${pricePEN}`
        : 'Bajo pedido';

    return {
      isVariant: false,
      selectedIndex: 0,
      pricePEN,
      label: '',
      formattedPrice,
    };
  }, [service, selectedVariantIndex]);

  const relatedServices = useMemo<CatalogService[]>(() => {
    if (!service) return [];

    const related: CatalogService[] = [];

    for (const item of activeServices) {
      if (item.category === service.category && item.id !== service.id) {
        related.push(item);

        if (related.length >= 3) break;
      }
    }

    return related;
  }, [activeServices, service]);

  const handlePrevPhoto = () => {
    if (galleryImages.length <= 1) return;

    setActivePhotoIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleNextPhoto = () => {
    if (galleryImages.length <= 1) return;

    setActivePhotoIndex((prev) => (prev + 1) % galleryImages.length);
  };

  if (!loadingCatalog && (!service || !isAvailable)) {
    return (
      <div className="min-h-screen meraki-catalog-surface text-[#111111] font-['Montserrat',sans-serif] flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-lg w-full bg-[#FFFDF9] rounded-3xl p-8 sm:p-10 border border-[#5E765E]/20 shadow-sm text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-[#D5A688] mx-auto" />
            <h1 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#111111]">
              Servicio no disponible
            </h1>
            <p className="text-xs text-[#111111]/75 leading-relaxed">
              Este tratamiento fue pausado temporalmente o el enlace ya no corresponde a un servicio activo del catálogo.
            </p>
            <div className="pt-2">
              <Link
                to="/catalogo"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al Catálogo</span>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen meraki-catalog-surface text-[#111111] font-['Montserrat',sans-serif] flex flex-col">
        <Header />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 aspect-[4/3] rounded-3xl meraki-skeleton" />
            <div className="lg:col-span-5 space-y-4">
              <div className="h-4 w-40 rounded meraki-skeleton" />
              <div className="h-10 w-3/4 rounded-xl meraki-skeleton" />
              <div className="h-8 w-32 rounded-lg meraki-skeleton" />
              <div className="h-24 w-full rounded-xl meraki-skeleton" />
              <div className="h-12 w-full rounded-full meraki-skeleton" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentPhoto = galleryImages[activePhotoIndex] || '';

  const variantSuffix = priceInfo.isVariant ? ` (${priceInfo.label})` : '';

  const priceWaText = service.priceNote
    ? ` (${service.priceNote})`
    : priceInfo.pricePEN > 0
      ? ` de S/ ${priceInfo.pricePEN}`
      : ' (bajo pedido / a cotizar)';

  const waMessage = `Hola Meraki Spa, acabo de ver la ficha de *${service.name}*${variantSuffix}${priceWaText} y deseo consultar disponibilidad en Pueblo Libre o a domicilio.`;
  const waHref = `https://wa.me/${SPA_INFO.whatsappNumber}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="min-h-screen meraki-catalog-surface text-[#111111] font-['Montserrat',sans-serif] flex flex-col pb-20 lg:pb-0 selection:bg-[#5E765E] selection:text-[#FFF2DE]">
      <Header />

      <main className="flex-1">
        {/* Clean Editorial Breadcrumb Bar */}
        <section className="border-b border-[#5E765E]/15 bg-[#FFFDF9]/85">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
            <nav aria-label="Ruta del servicio" className="flex flex-wrap items-center gap-2 text-xs text-[#111111]/65">
              <Link to="/" className="hover:text-[#5E765E] transition-colors">
                Inicio
              </Link>
              <span aria-hidden="true">/</span>
              <Link to="/catalogo" className="hover:text-[#5E765E] transition-colors">
                Catálogo
              </Link>
              <span aria-hidden="true">/</span>
              <Link
                to={`/catalogo?cat=${service.category}`}
                className="hover:text-[#5E765E] transition-colors"
              >
                {service.categoryLabel}
              </Link>
              <span aria-hidden="true">/</span>
              <span className="font-medium text-[#111111] truncate max-w-[220px] sm:max-w-xs">
                {service.name}
              </span>
            </nav>

            <Link
              to={`/catalogo?cat=${service.category}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5E765E] hover:underline whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Explorar {service.categoryLabel}</span>
            </Link>
          </div>
        </section>

        {/* Contiguous E-Commerce Product Detail Section (Gallery Left / Purchase Module Right) */}
        <section className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* LEFT: Sticky Image Showcase & Gallery Strip (up to 11 images) */}
              <div className="lg:col-span-7 lg:sticky lg:top-24 space-y-4">
                <div className="relative rounded-3xl overflow-hidden border border-[#5E765E]/20 bg-[#FFFDF9] shadow-sm">
                  <div className="relative aspect-[4/3] w-full bg-[#EDF2EC]">
                    <CatalogImage
                      src={currentPhoto}
                      alt={`${service.name} — vista ${activePhotoIndex + 1}`}
                      loading="eager"
                      fetchPriority="high"
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover"
                    />

                    {/* Subtle gradient for bottom controls readability */}
                    {galleryImages.length > 0 && (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 via-black/10 to-transparent"
                      />
                    )}

                    {/* Top Right Fullscreen Zoom Trigger */}
                    {currentPhoto && (
                      <button
                        type="button"
                        onClick={() => setIsLightboxOpen(true)}
                        aria-label="Ampliar fotografía del servicio"
                        className="absolute top-3.5 right-3.5 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#111111] border border-[#5E765E]/20 shadow-sm flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                      >
                        <Expand className="w-4 h-4" />
                      </button>
                    )}

                    {/* Prev / Next Gallery Arrows */}
                    {galleryImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevPhoto}
                          aria-label="Fotografía anterior"
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#111111] border border-[#5E765E]/20 shadow-sm flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextPhoto}
                          aria-label="Fotografía siguiente"
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#111111] border border-[#5E765E]/20 shadow-sm flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {/* Bottom Image Index Indicator */}
                    {galleryImages.length > 1 && (
                      <div className="absolute bottom-3.5 right-3.5 z-20 px-3 py-1 rounded-full bg-black/60 text-white text-[11px] font-medium tabular-nums backdrop-blur-xs">
                        {activePhotoIndex + 1} / {galleryImages.length}
                      </div>
                    )}
                  </div>
                </div>

                {/* Thumbnail Strip (Principal + up to 10 Gallery photos) */}
                {galleryImages.length > 1 && (
                  <div
                    role="list"
                    aria-label="Galería de imágenes del servicio"
                    className="flex items-center gap-2.5 overflow-x-auto pb-1"
                  >
                    {galleryImages.map((imgUrl, idx) => {
                      const isSelected = idx === activePhotoIndex;

                      return (
                        <button
                          key={`${imgUrl}-${idx}`}
                          type="button"
                          onClick={() => setActivePhotoIndex(idx)}
                          aria-label={`Ver foto ${idx + 1} de ${galleryImages.length}`}
                          aria-current={isSelected ? 'true' : undefined}
                          className={`relative w-18 h-14 sm:w-20 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#5E765E] ring-2 ring-[#5E765E]/25'
                              : 'border-transparent opacity-75 hover:opacity-100 hover:border-[#D5A688]/60'
                          }`}
                        >
                          <CatalogImage
                            src={imgUrl}
                            alt={`${service.name} miniatura ${idx + 1}`}
                            loading="lazy"
                            containerClassName="w-full h-full bg-[#EDF2EC]"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RIGHT: Contiguous Purchase & Booking Module */}
              <div className="lg:col-span-5 bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-[#5E765E]/20 shadow-sm space-y-6 text-left">
                <div className="space-y-3">
                  {/* Quiet unboxed metadata line */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#5E765E] font-medium">
                    <span className="uppercase tracking-[0.14em]">{service.categoryLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#111111]/65">{service.subcategory}</span>
                    {service.popular && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#9A6342] font-semibold">Favorito Meraki</span>
                      </>
                    )}
                  </div>

                  <h1 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl font-bold text-[#111111] leading-tight text-balance">
                    {service.name}
                  </h1>

                  {/* Tabular Price Readout */}
                  <div className="flex flex-wrap items-baseline gap-3 pt-1">
                    <span className="text-3xl font-bold text-[#5E765E] tabular-nums tracking-tight">
                      {priceInfo.formattedPrice}
                    </span>
                    {priceInfo.pricePEN > 0 && !service.priceNote && (
                      <span className="text-xs text-[#111111]/65 tabular-nums">
                        Reserva con 40% (S/ {Math.round(priceInfo.pricePEN * 0.4)})
                      </span>
                    )}
                  </div>

                  {/* Quick Service Metadata */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#111111]/70 pt-1">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D5A688]" />
                      <span>Estudio Pueblo Libre &amp; Domicilio</span>
                    </span>
                    {service.durationMin && (
                      <span className="inline-flex items-center gap-1.5 tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-[#D5A688]" />
                        <span>Aprox. {service.durationMin} min</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Editorial Description */}
                <p className="text-sm text-[#111111]/80 font-light leading-relaxed border-t border-[#5E765E]/15 pt-5">
                  {service.description}
                </p>

                {/* Variant / Option Selector */}
                {priceInfo.isVariant && priceInfo.options && (
                  <div className="space-y-2.5 border-t border-[#5E765E]/15 pt-5">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-[#5E765E]">
                      Elige tu opción o duración:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {priceInfo.options.map((opt, idx) => {
                        const isSelected = priceInfo.selectedIndex === idx;

                        return (
                          <button
                            key={`${opt.label}-${idx}`}
                            type="button"
                            onClick={() => setSelectedVariantIndex(idx)}
                            className={`px-3.5 py-3 rounded-xl text-left text-xs transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-[#5E765E] text-[#FFF2DE] border-[#5E765E] shadow-xs'
                                : 'bg-white text-[#111111] border-[#5E765E]/20 hover:border-[#5E765E]/50'
                            }`}
                          >
                            <span className="block font-semibold">{opt.label}</span>
                            <span
                              className={`block mt-0.5 tabular-nums font-bold ${
                                isSelected ? 'text-[#FFF2DE]' : 'text-[#5E765E]'
                              }`}
                            >
                              S/ {opt.pricePEN}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Primary & Secondary Action Buttons */}
                <div className="space-y-2.5 border-t border-[#5E765E]/15 pt-5">
                  <button
                    type="button"
                    onClick={() => openBooking(service.id, priceInfo.selectedIndex)}
                    className="meraki-btn-fluid w-full inline-flex items-center justify-center gap-2 bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] py-3.5 px-6 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-[#D5A688]" />
                    <span>Agendar este servicio • {priceInfo.formattedPrice}</span>
                  </button>

                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full border border-[#5E765E]/25 bg-white hover:bg-[#EDF2EC] text-[#111111] text-xs font-semibold transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-[#25D366]" />
                    <span>Consultar dudas por WhatsApp</span>
                  </a>
                </div>

                {/* Note Alert if Applicable */}
                {service.note && (
                  <div className="p-3.5 rounded-2xl bg-[#FFF2DE]/70 border border-[#D5A688]/40 text-xs text-[#111111]/85 leading-relaxed flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-[#9A6342] shrink-0 mt-0.5" />
                    <span>{service.note}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Structured Ritual Specification Strip (Below Split) */}
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* What is Included */}
              <div className="lg:col-span-7 bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-[#5E765E]/15 space-y-5 text-left">
                <div className="flex items-center gap-2.5 border-b border-[#5E765E]/15 pb-4">
                  <Sparkles className="w-5 h-5 text-[#D5A688]" />
                  <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111]">
                    ¿Qué incluye este tratamiento?
                  </h2>
                </div>

                {service.includes.length > 0 ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {service.includes.map((inc, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[#111111]/85 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-[#5E765E] shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#111111]/70">
                    Incluye evaluación previa personalizada e insumos estériles de cabina.
                  </p>
                )}
              </div>

              {/* Modality, Biosecurity & Guarantees */}
              <div className="lg:col-span-5 bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-[#5E765E]/15 space-y-4 text-left">
                <div className="flex items-center gap-2.5 border-b border-[#5E765E]/15 pb-4">
                  <ShieldCheck className="w-5 h-5 text-[#5E765E]" />
                  <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111]">
                    Condiciones y Bioseguridad
                  </h2>
                </div>

                <div className="space-y-3 text-xs text-[#111111]/80 font-light leading-relaxed">
                  <p>
                    <strong className="font-semibold text-[#111111]">Estudio sin movilidad adicional:</strong> Atención en Calle Agustín Gamarra 515, Pueblo Libre.
                  </p>
                  <p>
                    <strong className="font-semibold text-[#111111]">A domicilio u oficina:</strong> {POLICIES_DATA.mobility}
                  </p>
                  <p>
                    <strong className="font-semibold text-[#111111]">Política de cita:</strong> {POLICIES_DATA.cancellation}
                  </p>
                </div>
              </div>
            </div>

            {/* Related Services Section */}
            {relatedServices.length > 0 && (
              <div className="mt-14 pt-10 border-t border-[#5E765E]/20 space-y-6 text-left">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#5E765E] block">
                      Complementa tu sesión
                    </span>
                    <h2 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#111111]">
                      Más tratamientos en {service.categoryLabel}
                    </h2>
                  </div>
                  <Link
                    to={`/catalogo?cat=${service.category}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5E765E] hover:underline"
                  >
                    <span>Ver categoría completa</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedServices.map((rel) => {
                    const relPrice =
                      rel.priceOptions && rel.priceOptions.length > 0
                        ? `Desde S/ ${rel.priceOptions[0].pricePEN}`
                        : rel.priceNote
                          ? rel.priceNote
                          : rel.pricePEN
                            ? `S/ ${rel.pricePEN}`
                            : 'Bajo pedido';

                    return (
                      <Link
                        key={rel.id}
                        to={`/catalogo/${rel.id}`}
                        className="theme-card-surface rounded-2xl overflow-hidden flex flex-col group transition-transform duration-200 hover:-translate-y-0.5"
                      >
                        <CatalogImage
                          src={rel.image}
                          alt={rel.name}
                          loading="lazy"
                          containerClassName="aspect-[16/9] w-full bg-[#EDF2EC]"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <span className="text-[11px] font-medium text-[#5E765E] block mb-1">
                              {rel.subcategory}
                            </span>
                            <h3 className="font-['Cormorant_Garamond',serif] text-xl font-bold text-[#111111] group-hover:text-[#5E765E] transition-colors">
                              {rel.name}
                            </h3>
                            <p className="text-xs text-[#111111]/70 font-light line-clamp-2 mt-1">
                              {rel.description}
                            </p>
                          </div>
                          <div className="pt-3 border-t border-[#5E765E]/15 flex items-center justify-between text-xs font-bold text-[#5E765E] tabular-nums">
                            <span>{relPrice}</span>
                            <span className="inline-flex items-center gap-1 font-semibold">
                              Ver ficha <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Sticky Compact Mobile Booking Bar (<= 15% mobile height) */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-t border-[#5E765E]/20 px-4 py-2.5 shadow-[0_-8px_24px_rgba(17,17,17,0.08)]">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0 text-left">
            <span className="block text-[11px] text-[#111111]/65 truncate">{service.name}</span>
            <span className="block text-base font-bold text-[#5E765E] tabular-nums">
              {priceInfo.formattedPrice}
            </span>
          </div>
          <button
            type="button"
            onClick={() => openBooking(service.id, priceInfo.selectedIndex)}
            className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#5E765E] text-[#FFF2DE] text-xs font-semibold uppercase tracking-wider shadow-sm cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#D5A688]" />
            <span>Agendar</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal for Gallery Photos */}
      {isLightboxOpen && currentPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galería de ${service.name}`}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Cerrar galería"
            className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevPhoto}
                aria-label="Foto anterior"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={handleNextPhoto}
                aria-label="Foto siguiente"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="max-w-4xl w-full max-h-[84vh] flex flex-col items-center gap-3">
            <div className="w-full max-h-[75vh] aspect-[4/3] rounded-2xl overflow-hidden bg-black/40">
              <CatalogImage
                src={currentPhoto}
                alt={`${service.name} foto ${activePhotoIndex + 1}`}
                loading="eager"
                containerClassName="w-full h-full"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-xs text-white/80 tabular-nums">
              {service.name} — Foto {activePhotoIndex + 1} de {galleryImages.length}
            </div>
          </div>
        </div>
      )}

      <Footer />
      <FloatingWhatsAppButton />
    </div>
  );
}
