'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import HeroSection from './HeroSection';
import TopBookings from './TopBookings';
import BookingDialog from './BookingDialog';
import AccountSection from './AccountSection';
import {
  createBooking,
  fetchCurrentUser,
  fetchMyBookings,
  fetchProperties,
  fetchPropertyDetail,
  logoutUser,
  updateAccount,
} from '@/lib/api';
import {
  clearPendingBooking,
  clearStoredAuthToken,
  getPendingBooking,
  getStoredAuthToken,
  storeAuthToken,
} from '@/lib/auth-client';

const initialFilters = {
  location: '',
  checkIn: '',
  checkOut: '',
  guests: '2',
};

const initialProfileForm = {
  fullName: '',
  phone: '',
};

export default function BookingExperience() {
  const [filters, setFilters] = useState(initialFilters);
  const [properties, setProperties] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [accountFeedback, setAccountFeedback] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedPropertyDetail, setSelectedPropertyDetail] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [authToken, setAuthToken] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [hasRestoredPendingBooking, setHasRestoredPendingBooking] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isBookingPending, startBookingTransition] = useTransition();
  const [isDetailPending, startDetailTransition] = useTransition();
  const [isProfilePending, startProfileTransition] = useTransition();
  const [isBookingsPending, startBookingsTransition] = useTransition();
  const activeBookingProperty = selectedPropertyDetail || selectedProperty;

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

  useEffect(() => {
    const storedToken = getStoredAuthToken();

    if (storedToken) {
      hydrateSession(storedToken);
    }
  }, []);

  useEffect(() => {
    if (!currentUser || hasRestoredPendingBooking) {
      return;
    }

    const pendingBooking = getPendingBooking();

    if (!pendingBooking?.propertySlug) {
      setHasRestoredPendingBooking(true);
      return;
    }

    if (pendingBooking.filters) {
      setFilters((current) => ({
        ...current,
        ...pendingBooking.filters,
      }));
    }

    const fallbackProperty = properties.find((property) => property.slug === pendingBooking.propertySlug);

    if (fallbackProperty) {
      handleOpenBooking(fallbackProperty);
      clearPendingBooking();
      setHasRestoredPendingBooking(true);
      return;
    }

    startDetailTransition(async () => {
      try {
        const detail = await fetchPropertyDetail(pendingBooking.propertySlug);
        setFeedback('');
        setSelectedProperty(detail);
        setSelectedPropertyDetail(detail);
      } catch (error) {
        setFeedback(error.message);
      } finally {
        clearPendingBooking();
        setHasRestoredPendingBooking(true);
      }
    });
  }, [currentUser, hasRestoredPendingBooking, properties]);

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
    setSelectedPropertyDetail(null);

    startDetailTransition(async () => {
      try {
        const detail = await fetchPropertyDetail(property.slug);
        setSelectedPropertyDetail(detail);
      } catch (error) {
        setFeedback(error.message);
      }
    });
  }

  function handleCloseBooking() {
    if (!isBookingPending) {
      setSelectedProperty(null);
      setSelectedPropertyDetail(null);
      clearPendingBooking();
    }
  }

  function handleCreateBooking(formData) {
    startBookingTransition(async () => {
      try {
        if (!authToken || !currentUser) {
          setFeedback('Login or register in My Account before confirming a booking.');
          return;
        }

        if (!activeBookingProperty?.slug) {
          setFeedback('Booking details are missing. Please reopen the stay and try again.');
          return;
        }

        const booking = await createBooking({
          propertySlug: activeBookingProperty.slug,
          guestName: formData.guestName,
          guestEmail: formData.guestEmail,
          guestPhone: formData.guestPhone,
          guestsCount: Number(filters.guests || 1),
          checkIn: filters.checkIn,
          checkOut: filters.checkOut,
          specialRequest: formData.specialRequest,
          token: authToken,
        });

        setBookingResult(booking);
        setSelectedProperty(null);
        setSelectedPropertyDetail(null);
        setFeedback('');
        setAccountFeedback(`Booking confirmed. Reference ${booking.booking_reference}`);
        clearPendingBooking();
        refreshMyBookings(authToken);
      } catch (error) {
        setFeedback(error.message);
      }
    });
  }

  function handleProfileFormChange(name, value) {
    setAccountFeedback('');
    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleLogout() {
    startTransition(async () => {
      try {
        if (authToken) {
          await logoutUser(authToken);
        }
      } catch (_error) {
      } finally {
        clearSession();
        setAccountFeedback('Logged out.');
      }
    });
  }

  function handleProfileSave() {
    startProfileTransition(async () => {
      try {
        const updatedUser = await updateAccount(
          {
            fullName: profileForm.fullName,
            phone: profileForm.phone,
          },
          authToken
        );

        setCurrentUser(updatedUser);
        setProfileForm({
          fullName: updatedUser.full_name || '',
          phone: updatedUser.phone || '',
        });
        setAccountFeedback('Profile updated.');
      } catch (error) {
        setAccountFeedback(error.message);
      }
    });
  }

  function hydrateSession(token) {
    startTransition(async () => {
      try {
        const user = await fetchCurrentUser(token);
        setAuthToken(token);
        setCurrentUser(user);
        setProfileForm({
          fullName: user.full_name || '',
          phone: user.phone || '',
        });
        storeAuthToken(token);
        refreshMyBookings(token);
      } catch (_error) {
        clearSession();
      }
    });
  }

  function refreshMyBookings(token) {
    startBookingsTransition(async () => {
      try {
        const bookings = await fetchMyBookings(token);
        setMyBookings(bookings);
      } catch (error) {
        setAccountFeedback(error.message);
      }
    });
  }

  function clearSession() {
    setAuthToken('');
    setCurrentUser(null);
    setMyBookings([]);
    setProfileForm(initialProfileForm);
    clearStoredAuthToken();
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
        property={activeBookingProperty}
        filters={filters}
        currentUser={currentUser}
        feedback={feedback}
        onFilterChange={handleFilterChange}
        onClose={handleCloseBooking}
        onSubmit={handleCreateBooking}
        isPending={isBookingPending}
        isDetailPending={isDetailPending}
      />
      <AccountSection
        profileForm={profileForm}
        currentUser={currentUser}
        myBookings={myBookings}
        accountFeedback={accountFeedback}
        bookingResult={bookingResult}
        isProfilePending={isProfilePending}
        isBookingsPending={isBookingsPending}
        onProfileFormChange={handleProfileFormChange}
        onLogout={handleLogout}
        onProfileSave={handleProfileSave}
      />
    </>
  );
}
