export type ServiceCategory = 'manos' | 'pies' | 'pestanas' | 'depilacion' | 'masajes' | 'faciales';

export interface ServicePriceOption {
  label: string;
  pricePEN: number;
  sessions?: number;
}

export interface CatalogService {
  id: string;
  name: string;
  category: ServiceCategory;
  categoryLabel: string;
  subcategory: string;
  pricePEN?: number;
  priceOptions?: ServicePriceOption[];
  priceNote?: string;
  description: string;
  includes: string[];
  note?: string;
  popular?: boolean;
  image?: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  rating: number;
  comment: string;
  service: string;
  location: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'reservas' | 'servicios' | 'movilidad' | 'bioseguridad';
}

export type PaymentMode = 'manual_yape' | 'gateway_checkout';

export type BookingPaymentStatus =
  | 'pending_yape'
  | 'manual_code_submitted'
  | 'gateway_paid'
  | 'verified'
  | 'cancelled';

export type BookingStatus =
  | 'pending_yape'
  | 'manual_code_submitted'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export type ServiceLocationType = 'estudio' | 'casa' | 'trabajo';

export interface LoyaltyHistoryItem {
  id: string;
  date: string;
  service: string;
  price: number;
}

export interface UserLoyaltyProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  adminNote?: string;
  photoURL?: string;
  stamps: number;
  rewardsClaimed: number;
  history: LoyaltyHistoryItem[];
}

export interface StaffAccessEntry {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  canManageAgenda: boolean;
  canManageBookings: boolean;
  canStampVip: boolean;
  createdBy: string;
}

export interface ScheduleConfig {
  blockedDates: string[];
  blockedSlots: string[];
  enableConditional0800: boolean;
  requireNearby0600For0800: boolean;
  maxTravelMinutes: number;
  distantMinOrderPEN: number;
  paymentMode: PaymentMode;
  updatedBy: string;
}

export interface SlotLockEntry {
  bookingCode: string;
  date: string;
  timeSlot: string;
  locationType: ServiceLocationType;
  district: string;
  totalPEN: number;
  estimatedDurationMin: number;
  status: 'active' | 'cancelled';
}

export interface BookingServiceLine {
  serviceId: string;
  serviceName: string;
  optionLabel: string;
  pricePEN: number;
}

export interface MerakiBooking {
  bookingCode: string;
  uid: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  specialNotes: string;
  services: BookingServiceLine[];
  servicesSummary: string;
  locationType: ServiceLocationType;
  district: string;
  address: string;
  date: string;
  timeSlot: string;
  estimatedDurationMin: number;
  totalPEN: number;
  advancePEN: number;
  paymentMode: PaymentMode;
  paymentStatus: BookingPaymentStatus;
  yapeOperationCode: string;
  status: BookingStatus;
  privacyAccepted: boolean;
  createdAtIso?: string;
}

export interface ComplaintEntry {
  claimCode: string;
  fullName: string;
  documentType: 'DNI' | 'CE' | 'Pasaporte' | 'RUC';
  documentNumber: string;
  phone: string;
  email: string;
  address: string;
  isMinor: boolean;
  serviceContracted: string;
  amountClaimedPEN: number;
  complaintType: 'reclamo' | 'queja';
  detail: string;
  consumerRequest: string;
  status: 'pendiente' | 'atendido';
  adminResponse: string;
  createdAtIso?: string;
}

export interface LimaDistrictMeta {
  name: string;
  lat: number;
  lng: number;
  minutesFromStudio: number;
  tier: 'cercano' | 'intermedio' | 'lejano';
}
