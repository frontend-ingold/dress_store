'use client';

import Image from 'next/image';
import styles from './TopBookings.module.css';

function formatUsd(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function TopBookings({
  properties,
  isLoading,
  onBook,
  hasSearchFilters,
  bookingResult,
  feedback,
}) {
  return (
    <section className="section" id="destinations">
      <div className="container">
        <div className={styles.heading}>
          <span className="section-kicker">
            <span className="eyebrow-dot" />
            Top book now
          </span>
          <h2 className="section-title">
            {hasSearchFilters ? 'Available stays for your trip' : 'Trending stays with a premium resort look'}
          </h2>
          <p className="section-subtitle">
            Search results are now driven by the booking API and PostgreSQL availability data.
          </p>
        </div>

        {bookingResult ? (
          <div className={styles.successBanner}>
            Booking confirmed for <strong>{bookingResult.property.name}</strong>. Reference:{' '}
            <strong>{bookingResult.booking_reference}</strong>
          </div>
        ) : null}

        <div className={styles.grid}>
          {properties.map((property) => (
            <article key={property.slug} className={`${styles.card} card`}>
              <div className={styles.imageWrap}>
                <Image src={property.image} alt={property.name} fill className={styles.image} />
                <span className={styles.badge}>★ {property.rating}</span>
              </div>
              <div className={styles.body}>
                <div>
                  <h3>{property.name}</h3>
                  <p>{property.location}</p>
                  <span className={styles.meta}>
                    {property.bedrooms} bed · {property.bathrooms} bath · Up to {property.max_guests} guests
                  </span>
                </div>
                <strong>{formatUsd(property.nightly_rate_usd)}</strong>
              </div>
              <div className={styles.footer}>
                <p>{property.summary}</p>
                <button className="pill-button" onClick={() => onBook(property)}>
                  Book now
                </button>
              </div>
            </article>
          ))}
        </div>

        {isLoading ? <p className={styles.state}>Loading available stays...</p> : null}
        {!isLoading && properties.length === 0 && !feedback ? (
          <p className={styles.state}>No properties available yet.</p>
        ) : null}
      </div>
    </section>
  );
}
