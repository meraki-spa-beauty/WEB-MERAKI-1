/**
 * Unified Google Sheets & Automated Dual-Email Sync Service for Meraki Spa
 * Captures leads from Booking Wizard, Contact Form, Workshop, and Libro de Reclamaciones,
 * including automatic email notification targets (meraki.spa.pe@gmail.com + client email).
 */

import { CENTRAL_OWNER_EMAIL } from '../data/spaData';
import { getTrafficSource } from './trafficSource';

export interface LeadSyncPayload {
  formulario: 'Workshop Press On' | 'Cita Spa' | 'Contacto Web' | 'Libro de Reclamaciones';
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
  estado_pago?: string;
  codigo_yape?: string;
}

export interface StoredLeadRecord {
  fecha: string;
  formulario: string;
  codigo: string;
  cliente: string;
  whatsapp: string;
  email: string;
  admin_notify_email: string;
  send_client_email: boolean;
  send_admin_email: boolean;
  servicio: string;
  modalidad: string;
  distrito: string;
  direccion: string;
  fecha_preferida: string;
  hora_preferida: string;
  adelanto: string;
  total: string;
  estado_pago: string;
  codigo_yape: string;
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

const DEFAULT_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbyH7mg08giiH3BSnWwyS1ma8uqHzw73rZFfJRBI_Wt6Rax5rWxUfXl8Z7FT9J2Cga-jwQ/exec';

const GOOGLE_SHEETS_WEBHOOK_URL =
  import.meta.env.VITE_LEADS_SHEETS_URL ||
  import.meta.env.VITE_WORKSHOP_SHEETS_URL ||
  DEFAULT_WEBHOOK_URL;

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

  const cleanClientEmail = (payload.email || '').trim();
  const hasValidClientEmail = cleanClientEmail.includes('@');

  const record: StoredLeadRecord = {
    fecha: limaDate,
    formulario: payload.formulario,
    codigo: payload.codigo_reserva || 'MRK-LEAD',
    cliente: payload.cliente,
    whatsapp: payload.whatsapp,
    email: hasValidClientEmail ? cleanClientEmail : 'No proporcionado',
    admin_notify_email: CENTRAL_OWNER_EMAIL,
    send_client_email: hasValidClientEmail,
    send_admin_email: true,
    servicio: payload.servicio_detalle || 'N/A',
    modalidad: payload.modalidad || 'N/A',
    distrito: payload.distrito || 'N/A',
    direccion: payload.direccion || 'N/A',
    fecha_preferida: payload.fecha_preferida || 'N/A',
    hora_preferida: payload.hora_preferida || 'N/A',
    adelanto: payload.monto_adelanto || 'N/A',
    total: payload.monto_total || 'N/A',
    estado_pago: payload.estado_pago || 'Pendiente de abono',
    codigo_yape: payload.codigo_yape || 'N/A',
    notas: payload.mensaje_notas || 'N/A',
    origen_resumen: traffic.resumen_origen,
    origen_tipo: traffic.tipo,
    origen_campana: traffic.campana,
    origen_video_contenido: traffic.contenido_video,
    origen_fuente: traffic.fuente,
    origen_medio: traffic.medio,
    click_id: traffic.click_id,
    landing_url: traffic.landing_page,
    estado: 'Registrado en web',
  };

  try {
    const existingRaw = localStorage.getItem('meraki_all_leads');

    // SAFETY: Parsed from browser localStorage written by this module
    const existing = existingRaw ? (JSON.parse(existingRaw) as StoredLeadRecord[]) : [];

    existing.push(record);
    localStorage.setItem('meraki_all_leads', JSON.stringify(existing.slice(-50)));
  } catch (err) {
    console.warn('[Meraki Leads] No se pudo guardar en almacenamiento local:', err);
  }

  if (GOOGLE_SHEETS_WEBHOOK_URL) {
    try {
      await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(record),
      });
    } catch (err) {
      console.error('[Meraki Leads] Error al sincronizar:', err);
    }
  }
}
