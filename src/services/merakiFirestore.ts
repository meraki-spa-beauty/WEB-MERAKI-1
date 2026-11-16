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
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type {
  BookingServiceLine,
  BookingStatus,
  ComplaintEntry,
  LoyaltyHistoryItem,
  MerakiBooking,
  PaymentMode,
  ScheduleConfig,
  ServiceLocationType,
  SlotLockEntry,
  StaffAccessEntry,
  UserLoyaltyProfile,
} from '../types';
import { CENTRAL_OWNER_EMAIL } from '../data/spaData';
import { DEFAULT_SCHEDULE_CONFIG } from '../utils/scheduleEngine';

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
        uid: readStr(d, 'uid', docSnap.id),
        email: readStr(d, 'email', ''),
        displayName: readStr(d, 'displayName', 'Clienta VIP'),
        photoURL: readStr(d, 'photoURL', ''),
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

export async function adminStampUserVip(params: {
  user: UserLoyaltyProfile;
  serviceName: string;
  pricePEN: number;
  action: 'stamp' | 'redeem';
}): Promise<UserLoyaltyProfile> {
  if (!db) throw new Error('Firestore no está disponible.');

  const path = `users/${params.user.uid}`;
  const cleanName = clampText(params.serviceName, 160);
  const cleanPrice = Math.max(0, Math.min(10000, Math.round(params.pricePEN)));

  const todayLabel = new Date().toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const entry: LoyaltyHistoryItem = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    date: todayLabel,
    service: params.action === 'redeem' ? `Canje VIP: ${cleanName}` : cleanName,
    price: params.action === 'redeem' ? 0 : cleanPrice,
  };

  const nextStamps =
    params.action === 'redeem' ? 0 : Math.min(5, Math.max(0, params.user.stamps + 1));

  const nextRewards =
    params.action === 'redeem' ? params.user.rewardsClaimed + 1 : params.user.rewardsClaimed;

  const nextHistory = [entry, ...params.user.history].slice(0, 100);

  try {
    await updateDoc(doc(db, 'users', params.user.uid), {
      stamps: nextStamps,
      rewardsClaimed: nextRewards,
      history: nextHistory,
      updatedAt: serverTimestamp(),
    });

    return {
      ...params.user,
      stamps: nextStamps,
      rewardsClaimed: nextRewards,
      history: nextHistory,
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
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
