/**
 * Unified Google Sheets sync service for Meraki Spa & Beauty
 * Automatically captures leads from Workshop, Spa Booking, and Contact forms,
 * including client traffic attribution (ads, video, campaigns, referral).
 */

import { getTrafficSource } from './trafficSource';

export interface LeadSyncPayload {
  formulario: 'Workshop Press On' | 'Cita Spa' | 'Contacto Web';
  cliente: string;
  whatsapp: string;
  email?: string;
  servicio_detalle?: string;
  modalidad?: string;
  fecha_preferida?: string;
  hora_preferida?: string;
  distrito?: string;
  direccion?: string;
  monto_adelanto?: string;
  monto_total?: string;
  codigo_reserva?: string;
  mensaje_notas?: string;
}

export interface StoredLeadRecord {
  fecha: string;
  formulario: string;
  codigo: string;
  cliente: string;
  whatsapp: string;
  email: string;
  servicio: string;
  modalidad: string;
  distrito: string;
  direccion: string;
  fecha_preferida: string;
  hora_preferida: string;
  adelanto: string;
  total: string;
  notas: string;
  origen_resumen: string;
  origen_tipo: string;
  origen_campana: string;
  origen_video_contenido: string;
  origen_fuente: string;
  origen_medio: string;
  click_id: string;
  landing_url: string;
  estado: string;
}

const GOOGLE_SHEETS_WEBHOOK_URL =
  import.meta.env.VITE_LEADS_SHEETS_URL ||
  import.meta.env.VITE_WORKSHOP_SHEETS_URL ||
  '';

/**
 * Envia el lead a Google Sheets y lo respalda en localStorage de inmediato
 */
export async function syncLeadToGoogleSheets(payload: LeadSyncPayload): Promise<void> {
  const traffic = getTrafficSource();

  const limaDate = new Date().toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const record: StoredLeadRecord = {
    fecha: limaDate,
    formulario: payload.formulario,
    codigo: payload.codigo_reserva || 'MRK-LEAD',
    cliente: payload.cliente,
    whatsapp: payload.whatsapp,
    email: payload.email || 'No proporcionado',
    servicio: payload.servicio_detalle || 'N/A',
    modalidad: payload.modalidad || 'N/A',
    distrito: payload.distrito || 'N/A',
    direccion: payload.direccion || 'N/A',
    fecha_preferida: payload.fecha_preferida || 'N/A',
    hora_preferida: payload.hora_preferida || 'N/A',
    adelanto: payload.monto_adelanto || 'N/A',
    total: payload.monto_total || 'N/A',
    notas: payload.mensaje_notas || 'N/A',
    origen_resumen: traffic.resumen_origen,
    origen_tipo: traffic.tipo,
    origen_campana: traffic.campana,
    origen_video_contenido: traffic.contenido_video,
    origen_fuente: traffic.fuente,
    origen_medio: traffic.medio,
    click_id: traffic.click_id,
    landing_url: traffic.landing_page,
    estado: 'Pre-reserva generada en web',
  };

  // 1. Respaldo inmediato en localStorage del navegador
  try {
    const existingRaw = localStorage.getItem('meraki_all_leads');

    // SAFETY: Parsed from localStorage containing previous lead records formatted by this module
    const existing = existingRaw ? (JSON.parse(existingRaw) as StoredLeadRecord[]) : [];

    existing.push(record);
    localStorage.setItem('meraki_all_leads', JSON.stringify(existing));

    // Si es del workshop, mantener sincronizado el key histórico 'meraki_workshop_leads'
    if (payload.formulario === 'Workshop Press On') {
      const wsHistoryRaw = localStorage.getItem('meraki_workshop_leads');
      const wsHistory = wsHistoryRaw ? JSON.parse(wsHistoryRaw) : [];

      wsHistory.push({
        fecha: record.fecha,
        codigo: record.codigo,
        nombre: record.cliente,
        whatsapp: record.whatsapp,
        email: record.email,
        adelanto: record.adelanto,
        total: record.total,
        estado: record.estado,
        origen: record.origen_resumen,
      });

      localStorage.setItem('meraki_workshop_leads', JSON.stringify(wsHistory));
    }
  } catch (err) {
    console.warn('[Meraki Leads] No se pudo guardar en almacenamiento local:', err);
  }

  // 2. Transmisión a Google Sheets vía Webhook (Google Apps Script)
  if (GOOGLE_SHEETS_WEBHOOK_URL) {
    try {
      await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record),
      });

      console.log('[Meraki Leads] Lead sincronizado exitosamente con Google Sheets');
    } catch (err) {
      console.error('[Meraki Leads] Error al enviar a Google Sheets:', err);
    }
  }
}
