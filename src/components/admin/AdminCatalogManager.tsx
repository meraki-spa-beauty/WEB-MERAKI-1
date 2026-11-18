import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  ImagePlus,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  Sparkles,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import type { CatalogService, ServiceCategory, ServicePriceOption } from '../../types';
import { collectServiceGalleryImages, useCatalog } from '../../context/CatalogContext';
import { CatalogImage } from '../ui/CatalogImage';
import {
  getCategoryLabelForKey,
  uploadCatalogMediaImage,
} from '../../services/merakiFirestore';
import {
  isValidCatalogImageRef,
  optimizeCatalogImageFile,
} from '../../utils/imageOptimizer';

interface AdminCatalogManagerProps {
  actorEmail: string;
  onNotify: (message: string) => void;
}

const SERVICE_CATEGORY_OPTIONS: { id: ServiceCategory; label: string }[] = [
  { id: 'manos', label: 'Manos' },
  { id: 'pies', label: 'Pies' },
  { id: 'pestanas', label: 'Pestañas' },
  { id: 'depilacion', label: 'Depilación' },
  { id: 'masajes', label: 'Masajes' },
  { id: 'faciales', label: 'Faciales' },
];

const MAX_GALLERY_COUNT = 10;

interface ServiceDraftForm {
  id: string;
  isNew: boolean;
  name: string;
  category: ServiceCategory;
  subcategory: string;
  description: string;
  pricingMode: 'single' | 'variants';
  pricePEN: number;
  priceNote: string;
  priceOptions: ServicePriceOption[];
  includes: string[];
  note: string;
  popular: boolean;
  active: boolean;
  durationMin: string;
  displayOrder: number;
  mainImage: string;
  gallery: string[];
}

function slugifyServiceId(rawName: string, category: ServiceCategory): string {
  const normalized = rawName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 42);

  const suffix = Math.random().toString(36).slice(2, 6);

  return `${category}-${normalized || 'servicio'}-${suffix}`.slice(0, 76);
}

function buildDraftFromService(service: CatalogService): ServiceDraftForm {
  const hasVariants = Boolean(service.priceOptions && service.priceOptions.length > 0);
  const allImages = collectServiceGalleryImages(service);
  const mainImage = allImages[0] || '';
  const gallery = allImages.slice(1, 1 + MAX_GALLERY_COUNT);

  return {
    id: service.id,
    isNew: false,
    name: service.name,
    category: service.category,
    subcategory: service.subcategory || service.categoryLabel,
    description: service.description,
    pricingMode: hasVariants ? 'variants' : 'single',
    pricePEN: service.pricePEN ?? 0,
    priceNote: service.priceNote || '',
    priceOptions: hasVariants && service.priceOptions
      ? service.priceOptions.map((opt) => ({ ...opt }))
      : [{ label: 'Estándar', pricePEN: service.pricePEN ?? 80 }],
    includes: service.includes.length > 0 ? [...service.includes] : [''],
    note: service.note || '',
    popular: Boolean(service.popular),
    active: service.active !== false,
    durationMin: service.durationMin ? String(service.durationMin) : '',
    displayOrder: service.displayOrder ?? 100,
    mainImage,
    gallery,
  };
}

function buildNewServiceDraft(nextOrder: number): ServiceDraftForm {
  return {
    id: '',
    isNew: true,
    name: '',
    category: 'manos',
    subcategory: 'Manos',
    description: '',
    pricingMode: 'single',
    pricePEN: 80,
    priceNote: '',
    priceOptions: [{ label: '1 sesión', pricePEN: 80 }],
    includes: [''],
    note: '',
    popular: false,
    active: true,
    durationMin: '60',
    displayOrder: nextOrder,
    mainImage: '',
    gallery: [],
  };
}

function formatServiceListPrice(service: CatalogService): string {
  if (service.priceOptions && service.priceOptions.length > 0) {
    let minPrice = service.priceOptions[0].pricePEN;
    let maxPrice = service.priceOptions[0].pricePEN;

    for (const opt of service.priceOptions) {
      if (opt.pricePEN < minPrice) minPrice = opt.pricePEN;

      if (opt.pricePEN > maxPrice) maxPrice = opt.pricePEN;
    }

    return minPrice === maxPrice ? `S/ ${minPrice}` : `S/ ${minPrice} – ${maxPrice}`;
  }

  if (service.priceNote) return service.priceNote;

  return (service.pricePEN ?? 0) > 0 ? `S/ ${service.pricePEN}` : 'Bajo pedido';
}

export function AdminCatalogManager({ actorEmail, onNotify }: AdminCatalogManagerProps) {
  const { allServices, saveService, toggleServiceActive } = useCatalog();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<ServiceCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');

  const [editingDraft, setEditingDraft] = useState<ServiceDraftForm | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [savingService, setSavingService] = useState<boolean>(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [urlInput, setUrlInput] = useState<string>('');
  const [uploadingPhotos, setUploadingPhotos] = useState<boolean>(false);
  const [uploadProgressLabel, setUploadProgressLabel] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list: CatalogService[] = [];

    for (const srv of allServices) {
      if (categoryFilter !== 'all' && srv.category !== categoryFilter) continue;

      const isActive = srv.active !== false;

      if (statusFilter === 'active' && !isActive) continue;

      if (statusFilter === 'paused' && isActive) continue;

      if (q) {
        const matches =
          srv.name.toLowerCase().includes(q) ||
          srv.subcategory.toLowerCase().includes(q) ||
          srv.id.toLowerCase().includes(q);

        if (!matches) continue;
      }

      list.push(srv);
    }

    return list;
  }, [allServices, searchQuery, categoryFilter, statusFilter]);

  const counts = useMemo(() => {
    let activeCount = 0;
    let pausedCount = 0;

    for (const s of allServices) {
      if (s.active !== false) {
        activeCount += 1;
      } else {
        pausedCount += 1;
      }
    }

    return { total: allServices.length, activeCount, pausedCount };
  }, [allServices]);

  const handleOpenEdit = (service: CatalogService) => {
    setFormError(null);
    setUrlInput('');
    setEditingDraft(buildDraftFromService(service));
  };

  const handleOpenNew = () => {
    setFormError(null);
    setUrlInput('');
    setEditingDraft(buildNewServiceDraft(allServices.length + 1));
  };

  const handleQuickToggleActive = async (service: CatalogService) => {
    const nextActive = service.active === false;

    setTogglingId(service.id);

    try {
      await toggleServiceActive(service, nextActive, actorEmail);
      onNotify(
        nextActive
          ? `"${service.name}" activado nuevamente en el catálogo web.`
          : `"${service.name}" pausado y ocultado de la web pública.`,
      );
    } catch {
      onNotify('No se pudo actualizar el estado del servicio.');
    } finally {
      setTogglingId(null);
    }
  };

  const appendImageRefsToDraft = (refs: string[]) => {
    setEditingDraft((prev) => {
      if (!prev || refs.length === 0) return prev;

      let nextMain = prev.mainImage;
      const nextGallery = [...prev.gallery];

      for (const ref of refs) {
        if (!nextMain) {
          nextMain = ref;
        } else if (nextGallery.length < MAX_GALLERY_COUNT && !nextGallery.includes(ref) && nextMain !== ref) {
          nextGallery.push(ref);
        }
      }

      return {
        ...prev,
        mainImage: nextMain,
        gallery: nextGallery,
      };
    });
  };

  const handleFileUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;

    if (!fileList || fileList.length === 0 || !editingDraft) return;

    const remainingSlots =
      (editingDraft.mainImage ? 0 : 1) + Math.max(0, MAX_GALLERY_COUNT - editingDraft.gallery.length);

    if (remainingSlots <= 0) {
      setFormError(`Ya alcanzaste el máximo de 1 foto principal y ${MAX_GALLERY_COUNT} en galería.`);
      e.target.value = '';

      return;
    }

    const filesToProcess = Array.from(fileList).slice(0, remainingSlots);

    const serviceIdHint =
      editingDraft.id || slugifyServiceId(editingDraft.name || 'nuevo', editingDraft.category);

    if (!editingDraft.id && editingDraft.isNew) {
      setEditingDraft((prev) => (prev ? { ...prev, id: serviceIdHint } : prev));
    }

    setUploadingPhotos(true);
    setFormError(null);

    const uploadedRefs: string[] = [];

    try {
      for (let i = 0; i < filesToProcess.length; i += 1) {
        const file = filesToProcess[i];

        setUploadProgressLabel(`Optimizando y subiendo foto ${i + 1} de ${filesToProcess.length}...`);

        const optimized = await optimizeCatalogImageFile(file);

        const mediaRef = await uploadCatalogMediaImage({
          serviceId: serviceIdHint,
          dataUrl: optimized.dataUrl,
          mimeType: optimized.mimeType,
          width: optimized.width,
          height: optimized.height,
          actorEmail,
        });

        uploadedRefs.push(mediaRef);
      }

      appendImageRefsToDraft(uploadedRefs);
      onNotify(
        uploadedRefs.length === 1
          ? 'Fotografía optimizada y subida correctamente.'
          : `${uploadedRefs.length} fotografías optimizadas y agregadas al servicio.`,
      );
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Ocurrió un error al optimizar o subir las imágenes.',
      );
    } finally {
      setUploadingPhotos(false);
      setUploadProgressLabel('');
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!editingDraft) return;

    const cleanUrl = urlInput.trim();

    if (!isValidCatalogImageRef(cleanUrl)) {
      setFormError('Ingresa una URL de imagen válida (https://...) o ruta de recurso del sitio.');

      return;
    }

    const remainingSlots =
      (editingDraft.mainImage ? 0 : 1) + Math.max(0, MAX_GALLERY_COUNT - editingDraft.gallery.length);

    if (remainingSlots <= 0) {
      setFormError(`Ya alcanzaste el límite máximo de ${MAX_GALLERY_COUNT} fotos en galería.`);

      return;
    }

    setFormError(null);
    appendImageRefsToDraft([cleanUrl]);
    setUrlInput('');
  };

  const handlePromoteToMain = (galleryIndex: number) => {
    setEditingDraft((prev) => {
      if (!prev) return prev;

      const target = prev.gallery[galleryIndex];

      if (!target) return prev;

      const nextGallery = [...prev.gallery];

      nextGallery.splice(galleryIndex, 1);

      if (prev.mainImage) {
        nextGallery.unshift(prev.mainImage);
      }

      return {
        ...prev,
        mainImage: target,
        gallery: nextGallery.slice(0, MAX_GALLERY_COUNT),
      };
    });
  };

  const handleMoveGalleryPhoto = (index: number, direction: -1 | 1) => {
    setEditingDraft((prev) => {
      if (!prev) return prev;

      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= prev.gallery.length) return prev;

      const nextGallery = [...prev.gallery];
      const temp = nextGallery[index];

      nextGallery[index] = nextGallery[targetIndex];
      nextGallery[targetIndex] = temp;

      return { ...prev, gallery: nextGallery };
    });
  };

  const handleRemoveMainPhoto = () => {
    setEditingDraft((prev) => {
      if (!prev) return prev;

      if (prev.gallery.length > 0) {
        const [first, ...rest] = prev.gallery;

        return {
          ...prev,
          mainImage: first,
          gallery: rest,
        };
      }

      return {
        ...prev,
        mainImage: '',
      };
    });
  };

  const handleRemoveGalleryPhoto = (index: number) => {
    setEditingDraft((prev) => {
      if (!prev) return prev;

      const nextGallery = prev.gallery.filter((_, idx) => idx !== index);

      return { ...prev, gallery: nextGallery };
    });
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingDraft) return;

    const cleanName = editingDraft.name.trim();
    const cleanDescription = editingDraft.description.trim();

    if (cleanName.length < 2) {
      setFormError('El título del servicio debe tener al menos 2 caracteres.');

      return;
    }

    if (cleanDescription.length < 5) {
      setFormError('La descripción debe tener al menos 5 caracteres.');

      return;
    }

    const finalId = editingDraft.id || slugifyServiceId(cleanName, editingDraft.category);

    const cleanIncludes: string[] = [];

    for (const item of editingDraft.includes) {
      const trimmed = item.trim();

      if (trimmed) cleanIncludes.push(trimmed);
    }

    let validPriceOptions: ServicePriceOption[] | undefined;

    if (editingDraft.pricingMode === 'variants') {
      const parsedOptions: ServicePriceOption[] = [];

      for (const opt of editingDraft.priceOptions) {
        const label = opt.label.trim();

        if (!label) continue;

        const pricePEN = Math.max(0, Math.round(Number(opt.pricePEN) || 0));

        if (opt.sessions && opt.sessions > 0) {
          parsedOptions.push({ label, pricePEN, sessions: Math.round(opt.sessions) });
        } else {
          parsedOptions.push({ label, pricePEN });
        }
      }

      if (parsedOptions.length === 0) {
        setFormError('Agrega al menos una opción de tarifa válida o cambia a precio único.');

        return;
      }

      validPriceOptions = parsedOptions;
    }

    const parsedDuration = Number(editingDraft.durationMin);

    const serviceToSave: CatalogService = {
      id: finalId,
      name: cleanName,
      category: editingDraft.category,
      categoryLabel: getCategoryLabelForKey(editingDraft.category),
      subcategory: editingDraft.subcategory.trim() || getCategoryLabelForKey(editingDraft.category),
      description: cleanDescription,
      includes: cleanIncludes,
      active: editingDraft.active,
      popular: editingDraft.popular,
      displayOrder: Math.max(0, Math.round(Number(editingDraft.displayOrder) || 100)),
    };

    if (validPriceOptions) {
      serviceToSave.priceOptions = validPriceOptions;
    } else {
      serviceToSave.pricePEN = Math.max(0, Math.round(Number(editingDraft.pricePEN) || 0));
    }

    if (editingDraft.priceNote.trim()) {
      serviceToSave.priceNote = editingDraft.priceNote.trim();
    }

    if (editingDraft.note.trim()) {
      serviceToSave.note = editingDraft.note.trim();
    }

    if (editingDraft.mainImage.trim()) {
      serviceToSave.image = editingDraft.mainImage.trim();
    }

    if (editingDraft.gallery.length > 0) {
      serviceToSave.gallery = editingDraft.gallery.slice(0, MAX_GALLERY_COUNT);
    }

    if (Number.isFinite(parsedDuration) && parsedDuration >= 15 && parsedDuration <= 360) {
      serviceToSave.durationMin = Math.round(parsedDuration);
    }

    setSavingService(true);
    setFormError(null);

    try {
      await saveService(serviceToSave, actorEmail);
      onNotify(`Servicio "${serviceToSave.name}" guardado y publicado correctamente.`);
      setEditingDraft(null);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar el servicio. Verifica tu conexión o permisos.',
      );
    } finally {
      setSavingService(false);
    }
  };

  if (editingDraft) {
    return (
      <form onSubmit={(e) => void handleSaveDraft(e)} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#5E765E]/20 shadow-xs space-y-6">
          {/* Editor Top Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#5E765E]/15 pb-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEditingDraft(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EDF2EC] hover:bg-[#5E765E] hover:text-white text-[#5E765E] text-xs font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al inventario</span>
              </button>
              <div>
                <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111]">
                  {editingDraft.isNew ? 'Crear Nuevo Servicio' : `Editar: ${editingDraft.name}`}
                </h2>
                <p className="text-[11px] text-[#111111]/60 font-mono">
                  {editingDraft.id ? `ID: ${editingDraft.id}` : 'El identificador se generará automáticamente al guardar'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {!editingDraft.isNew && editingDraft.active && (
                <Link
                  to={`/catalogo/${editingDraft.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#5E765E]/25 bg-white hover:bg-[#EDF2EC] text-[#5E765E] text-xs font-semibold"
                >
                  <span>Ver ficha en web</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
              <button
                type="submit"
                disabled={savingService || uploadingPhotos}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5E765E] hover:bg-[#4d634d] disabled:opacity-60 text-[#FFF2DE] text-xs font-semibold cursor-pointer shadow-xs"
              >
                {savingService ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[#D5A688]" />}
                <span>{savingService ? 'Guardando...' : 'Guardar Servicio'}</span>
              </button>
            </div>
          </div>

          {formError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Core Identity & Visibility */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <div>
                <label htmlFor="cms-service-name" className="block text-xs font-semibold text-[#111111] mb-1">
                  Título del servicio *
                </label>
                <input
                  id="cms-service-name"
                  type="text"
                  required
                  maxLength={120}
                  value={editingDraft.name}
                  onChange={(e) => setEditingDraft((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                  placeholder="Ej. Esmalte Gel Clásico con Nivelación"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#5E765E]/25 text-xs bg-white focus:outline-none focus:border-[#5E765E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cms-service-category" className="block text-xs font-semibold text-[#111111] mb-1">
                    Categoría *
                  </label>
                  <select
                    id="cms-service-category"
                    value={editingDraft.category}
                    onChange={(e) => {
                      const val = e.target.value;
                      const validCat = SERVICE_CATEGORY_OPTIONS.find((c) => c.id === val)?.id || 'manos';

                      setEditingDraft((prev) => (prev ? { ...prev, category: validCat } : prev));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#5E765E]/25 text-xs bg-white focus:outline-none focus:border-[#5E765E]"
                  >
                    {SERVICE_CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="cms-service-subcategory" className="block text-xs font-semibold text-[#111111] mb-1">
                    Subcategoría / Línea *
                  </label>
                  <input
                    id="cms-service-subcategory"
                    type="text"
                    required
                    maxLength={100}
                    value={editingDraft.subcategory}
                    onChange={(e) =>
                      setEditingDraft((prev) => (prev ? { ...prev, subcategory: e.target.value } : prev))
                    }
                    placeholder="Ej. Manos Básico"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#5E765E]/25 text-xs bg-white focus:outline-none focus:border-[#5E765E]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cms-service-desc" className="block text-xs font-semibold text-[#111111] mb-1">
                  Descripción editorial para la web y ficha detallada *
                </label>
                <textarea
                  id="cms-service-desc"
                  rows={4}
                  required
                  maxLength={1200}
                  value={editingDraft.description}
                  onChange={(e) =>
                    setEditingDraft((prev) => (prev ? { ...prev, description: e.target.value } : prev))
                  }
                  placeholder="Describe los beneficios, técnica, materiales e impresión final del tratamiento..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#5E765E]/25 text-xs bg-white focus:outline-none focus:border-[#5E765E]"
                />
              </div>
            </div>

            {/* Sidebar Switches & Logistics */}
            <div className="lg:col-span-4 space-y-4 p-5 rounded-2xl bg-[#EDF2EC]/55 border border-[#5E765E]/15">
              <span className="block text-xs font-bold uppercase tracking-wider text-[#5E765E]">
                Visibilidad &amp; Orden
              </span>

              <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#5E765E]/15 cursor-pointer">
                <span className="text-xs font-semibold text-[#111111]">Visible en catálogo web</span>
                <input
                  type="checkbox"
                  checked={editingDraft.active}
                  onChange={(e) =>
                    setEditingDraft((prev) => (prev ? { ...prev, active: e.target.checked } : prev))
                  }
                  className="w-4 h-4 accent-[#5E765E]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#5E765E]/15 cursor-pointer">
                <span className="text-xs font-semibold text-[#111111] flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-[#D5A688]" />
                  <span>Destacado (Popular)</span>
                </span>
                <input
                  type="checkbox"
                  checked={editingDraft.popular}
                  onChange={(e) =>
                    setEditingDraft((prev) => (prev ? { ...prev, popular: e.target.checked } : prev))
                  }
                  className="w-4 h-4 accent-[#5E765E]"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cms-service-duration" className="block text-[11px] font-semibold mb-1">
                    Duración (min)
                  </label>
                  <input
                    id="cms-service-duration"
                    type="number"
                    min={15}
                    max={360}
                    placeholder="60"
                    value={editingDraft.durationMin}
                    onChange={(e) =>
                      setEditingDraft((prev) => (prev ? { ...prev, durationMin: e.target.value } : prev))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#5E765E]/25 text-xs bg-white tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="cms-service-order" className="block text-[11px] font-semibold mb-1">
                    Orden visual
                  </label>
                  <input
                    id="cms-service-order"
                    type="number"
                    min={0}
                    max={10000}
                    value={editingDraft.displayOrder}
                    onChange={(e) =>
                      setEditingDraft((prev) =>
                        prev ? { ...prev, displayOrder: Number(e.target.value) || 0 } : prev,
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#5E765E]/25 text-xs bg-white tabular-nums"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Variants */}
          <div className="border-t border-[#5E765E]/15 pt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-['Cormorant_Garamond',serif] text-xl font-bold text-[#111111]">
                  Tarifa y Opciones de Precio
                </h3>
                <p className="text-xs text-[#111111]/65">
                  Elige precio único en soles o configura variantes por zona, duración o paquetes.
                </p>
              </div>

              <div className="inline-flex rounded-xl p-1 bg-[#EDF2EC] border border-[#5E765E]/15">
                <button
                  type="button"
                  onClick={() =>
                    setEditingDraft((prev) => (prev ? { ...prev, pricingMode: 'single' } : prev))
                  }
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    editingDraft.pricingMode === 'single'
                      ? 'bg-[#5E765E] text-white'
                      : 'text-[#111111]/75 hover:text-[#111111]'
                  }`}
                >
                  Precio único
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setEditingDraft((prev) => (prev ? { ...prev, pricingMode: 'variants' } : prev))
                  }
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    editingDraft.pricingMode === 'variants'
                      ? 'bg-[#5E765E] text-white'
                      : 'text-[#111111]/75 hover:text-[#111111]'
                  }`}
                >
                  Con variantes / duraciones
                </button>
              </div>
            </div>

            {editingDraft.pricingMode === 'single' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cms-single-price" className="block text-xs font-semibold mb-1">
                    Precio en Soles (PEN)
                  </label>
                  <input
                    id="cms-single-price"
                    type="number"
                    min={0}
                    max={20000}
                    value={editingDraft.pricePEN}
                    onChange={(e) =>
                      setEditingDraft((prev) =>
                        prev ? { ...prev, pricePEN: Math.max(0, Number(e.target.value) || 0) } : prev,
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#5E765E]/25 text-xs bg-white tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="cms-price-note" className="block text-xs font-semibold mb-1">
                    Etiqueta alternativa (opcional, ej. &quot;Bajo pedido&quot;)
                  </label>
                  <input
                    id="cms-price-note"
                    type="text"
                    maxLength={80}
                    value={editingDraft.priceNote}
                    onChange={(e) =>
                      setEditingDraft((prev) => (prev ? { ...prev, priceNote: e.target.value } : prev))
                    }
                    placeholder="Déjalo vacío para mostrar S/ precio"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#5E765E]/25 text-xs bg-white"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {editingDraft.priceOptions.map((opt, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                    <div className="sm:col-span-6">
                      <input
                        type="text"
                        aria-label={`Etiqueta variante ${idx + 1}`}
                        maxLength={100}
                        placeholder="Ej. 60 minutos / 5 sesiones"
                        value={opt.label}
                        onChange={(e) =>
                          setEditingDraft((prev) => {
                            if (!prev) return prev;

                            const next = prev.priceOptions.map((item, i) =>
                              i === idx ? { ...item, label: e.target.value } : item,
                            );

                            return { ...prev, priceOptions: next };
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#5E765E]/25 text-xs bg-white"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="number"
                        aria-label={`Precio soles variante ${idx + 1}`}
                        min={0}
                        max={20000}
                        placeholder="S/"
                        value={opt.pricePEN}
                        onChange={(e) =>
                          setEditingDraft((prev) => {
                            if (!prev) return prev;

                            const next = prev.priceOptions.map((item, i) =>
                              i === idx
                                ? { ...item, pricePEN: Math.max(0, Number(e.target.value) || 0) }
                                : item,
                            );

                            return { ...prev, priceOptions: next };
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#5E765E]/25 text-xs bg-white tabular-nums"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        aria-label={`Sesiones variante ${idx + 1}`}
                        min={0}
                        max={50}
                        placeholder="Sesiones (opc.)"
                        value={opt.sessions ?? ''}
                        onChange={(e) =>
                          setEditingDraft((prev) => {
                            if (!prev) return prev;

                            const val = Number(e.target.value);

                            const next = prev.priceOptions.map((item, i) => {
                              if (i !== idx) return item;

                              if (val > 0) {
                                return { label: item.label, pricePEN: item.pricePEN, sessions: val };
                              }

                              return { label: item.label, pricePEN: item.pricePEN };
                            });

                            return { ...prev, priceOptions: next };
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#5E765E]/25 text-xs bg-white tabular-nums"
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        disabled={editingDraft.priceOptions.length <= 1}
                        onClick={() =>
                          setEditingDraft((prev) => {
                            if (!prev || prev.priceOptions.length <= 1) return prev;

                            return {
                              ...prev,
                              priceOptions: prev.priceOptions.filter((_, i) => i !== idx),
                            };
                          })
                        }
                        aria-label="Eliminar variante"
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {editingDraft.priceOptions.length < 12 && (
                  <button
                    type="button"
                    onClick={() =>
                      setEditingDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              priceOptions: [...prev.priceOptions, { label: '', pricePEN: 100 }],
                            }
                          : prev,
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EDF2EC] hover:bg-[#5E765E] hover:text-white text-[#5E765E] text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar opción de tarifa</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Media Studio (1 Main + up to 10 Gallery photos) */}
          <div className="border-t border-[#5E765E]/15 pt-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-['Cormorant_Garamond',serif] text-xl font-bold text-[#111111]">
                  Fotografías del Servicio (1 Principal + hasta 10 en Galería)
                </h3>
                <p className="text-xs text-[#111111]/65">
                  Sube fotos desde tu computadora o celular (se optimizan automáticamente) o pega un enlace URL.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#5E765E] tabular-nums">
                Principal: {editingDraft.mainImage ? '1/1' : '0/1'} · Galería: {editingDraft.gallery.length}/{MAX_GALLERY_COUNT}
              </span>
            </div>

            {/* Dual Upload Controls: Local Device Upload + URL Input */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 rounded-2xl bg-[#EDF2EC]/65 border border-[#5E765E]/15">
              <div className="lg:col-span-5 flex flex-col justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => void handleFileUploadChange(e)}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingPhotos}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#5E765E] hover:bg-[#4d634d] disabled:opacity-60 text-[#FFF2DE] text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {uploadingPhotos ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 text-[#D5A688]" />
                  )}
                  <span>
                    {uploadingPhotos ? uploadProgressLabel || 'Subiendo...' : 'Subir fotos desde PC o celular'}
                  </span>
                </button>
              </div>

              <div className="lg:col-span-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Link2 className="w-4 h-4 text-[#5E765E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    aria-label="Enlace URL de fotografía"
                    placeholder="O pega un enlace URL (https://... o /assets/...)"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#5E765E]/25 text-xs bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FFF2DE] border border-[#5E765E]/30 text-[#5E765E] text-xs font-semibold cursor-pointer shrink-0"
                >
                  <ImagePlus className="w-4 h-4" />
                  <span>Agregar URL</span>
                </button>
              </div>
            </div>

            {/* Main Photo Preview + Gallery Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Main Cover Photo */}
              <div className="lg:col-span-4 space-y-2">
                <span className="block text-xs font-bold text-[#5E765E] uppercase tracking-wider">
                  Foto Principal (Portada)
                </span>
                {editingDraft.mainImage ? (
                  <div className="rounded-2xl overflow-hidden border border-[#5E765E]/25 bg-white shadow-xs">
                    <div className="aspect-[4/3] w-full bg-[#EDF2EC]">
                      <CatalogImage
                        src={editingDraft.mainImage}
                        alt="Imagen principal del servicio"
                        loading="eager"
                        containerClassName="w-full h-full"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2.5 flex items-center justify-between gap-2 bg-[#FFFDF9] border-t border-[#5E765E]/15">
                      <span className="text-[11px] font-medium text-[#5E765E] truncate">
                        Portada activa
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveMainPhoto}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Quitar</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[4/3] rounded-2xl border-2 border-dashed border-[#5E765E]/25 bg-[#EDF2EC]/40 flex flex-col items-center justify-center p-6 text-center text-xs text-[#111111]/60">
                    <ImagePlus className="w-7 h-7 text-[#5E765E]/45 mb-2" />
                    <span>Aún sin foto principal. Sube una imagen o agrega un enlace URL.</span>
                  </div>
                )}
              </div>

              {/* Gallery up to 10 photos */}
              <div className="lg:col-span-8 space-y-2">
                <span className="block text-xs font-bold text-[#5E765E] uppercase tracking-wider">
                  Galería adicional ({editingDraft.gallery.length} de {MAX_GALLERY_COUNT})
                </span>

                {editingDraft.gallery.length === 0 ? (
                  <div className="min-h-[180px] rounded-2xl border border-dashed border-[#5E765E]/20 bg-[#FFFDF9] flex flex-col items-center justify-center p-6 text-center text-xs text-[#111111]/60">
                    <span>
                      Puedes sumar hasta 10 fotografías adicionales para mostrar ángulos, acabados y ejemplos reales en la ficha del servicio.
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {editingDraft.gallery.map((imgUrl, idx) => (
                      <div
                        key={`${imgUrl}-${idx}`}
                        className="rounded-xl overflow-hidden border border-[#5E765E]/20 bg-white flex flex-col"
                      >
                        <div className="aspect-[4/3] w-full bg-[#EDF2EC]">
                          <CatalogImage
                            src={imgUrl}
                            alt={`Galería ${idx + 1}`}
                            loading="lazy"
                            containerClassName="w-full h-full"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-1.5 flex items-center justify-between gap-1 border-t border-[#5E765E]/10 bg-[#FFFDF9]">
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveGalleryPhoto(idx, -1)}
                              aria-label="Mover foto a la izquierda"
                              className="p-1.5 rounded hover:bg-[#EDF2EC] disabled:opacity-25 text-[#111111] cursor-pointer"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === editingDraft.gallery.length - 1}
                              onClick={() => handleMoveGalleryPhoto(idx, 1)}
                              aria-label="Mover foto a la derecha"
                              className="p-1.5 rounded hover:bg-[#EDF2EC] disabled:opacity-25 text-[#111111] cursor-pointer"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handlePromoteToMain(idx)}
                            title="Usar como foto principal"
                            className="px-2 py-1 rounded text-[10px] font-semibold text-[#5E765E] hover:bg-[#EDF2EC] cursor-pointer"
                          >
                            Principal
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryPhoto(idx)}
                            aria-label={`Quitar foto ${idx + 1} de galería`}
                            className="p-1.5 rounded text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Includes List & Important Note */}
          <div className="border-t border-[#5E765E]/15 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5E765E]">
                ¿Qué incluye este servicio?
              </label>

              {editingDraft.includes.map((inc, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5E765E] shrink-0" />
                  <input
                    type="text"
                    maxLength={240}
                    aria-label={`Detalle incluido ${idx + 1}`}
                    value={inc}
                    placeholder="Ej. Manicura completa preparatoria con aceite de cutículas"
                    onChange={(e) =>
                      setEditingDraft((prev) => {
                        if (!prev) return prev;

                        const next = prev.includes.map((item, i) => (i === idx ? e.target.value : item));

                        return { ...prev, includes: next };
                      })
                    }
                    className="flex-1 px-3 py-2 rounded-xl border border-[#5E765E]/25 text-xs bg-white"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setEditingDraft((prev) => {
                        if (!prev) return prev;

                        const next = prev.includes.filter((_, i) => i !== idx);

                        return { ...prev, includes: next.length > 0 ? next : [''] };
                      })
                    }
                    aria-label="Eliminar línea"
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {editingDraft.includes.length < 20 && (
                <button
                  type="button"
                  onClick={() =>
                    setEditingDraft((prev) =>
                      prev ? { ...prev, includes: [...prev.includes, ''] } : prev,
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EDF2EC] hover:bg-[#5E765E] hover:text-white text-[#5E765E] text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar punto incluido</span>
                </button>
              )}
            </div>

            <div className="lg:col-span-5 space-y-2">
              <label htmlFor="cms-service-note" className="block text-xs font-bold uppercase tracking-wider text-[#5E765E]">
                Nota o recomendación especial (opcional)
              </label>
              <textarea
                id="cms-service-note"
                rows={4}
                maxLength={600}
                value={editingDraft.note}
                onChange={(e) =>
                  setEditingDraft((prev) => (prev ? { ...prev, note: e.target.value } : prev))
                }
                placeholder="Ej. El mantenimiento tiene el mismo coste que la puesta inicial o requiere coordinación por WhatsApp..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#5E765E]/25 text-xs bg-white"
              />
            </div>
          </div>

          {/* Bottom Editor Actions */}
          <div className="border-t border-[#5E765E]/15 pt-5 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditingDraft(null)}
              className="px-5 py-2.5 rounded-xl border border-[#5E765E]/25 bg-white hover:bg-[#EDF2EC] text-xs font-semibold text-[#111111] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingService || uploadingPhotos}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#5E765E] hover:bg-[#4d634d] disabled:opacity-60 text-[#FFF2DE] text-xs font-semibold cursor-pointer shadow-xs"
            >
              {savingService ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[#D5A688]" />}
              <span>{savingService ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#5E765E]/20 shadow-xs space-y-6">
        {/* Inventory Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#111111]">
              Gestor de Catálogo y Tienda de Servicios
            </h2>
            <p className="text-xs text-[#111111]/65 mt-0.5 tabular-nums">
              {counts.total} servicios registrados · {counts.activeCount} activos en web · {counts.pausedCount} pausados
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] text-xs font-semibold cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#D5A688]" />
            <span>Nuevo Servicio</span>
          </button>
        </div>

        {/* Search & Filters Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pt-2 border-t border-[#5E765E]/15">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#5E765E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Buscar servicio por título o subcategoría"
              placeholder="Buscar servicio por nombre, subcategoría o ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#5E765E]/25 text-xs bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filtrar por categoría"
              value={categoryFilter}
              onChange={(e) => {
                const val = e.target.value;

                if (val === 'all') {
                  setCategoryFilter('all');

                  return;
                }

                const match = SERVICE_CATEGORY_OPTIONS.find((c) => c.id === val);

                setCategoryFilter(match ? match.id : 'all');
              }}
              className="px-3 py-2 rounded-xl border border-[#5E765E]/25 text-xs bg-white"
            >
              <option value="all">Todas las categorías</option>
              {SERVICE_CATEGORY_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            <div className="inline-flex rounded-xl p-1 bg-[#EDF2EC] border border-[#5E765E]/15">
              {(['all', 'active', 'paused'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#5E765E] text-white'
                      : 'text-[#111111]/75 hover:text-[#111111]'
                  }`}
                >
                  {st === 'all' ? 'Todos' : st === 'active' ? 'Activos' : 'Pausados'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Service Inventory Rows */}
        {filteredServices.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-[#5E765E]/20 rounded-2xl text-xs text-[#111111]/65 space-y-3">
            <Sparkles className="w-8 h-8 text-[#D5A688] mx-auto" />
            <p>No encontramos servicios con los filtros actuales.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#5E765E]/15 border border-[#5E765E]/15 rounded-2xl overflow-hidden">
            {filteredServices.map((srv) => {
              const isActive = srv.active !== false;
              const photoCount = collectServiceGalleryImages(srv).length;
              const isToggling = togglingId === srv.id;

              return (
                <div
                  key={srv.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isActive ? 'bg-white hover:bg-[#FFFDF9]' : 'bg-[#F7F7F6] opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-18 h-14 rounded-xl overflow-hidden border border-[#5E765E]/15 shrink-0 bg-[#EDF2EC]">
                      <CatalogImage
                        src={srv.image}
                        alt={srv.name}
                        loading="lazy"
                        containerClassName="w-full h-full"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#5E765E]">
                        <span className="font-semibold uppercase tracking-wider">{srv.categoryLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#111111]/65">{srv.subcategory}</span>
                        {!isActive && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-amber-700">Pausado</span>
                          </>
                        )}
                      </div>
                      <h3 className="font-['Cormorant_Garamond',serif] text-xl font-bold text-[#111111] truncate">
                        {srv.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#111111]/70 tabular-nums">
                        <span className="font-bold text-[#5E765E]">{formatServiceListPrice(srv)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{photoCount} {photoCount === 1 ? 'foto' : 'fotos'}</span>
                        {srv.durationMin && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{srv.durationMin} min</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {isActive && (
                      <Link
                        to={`/catalogo/${srv.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#5E765E]/20 bg-white hover:bg-[#EDF2EC] text-xs font-semibold text-[#5E765E]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ver ficha</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      disabled={isToggling}
                      onClick={() => void handleQuickToggleActive(srv)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                        isActive
                          ? 'border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-amber-800'
                          : 'border-[#5E765E]/30 bg-[#EDF2EC] hover:bg-[#5E765E] hover:text-white text-[#5E765E]'
                      }`}
                    >
                      {isToggling ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isActive ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                      <span>{isActive ? 'Pausar' : 'Activar'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(srv)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5E765E] hover:bg-[#4d634d] text-[#FFF2DE] text-xs font-semibold cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#D5A688]" />
                      <span>Editar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
