'use client';

import { useEffect, useState } from 'react';
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

export default function BookingDialog({ property, filters, onClose, onSubmit, isPending }) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (property) {
      setForm(initialForm);
    }
  }, [property]);

  if (!property) {
    return null;
  }

  const nights = getNightCount(filters.checkIn, filters.checkOut);
  const subtotal = nights * Number(property.nightly_rate_usd || 0);
  const total = subtotal + Number(property.cleaning_fee_usd || 0);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close booking dialog">
          ×
        </button>

        <div className={styles.header}>
          <div>
            <h3>Complete your booking</h3>
            <p>
              {property.name} · {property.location}
            </p>
          </div>
          <div className={styles.priceChip}>{formatUsd(total || property.nightly_rate_usd)}</div>
        </div>

        <div className={styles.summary}>
          <span>Check in: {filters.checkIn || 'Select date'}</span>
          <span>Check out: {filters.checkOut || 'Select date'}</span>
          <span>Guests: {filters.guests || 1}</span>
          <span>Nights: {nights}</span>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <label>
              Full name
              <input
                name="guestName"
                required
                value={form.guestName}
                onChange={handleChange}
                placeholder="Enter guest name"
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
              />
            </label>
            <label>
              Phone
              <input
                name="guestPhone"
                value={form.guestPhone}
                onChange={handleChange}
                placeholder="Optional"
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
              type="submit"
              className="pill-button"
              disabled={isPending || !filters.checkIn || !filters.checkOut}
            >
              {isPending ? 'Processing...' : 'Confirm booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
