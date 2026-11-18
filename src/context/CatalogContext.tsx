import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CatalogService, ServiceCategory } from '../types';
import { CATALOG_SERVICES, CATEGORIES_DATA } from '../data/catalog';
import {
  fetchCatalogServicesFromFirestore,
  saveCatalogServiceToFirestore,
} from '../services/merakiFirestore';

export interface CatalogCategorySummary {
  id: ServiceCategory | 'todos';
  label: string;
  count: number;
  description: string;
}

interface CatalogContextValue {
  allServices: CatalogService[];
  activeServices: CatalogService[];
  categories: CatalogCategorySummary[];
  loadingCatalog: boolean;
  refreshCatalog: () => Promise<void>;
  upsertServiceInState: (saved: CatalogService) => void;
  saveService: (service: CatalogService, actorEmail: string) => Promise<CatalogService>;
  toggleServiceActive: (service: CatalogService, active: boolean, actorEmail: string) => Promise<CatalogService>;
  getServiceById: (serviceId: string) => CatalogService | undefined;
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);

function mergeCatalogWithOverrides(overrides: CatalogService[]): CatalogService[] {
  const overrideById = new Map<string, CatalogService>();

  for (const ov of overrides) {
    overrideById.set(ov.id, ov);
  }

  const merged: CatalogService[] = [];
  const consumedIds = new Set<string>();

  for (let i = 0; i < CATALOG_SERVICES.length; i += 1) {
    const base = CATALOG_SERVICES[i];
    const override = overrideById.get(base.id);

    consumedIds.add(base.id);

    if (override) {
      merged.push({
        ...base,
        ...override,
        active: override.active !== false,
        displayOrder: override.displayOrder ?? i + 1,
      });
    } else {
      merged.push({
        ...base,
        active: true,
        displayOrder: i + 1,
      });
    }
  }

  const customServices: CatalogService[] = [];

  for (const ov of overrides) {
    if (!consumedIds.has(ov.id)) {
      customServices.push({
        ...ov,
        active: ov.active !== false,
      });
    }
  }

  customServices.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));

  const combined = [...merged, ...customServices];

  combined.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));

  return combined;
}

export function collectServiceGalleryImages(service: CatalogService): string[] {
  const seen = new Set<string>();
  const images: string[] = [];

  if (service.image && service.image.trim()) {
    const cleanMain = service.image.trim();

    seen.add(cleanMain);
    images.push(cleanMain);
  }

  if (service.gallery && service.gallery.length > 0) {
    for (const url of service.gallery) {
      const cleanUrl = url.trim();

      if (cleanUrl && !seen.has(cleanUrl)) {
        seen.add(cleanUrl);
        images.push(cleanUrl);
      }
    }
  }

  return images;
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [cloudOverrides, setCloudOverrides] = useState<CatalogService[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState<boolean>(true);

  const refreshCatalog = useCallback(async () => {
    setLoadingCatalog(true);

    try {
      const list = await fetchCatalogServicesFromFirestore();

      setCloudOverrides(list);
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  const upsertServiceInState = useCallback((saved: CatalogService) => {
    setCloudOverrides((prev) => {
      const next: CatalogService[] = [];
      let replaced = false;

      for (const item of prev) {
        if (item.id === saved.id) {
          next.push(saved);
          replaced = true;
        } else {
          next.push(item);
        }
      }

      if (!replaced) {
        next.push(saved);
      }

      return next;
    });
  }, []);

  const saveService = useCallback(
    async (service: CatalogService, actorEmail: string): Promise<CatalogService> => {
      const saved = await saveCatalogServiceToFirestore(service, actorEmail);

      upsertServiceInState(saved);

      return saved;
    },
    [upsertServiceInState],
  );

  const toggleServiceActive = useCallback(
    async (service: CatalogService, active: boolean, actorEmail: string): Promise<CatalogService> => {
      const saved = await saveCatalogServiceToFirestore(
        {
          ...service,
          active,
        },
        actorEmail,
      );

      upsertServiceInState(saved);

      return saved;
    },
    [upsertServiceInState],
  );

  const allServices = useMemo(
    () => mergeCatalogWithOverrides(cloudOverrides),
    [cloudOverrides],
  );

  const activeServices = useMemo(() => {
    const list: CatalogService[] = [];

    for (const s of allServices) {
      if (s.active !== false) {
        list.push(s);
      }
    }

    return list;
  }, [allServices]);

  const categories = useMemo<CatalogCategorySummary[]>(() => {
    const counts = new Map<ServiceCategory, number>();

    for (const srv of activeServices) {
      counts.set(srv.category, (counts.get(srv.category) ?? 0) + 1);
    }

    const result: CatalogCategorySummary[] = [];

    for (const cat of CATEGORIES_DATA) {
      if (cat.id === 'todos') {
        result.push({
          ...cat,
          count: activeServices.length,
        });
      } else {
        result.push({
          ...cat,
          count: counts.get(cat.id) ?? 0,
        });
      }
    }

    return result;
  }, [activeServices]);

  const getServiceById = useCallback(
    (serviceId: string): CatalogService | undefined => {
      for (const s of allServices) {
        if (s.id === serviceId) return s;
      }

      return undefined;
    },
    [allServices],
  );

  const value = useMemo<CatalogContextValue>(
    () => ({
      allServices,
      activeServices,
      categories,
      loadingCatalog,
      refreshCatalog,
      upsertServiceInState,
      saveService,
      toggleServiceActive,
      getServiceById,
    }),
    [
      allServices,
      activeServices,
      categories,
      loadingCatalog,
      refreshCatalog,
      upsertServiceInState,
      saveService,
      toggleServiceActive,
      getServiceById,
    ],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);

  if (!ctx) {
    throw new Error('useCatalog must be used inside a CatalogProvider.');
  }

  return ctx;
}
