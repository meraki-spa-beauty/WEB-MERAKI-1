import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type FieldValue,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type {
  BookingServiceLine,
  BookingStatus,
  CatalogService,
  ComplaintEntry,
  LoyaltyHistoryItem,
  MerakiBooking,
  PaymentMode,
  ScheduleConfig,
  ServiceCategory,
  ServiceLocationType,
  ServicePriceOption,
  SlotLockEntry,
  StaffAccessEntry,
  UserLoyaltyProfile,
} from '../types';
import { CENTRAL_OWNER_EMAIL } from '../data/spaData';
import { DEFAULT_SCHEDULE_CONFIG } from '../utils/scheduleEngine';
import { buildCatalogMediaRef } from '../utils/imageOptimizer';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  cause: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const currentUser = auth?.currentUser;
  const providerList: { providerId?: string | null; email?: string | null }[] = [];

  if (currentUser?.providerData) {
    for (const p of currentUser.providerData) {
      providerList.push({
        providerId: p.providerId,
        email: p.email,
      });
    }
  }

  const errInfo: FirestoreErrorInfo = {
    error: cause instanceof Error ? cause.message : String(cause),
    authInfo: {
      userId: currentUser?.uid ?? null,
      email: currentUser?.email ?? null,
      emailVerified: currentUser?.emailVerified ?? null,
      isAnonymous: currentUser?.isAnonymous ?? null,
      tenantId: currentUser?.tenantId ?? null,
      providerInfo: providerList,
    },
    operationType,
    path,
  };

  const serialized = JSON.stringify(errInfo);

  console.error('Firestore Error:', serialized);
  throw new Error(serialized);
}

let connectionVerified = false;

export async function testFirestoreConnection(): Promise<void> {
  if (!db || connectionVerified) return;

  connectionVerified = true;

  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (err) {
    if (err instanceof Error && err.message.includes('the client is offline')) {
      console.error('Firebase Firestore connection check failed: client is offline.');
    }
  }
}

export function emailToStaffDocId(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 128);
}

export function isCentralOwnerEmail(email?: string | null): boolean {
  if (!email) return false;

  return email.trim().toLowerCase() === CENTRAL_OWNER_EMAIL;
}

function clampText(val: string, maxLen: number): string {
  return val.trim().slice(0, maxLen);
}


function readStr(data: DocumentData, key: string, fallback = ''): string {
  const raw = data[key];

  return Object.prototype.toString.call(raw) === '[object String]' ? String(raw) : fallback;
}

function readNum(data: DocumentData, key: string, fallback = 0): number {
  const raw = data[key];

  if (Object.prototype.toString.call(raw) === '[object Number]') {
    const num = Number(raw);

    return Number.isFinite(num) ? num : fallback;
  }

  return fallback;
}

function readBool(data: DocumentData, key: string, fallback = false): boolean {
  const raw = data[key];

  return Object.prototype.toString.call(raw) === '[object Boolean]' ? Boolean(raw) : fallback;
}

function readStringArray(data: DocumentData, key: string): string[] {
  const raw = data[key];

  if (!Array.isArray(raw)) return [];

  const clean: string[] = [];

  for (const item of raw) {
    if (Object.prototype.toString.call(item) === '[object String]') {
      clean.push(String(item));
    }
  }

  return clean;
}

function parsePaymentMode(raw: string): PaymentMode {
  return raw === 'gateway_checkout' ? 'gateway_checkout' : 'manual_yape';
}

function parseLocationType(raw: string): ServiceLocationType {
  if (raw === 'casa' || raw === 'trabajo') return raw;

  return 'estudio';
}

function parseBookingStatus(raw: string): BookingStatus {
  switch (raw) {
    case 'manual_code_submitted':
    case 'confirmed':
    case 'completed':
    case 'cancelled':
      return raw;
    default:
      return 'pending_yape';
  }
}

export async function fetchScheduleConfig(): Promise<ScheduleConfig> {
  if (!db) return DEFAULT_SCHEDULE_CONFIG;

  try {
    const snap = await getDoc(doc(db, 'scheduleConfig', 'global'));

    if (!snap.exists()) {
      return DEFAULT_SCHEDULE_CONFIG;
    }

    const d = snap.data();

    return {
      blockedDates: readStringArray(d, 'blockedDates'),
      blockedSlots: readStringArray(d, 'blockedSlots'),
      enableConditional0800: readBool(d, 'enableConditional0800', true),
      requireNearby0600For0800: readBool(d, 'requireNearby0600For0800', false),
      maxTravelMinutes: readNum(d, 'maxTravelMinutes', 28),
      distantMinOrderPEN: readNum(d, 'distantMinOrderPEN', 130),
      paymentMode: parsePaymentMode(readStr(d, 'paymentMode', 'manual_yape')),
      updatedBy: readStr(d, 'updatedBy', CENTRAL_OWNER_EMAIL),
    };
  } catch (err) {
    console.warn('Fallback to default schedule config:', err);

    return DEFAULT_SCHEDULE_CONFIG;
  }
}

export async function saveScheduleConfig(config: ScheduleConfig, actorEmail: string): Promise<void> {
  if (!db) throw new Error('Firestore no está disponible.');

  const path = 'scheduleConfig/global';

  try {
    await setDoc(doc(db, 'scheduleConfig', 'global'), {
      blockedDates: config.blockedDates.slice(0, 180),
      blockedSlots: config.blockedSlots.slice(0, 400),
      enableConditional0800: Boolean(config.enableConditional0800),
      requireNearby0600For0800: Boolean(config.requireNearby0600For0800),
      maxTravelMinutes: Math.max(5, Math.min(120, Math.round(config.maxTravelMinutes))),
      distantMinOrderPEN: Math.max(0, Math.min(1000, Math.round(config.distantMinOrderPEN))),
      paymentMode: config.paymentMode,
      updatedBy: clampText(actorEmail || CENTRAL_OWNER_EMAIL, 160),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchActiveSlotLocksForDate(date: string): Promise<SlotLockEntry[]> {
  if (!db || !date) return [];

  try {
    const q = query(
      collection(db, 'slotLocks'),
      where('date', '==', date),
      where('status', '==', 'active'),
      limit(40),
    );

    const snap = await getDocs(q);
    const locks: SlotLockEntry[] = [];

    for (const docSnap of snap.docs) {
      const d = docSnap.data();

      locks.push({
        bookingCode: readStr(d, 'bookingCode', docSnap.id),
        date: readStr(d, 'date', date),
        timeSlot: readStr(d, 'timeSlot', '09:30'),
        locationType: parseLocationType(readStr(d, 'locationType', 'estudio')),
        district: readStr(d, 'district', 'Pueblo Libre'),
        totalPEN: Math.round(readNum(d, 'totalPEN', 0)),
        estimatedDurationMin: Math.round(readNum(d, 'estimatedDurationMin', 90)),
        status: readStr(d, 'status', 'active') === 'cancelled' ? 'cancelled' : 'active',
      });
    }

    return locks;
  } catch (err) {
    console.warn('Could not read slotLocks:', err);

    return [];
  }
}

export async function createAtomicBooking(booking: MerakiBooking): Promise<void> {
  if (!db) return;

  const cleanCode = booking.bookingCode.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32);
  const path = `bookings/${cleanCode}`;

  const cleanServices: BookingServiceLine[] = [];

  for (const line of booking.services.slice(0, 15)) {
    cleanServices.push({
      serviceId: clampText(line.serviceId, 80),
      serviceName: clampText(line.serviceName, 160),
      optionLabel: clampText(line.optionLabel || 'Estándar', 100),
      pricePEN: Math.max(0, Math.min(10000, Math.round(line.pricePEN))),
    });
  }

  try {
    const batch = writeBatch(db);
    const bookingRef = doc(db, 'bookings', cleanCode);
    const lockRef = doc(db, 'slotLocks', cleanCode);

    batch.set(bookingRef, {
      bookingCode: cleanCode,
      uid: clampText(booking.uid, 128),
      clientName: clampText(booking.clientName, 120),
      clientPhone: clampText(booking.clientPhone, 30),
      clientEmail: clampText(booking.clientEmail, 160),
      specialNotes: clampText(booking.specialNotes, 600),
      services: cleanServices,
      servicesSummary: clampText(booking.servicesSummary, 400),
      locationType: booking.locationType,
      district: clampText(booking.district, 60),
      address: clampText(booking.address, 240),
      date: booking.date,
      timeSlot: booking.timeSlot,
      estimatedDurationMin: Math.max(15, Math.min(360, Math.round(booking.estimatedDurationMin))),
      totalPEN: Math.max(0, Math.min(20000, Math.round(booking.totalPEN))),
      advancePEN: Math.max(0, Math.min(20000, Math.round(booking.advancePEN))),
      paymentMode: booking.paymentMode,
      paymentStatus: booking.paymentStatus,
      yapeOperationCode: clampText(booking.yapeOperationCode, 32),
      status: booking.status,
      privacyAccepted: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    batch.set(lockRef, {
      bookingCode: cleanCode,
      date: booking.date,
      timeSlot: booking.timeSlot,
      locationType: booking.locationType,
      district: clampText(booking.district, 60),
      totalPEN: Math.max(0, Math.min(20000, Math.round(booking.totalPEN))),
      estimatedDurationMin: Math.max(15, Math.min(360, Math.round(booking.estimatedDurationMin))),
      status: 'active',
      createdAt: serverTimestamp(),
    });

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchBookingsForAdmin(filterDate?: string): Promise<MerakiBooking[]> {
  if (!db) return [];

  const path = 'bookings';

  try {
    const q = filterDate
      ? query(collection(db, 'bookings'), where('date', '==', filterDate), limit(100))
      : query(collection(db, 'bookings'), orderBy('date', 'desc'), limit(100));

    const snap = await getDocs(q);
    const items: MerakiBooking[] = [];

    for (const docSnap of snap.docs) {
      const d = docSnap.data();
      const rawServices = Array.isArray(d.services) ? d.services : [];
      const lines: BookingServiceLine[] = [];

      for (const s of rawServices) {
        if (Object.prototype.toString.call(s) === '[object Object]') {
          lines.push({
            serviceId: readStr(s, 'serviceId', 'svc'),
            serviceName: readStr(s, 'serviceName', 'Servicio'),
            optionLabel: readStr(s, 'optionLabel', 'Estándar'),
            pricePEN: readNum(s, 'pricePEN', 0),
          });
        }
      }

      const rawPaymentStatus = readStr(d, 'paymentStatus', 'pending_yape');

      items.push({
        bookingCode: readStr(d, 'bookingCode', docSnap.id),
        uid: readStr(d, 'uid', ''),
        clientName: readStr(d, 'clientName', 'Clienta'),
        clientPhone: readStr(d, 'clientPhone', ''),
        clientEmail: readStr(d, 'clientEmail', ''),
        specialNotes: readStr(d, 'specialNotes', ''),
        services: lines,
        servicesSummary: readStr(d, 'servicesSummary', ''),
        locationType: parseLocationType(readStr(d, 'locationType', 'estudio')),
        district: readStr(d, 'district', 'Pueblo Libre'),
        address: readStr(d, 'address', ''),
        date: readStr(d, 'date', ''),
        timeSlot: readStr(d, 'timeSlot', '09:30'),
        estimatedDurationMin: readNum(d, 'estimatedDurationMin', 90),
        totalPEN: readNum(d, 'totalPEN', 0),
        advancePEN: readNum(d, 'advancePEN', 0),
        paymentMode: parsePaymentMode(readStr(d, 'paymentMode', 'manual_yape')),
        paymentStatus:
          rawPaymentStatus === 'manual_code_submitted' ||
          rawPaymentStatus === 'gateway_paid' ||
          rawPaymentStatus === 'verified' ||
          rawPaymentStatus === 'cancelled'
            ? rawPaymentStatus
            : 'pending_yape',
        yapeOperationCode: readStr(d, 'yapeOperationCode', ''),
        status: parseBookingStatus(readStr(d, 'status', 'pending_yape')),
        privacyAccepted: readBool(d, 'privacyAccepted', true),
      });
    }

    items.sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;

      return a.timeSlot < b.timeSlot ? -1 : 1;
    });

    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function updateBookingStatusAdmin(
  bookingCode: string,
  nextStatus: BookingStatus,
): Promise<void> {
  if (!db) return;

  const cleanCode = bookingCode.replace(/[^a-zA-Z0-9_-]/g, '');
  const path = `bookings/${cleanCode}`;

  try {
    const paymentStatus =
      nextStatus === 'confirmed' || nextStatus === 'completed'
        ? 'verified'
        : nextStatus === 'cancelled'
          ? 'cancelled'
          : 'pending_yape';

    await updateDoc(doc(db, 'bookings', cleanCode), {
      status: nextStatus,
      paymentStatus,
      updatedAt: serverTimestamp(),
    });

    try {
      await updateDoc(doc(db, 'slotLocks', cleanCode), {
        status: nextStatus === 'cancelled' ? 'cancelled' : 'active',
      });
    } catch {
      // Lock might not exist for legacy entries
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function fetchMyStaffAccess(email: string): Promise<StaffAccessEntry | null> {
  if (!db || !email) return null;

  const staffId = emailToStaffDocId(email);
  const path = `staffAccess/${staffId}`;

  try {
    const snap = await getDoc(doc(db, 'staffAccess', staffId));

    if (!snap.exists()) return null;

    const d = snap.data();

    return {
      id: snap.id,
      email: readStr(d, 'email', email),
      name: readStr(d, 'name', email),
      isActive: readBool(d, 'isActive', false),
      canManageAgenda: readBool(d, 'canManageAgenda', false),
      canManageBookings: readBool(d, 'canManageBookings', false),
      canStampVip: readBool(d, 'canStampVip', false),
      createdBy: readStr(d, 'createdBy', CENTRAL_OWNER_EMAIL),
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function fetchAllStaffAccess(): Promise<StaffAccessEntry[]> {
  if (!db) return [];

  const path = 'staffAccess';

  try {
    const snap = await getDocs(query(collection(db, 'staffAccess'), limit(50)));
    const list: StaffAccessEntry[] = [];

    for (const docSnap of snap.docs) {
      const d = docSnap.data();

      list.push({
        id: docSnap.id,
        email: readStr(d, 'email', ''),
        name: readStr(d, 'name', ''),
        isActive: readBool(d, 'isActive', true),
        canManageAgenda: readBool(d, 'canManageAgenda', false),
        canManageBookings: readBool(d, 'canManageBookings', false),
        canStampVip: readBool(d, 'canStampVip', false),
        createdBy: readStr(d, 'createdBy', CENTRAL_OWNER_EMAIL),
      });
    }

    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveStaffAccessEntry(params: {
  email: string;
  name: string;
  isActive: boolean;
  canManageAgenda: boolean;
  canManageBookings: boolean;
  canStampVip: boolean;
  actorEmail: string;
  isNew: boolean;
}): Promise<void> {
  if (!db) return;

  const normalizedEmail = clampText(params.email.toLowerCase(), 160);
  const staffId = emailToStaffDocId(normalizedEmail);
  const path = `staffAccess/${staffId}`;

  try {
    if (params.isNew) {
      await setDoc(doc(db, 'staffAccess', staffId), {
        email: normalizedEmail,
        name: clampText(params.name, 100),
        isActive: Boolean(params.isActive),
        canManageAgenda: Boolean(params.canManageAgenda),
        canManageBookings: Boolean(params.canManageBookings),
        canStampVip: Boolean(params.canStampVip),
        createdBy: clampText(params.actorEmail, 160),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'staffAccess', staffId), {
        name: clampText(params.name, 100),
        isActive: Boolean(params.isActive),
        canManageAgenda: Boolean(params.canManageAgenda),
        canManageBookings: Boolean(params.canManageBookings),
        canStampVip: Boolean(params.canStampVip),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteStaffAccessEntry(staffId: string): Promise<void> {
  if (!db) return;

  const cleanId = staffId.replace(/[^a-zA-Z0-9_-]/g, '');
  const path = `staffAccess/${cleanId}`;

  try {
    await deleteDoc(doc(db, 'staffAccess', cleanId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

function sanitizeLoyaltyHistory(items: LoyaltyHistoryItem[]): LoyaltyHistoryItem[] {
  const sanitized: LoyaltyHistoryItem[] = [];

  for (const item of items.slice(0, 100)) {
    sanitized.push({
      id: clampText(item.id || 'entry', 64) || 'entry',
      date: clampText(item.date || '', 40),
      service: clampText(item.service || 'Servicio Meraki', 160) || 'Servicio Meraki',
      price: Math.max(0, Math.min(10000, Math.round(Number(item.price || 0)))),
    });
  }

  return sanitized;
}

export async function fetchAllVipUsers(): Promise<UserLoyaltyProfile[]> {
  if (!db) return [];

  const path = 'users';

  try {
    const snap = await getDocs(query(collection(db, 'users'), limit(150)));
    const list: UserLoyaltyProfile[] = [];

    for (const docSnap of snap.docs) {
      const d = docSnap.data();
      const rawHist = Array.isArray(d.history) ? d.history : [];
      const history: LoyaltyHistoryItem[] = [];

      for (const h of rawHist) {
        if (Object.prototype.toString.call(h) === '[object Object]') {
          history.push({
            id: readStr(h, 'id', 'item'),
            date: readStr(h, 'date', ''),
            service: readStr(h, 'service', 'Tratamiento Meraki'),
            price: readNum(h, 'price', 0),
          });
        }
      }

      list.push({
        uid: docSnap.id,
        email: readStr(d, 'email', ''),
        displayName: readStr(d, 'displayName', '') || 'Clienta VIP',
        phone: readStr(d, 'phone', ''),
        adminNote: readStr(d, 'adminNote', ''),
        photoURL: readStr(d, 'photoURL', ''),
        dataConsentAccepted: readBool(d, 'dataConsentAccepted', false),
        dataConsentAt: readStr(d, 'dataConsentAt', ''),
        stamps: Math.max(0, Math.min(5, Math.round(readNum(d, 'stamps', 0)))),
        rewardsClaimed: Math.max(0, Math.round(readNum(d, 'rewardsClaimed', 0))),
        history,
      });
    }

    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

function parseExistingLoyaltyHistory(raw: DocumentData): LoyaltyHistoryItem[] {
  const rawHist = Array.isArray(raw.history) ? raw.history : [];
  const items: LoyaltyHistoryItem[] = [];

  for (const h of rawHist) {
    if (Object.prototype.toString.call(h) === '[object Object]') {
      items.push({
        id: readStr(h, 'id', 'entry') || 'entry',
        date: readStr(h, 'date', ''),
        service: readStr(h, 'service', 'Servicio Meraki') || 'Servicio Meraki',
        price: Math.max(0, Math.min(10000, Number(readNum(h, 'price', 0)))),
      });
    }
  }

  return items.slice(0, 100);
}

export async function fetchClientVipProfile(uid: string): Promise<UserLoyaltyProfile | null> {
  if (!db) return null;

  const cleanUid = uid.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
  const path = `users/${cleanUid}`;

  try {
    const snap = await getDoc(doc(db, 'users', cleanUid));

    if (!snap.exists()) return null;

    const d = snap.data();

    return {
      uid: cleanUid,
      email: readStr(d, 'email', ''),
      displayName: readStr(d, 'displayName', ''),
      phone: readStr(d, 'phone', ''),
      adminNote: readStr(d, 'adminNote', ''),
      photoURL: readStr(d, 'photoURL', ''),
      dataConsentAccepted: readBool(d, 'dataConsentAccepted', false),
      dataConsentAt: readStr(d, 'dataConsentAt', ''),
      stamps: Math.max(0, Math.min(5, Math.round(readNum(d, 'stamps', 0)))),
      rewardsClaimed: Math.max(0, Math.min(1000, Math.round(readNum(d, 'rewardsClaimed', 0)))),
      history: parseExistingLoyaltyHistory(d),
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveClientVipProfileWithConsent(params: {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  photoURL: string;
}): Promise<UserLoyaltyProfile> {
  if (!db) throw new Error('Firestore no está disponible.');

  const cleanUid = params.uid.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
  const path = `users/${cleanUid}`;
  const userRef = doc(db, 'users', cleanUid);

  const cleanEmail = clampText(params.email.toLowerCase(), 160);
  const cleanName = clampText(params.displayName, 120);
  const cleanPhone = clampText(params.phone, 30);
  const cleanPhoto = clampText(params.photoURL, 500);
  const consentIso = new Date().toISOString().slice(0, 40);

  let existingSnap;

  try {
    existingSnap = await getDoc(userRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }

  if (existingSnap.exists()) {
    const d = existingSnap.data();
    const existingStamps = Math.max(0, Math.min(5, Math.round(readNum(d, 'stamps', 0))));
    const existingRewards = Math.max(0, Math.min(1000, Math.round(readNum(d, 'rewardsClaimed', 0))));
    const existingAdminNote = clampText(readStr(d, 'adminNote', ''), 160);
    const preservedHistory = sanitizeLoyaltyHistory(parseExistingLoyaltyHistory(d));

    try {
      await setDoc(userRef, {
        uid: cleanUid,
        email: cleanEmail,
        displayName: cleanName,
        phone: cleanPhone,
        adminNote: existingAdminNote,
        photoURL: cleanPhoto,
        dataConsentAccepted: true,
        dataConsentAt: consentIso,
        stamps: existingStamps,
        rewardsClaimed: existingRewards,
        history: preservedHistory,
        updatedAt: serverTimestamp(),
      });

      return {
        uid: cleanUid,
        email: cleanEmail,
        displayName: cleanName,
        phone: cleanPhone,
        adminNote: existingAdminNote,
        photoURL: cleanPhoto,
        dataConsentAccepted: true,
        dataConsentAt: consentIso,
        stamps: existingStamps,
        rewardsClaimed: existingRewards,
        history: preservedHistory,
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }

  const todayLabel = new Date().toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const welcomeHistory: LoyaltyHistoryItem[] = sanitizeLoyaltyHistory([
    {
      id: 'welcome',
      date: todayLabel,
      service: 'Bienvenida a Meraki VIP',
      price: 0,
    },
  ]);

  try {
    await setDoc(userRef, {
      uid: cleanUid,
      email: cleanEmail,
      displayName: cleanName,
      phone: cleanPhone,
      adminNote: '',
      photoURL: cleanPhoto,
      dataConsentAccepted: true,
      dataConsentAt: consentIso,
      stamps: 1,
      rewardsClaimed: 0,
      history: welcomeHistory,
      updatedAt: serverTimestamp(),
    });

    return {
      uid: cleanUid,
      email: cleanEmail,
      displayName: cleanName,
      phone: cleanPhone,
      adminNote: '',
      photoURL: cleanPhoto,
      dataConsentAccepted: true,
      dataConsentAt: consentIso,
      stamps: 1,
      rewardsClaimed: 0,
      history: welcomeHistory,
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function redeemClientVipReward(params: {
  uid: string;
  fallbackEmail: string;
  fallbackDisplayName: string;
  fallbackPhone: string;
  fallbackPhotoURL: string;
}): Promise<UserLoyaltyProfile | null> {
  if (!db) return null;

  const cleanUid = params.uid.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
  const path = `users/${cleanUid}`;
  const userRef = doc(db, 'users', cleanUid);

  let snap;

  try {
    snap = await getDoc(userRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }

  if (!snap.exists()) return null;

  const d = snap.data();
  const currentStamps = Math.max(0, Math.min(5, Math.round(readNum(d, 'stamps', 0))));

  if (currentStamps < 5) return null;

  const currentRewards = Math.max(0, Math.min(1000, Math.round(readNum(d, 'rewardsClaimed', 0))));
  const nextRewards = Math.min(1000, currentRewards + 1);
  const existingAdminNote = clampText(readStr(d, 'adminNote', ''), 160);
  const cleanEmail = clampText(readStr(d, 'email', '') || params.fallbackEmail, 160);
  const cleanName = clampText(readStr(d, 'displayName', '') || params.fallbackDisplayName, 120) || 'Clienta VIP';
  const cleanPhone = clampText(readStr(d, 'phone', '') || params.fallbackPhone, 30);
  const cleanPhoto = clampText(readStr(d, 'photoURL', '') || params.fallbackPhotoURL, 500);
  const consentAccepted = readBool(d, 'dataConsentAccepted', true);
  const consentAt = clampText(readStr(d, 'dataConsentAt', ''), 40);

  const redeemEntry: LoyaltyHistoryItem = {
    id: `redeem-${Date.now().toString(36)}`,
    date: new Date().toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    service: 'Canje de Beneficio Meraki VIP',
    price: 0,
  };

  const nextHistory = sanitizeLoyaltyHistory([redeemEntry, ...parseExistingLoyaltyHistory(d)]);

  try {
    await setDoc(userRef, {
      uid: cleanUid,
      email: cleanEmail,
      displayName: cleanName,
      phone: cleanPhone,
      adminNote: existingAdminNote,
      photoURL: cleanPhoto,
      dataConsentAccepted: consentAccepted,
      dataConsentAt: consentAt,
      stamps: 0,
      rewardsClaimed: nextRewards,
      history: nextHistory,
      updatedAt: serverTimestamp(),
    });

    return {
      uid: cleanUid,
      email: cleanEmail,
      displayName: cleanName,
      phone: cleanPhone,
      adminNote: existingAdminNote,
      photoURL: cleanPhoto,
      dataConsentAccepted: consentAccepted,
      dataConsentAt: consentAt,
      stamps: 0,
      rewardsClaimed: nextRewards,
      history: nextHistory,
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function adminStampUserVip(params: {
  user: UserLoyaltyProfile;
  serviceName: string;
  pricePEN: number;
  action: 'stamp' | 'redeem';
}): Promise<UserLoyaltyProfile> {
  if (!db) throw new Error('Firestore no está disponible.');

  const cleanUid = params.user.uid.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
  const path = `users/${cleanUid}`;
  const cleanName = clampText(params.serviceName || 'Servicio Meraki', 160) || 'Servicio Meraki';
  const cleanPrice = Math.max(0, Math.min(10000, Math.round(params.pricePEN)));

  const todayLabel = new Date().toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const entry: LoyaltyHistoryItem = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    date: clampText(todayLabel, 40),
    service: clampText(
      params.action === 'redeem' ? `Canje VIP: ${cleanName}` : cleanName,
      160,
    ),
    price: params.action === 'redeem' ? 0 : cleanPrice,
  };

  const nextStamps =
    params.action === 'redeem' ? 0 : Math.min(5, Math.max(0, Math.round(params.user.stamps) + 1));

  const nextRewards =
    params.action === 'redeem'
      ? Math.max(0, Math.min(1000, Math.round(params.user.rewardsClaimed) + 1))
      : Math.max(0, Math.min(1000, Math.round(params.user.rewardsClaimed)));

  const nextHistory = sanitizeLoyaltyHistory([entry, ...params.user.history]);

  const normalizedEmail = clampText(params.user.email || '', 160);
  const normalizedDisplayName = clampText(params.user.displayName || 'Clienta VIP', 120) || 'Clienta VIP';
  const normalizedPhone = clampText(params.user.phone || '', 30);
  const normalizedAdminNote = clampText(params.user.adminNote || '', 160);
  const normalizedPhoto = clampText(params.user.photoURL || '', 500);
  const normalizedConsent = Boolean(params.user.dataConsentAccepted);
  const normalizedConsentAt = clampText(params.user.dataConsentAt || '', 40);

  try {
    await setDoc(doc(db, 'users', cleanUid), {
      uid: cleanUid,
      email: normalizedEmail,
      displayName: normalizedDisplayName,
      phone: normalizedPhone,
      adminNote: normalizedAdminNote,
      photoURL: normalizedPhoto,
      dataConsentAccepted: normalizedConsent,
      dataConsentAt: normalizedConsentAt,
      stamps: nextStamps,
      rewardsClaimed: nextRewards,
      history: nextHistory,
      updatedAt: serverTimestamp(),
    });

    return {
      uid: cleanUid,
      email: normalizedEmail,
      displayName: normalizedDisplayName,
      phone: normalizedPhone,
      adminNote: normalizedAdminNote,
      photoURL: normalizedPhoto,
      dataConsentAccepted: normalizedConsent,
      dataConsentAt: normalizedConsentAt,
      stamps: nextStamps,
      rewardsClaimed: nextRewards,
      history: nextHistory,
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function adminSaveVipCardProfile(params: {
  existing?: UserLoyaltyProfile;
  displayName: string;
  email: string;
  phone: string;
  adminNote: string;
}): Promise<UserLoyaltyProfile> {
  if (!db) throw new Error('Firestore no está disponible.');

  const cleanUid = params.existing
    ? params.existing.uid.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128)
    : `vip-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  const path = `users/${cleanUid}`;
  const cleanName = clampText(params.displayName, 120) || 'Clienta VIP';
  const cleanEmail = clampText(params.email, 160);
  const cleanPhone = clampText(params.phone, 30);
  const cleanNote = clampText(params.adminNote, 160);
  const cleanPhoto = clampText(params.existing?.photoURL || '', 500);
  const cleanConsent = params.existing ? Boolean(params.existing.dataConsentAccepted) : true;

  const cleanConsentAt = params.existing
    ? clampText(params.existing.dataConsentAt || '', 40)
    : new Date().toISOString().slice(0, 40);

  const todayLabel = new Date().toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const stamps = params.existing
    ? Math.max(0, Math.min(5, Math.round(params.existing.stamps)))
    : 1;

  const rewardsClaimed = params.existing
    ? Math.max(0, Math.min(1000, Math.round(params.existing.rewardsClaimed)))
    : 0;

  const history = params.existing
    ? sanitizeLoyaltyHistory(params.existing.history)
    : sanitizeLoyaltyHistory([
        {
          id: 'welcome',
          date: todayLabel,
          service: 'Registro en Meraki Club VIP',
          price: 0,
        },
      ]);

  try {
    await setDoc(doc(db, 'users', cleanUid), {
      uid: cleanUid,
      email: cleanEmail,
      displayName: cleanName,
      phone: cleanPhone,
      adminNote: cleanNote,
      photoURL: cleanPhoto,
      dataConsentAccepted: cleanConsent,
      dataConsentAt: cleanConsentAt,
      stamps,
      rewardsClaimed,
      history,
      updatedAt: serverTimestamp(),
    });

    return {
      uid: cleanUid,
      email: cleanEmail,
      displayName: cleanName,
      phone: cleanPhone,
      adminNote: cleanNote,
      photoURL: cleanPhoto,
      dataConsentAccepted: cleanConsent,
      dataConsentAt: cleanConsentAt,
      stamps,
      rewardsClaimed,
      history,
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteVipCardAdmin(uid: string): Promise<void> {
  if (!db) throw new Error('Firestore no está disponible.');

  const cleanUid = uid.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
  const path = `users/${cleanUid}`;

  try {
    await deleteDoc(doc(db, 'users', cleanUid));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function submitComplaintToFirestore(complaint: ComplaintEntry): Promise<void> {
  if (!db) return;

  const cleanCode = complaint.claimCode.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32);
  const path = `complaints/${cleanCode}`;

  try {
    await setDoc(doc(db, 'complaints', cleanCode), {
      claimCode: cleanCode,
      fullName: clampText(complaint.fullName, 120),
      documentType: complaint.documentType,
      documentNumber: clampText(complaint.documentNumber, 20),
      phone: clampText(complaint.phone, 30),
      email: clampText(complaint.email, 160),
      address: clampText(complaint.address, 240),
      isMinor: Boolean(complaint.isMinor),
      serviceContracted: clampText(complaint.serviceContracted, 200),
      amountClaimedPEN: Math.max(0, Math.min(50000, Number(complaint.amountClaimedPEN) || 0)),
      complaintType: complaint.complaintType,
      detail: clampText(complaint.detail, 2000),
      consumerRequest: clampText(complaint.consumerRequest, 1000),
      status: 'pendiente',
      adminResponse: '',
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

const VALID_SERVICE_CATEGORIES: ServiceCategory[] = [
  'manos',
  'pies',
  'pestanas',
  'depilacion',
  'masajes',
  'faciales',
];

function parseServiceCategory(raw: string): ServiceCategory {
  for (const cat of VALID_SERVICE_CATEGORIES) {
    if (cat === raw) return cat;
  }

  return 'manos';
}

export function getCategoryLabelForKey(category: ServiceCategory): string {
  switch (category) {
    case 'manos':
      return 'Manos';
    case 'pies':
      return 'Pies';
    case 'pestanas':
      return 'Pestañas';
    case 'depilacion':
      return 'Depilación';
    case 'masajes':
      return 'Masajes';
    case 'faciales':
      return 'Faciales';
  }
}

function sanitizeServicePriceOptions(raw: DocumentData['priceOptions']): ServicePriceOption[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;

  const list: ServicePriceOption[] = [];

  for (const entry of raw.slice(0, 12)) {
    if (!entry || Object.prototype.toString.call(entry) !== '[object Object]') continue;

    // SAFETY: entry verified as a plain [object Object] immediately above.
    const itemData = entry as DocumentData;
    const label = clampText(readStr(itemData, 'label', ''), 100);
    const pricePEN = Math.max(0, Math.min(20000, Math.round(readNum(itemData, 'pricePEN', 0))));
    const sessions = Math.round(readNum(itemData, 'sessions', 0));

    if (!label) continue;

    if (sessions >= 1 && sessions <= 50) {
      list.push({ label, pricePEN, sessions });
    } else {
      list.push({ label, pricePEN });
    }
  }

  return list.length > 0 ? list : undefined;
}

export async function fetchCatalogServicesFromFirestore(): Promise<CatalogService[]> {
  if (!db) return [];

  try {
    const snap = await getDocs(query(collection(db, 'catalogServices'), limit(200)));
    const items: CatalogService[] = [];

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const id = readStr(d, 'id', docSnap.id).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);

      if (id.length < 2) return;

      const category = parseServiceCategory(readStr(d, 'category', 'manos'));
      const priceOptions = sanitizeServicePriceOptions(d['priceOptions']);
      const priceNote = clampText(readStr(d, 'priceNote', ''), 80);
      const note = clampText(readStr(d, 'note', ''), 600);
      const image = clampText(readStr(d, 'image', ''), 500);
      const galleryRaw = readStringArray(d, 'gallery');
      const gallery: string[] = [];

      for (const g of galleryRaw.slice(0, 10)) {
        const cleanG = clampText(g, 500);

        if (cleanG) gallery.push(cleanG);
      }

      const rawPrice = d['pricePEN'];
      const hasPricePEN = Object.prototype.toString.call(rawPrice) === '[object Number]';

      const pricePEN = hasPricePEN
        ? Math.max(0, Math.min(20000, Math.round(Number(rawPrice))))
        : undefined;

      const rawDuration = d['durationMin'];

      const durationMin =
        Object.prototype.toString.call(rawDuration) === '[object Number]'
          ? Math.max(15, Math.min(360, Math.round(Number(rawDuration))))
          : undefined;

      const service: CatalogService = {
        id,
        name: clampText(readStr(d, 'name', 'Servicio Meraki'), 120),
        category,
        categoryLabel: clampText(readStr(d, 'categoryLabel', getCategoryLabelForKey(category)), 60),
        subcategory: clampText(readStr(d, 'subcategory', getCategoryLabelForKey(category)), 100),
        description: clampText(readStr(d, 'description', ''), 1200),
        includes: readStringArray(d, 'includes').slice(0, 20).map((inc) => clampText(inc, 240)).filter(Boolean),
        active: readBool(d, 'active', true),
        popular: readBool(d, 'popular', false),
        displayOrder: Math.max(0, Math.min(10000, Math.round(readNum(d, 'displayOrder', 100)))),
        updatedBy: clampText(readStr(d, 'updatedBy', ''), 160),
      };

      if (pricePEN !== undefined) service.pricePEN = pricePEN;

      if (priceOptions) service.priceOptions = priceOptions;

      if (priceNote) service.priceNote = priceNote;

      if (note) service.note = note;

      if (image) service.image = image;

      if (gallery.length > 0) service.gallery = gallery;

      if (durationMin !== undefined) service.durationMin = durationMin;

      items.push(service);
    });

    return items;
  } catch (err) {
    console.warn('No se pudo leer catalogServices desde Firestore, usando catálogo base:', err);

    return [];
  }
}

interface FirestoreCatalogServicePayload {
  id: string;
  name: string;
  category: ServiceCategory;
  categoryLabel: string;
  subcategory: string;
  description: string;
  includes: string[];
  active: boolean;
  displayOrder: number;
  updatedBy: string;
  updatedAt: FieldValue;
  pricePEN?: number;
  priceOptions?: ServicePriceOption[];
  priceNote?: string;
  note?: string;
  popular?: boolean;
  image?: string;
  gallery?: string[];
  durationMin?: number;
}

export async function saveCatalogServiceToFirestore(
  service: CatalogService,
  actorEmail: string,
): Promise<CatalogService> {
  if (!db) throw new Error('Firestore no está disponible.');

  const cleanId = service.id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);

  if (cleanId.length < 2) {
    throw new Error('Identificador de servicio inválido.');
  }

  const path = `catalogServices/${cleanId}`;
  const cleanIncludes: string[] = [];

  for (const inc of (service.includes || []).slice(0, 20)) {
    const trimmed = clampText(inc, 240);

    if (trimmed) cleanIncludes.push(trimmed);
  }

  const cleanGallery: string[] = [];

  for (const imgRef of (service.gallery || []).slice(0, 10)) {
    const trimmed = clampText(imgRef, 500);

    if (trimmed) cleanGallery.push(trimmed);
  }

  const cleanName = clampText(service.name, 120);
  const cleanCategoryLabel = clampText(service.categoryLabel || getCategoryLabelForKey(service.category), 60);
  const cleanSubcategory = clampText(service.subcategory || cleanCategoryLabel, 100);
  const cleanDescription = clampText(service.description, 1200);
  const cleanActor = clampText(actorEmail || CENTRAL_OWNER_EMAIL, 160);
  const cleanDisplayOrder = Math.max(0, Math.min(10000, Math.round(service.displayOrder ?? 100)));
  const cleanActive = service.active !== false;

  const payload: FirestoreCatalogServicePayload = {
    id: cleanId,
    name: cleanName,
    category: service.category,
    categoryLabel: cleanCategoryLabel,
    subcategory: cleanSubcategory,
    description: cleanDescription,
    includes: cleanIncludes,
    active: cleanActive,
    displayOrder: cleanDisplayOrder,
    updatedBy: cleanActor,
    updatedAt: serverTimestamp(),
    popular: Boolean(service.popular),
  };

  const normalizedResult: CatalogService = {
    id: cleanId,
    name: cleanName,
    category: service.category,
    categoryLabel: cleanCategoryLabel,
    subcategory: cleanSubcategory,
    description: cleanDescription,
    includes: cleanIncludes,
    active: cleanActive,
    popular: Boolean(service.popular),
    displayOrder: cleanDisplayOrder,
    updatedBy: cleanActor,
  };

  const cleanOptions: ServicePriceOption[] = [];

  if (service.priceOptions && service.priceOptions.length > 0) {
    for (const opt of service.priceOptions.slice(0, 12)) {
      const label = clampText(opt.label, 100);
      const pricePEN = Math.max(0, Math.min(20000, Math.round(Number(opt.pricePEN) || 0)));

      if (!label) continue;

      if (opt.sessions && opt.sessions >= 1 && opt.sessions <= 50) {
        cleanOptions.push({ label, pricePEN, sessions: Math.round(opt.sessions) });
      } else {
        cleanOptions.push({ label, pricePEN });
      }
    }
  }

  if (cleanOptions.length > 0) {
    payload.priceOptions = cleanOptions;
    normalizedResult.priceOptions = cleanOptions;
  } else {
    const cleanPricePEN = Math.max(0, Math.min(20000, Math.round(Number(service.pricePEN) || 0)));

    payload.pricePEN = cleanPricePEN;
    normalizedResult.pricePEN = cleanPricePEN;
  }

  const cleanPriceNote = clampText(service.priceNote || '', 80);

  if (cleanPriceNote) {
    payload.priceNote = cleanPriceNote;
    normalizedResult.priceNote = cleanPriceNote;
  }

  const cleanNote = clampText(service.note || '', 600);

  if (cleanNote) {
    payload.note = cleanNote;
    normalizedResult.note = cleanNote;
  }

  const cleanImage = clampText(service.image || '', 500);

  if (cleanImage) {
    payload.image = cleanImage;
    normalizedResult.image = cleanImage;
  }

  if (cleanGallery.length > 0) {
    payload.gallery = cleanGallery;
    normalizedResult.gallery = cleanGallery;
  }

  if (service.durationMin !== undefined && Number.isFinite(service.durationMin)) {
    const cleanDuration = Math.max(15, Math.min(360, Math.round(service.durationMin)));

    payload.durationMin = cleanDuration;
    normalizedResult.durationMin = cleanDuration;
  }

  try {
    await setDoc(doc(db, 'catalogServices', cleanId), payload);

    return normalizedResult;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

const catalogMediaMemoryCache = new Map<string, string>();

const catalogMediaInflight = new Map<string, Promise<string | null>>();

export async function fetchCatalogMediaById(mediaId: string): Promise<string | null> {
  const cleanMediaId = mediaId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);

  if (cleanMediaId.length < 2) return null;

  const cached = catalogMediaMemoryCache.get(cleanMediaId);

  if (cached) return cached;

  const inflight = catalogMediaInflight.get(cleanMediaId);

  if (inflight) return inflight;

  if (!db) return null;

  const firestoreDb = db;

  const loadPromise = (async () => {
    try {
      const snap = await getDoc(doc(firestoreDb, 'catalogMedia', cleanMediaId));

      if (!snap.exists()) return null;

      const d = snap.data();
      const dataUrl = readStr(d, 'dataUrl', '');

      if (dataUrl.startsWith('data:image/')) {
        catalogMediaMemoryCache.set(cleanMediaId, dataUrl);

        return dataUrl;
      }

      return null;
    } catch (err) {
      console.warn(`No se pudo cargar imagen media/${cleanMediaId}:`, err);

      return null;
    } finally {
      catalogMediaInflight.delete(cleanMediaId);
    }
  })();

  catalogMediaInflight.set(cleanMediaId, loadPromise);

  return loadPromise;
}

export async function uploadCatalogMediaImage(params: {
  serviceId: string;
  dataUrl: string;
  mimeType: 'image/webp' | 'image/jpeg' | 'image/png';
  width: number;
  height: number;
  actorEmail: string;
}): Promise<string> {
  if (!db) throw new Error('Firestore no está disponible.');

  const cleanServiceId = params.serviceId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || 'srv';
  const rand = Math.random().toString(36).slice(2, 7);
  const mediaId = `img-${cleanServiceId.slice(0, 32)}-${Date.now().toString(36)}-${rand}`.slice(0, 128);
  const path = `catalogMedia/${mediaId}`;

  try {
    await setDoc(doc(db, 'catalogMedia', mediaId), {
      id: mediaId,
      serviceId: cleanServiceId,
      dataUrl: params.dataUrl,
      mimeType: params.mimeType,
      width: Math.max(16, Math.min(2048, Math.round(params.width))),
      height: Math.max(16, Math.min(2048, Math.round(params.height))),
      updatedBy: clampText(params.actorEmail || CENTRAL_OWNER_EMAIL, 160),
      createdAt: serverTimestamp(),
    });

    catalogMediaMemoryCache.set(mediaId, params.dataUrl);

    return buildCatalogMediaRef(mediaId);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function deleteCatalogMediaImage(mediaId: string): Promise<void> {
  if (!db) return;

  const cleanMediaId = mediaId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);

  if (cleanMediaId.length < 2) return;

  catalogMediaMemoryCache.delete(cleanMediaId);

  try {
    await deleteDoc(doc(db, 'catalogMedia', cleanMediaId));
  } catch (err) {
    console.warn(`No se pudo eliminar catalogMedia/${cleanMediaId}:`, err);
  }
}
