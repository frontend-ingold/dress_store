'use client';

import Image from 'next/image';
import styles from './HeroSection.module.css';

const fields = [
  { name: 'location', label: 'Location', icon: 'location', placeholder: 'Add destination', type: 'text' },
  { name: 'checkIn', label: 'Check in', icon: 'calendar', placeholder: 'Add dates', type: 'date' },
  { name: 'checkOut', label: 'Check out', icon: 'calendar', placeholder: 'Add dates', type: 'date' },
  { name: 'guests', label: 'Guests', icon: 'guests', placeholder: 'Add guests', type: 'select' },
];

export default function HeroSection({ filters, onFilterChange, onSearch, isLoading, feedback }) {
  return (
    <section className={styles.hero} id="home">
      <div className={styles.banner}>
        <Image
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
          alt="Luxury island aerial view"
          fill
          priority
          className={styles.heroImage}
        />
        <div className={styles.overlay} />
      </div>

      <div className={`container ${styles.content}`}>
        <div className={`${styles.bookingPanel} card`}>
          <div className={styles.copy}>
            <h1 className={styles.title}>Good Morning!</h1>
            <p className={styles.subtitle}>
              Explore beautiful places in the world with Acenda and search live availability.
            </p>
          </div>

          <div className={styles.searchCard}>
            {fields.map((field) => (
              <div key={field.label} className={styles.field}>
                <span
                  className={`${styles.fieldIcon} ${
                    field.icon === 'calendar'
                      ? styles.calendarIcon
                      : field.icon === 'guests'
                        ? styles.guestsIcon
                        : styles.locationIcon
                  }`}
                  aria-hidden="true"
                />
                <label className={styles.fieldText}>
                  <span className={styles.fieldLabel}>{field.label}</span>
                  {field.type === 'select' ? (
                    <select
                      className={styles.fieldInput}
                      value={filters[field.name]}
                      onChange={(event) => onFilterChange(field.name, event.target.value)}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                        <option key={count} value={count}>
                          {count} guest{count > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      className={styles.fieldInput}
                      value={filters[field.name]}
                      placeholder={field.placeholder}
                      onChange={(event) => onFilterChange(field.name, event.target.value)}
                    />
                  )}
                </label>
              </div>
            ))}
            <button
              className={styles.searchButton}
              aria-label="Search stays"
              onClick={onSearch}
              disabled={isLoading}
            >
              <span className={styles.searchIcon} />
            </button>
          </div>
          {feedback ? <p className={styles.feedback}>{feedback}</p> : null}
        </div>
      </div>
    </section>
  );
}
