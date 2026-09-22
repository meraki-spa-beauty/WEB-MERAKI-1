import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FloatingWhatsAppButton } from '../components/common/FloatingWhatsAppButton';
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
  MessageSquare
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

  // Sync category with URL parameter
  useEffect(() => {
    const rawCat = searchParams.get('cat');
    const parsed = parseCategory(rawCat);

    if (rawCat && parsed !== 'todos') {
      setSelectedCategory(parsed);
    }
  }, [searchParams]);

  const handleSelectCategory = (cat: ServiceCategory | 'todos') => {
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
        label: currentOption.label
      };
    }

    return {
      isVariant: false,
      pricePEN: service.pricePEN || 0,
      label: ''
    };
  };

  const buildWhatsAppLink = (service: CatalogService) => {
    const priceInfo = getServicePriceInfo(service);
    const variantText = priceInfo.isVariant ? ` (${priceInfo.label})` : '';
    const message = `Hola Meraki Spa Beauty, deseo agendar el servicio *${service.name}*${variantText} de S/ ${priceInfo.pricePEN}. ¿Me podrían indicar disponibilidad y el costo de movilidad para mi distrito?`;

    return `https://wa.me/${SPA_INFO.whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen bg-[#FFF2DE] text-[#111111] font-['Montserrat',sans-serif] flex flex-col selection:bg-[#5E765E] selection:text-[#FFF2DE]">
      <TopBar />
      <Header />

      <main className="flex-1">
        {/* Subpage Header Banner */}
        <section className="bg-gradient-to-b from-[#5E765E]/15 to-transparent pt-12 pb-10 border-b border-[#5E765E]/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5E765E]/10 border border-[#5E765E]/20 text-[#5E765E] text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#D5A688]" />
              <span>Fuente Oficial de Servicios Meraki</span>
            </div>
            <h1 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl md:text-6xl font-normal text-[#111111] leading-tight mb-4">
              Catálogo de Servicios &amp; Tarifas
            </h1>
            <p className="font-['Montserrat',sans-serif] text-sm sm:text-base text-[#111111]/75 max-w-2xl mx-auto font-light leading-relaxed mb-8">
              Todos nuestros servicios se realizan en la comodidad de tu casa u oficina con instrumental esterilizado, cosmética profesional y protocolos de bioseguridad.
            </p>

            {/* Direct Booking Reminder Bar */}
            <div className="inline-flex flex-wrap items-center justify-center gap-4 py-2.5 px-6 rounded-2xl bg-white/80 border border-[#5E765E]/20 shadow-sm text-xs text-[#111111]/80 max-w-3xl mx-auto">
              <span className="flex items-center gap-1.5 font-medium text-[#5E765E]">
                <Truck className="w-4 h-4 text-[#D5A688]" />
                <span>Movilidad según distrito</span>
              </span>
              <span className="text-[#5E765E]/30 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5 font-medium text-[#5E765E]">
                <Clock className="w-4 h-4 text-[#D5A688]" />
                <span>Reserva previa del 40%</span>
              </span>
              <span className="text-[#5E765E]/30 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5 font-medium text-[#5E765E]">
                <ShieldCheck className="w-4 h-4 text-[#D5A688]" />
                <span>Bioseguridad garantizada</span>
              </span>
            </div>
          </div>
        </section>

        {/* Filters and Search Bar */}
        <section className="sticky top-[69px] z-30 bg-[#FFF2DE]/95 backdrop-blur-md py-4 border-b border-[#5E765E]/15 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                {CATEGORIES_DATA.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-['Montserrat',sans-serif] uppercase tracking-wider transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#5E765E] text-[#FFF2DE] shadow-sm font-semibold'
                        : 'bg-white/70 hover:bg-white text-[#111111]/80 border border-[#5E765E]/15'
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
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredServices.length === 0 ? (
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
                      className="bg-white rounded-2xl border border-[#5E765E]/15 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group text-left"
                    >
                      {/* Image or Colored Header */}
                      {service.image ? (
                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#EAE2D5]">
                          <img
                            src={service.image}
                            alt={service.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <span className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-sm text-[10px] font-['Montserrat',sans-serif] font-bold uppercase tracking-wider text-[#5E765E]">
                              {service.subcategory}
                            </span>
                            {service.popular && (
                              <span className="px-2 py-1 rounded-md bg-[#5E765E] text-[#FFF2DE] text-[10px] font-['Montserrat',sans-serif] font-bold uppercase tracking-wider">
                                Popular
                              </span>
                            )}
                          </div>
                          <div className="absolute bottom-3 right-3 bg-[#5E765E] text-[#FFF2DE] px-3 py-1 rounded-lg font-['Montserrat',sans-serif] text-sm font-bold shadow-md">
                            S/ {priceInfo.pricePEN}
                          </div>
                        </div>
                      ) : (
                        <div className="px-6 pt-5 pb-2 flex items-center justify-between border-b border-[#5E765E]/10 bg-[#5E765E]/5">
                          <span className="text-[10px] font-['Montserrat',sans-serif] font-bold uppercase tracking-wider text-[#5E765E]">
                            {service.subcategory}
                          </span>
                          <span className="text-sm font-['Montserrat',sans-serif] font-bold text-[#5E765E]">
                            S/ {priceInfo.pricePEN}
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
                          {priceInfo.isVariant && (
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
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                        isSelected
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
                            <span>Agendar Cita • S/ {priceInfo.pricePEN}</span>
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
        <section className="py-12 bg-white/70 border-t border-[#5E765E]/15">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 rounded-3xl bg-[#FFF2DE] border border-[#5E765E]/20 shadow-sm text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#5E765E] text-[#FFF2DE] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#D5A688]" />
                </div>
                <div>
                  <span className="text-[10px] font-['Montserrat',sans-serif] uppercase tracking-[0.2em] font-bold text-[#5E765E]">
                    Fuente de la Verdad
                  </span>
                  <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111]">
                    Datos Importantes &amp; Condiciones del Catálogo
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#111111]/85 font-light">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 border border-[#5E765E]/10">
                  <CheckCircle2 className="w-4 h-4 text-[#5E765E] shrink-0 mt-0.5" />
                  <span><strong>Disponibilidad:</strong> {POLICIES_DATA.availability}</span>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 border border-[#5E765E]/10">
                  <Truck className="w-4 h-4 text-[#D5A688] shrink-0 mt-0.5" />
                  <span><strong>Costo de Movilidad:</strong> {POLICIES_DATA.mobility}</span>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 border border-[#5E765E]/10">
                  <ShieldCheck className="w-4 h-4 text-[#5E765E] shrink-0 mt-0.5" />
                  <span><strong>Bioseguridad:</strong> {POLICIES_DATA.biosecurity}</span>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 border border-[#5E765E]/10">
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
