import { createContext, useContext, useState, ReactNode } from 'react';
import { BookingModal } from '../components/modals/BookingModal';

interface BookingContextType {
  isBookingOpen: boolean;
  preselectedServiceId?: string;
  openBooking: (serviceId?: string) => void;
  closeBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);

  const openBooking = (serviceId?: string) => {
    setSelectedServiceId(serviceId);
    setIsOpen(true);
  };

  const closeBooking = () => {
    setIsOpen(false);
  };

  return (
    <BookingContext.Provider
      value={{
        isBookingOpen: isOpen,
        preselectedServiceId: selectedServiceId,
        openBooking,
        closeBooking
      }}
    >
      {children}
      <BookingModal
        isOpen={isOpen}
        onClose={closeBooking}
        preselectedServiceId={selectedServiceId}
      />
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingContextType {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }

  return context;
}
