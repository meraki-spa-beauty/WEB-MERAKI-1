import { createContext, useContext, useState, ReactNode } from 'react';

interface BookingContextType {
  isBookingOpen: boolean;
  preselectedServiceId?: string;
  preselectedOptionIndex?: number;
  openBooking: (serviceId?: string, optionIndex?: number) => void;
  closeBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | undefined>(undefined);

  const openBooking = (serviceId?: string, optionIndex?: number) => {
    setSelectedServiceId(serviceId);
    setSelectedOptionIndex(optionIndex);
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
        preselectedOptionIndex: selectedOptionIndex,
        openBooking,
        closeBooking,
      }}
    >
      {children}
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
