'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import HeroSection from './HeroSection';
import TopBookings from './TopBookings';
import BookingDialog from './BookingDialog';
import { createBooking, fetchProperties } from '@/lib/api';

const initialFilters = {
  location: '',
  checkIn: '',
  checkOut: '',
  guests: '2',
};

export default function BookingExperience() {
  const [filters, setFilters] = useState(initialFilters);
  const [properties, setProperties] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [isBookingPending, startBookingTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const featuredProperties = await fetchProperties({ featured: 'true' });
        setProperties(featuredProperties);
      } catch (error) {
        setFeedback(error.message);
      }
    });
  }, []);

  const hasSearchFilters = useMemo(
    () => Boolean(filters.location || filters.checkIn || filters.checkOut),
    [filters]
  );

  function handleFilterChange(name, value) {
    setFeedback('');
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSearch() {
    startTransition(async () => {
      try {
        setFeedback('');
        setBookingResult(null);

        const results = await fetchProperties({
          location: filters.location,
          checkIn: filters.checkIn,
          checkOut: filters.checkOut,
          guests: filters.guests,
        });

        setProperties(results);

        if (results.length === 0) {
          setFeedback('No available stays found for the selected filters.');
        }
      } catch (error) {
        setFeedback(error.message);
      }
    });
  }

  function handleOpenBooking(property) {
    setFeedback('');
    setSelectedProperty(property);
  }

  function handleCloseBooking() {
    if (!isBookingPending) {
      setSelectedProperty(null);
    }
  }

  function handleCreateBooking(formData) {
    startBookingTransition(async () => {
      try {
        const booking = await createBooking({
          propertySlug: selectedProperty.slug,
          guestName: formData.guestName,
          guestEmail: formData.guestEmail,
          guestPhone: formData.guestPhone,
          guestsCount: Number(filters.guests || 1),
          checkIn: filters.checkIn,
          checkOut: filters.checkOut,
          specialRequest: formData.specialRequest,
        });

        setBookingResult(booking);
        setSelectedProperty(null);
        setFeedback('');
      } catch (error) {
        setFeedback(error.message);
      }
    });
  }

  return (
    <>
      <HeroSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        isLoading={isPending}
        feedback={feedback}
      />
      <TopBookings
        properties={properties}
        isLoading={isPending}
        onBook={handleOpenBooking}
        hasSearchFilters={hasSearchFilters}
        bookingResult={bookingResult}
        feedback={feedback}
      />
      <BookingDialog
        property={selectedProperty}
        filters={filters}
        onClose={handleCloseBooking}
        onSubmit={handleCreateBooking}
        isPending={isBookingPending}
      />
    </>
  );
}
