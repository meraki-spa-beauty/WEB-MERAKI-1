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

export interface BookingData {
  serviceId?: string;
  serviceName?: string;
  category?: ServiceCategory;
  clientName: string;
  phone: string;
  district: string;
  serviceLocationType: 'casa' | 'trabajo';
  preferredDate: string;
  preferredTime: string;
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
