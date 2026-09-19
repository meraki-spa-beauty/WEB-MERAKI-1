import { useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/sections/Hero';
import { TreatmentsCatalog } from '../components/sections/TreatmentsCatalog';
import { WelcomeRitual } from '../components/sections/WelcomeRitual';
import { GiftCardsSection } from '../components/sections/GiftCardsSection';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { FAQSection } from '../components/sections/FAQSection';
import { LocationContact } from '../components/sections/LocationContact';
import { TreatmentDetailModal } from '../components/modals/TreatmentDetailModal';
import { BookingModal } from '../components/modals/BookingModal';
import type { Treatment } from '../types';

export function Home() {
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingTreatmentId, setBookingTreatmentId] = useState<string | undefined>(undefined);

  const handleOpenBooking = (treatmentId?: string) => {
    setBookingTreatmentId(treatmentId);
    setIsBookingOpen(true);
  };

  const handleOpenGiftCard = () => {
    const el = document.getElementById('gift-cards');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF2DE] text-[#111111] font-['Montserrat',sans-serif] flex flex-col selection:bg-[#5E765E] selection:text-[#FFF2DE]">
      {/* Upper Announcement & Quick Coordinates Bar */}
      <TopBar onOpenGiftCardModal={handleOpenGiftCard} />

      {/* Main Sticky Header */}
      <Header onOpenBookingModal={handleOpenBooking} />

      {/* Main Page Flow */}
      <main className="flex-1">
        <Hero onOpenBookingModal={() => handleOpenBooking()} />
        <TreatmentsCatalog
          onSelectTreatment={(treatment) => setSelectedTreatment(treatment)}
          onBookTreatment={(id) => handleOpenBooking(id)}
        />
        <WelcomeRitual />
        <GiftCardsSection />
        <TestimonialsSection />
        <FAQSection />
        <LocationContact />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <TreatmentDetailModal
        treatment={selectedTreatment}
        onClose={() => setSelectedTreatment(null)}
        onBook={(id) => handleOpenBooking(id)}
      />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        preselectedTreatmentId={bookingTreatmentId}
      />
    </div>
  );
}
