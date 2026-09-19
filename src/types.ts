export type TreatmentCategory = 'masajes' | 'faciales' | 'corporales' | 'parejas' | 'salon';

export type ExperienceTone = 'sage' | 'cream' | 'terracotta';

export interface Treatment {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: TreatmentCategory;
  categoryLabel: string;
  durationMin: number;
  durationLabel: string;
  pricePEN: number;
  shortDescription: string;
  fullDescription: string;
  benefits: string[];
  includes: string[];
  image: string;
  isPopular?: boolean;
  tone: ExperienceTone;
}

export interface BookingRequest {
  treatmentId: string;
  treatmentTitle: string;
  date: string;
  timeSlot: string;
  peopleCount: 1 | 2;
  therapistPreference: 'any' | 'female' | 'specialist';
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  specialRequests: string;
}

export interface GiftCardSelection {
  type: 'digital' | 'luxury-box';
  amount: number;
  treatmentName?: string;
  recipientName: string;
  recipientEmail?: string;
  senderName: string;
  personalMessage: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  rating: number;
  comment: string;
  treatment: string;
  date: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'reservas' | 'servicios' | 'instalaciones' | 'giftcards';
}
