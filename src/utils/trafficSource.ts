/**
 * Traffic source and ad campaign attribution tracker for Meraki Spa & Beauty
 * Detects whether the visitor arrived via Meta Ads (FB/Instagram), TikTok Ads,
 * Google Ads, organic social video (Reels, TikTok, etc.), or direct traffic.
 */

export interface TrafficSourceData {
  tipo: string;
  campana: string;
  contenido_video: string;
  fuente: string;
  medio: string;
  click_id: string;
  landing_page: string;
  resumen_origen: string;
  timestamp: string;
}

const STORAGE_KEY = 'meraki_lead_traffic_origin';

function parseUrlParams(): URLSearchParams | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return new URLSearchParams(window.location.search);
  } catch {
    return null;
  }
}

function classifyTraffic(
  params: URLSearchParams | null,
  referrer: string,
  currentUrl: string
): TrafficSourceData {
  const utmSource = params?.get('utm_source')?.trim() || '';
  const utmMedium = params?.get('utm_medium')?.trim() || '';
  const utmCampaign = params?.get('utm_campaign')?.trim() || '';
  const utmContent = params?.get('utm_content')?.trim() || '';
  const utmTerm = params?.get('utm_term')?.trim() || '';

  const fbclid = params?.get('fbclid')?.trim() || '';
  const ttclid = params?.get('ttclid')?.trim() || '';
  const gclid = params?.get('gclid')?.trim() || '';

  const refLower = referrer.toLowerCase();
  const srcLower = utmSource.toLowerCase();
  const medLower = utmMedium.toLowerCase();

  let tipo = 'Tráfico Directo / Orgánico';
  let clickId = '';

  if (fbclid || srcLower.includes('facebook') || srcLower.includes('instagram') || srcLower.includes('meta')) {
    if (fbclid || medLower.includes('cpc') || medLower.includes('ad') || medLower.includes('paid')) {
      tipo = 'Publicidad Meta Ads (Instagram / Facebook)';
      clickId = fbclid;
    } else {
      tipo = srcLower.includes('instagram') ? 'Instagram (Enlace / Perfil)' : 'Facebook (Publicación / Enlace)';
    }
  } else if (ttclid || srcLower.includes('tiktok')) {
    if (ttclid || medLower.includes('cpc') || medLower.includes('ad') || medLower.includes('paid')) {
      tipo = 'Publicidad TikTok Ads';
      clickId = ttclid;
    } else {
      tipo = 'TikTok (Video / Perfil)';
    }
  } else if (gclid || srcLower.includes('google')) {
    if (gclid || medLower.includes('cpc') || medLower.includes('ad')) {
      tipo = 'Publicidad Google Ads';
      clickId = gclid;
    } else {
      tipo = 'Google Orgánico';
    }
  } else if (utmContent && (utmContent.toLowerCase().includes('video') || utmContent.toLowerCase().includes('reel'))) {
    tipo = `Video Promocional (${utmContent})`;
  } else if (utmCampaign) {
    tipo = `Campaña Promocional (${utmCampaign})`;
  } else if (refLower.includes('instagram.com') || refLower.includes('l.instagram.com')) {
    tipo = 'Instagram (Bio / Enlace / Mensaje)';
  } else if (refLower.includes('tiktok.com')) {
    tipo = 'TikTok (Perfil / Video)';
  } else if (refLower.includes('facebook.com') || refLower.includes('fb.me')) {
    tipo = 'Facebook Orgánico';
  } else if (refLower.includes('google.com') || refLower.includes('google.com.pe')) {
    tipo = 'Búsqueda en Google';
  } else if (referrer) {
    try {
      const refHost = new URL(referrer).hostname;
      tipo = `Sitio Referidor (${refHost})`;
    } catch {
      tipo = 'Sitio Web Referidor';
    }
  }

  // Generar resumen legible para una columna directa en Google Sheets
  const parts: string[] = [tipo];

  if (utmCampaign) {
    parts.push(`Campaña: ${utmCampaign}`);
  }

  if (utmContent) {
    parts.push(`Video/Ad: ${utmContent}`);
  } else if (utmTerm) {
    parts.push(`Término: ${utmTerm}`);
  }

  if (utmSource && !tipo.toLowerCase().includes(srcLower)) {
    parts.push(`Fuente: ${utmSource}`);
  }

  const resumen = parts.join(' · ');

  return {
    tipo,
    campana: utmCampaign || 'N/A',
    contenido_video: utmContent || utmTerm || 'N/A',
    fuente: utmSource || (referrer ? new URL(referrer).hostname : 'Directo'),
    medio: utmMedium || (fbclid ? 'meta_ad' : ttclid ? 'tiktok_ad' : gclid ? 'google_ad' : 'none'),
    click_id: clickId || 'N/A',
    landing_page: currentUrl,
    resumen_origen: resumen,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Inicializa y captura la atribución del primer toque del usuario
 */
export function initTrafficSource(): TrafficSourceData {
  if (typeof window === 'undefined') {
    return {
      tipo: 'Directo',
      campana: 'N/A',
      contenido_video: 'N/A',
      fuente: 'Directo',
      medio: 'none',
      click_id: 'N/A',
      landing_page: '',
      resumen_origen: 'Tráfico Directo',
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const existingRaw = window.sessionStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(STORAGE_KEY);

    if (existingRaw) {
      // SAFETY: Parsed from internal storage containing traffic source attribution
      const parsed = JSON.parse(existingRaw) as TrafficSourceData;

      if (parsed && parsed.resumen_origen) {
        return parsed;
      }
    }
  } catch {
    // Continuar si hay error de almacenamiento
  }

  const params = parseUrlParams();
  const referrer = typeof document !== 'undefined' ? document.referrer : '';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const detected = classifyTraffic(params, referrer, currentUrl);

  try {
    const jsonStr = JSON.stringify(detected);
    window.sessionStorage.setItem(STORAGE_KEY, jsonStr);
    window.localStorage.setItem(STORAGE_KEY, jsonStr);
  } catch {
    // Almacenamiento seguro
  }

  return detected;
}

/**
 * Retorna la fuente de tráfico detectada para el usuario actual
 */
export function getTrafficSource(): TrafficSourceData {
  return initTrafficSource();
}
