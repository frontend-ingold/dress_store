'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { storePendingBooking } from '@/lib/auth-client';
import styles from './BookingDialog.module.css';

const initialForm = {
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  specialRequest: '',
};

function formatUsd(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getNightCount(checkIn, checkOut) {
  if (!checkIn || !checkOut) {
    return 0;
  }

  return Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
}

export default function BookingDialog({
  property,
  filters,
  currentUser,
  feedback,
  onFilterChange,
  onClose,
  onSubmit,
  isPending,
  isDetailPending,
}) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [localFeedback, setLocalFeedback] = useState('');
  const isAuthenticated = Boolean(currentUser);

  useEffect(() => {
    if (property) {
      setForm({
        guestName: currentUser?.full_name || '',
        guestEmail: currentUser?.email || '',
        guestPhone: currentUser?.phone || '',
        specialRequest: '',
      });
    }
  }, [currentUser, property]);

  useEffect(() => {
    if (property) {
      setLocalFeedback('');
    }
  }, [property]);

  if (!property) {
    return null;
  }

  const nights = getNightCount(filters.checkIn, filters.checkOut);
  const subtotal = nights * Number(property.nightly_rate_usd || 0);
  const total = subtotal + Number(property.cleaning_fee_usd || 0);
  const gallery = property.images?.length ? property.images : [property.image];
  const reviews = property.reviews || [];
  const amenities = property.amenities || [];

  function handleChange(event) {
    setLocalFeedback('');
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleTripChange(name, value) {
    setLocalFeedback('');
    onFilterChange(name, value);
  }

  function handleConfirmBooking() {
    if (!filters.checkIn || !filters.checkOut) {
      setLocalFeedback('Select check-in and check-out dates before confirming the booking.');
      return;
    }

    if (!isAuthenticated) {
      storePendingBooking({
        propertySlug: property.slug,
        filters,
      });
      router.push(`/login?redirect=${encodeURIComponent('/')}`);
      return;
    }

    if (!form.guestName || !form.guestEmail) {
      setLocalFeedback('Guest name and email are required.');
      return;
    }

    onSubmit(form);
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close booking dialog">
          x
        </button>

        <div className={styles.header}>
          <div>
            <h3>Complete your booking</h3>
            <p>
              {property.name} | {property.location}
            </p>
          </div>
          <div className={styles.priceChip}>{formatUsd(total || property.nightly_rate_usd)}</div>
        </div>

        {isDetailPending ? <div className={styles.loading}>Loading property details...</div> : null}

        <div className={styles.gallery}>
          {gallery.slice(0, 4).map((image, index) => (
            <div
              key={`${property.slug}-${index}`}
              className={`${styles.imageWrap} ${index === 0 ? styles.heroImageWrap : ''}`}
            >
              <Image src={image} alt={`${property.name} ${index + 1}`} fill className={styles.image} />
            </div>
          ))}
        </div>

        <div className={styles.tripEditor}>
          <label>
            Check in
            <input
              type="date"
              value={filters.checkIn}
              onChange={(event) => handleTripChange('checkIn', event.target.value)}
            />
          </label>
          <label>
            Check out
            <input
              type="date"
              value={filters.checkOut}
              onChange={(event) => handleTripChange('checkOut', event.target.value)}
            />
          </label>
          <label>
            Guests
            <select value={filters.guests} onChange={(event) => handleTripChange('guests', event.target.value)}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                <option key={count} value={count}>
                  {count} guest{count > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </label>
          <div className={styles.nightsChip}>Nights: {nights}</div>
        </div>

        <div className={styles.details}>
          <div className={styles.infoPanel}>
            <p className={styles.description}>{property.description || property.summary}</p>

            {amenities.length > 0 ? (
              <div>
                <h4>Amenities</h4>
                <div className={styles.tags}>
                  {amenities.map((amenity) => (
                    <span key={amenity}>{amenity}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {reviews.length > 0 ? (
              <div>
                <h4>Guest reviews</h4>
                <div className={styles.reviews}>
                  {reviews.map((review, index) => (
                    <article key={`${review.guest_name}-${index}`} className={styles.reviewCard}>
                      <div className={styles.reviewHead}>
                        <div className={styles.avatarWrap}>
                          {review.guest_avatar ? (
                            <Image
                              src={review.guest_avatar}
                              alt={review.guest_name}
                              fill
                              className={styles.avatar}
                            />
                          ) : null}
                        </div>
                        <div>
                          <strong>{review.guest_name}</strong>
                          <p>{review.guest_location}</p>
                        </div>
                        <span className={styles.reviewRating}>* {review.rating}</span>
                      </div>
                      <p className={styles.reviewText}>{review.review_text}</p>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <form
            className={styles.form}
            onSubmit={(event) => {
              event.preventDefault();
              handleConfirmBooking();
            }}
          >
            {!isAuthenticated ? (
              <div className={styles.authNotice}>Login or create an account to confirm this booking.</div>
            ) : null}
            {localFeedback || feedback ? (
              <div className={styles.errorNotice}>{localFeedback || feedback}</div>
            ) : null}
            <div className={styles.grid}>
              <label>
                Full name
                <input
                  name="guestName"
                  required
                  value={form.guestName}
                  onChange={handleChange}
                  placeholder="Enter guest name"
                  disabled={!isAuthenticated}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="guestEmail"
                  required
                  value={form.guestEmail}
                  onChange={handleChange}
                  placeholder="Enter email"
                  disabled={!isAuthenticated}
                />
              </label>
              <label>
                Phone
                <input
                  name="guestPhone"
                  value={form.guestPhone}
                  onChange={handleChange}
                  placeholder="Optional"
                  disabled={!isAuthenticated}
                />
              </label>
              <label>
                Special request
                <textarea
                  rows="4"
                  name="specialRequest"
                  value={form.specialRequest}
                  onChange={handleChange}
                  placeholder="Airport pickup, early check-in, dietary notes..."
                  disabled={!isAuthenticated}
                />
              </label>
            </div>

            <div className={styles.totalRow}>
              <div>
                <strong>Total</strong>
                <p>
                  {nights > 0
                    ? `${formatUsd(subtotal)} + ${formatUsd(property.cleaning_fee_usd)} cleaning`
                    : `From ${formatUsd(property.nightly_rate_usd)} / night`}
                </p>
              </div>
              <button
                type="button"
                className="pill-button"
                disabled={isPending}
                onClick={handleConfirmBooking}
              >
                {isPending ? 'Processing...' : isAuthenticated ? 'Confirm booking' : 'Login to confirm'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
