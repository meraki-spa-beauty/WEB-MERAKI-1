/**
 * TikTok Pixel helper for Meraki Spa & Beauty
 * Pixel ID: DARK4RRC77U5PB60AB4G
 */

export type TikTokTrackEvent =
  | 'PageView'
  | 'SubmitForm'
  | 'CompleteRegistration'
  | 'Contact'
  | 'ViewContent';

export interface TikTokPixelInstance {
  track: (
    eventName: TikTokTrackEvent,
    params?: Record<string, string | number | boolean | null | undefined>
  ) => void;
  page: () => void;
}

declare global {
  interface Window {
    ttq?: TikTokPixelInstance;
  }
}

export interface TikTokEventParams {
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: 'PEN' | 'USD';
}

function getSafeTtq(): TikTokPixelInstance | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (typeof window.ttq === 'undefined') {
    return null;
  }

  return window.ttq;
}

/**
 * Registra una vista de página en el Pixel de TikTok
 */
export function trackTikTokPageView(): void {
  const ttq = getSafeTtq();

  if (ttq) {
    ttq.page();
  }
}

/**
 * Registra el envío de formulario o solicitud de cupo / cita (SubmitForm)
 */
export function trackTikTokSubmitForm(params: TikTokEventParams): void {
  const ttq = getSafeTtq();

  if (ttq) {
    ttq.track('SubmitForm', {
      content_name: params.content_name,
      content_category: params.content_category,
      value: params.value ?? 0,
      currency: params.currency ?? 'PEN',
    });
  }
}

/**
 * Registra el evento CompleteRegistration para el Workshop o reserva completada
 */
export function trackTikTokCompleteRegistration(params: TikTokEventParams): void {
  const ttq = getSafeTtq();

  if (ttq) {
    ttq.track('CompleteRegistration', {
      content_name: params.content_name,
      content_category: params.content_category,
      value: params.value ?? 180,
      currency: params.currency ?? 'PEN',
    });
  }
}

/**
 * Registra el evento Contact para clics en WhatsApp o canales directos
 */
export function trackTikTokContact(params?: {
  content_name?: string;
}): void {
  const ttq = getSafeTtq();

  if (ttq) {
    ttq.track('Contact', {
      content_name: params?.content_name ?? 'WhatsApp Meraki',
    });
  }
}
