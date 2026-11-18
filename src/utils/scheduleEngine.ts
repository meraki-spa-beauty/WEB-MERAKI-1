import type {
  LimaDistrictMeta,
  ScheduleConfig,
  ServiceLocationType,
  SlotLockEntry,
} from '../types';

/**
 * Horarios oficiales visibles: únicamente de 06:00 a 20:00.
 * El bloque de 08:00 AM opera con disponibilidad condicional inteligente.
 */
export const OFFICIAL_TIME_SLOTS: string[] = [
  '06:00',
  '08:00',
  '09:30',
  '11:00',
  '12:30',
  '14:00',
  '15:30',
  '17:00',
  '18:30',
  '20:00',
];

export const DEFAULT_SCHEDULE_CONFIG: ScheduleConfig = {
  blockedDates: [],
  blockedSlots: [],
  enableConditional0800: true,
  requireNearby0600For0800: false,
  maxTravelMinutes: 28,
  distantMinOrderPEN: 130,
  paymentMode: 'manual_yape',
  updatedBy: 'meraki.spa.pe@gmail.com',
};

export const LIMA_DISTRICTS_META: LimaDistrictMeta[] = [
  { name: 'Pueblo Libre', lat: -12.0757, lng: -77.0631, minutesFromStudio: 0, tier: 'cercano' },
  { name: 'Jesús María', lat: -12.0725, lng: -77.0489, minutesFromStudio: 10, tier: 'cercano' },
  { name: 'Magdalena del Mar', lat: -12.0906, lng: -77.0715, minutesFromStudio: 10, tier: 'cercano' },
  { name: 'Breña', lat: -12.0585, lng: -77.0518, minutesFromStudio: 11, tier: 'cercano' },
  { name: 'San Miguel', lat: -12.0772, lng: -77.0906, minutesFromStudio: 12, tier: 'cercano' },
  { name: 'Lince', lat: -12.0846, lng: -77.0332, minutesFromStudio: 14, tier: 'cercano' },
  { name: 'Cercado de Lima', lat: -12.0464, lng: -77.0428, minutesFromStudio: 16, tier: 'intermedio' },
  { name: 'San Isidro', lat: -12.0981, lng: -77.0365, minutesFromStudio: 17, tier: 'intermedio' },
  { name: 'San Luis', lat: -12.0762, lng: -76.9964, minutesFromStudio: 20, tier: 'intermedio' },
  { name: 'Miraflores', lat: -12.1191, lng: -77.0289, minutesFromStudio: 22, tier: 'intermedio' },
  { name: 'Surquillo', lat: -12.1128, lng: -77.0124, minutesFromStudio: 22, tier: 'intermedio' },
  { name: 'San Borja', lat: -12.0968, lng: -76.9998, minutesFromStudio: 22, tier: 'intermedio' },
  { name: 'Barranco', lat: -12.1436, lng: -77.0211, minutesFromStudio: 27, tier: 'intermedio' },
  { name: 'Santiago de Surco', lat: -12.1387, lng: -76.9899, minutesFromStudio: 28, tier: 'lejano' },
  { name: 'Los Olivos', lat: -11.9722, lng: -77.0706, minutesFromStudio: 32, tier: 'lejano' },
  { name: 'Chorrillos', lat: -12.1722, lng: -77.0155, minutesFromStudio: 34, tier: 'lejano' },
  { name: 'Ate', lat: -12.0427, lng: -76.9426, minutesFromStudio: 36, tier: 'lejano' },
  { name: 'La Molina', lat: -12.0785, lng: -76.9428, minutesFromStudio: 38, tier: 'lejano' },
  { name: 'San Juan de Miraflores', lat: -12.1583, lng: -76.9701, minutesFromStudio: 38, tier: 'lejano' },
  { name: 'Otro distrito en Lima', lat: -12.091, lng: -77.035, minutesFromStudio: 35, tier: 'lejano' },
];

export const LIMA_DISTRICT_NAMES: string[] = LIMA_DISTRICTS_META.map((d) => d.name);

export function getDistrictMeta(districtName: string): LimaDistrictMeta {
  const normalized = districtName.trim().toLowerCase();

  for (const item of LIMA_DISTRICTS_META) {
    if (item.name.toLowerCase() === normalized) {
      return item;
    }
  }

  return LIMA_DISTRICTS_META[0];
}

export function timeSlotToMinutes(timeSlot: string): number {
  const parts = timeSlot.split(':');
  const hours = Number(parts[0] || 0);
  const mins = Number(parts[1] || 0);

  return hours * 60 + mins;
}

/**
 * Estima tiempo de traslado en taxi entre dos distritos de Lima usando distancia geodésica
 * ajustada por factor de tráfico urbano limeño.
 */
export function estimateLimaTravelMinutes(fromDistrict: string, toDistrict: string): number {
  if (fromDistrict.trim().toLowerCase() === toDistrict.trim().toLowerCase()) {
    return 8;
  }

  const fromMeta = getDistrictMeta(fromDistrict);
  const toMeta = getDistrictMeta(toDistrict);

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const rKm = 6371;
  const dLat = toRad(toMeta.lat - fromMeta.lat);
  const dLng = toRad(toMeta.lng - fromMeta.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(fromMeta.lat)) *
      Math.cos(toRad(toMeta.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = rKm * c;

  return Math.max(10, Math.min(55, Math.round(km * 3.1 + 7)));
}

export type SlotBlockReasonCode =
  | 'ok'
  | 'date_blocked'
  | 'manual_slot_blocked'
  | 'already_booked'
  | 'conditional_0800_locked'
  | 'route_conflict'
  | 'low_ticket_distant';

export interface SlotAvailabilityResult {
  timeSlot: string;
  available: boolean;
  reasonCode: SlotBlockReasonCode;
  reasonText: string;
  isConditionalBonus?: boolean;
}

export function buildBlockedSlotKey(
  date: string,
  timeSlot: string,
  scope: 'all' | 'estudio' | 'domicilio',
): string {
  return `${date}|${timeSlot}|${scope}`;
}

export function evaluateSlotAvailability(params: {
  date: string;
  timeSlot: string;
  locationType: ServiceLocationType;
  district: string;
  totalPEN: number;
  estimatedDurationMin: number;
  config: ScheduleConfig;
  activeLocks: SlotLockEntry[];
}): SlotAvailabilityResult {
  const { date, timeSlot, locationType, district, totalPEN, estimatedDurationMin, config, activeLocks } =
    params;

  const isDomicilio = locationType !== 'estudio';
  const targetDistrict = isDomicilio ? district : 'Pueblo Libre';
  const scopeKey = isDomicilio ? 'domicilio' : 'estudio';

  if (config.blockedDates.includes(date)) {
    return {
      timeSlot,
      available: false,
      reasonCode: 'date_blocked',
      reasonText: 'Fecha cerrada en agenda por Meraki Spa.',
    };
  }

  if (
    config.blockedSlots.includes(buildBlockedSlotKey(date, timeSlot, 'all')) ||
    config.blockedSlots.includes(buildBlockedSlotKey(date, timeSlot, scopeKey))
  ) {
    return {
      timeSlot,
      available: false,
      reasonCode: 'manual_slot_blocked',
      reasonText: 'Horario bloqueado manualmente por la especialista.',
    };
  }

  const candidateStart = timeSlotToMinutes(timeSlot);
  const candidateEnd = candidateStart + Math.max(60, estimatedDurationMin);

  const dayLocks: SlotLockEntry[] = [];

  for (const lock of activeLocks) {
    if (lock.date === date && lock.status === 'active') {
      dayLocks.push(lock);
    }
  }

  for (const lock of dayLocks) {
    const lockStart = timeSlotToMinutes(lock.timeSlot);
    const lockDuration = Math.max(60, lock.estimatedDurationMin);
    const lockEnd = lockStart + lockDuration;
    const lockDistrict = lock.locationType === 'estudio' ? 'Pueblo Libre' : lock.district;

    if (lock.timeSlot === timeSlot) {
      return {
        timeSlot,
        available: false,
        reasonCode: 'already_booked',
        reasonText: 'Este horario ya cuenta con una reserva activa.',
      };
    }

    const overlapsTime = candidateStart < lockEnd && candidateEnd > lockStart;

    if (overlapsTime) {
      return {
        timeSlot,
        available: false,
        reasonCode: 'already_booked',
        reasonText: `Se cruza con otra cita reservada (${lock.timeSlot}).`,
      };
    }

    // Travel-time feasibility check when shifting between districts or studio
    if (candidateStart >= lockEnd) {
      const travelNeeded = estimateLimaTravelMinutes(lockDistrict, targetDistrict);
      const gap = candidateStart - lockEnd;

      if (gap < travelNeeded) {
        return {
          timeSlot,
          available: false,
          reasonCode: 'route_conflict',
          reasonText: `Traslado incompatible desde ${lockDistrict} (~${travelNeeded} min en taxi).`,
        };
      }
    } else if (lockStart >= candidateEnd) {
      const travelNeeded = estimateLimaTravelMinutes(targetDistrict, lockDistrict);
      const gap = lockStart - candidateEnd;

      if (gap < travelNeeded) {
        return {
          timeSlot,
          available: false,
          reasonCode: 'route_conflict',
          reasonText: `No hay margen suficiente para llegar luego a ${lockDistrict} (~${travelNeeded} min).`,
        };
      }
    }
  }

  // Conditional 08:00 AM rule
  if (timeSlot === '08:00') {
    if (!config.enableConditional0800) {
      return {
        timeSlot,
        available: false,
        reasonCode: 'conditional_0800_locked',
        reasonText: 'El turno temprano de 08:00 AM está deshabilitado actualmente.',
      };
    }

    if (config.requireNearby0600For0800 && isDomicilio) {
      let hasNearby0600 = false;

      for (const lock of dayLocks) {
        if (lock.timeSlot === '06:00') {
          const lockDist = lock.locationType === 'estudio' ? 'Pueblo Libre' : lock.district;

          if (estimateLimaTravelMinutes(lockDist, targetDistrict) <= config.maxTravelMinutes) {
            hasNearby0600 = true;
            break;
          }
        }
      }

      if (!hasNearby0600) {
        return {
          timeSlot,
          available: false,
          reasonCode: 'conditional_0800_locked',
          reasonText: '08:00 AM a domicilio se habilita cuando existe una ruta cercana a las 06:00 AM.',
        };
      }

      return {
        timeSlot,
        available: true,
        reasonCode: 'ok',
        reasonText: 'Desbloqueado por ruta matutina cercana.',
        isConditionalBonus: true,
      };
    }
  }

  // Distant district minimum ticket check for domicilio
  if (isDomicilio && totalPEN > 0) {
    const meta = getDistrictMeta(targetDistrict);

    if (meta.minutesFromStudio > config.maxTravelMinutes && totalPEN < config.distantMinOrderPEN) {
      return {
        timeSlot,
        available: false,
        reasonCode: 'low_ticket_distant',
        reasonText: `Para domicilio en ${meta.name} (~${meta.minutesFromStudio} min), el mínimo sugerido es S/ ${config.distantMinOrderPEN} o atiende en estudio.`,
      };
    }
  }

  return {
    timeSlot,
    available: true,
    reasonCode: 'ok',
    reasonText: 'Disponible',
  };
}

export function evaluateDaySchedule(params: {
  date: string;
  locationType: ServiceLocationType;
  district: string;
  totalPEN: number;
  estimatedDurationMin: number;
  config: ScheduleConfig;
  activeLocks: SlotLockEntry[];
}): SlotAvailabilityResult[] {
  const results: SlotAvailabilityResult[] = [];

  for (const slot of OFFICIAL_TIME_SLOTS) {
    results.push(
      evaluateSlotAvailability({
        date: params.date,
        timeSlot: slot,
        locationType: params.locationType,
        district: params.district,
        totalPEN: params.totalPEN,
        estimatedDurationMin: params.estimatedDurationMin,
        config: params.config,
        activeLocks: params.activeLocks,
      }),
    );
  }

  return results;
}
