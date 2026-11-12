import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FloatingWhatsAppButton } from '../components/layout/FloatingWhatsAppButton';
import { CatalogGridSkeleton, SkeletonImage } from '../components/ui/Skeleton';
import { CATALOG_SERVICES, CATEGORIES_DATA, POLICIES_DATA } from '../data/catalog';
import { SPA_INFO } from '../data/spaData';
import { useBooking } from '../context/BookingContext';
import type { CatalogService, ServiceCategory } from '../types';
import {
  Search,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Clock,
  AlertCircle,
  MessageSquare,
  MapPin
} from 'lucide-react';

function parseCategory(val: string | null): ServiceCategory | 'todos' {
  if (
    val === 'manos' ||
    val === 'pies' ||
    val === 'pestanas' ||
    val === 'depilacion' ||
    val === 'masajes' ||
    val === 'faciales'
  ) {
    return val;
  }

  return 'todos';
}

export function Catalogo() {
  const { openBooking } = useBooking();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = parseCategory(searchParams.get('cat'));

  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'todos'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({});
  const [isLoadingGrid, setIsLoadingGrid] = useState<boolean>(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoadingGrid(false);
    }, 110);

    return () => window.clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  // Sync category with URL parameter
  useEffect(() => {
    const rawCat = searchParams.get('cat');
    const parsed = parseCategory(rawCat);

    if (rawCat && parsed !== 'todos' && parsed !== selectedCategory) {
      setIsLoadingGrid(true);
      setSelectedCategory(parsed);
    }
  }, [searchParams, selectedCategory]);

  const handleSelectCategory = (cat: ServiceCategory | 'todos') => {
    if (cat !== selectedCategory) {
      setIsLoadingGrid(true);
    }

    setSelectedCategory(cat);

    if (cat === 'todos') {
      searchParams.delete('cat');
    } else {
      searchParams.set('cat', cat);
    }

    setSearchParams(searchParams);
  };

  const handleVariantSelect = (serviceId: string, optionIndex: number) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [serviceId]: optionIndex
    }));
  };

  const filteredServices = useMemo(() => {
    return CATALOG_SERVICES.filter((service) => {
      const matchesCategory = selectedCategory === 'todos' || service.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();

      const matchesQuery =
        !q ||
        service.name.toLowerCase().includes(q) ||
        service.subcategory.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q) ||
        service.includes.some((inc) => inc.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const getServicePriceInfo = (service: CatalogService) => {
    if (service.priceOptions && service.priceOptions.length > 0) {
      const selectedIndex = selectedVariants[service.id] || 0;
      const currentOption = service.priceOptions[selectedIndex] || service.priceOptions[0];

      return {
        isVariant: true,
        currentOption,
        options: service.priceOptions,
        pricePEN: currentOption.pricePEN,
        label: currentOption.label,
        formattedPrice: `S/ ${currentOption.pricePEN}`
      };
    }

    const pricePEN = service.pricePEN || 0;

    const formattedPrice = service.priceNote
      ? service.priceNote
      : pricePEN > 0
        ? `S/ ${pricePEN}`
        : 'Bajo pedido';

    return {
      isVariant: false,
      pricePEN,
      label: '',
      formattedPrice
    };
  };

  const buildWhatsAppLink = (service: CatalogService) => {
    const priceInfo = getServicePriceInfo(service);
    const variantText = priceInfo.isVariant ? ` (${priceInfo.label})` : '';

    const priceText = service.priceNote
      ? ` (${service.priceNote})`
      : priceInfo.pricePEN > 0
        ? ` de S/ ${priceInfo.pricePEN}`
        : ' (bajo pedido / a cotizar)';

    const message = `Hola Meraki Spa, deseo agendar el servicio *${service.name}*${variantText}${priceText}. ¿Me podrían indicar disponibilidad para atención en su estudio de Pueblo Libre o a domicilio?`;

    return `https://wa.me/${SPA_INFO.whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen meraki-editorial-canvas text-[#111111] font-['Montserrat',sans-serif] flex flex-col selection:bg-[#5E765E] selection:text-[#FFF2DE]">
      <Header />

      <main className="flex-1">
        {/* Subpage Header Banner */}
        <section className="meraki-hero-banner pt-10 lg:pt-24 pb-10 border-b border-[#D5A688]/35">
          {/* Studio Radial Halos & Botanical Monogram Filigree */}
          <div
            aria-hidden="true"
            className="pointer-events-none select-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#D5A688]/35 blur-3xl" />
            <div className="absolute -bottom-24 -right-20 w-96 h-96 rounded-full bg-[#AEC2AE]/45 blur-3xl" />
            <img
              src="/assets/brand/meraki-monogram.svg"
              alt=""
              className="absolute -right-14 top-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 opacity-[0.045] -rotate-6"
            />
            <img
              src="/assets/brand/meraki-monogram.svg"
              alt=""
              className="absolute -left-16 -bottom-12 w-56 sm:w-72 h-56 sm:h-72 opacity-[0.035] rotate-12"
            />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="relative rounded-t-[130px] sm:rounded-t-[220px] rounded-b-3xl border border-[#D5A688]/40 bg-gradient-to-b from-[#FFFDF9]/90 via-[#FFFDF9]/65 to-[#FFF2DE]/30 backdrop-blur-[2px] px-4 sm:px-10 pt-8 sm:pt-10 pb-7 shadow-[0_16px_40px_-12px_rgba(94,118,94,0.08),inset_0_1px_0_#FFFFFF]">
              <div className="meraki-editorial-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[#5E765E] text-[11px] font-semibold uppercase tracking-[0.2em] mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#D5A688]" />
                <span>Fuente Oficial de Servicios Meraki</span>
              </div>

              <h1 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl md:text-6xl font-normal text-[#111111] leading-tight mb-3">
                Catálogo de Servicios &amp; Tarifas
              </h1>

              {/* Editorial Ornamental Divider */}
              <div aria-hidden="true" className="flex items-center justify-center gap-3 mb-4">
                <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent via-[#D5A688]/70 to-[#5E765E]/50" />
                <span className="w-1.5 h-1.5 rotate-45 bg-[#D5A688]" />
                <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent via-[#D5A688]/70 to-[#5E765E]/50" />
              </div>

              <p className="font-['Montserrat',sans-serif] text-sm sm:text-base text-[#111111]/75 max-w-2xl mx-auto font-light leading-relaxed mb-7">
                Atención presencial en nuestro estudio (Calle Agustín Gamarra 515, Pueblo Libre) o en la comodidad de tu casa u oficina, con instrumental esterilizado, cosmética profesional y protocolos de bioseguridad.
              </p>

              {/* Direct Booking Reminder Bar */}
              <div className="theme-card-surface inline-flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 py-3 px-6 rounded-2xl text-xs text-[#111111]/85 max-w-3xl mx-auto">
                <span className="flex items-center gap-1.5 font-medium text-[#5E765E]">
                  <MapPin className="w-4 h-4 text-[#D5A688]" />
                  <span>Estudio en Pueblo Libre &amp; A Domicilio</span>
                </span>
                <span className="text-[#D5A688]/50 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5 font-medium text-[#5E765E]">
                  <Clock className="w-4 h-4 text-[#D5A688]" />
                  <span>Reserva previa del 40%</span>
                </span>
                <span className="text-[#D5A688]/50 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5 font-medium text-[#5E765E]">
                  <ShieldCheck className="w-4 h-4 text-[#D5A688]" />
                  <span>Bioseguridad garantizada</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Search Bar */}
        <section className="sticky top-[69px] z-30 bg-[#FFFDF9]/90 backdrop-blur-md py-4 border-b border-[#D5A688]/25 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                {CATEGORIES_DATA.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-['Montserrat',sans-serif] uppercase tracking-wider transition-all cursor-pointer ${selectedCategory === cat.id
                        ? 'bg-[#5E765E] text-[#FFF2DE] shadow-sm font-semibold'
                        : 'bg-white/85 hover:bg-white text-[#111111]/80 border border-[#D5A688]/30 shadow-xs'
                      }`}
                  >
                    {cat.label}
                    <span className="ml-1.5 text-[10px] opacity-75">
                      ({cat.count})
                    </span>
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72 shrink-0">
                <Search className="w-4 h-4 text-[#111111]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar tratamiento o zona..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-[#5E765E]/20 text-xs text-[#111111] placeholder:text-[#111111]/40 focus:outline-none focus:border-[#5E765E] shadow-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#111111]/40 hover:text-[#111111]"
                  >
                    ✕
                  </button>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* Services List / Cards */}
        <section className="py-12 meraki-section-cream">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoadingGrid ? (
              <CatalogGridSkeleton count={6} />
            ) : filteredServices.length === 0 ? (
              <div className="bg-white/80 rounded-3xl p-12 text-center border border-[#5E765E]/20 max-w-lg mx-auto">
                <AlertCircle className="w-10 h-10 text-[#D5A688] mx-auto mb-3" />
                <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-semibold text-[#111111]">
                  No se encontraron servicios
                </h3>
                <p className="text-xs text-[#111111]/70 mt-2 mb-6">
                  Prueba cambiando la categoría o borrando el término de búsqueda.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('todos');
                    setSearchQuery('');
                  }}
                  className="bg-[#5E765E] text-[#FFF2DE] px-6 py-2.5 rounded-full text-xs font-medium uppercase tracking-wider cursor-pointer"
                >
                  Restablecer Catálogo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => {
                  const priceInfo = getServicePriceInfo(service);
                  const waLink = buildWhatsAppLink(service);

                  return (
                    <article
                      key={service.id}
                      className="theme-card-surface rounded-2xl flex flex-col justify-between overflow-hidden group text-left"
                    >
                      {/* Image or Colored Header */}
                      {service.image ? (
                        <SkeletonImage
                          src={service.image}
                          alt={service.name}
                          width={640}
                          height={360}
                          loading="lazy"
                          containerClassName="aspect-[16/9] w-full bg-[#EAE2D5]"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
                            <span className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-sm text-[10px] font-['Montserrat',sans-serif] font-bold uppercase tracking-wider text-[#5E765E]">
                              {service.subcategory}
                            </span>
                            {service.popular && (
                              <span className="px-2 py-1 rounded-md bg-[#5E765E] text-[#FFF2DE] text-[10px] font-['Montserrat',sans-serif] font-bold uppercase tracking-wider">
                                Popular
                              </span>
                            )}
                          </div>
                          <div className="absolute bottom-3 right-3 z-20 bg-[#5E765E] text-[#FFF2DE] px-3 py-1 rounded-lg font-['Montserrat',sans-serif] text-sm font-bold shadow-md">
                            {priceInfo.formattedPrice}
                          </div>
                        </SkeletonImage>
                      ) : (
                        <div className="px-6 pt-5 pb-2 flex items-center justify-between border-b border-[#5E765E]/10 bg-[#5E765E]/5">
                          <span className="text-[10px] font-['Montserrat',sans-serif] font-bold uppercase tracking-wider text-[#5E765E]">
                            {service.subcategory}
                          </span>
                          <span className="text-sm font-['Montserrat',sans-serif] font-bold text-[#5E765E]">
                            {priceInfo.formattedPrice}
                          </span>
                        </div>
                      )}

                      {/* Card Content */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111] leading-tight mb-2 group-hover:text-[#5E765E] transition-colors">
                            {service.name}
                          </h3>
                          <p className="text-xs text-[#111111]/75 font-light leading-relaxed mb-4">
                            {service.description}
                          </p>

                          {/* Variant Options Selector */}
                          {priceInfo.isVariant && priceInfo.options && (
                            <div className="mb-4 p-2.5 rounded-xl bg-[#FFF2DE]/60 border border-[#5E765E]/15">
                              <span className="block text-[10px] font-['Montserrat',sans-serif] font-bold uppercase tracking-wider text-[#5E765E] mb-2">
                                Selecciona Opción / Duración:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {priceInfo.options.map((opt, idx) => {
                                  const isSelected = (selectedVariants[service.id] || 0) === idx;

                                  return (
                                    <button
                                      key={opt.label}
                                      type="button"
                                      onClick={() => handleVariantSelect(service.id, idx)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${isSelected
                                          ? 'bg-[#5E765E] text-[#FFF2DE] shadow-sm'
                                          : 'bg-white text-[#111111]/80 hover:bg-[#FFF2DE] border border-[#5E765E]/20'
                                        }`}
                                    >
                                      {opt.label}: <strong>S/ {opt.pricePEN}</strong>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Includes List */}
                          {service.includes && service.includes.length > 0 && (
                            <div className="space-y-1.5 mb-4">
                              <span className="text-[10px] font-['Montserrat',sans-serif] font-semibold uppercase tracking-wider text-[#111111]/60 block mb-1">
                                Incluye:
                              </span>
                              {service.includes.map((inc, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs text-[#111111]/85">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5E765E] shrink-0 mt-0.5" />
                                  <span className="font-light">{inc}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Specific Note */}
                          {service.note && (
                            <div className="p-2.5 rounded-lg bg-[#D5A688]/15 border border-[#D5A688]/30 text-[11px] text-[#111111]/80 mb-4 leading-snug flex items-start gap-2">
                              <AlertCircle className="w-3.5 h-3.5 text-[#D5A688] shrink-0 mt-0.5" />
                              <span>{service.note}</span>
                            </div>
                          )}
                        </div>

                        {/* Card Action Button */}
                        <div className="pt-4 border-t border-[#5E765E]/10 mt-auto flex flex-col sm:flex-row gap-2">
                          <button
                            type="button"
                            onClick={() => openBooking(service.id)}
                            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm hover:shadow-md cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5 text-[#D5A688]" />
                            <span>Agendar Cita • {priceInfo.formattedPrice}</span>
                          </button>
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-2.5 rounded-xl border border-[#5E765E]/20 bg-white hover:bg-[#FFF2DE] text-[#5E765E] text-xs transition-colors"
                            aria-label={`Consultar ${service.name} por WhatsApp`}
                            title="Consulta directa por WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4 text-[#25D366]" />
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Catalog Policies Box */}
        <section className="py-12 meraki-section-ivory border-t border-[#D5A688]/25">
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 rounded-3xl meraki-cream-card text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#5E765E] text-[#FFF2DE] flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-[#D5A688]" />
                </div>
                <div>
                  <span className="meraki-editorial-pill inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E] mb-1">
                    Fuente de la Verdad
                  </span>
                  <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111]">
                    Datos Importantes &amp; Condiciones del Catálogo
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#111111]/85 font-light">
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white/90 backdrop-blur-sm border border-[#D5A688]/25 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#5E765E] shrink-0 mt-0.5" />
                  <span><strong>Disponibilidad:</strong> {POLICIES_DATA.availability}</span>
                </div>

                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white/90 backdrop-blur-sm border border-[#D5A688]/25 shadow-xs">
                  <Truck className="w-4 h-4 text-[#D5A688] shrink-0 mt-0.5" />
                  <span><strong>Costo de Movilidad:</strong> {POLICIES_DATA.mobility}</span>
                </div>

                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white/90 backdrop-blur-sm border border-[#D5A688]/25 shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-[#5E765E] shrink-0 mt-0.5" />
                  <span><strong>Bioseguridad:</strong> {POLICIES_DATA.biosecurity}</span>
                </div>

                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white/90 backdrop-blur-sm border border-[#D5A688]/25 shadow-xs">
                  <Clock className="w-4 h-4 text-[#D5A688] shrink-0 mt-0.5" />
                  <span><strong>Cancelaciones:</strong> {POLICIES_DATA.cancellation}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[#5E765E]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-[#111111]/70">
                  ¿Tienes dudas sobre los 5 pasos para agendar tu cita?
                </p>
                <Link
                  to="/como-reservar"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5E765E] hover:underline"
                >
                  <span>Ver guía paso a paso de reserva</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingWhatsAppButton />
    </div>
  );
}
