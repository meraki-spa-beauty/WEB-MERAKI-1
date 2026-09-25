/**
 * Meta (Facebook) Pixel helper for Meraki Spa & Beauty
 * Pixel ID: 1062483066695765
 */

declare global {
  interface Window {
    fbq?: (
      action: 'track' | 'trackCustom' | 'init',
      eventName: string,
      params?: Record<string, string | number | boolean | null | undefined>
    ) => void;
    _fbq?: unknown;
  }
}

export interface SpaLeadParams {
  content_name: string;
  content_category: 'Cita Spa' | 'Workshop Presencial' | 'Consulta General';
  value?: number;
  currency?: 'PEN' | 'USD';
}

function getSafeFbq(): Window['fbq'] | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (typeof window.fbq === 'undefined') {
    return null;
  }

  return window.fbq;
}

/**
 * Registra una vista de página en el Pixel de Meta
 */
export function trackMetaPageView(): void {
  const fbq = getSafeFbq();

  if (fbq) {
    fbq('track', 'PageView');
  }
}

/**
 * Registra un Lead al completar el formulario y proceder a WhatsApp
 */
export function trackMetaLead(params: SpaLeadParams): void {
  const fbq = getSafeFbq();

  if (fbq) {
    fbq('track', 'Lead', {
      content_name: params.content_name,
      content_category: params.content_category,
      value: params.value ?? 0,
      currency: params.currency ?? 'PEN',
    });
  }
}

/**
 * Registra el evento Schedule para reservas de citas de Spa
 */
export function trackMetaSchedule(params: {
  content_name: string;
  value?: number;
  currency?: 'PEN';
}): void {
  const fbq = getSafeFbq();

  if (fbq) {
    fbq('track', 'Schedule', {
      content_name: params.content_name,
      value: params.value ?? 0,
      currency: params.currency ?? 'PEN',
    });
  }
}

/**
 * Registra el evento CompleteRegistration para el Workshop
 */
export function trackMetaCompleteRegistration(params: {
  content_name: string;
  value?: number;
  currency?: 'PEN';
}): void {
  const fbq = getSafeFbq();

  if (fbq) {
    fbq('track', 'CompleteRegistration', {
      content_name: params.content_name,
      value: params.value ?? 139,
      currency: params.currency ?? 'PEN',
    });
  }
}

/**
 * Registra el evento Contact para clics generales en WhatsApp o teléfono
 */
export function trackMetaContact(params?: {
  content_name?: string;
}): void {
  const fbq = getSafeFbq();

  if (fbq) {
    fbq('track', 'Contact', {
      content_name: params?.content_name ?? 'WhatsApp Meraki',
    });
  }
}
