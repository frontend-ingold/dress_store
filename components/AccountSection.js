'use client';

import Link from 'next/link';
import styles from './AccountSection.module.css';

function formatUsd(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) {
    return '--';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export default function AccountSection({
  profileForm,
  currentUser,
  myBookings,
  accountFeedback,
  bookingResult,
  isProfilePending,
  isBookingsPending,
  onProfileFormChange,
  onLogout,
  onProfileSave,
}) {
  const isAuthenticated = Boolean(currentUser);

  return (
    <section className="section" id="account">
      <div className="container">
        <div className={styles.heading}>
          <span className="section-kicker">
            <span className="eyebrow-dot" />
            Account center
          </span>
          <h2 className="section-title">Login, manage your profile, and review confirmed trips</h2>
          <p className="section-subtitle">
            Booking confirmation is tied to your account, and every successful reservation appears here dynamically.
          </p>
        </div>

        {accountFeedback ? <div className={styles.feedback}>{accountFeedback}</div> : null}

        <div className={styles.grid}>
          <article className={`${styles.panel} card`}>
            {!isAuthenticated ? (
              <>
                <div className={styles.panelHeader}>
                  <div>
                    <p className={styles.eyebrow}>Access</p>
                    <h3>Login or register before booking</h3>
                  </div>
                </div>
                <p className={styles.copy}>
                  Use the dedicated authentication pages to access your profile, confirm bookings, and
                  keep all reservation history under one account.
                </p>
                <div className={styles.actions}>
                  <Link href="/login" className="pill-button">
                    Login
                  </Link>
                  <Link href="/register" className="ghost-button">
                    Register
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className={styles.panelHeader}>
                  <div>
                    <p className={styles.eyebrow}>My account</p>
                    <h3>{currentUser.full_name}</h3>
                    <p className={styles.inlineMeta}>{currentUser.email}</p>
                  </div>
                  <button type="button" className="ghost-button" onClick={onLogout}>
                    Logout
                  </button>
                </div>

                <form
                  className={styles.form}
                  onSubmit={(event) => {
                    event.preventDefault();
                    onProfileSave();
                  }}
                >
                  <label>
                    Full name
                    <input
                      value={profileForm.fullName}
                      onChange={(event) => onProfileFormChange('fullName', event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Email
                    <input value={currentUser.email} disabled />
                  </label>
                  <label>
                    Phone
                    <input
                      value={profileForm.phone}
                      onChange={(event) => onProfileFormChange('phone', event.target.value)}
                      placeholder="Optional"
                    />
                  </label>

                  <button type="submit" className="pill-button" disabled={isProfilePending}>
                    {isProfilePending ? 'Saving...' : 'Save profile'}
                  </button>
                </form>

                {bookingResult ? (
                  <div className={styles.highlightCard}>
                    <p className={styles.eyebrow}>Latest confirmation</p>
                    <strong>{bookingResult.property.name}</strong>
                    <span>Reference {bookingResult.booking_reference}</span>
                  </div>
                ) : null}
              </>
            )}
          </article>

          <article className={`${styles.panel} card`}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.eyebrow}>My bookings</p>
                <h3>Confirmed stays</h3>
              </div>
              {isBookingsPending ? <span className={styles.inlineMeta}>Refreshing...</span> : null}
            </div>

            {!isAuthenticated ? (
              <p className={styles.emptyState}>Sign in to see live booking history and confirmation references.</p>
            ) : myBookings.length === 0 ? (
              <p className={styles.emptyState}>No bookings yet. Confirm a stay and it will appear here.</p>
            ) : (
              <div className={styles.bookingList}>
                {myBookings.map((booking) => (
                  <article key={booking.booking_reference} className={styles.bookingCard}>
                    <div className={styles.bookingHead}>
                      <div>
                        <strong>{booking.property_name}</strong>
                        <p>{booking.property_location}</p>
                      </div>
                      <span className={styles.status}>{booking.status}</span>
                    </div>
                    <div className={styles.bookingMeta}>
                      <span>{formatDate(booking.check_in)} - {formatDate(booking.check_out)}</span>
                      <span>{booking.guests_count} guests</span>
                      <span>{booking.nights} nights</span>
                      <span>{formatUsd(booking.total_price_usd)}</span>
                    </div>
                    <div className={styles.referenceRow}>
                      <span>Reference: {booking.booking_reference}</span>
                      <span>Booked on {formatDate(booking.created_at)}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
