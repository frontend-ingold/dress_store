import Image from 'next/image';
import styles from './HeroSection.module.css';

const fields = [
  { label: 'Location', value: 'Add destination', icon: 'location' },
  { label: 'Check in', value: 'Add dates', icon: 'calendar' },
  { label: 'Check out', value: 'Add dates', icon: 'calendar' },
  { label: 'Guests', value: 'Add guests', icon: 'guests' },
];

export default function HeroSection() {
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
            <p className={styles.subtitle}>Explore beautiful places in the world with Acenda</p>
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
                <div className={styles.fieldText}>
                  <span className={styles.fieldLabel}>{field.label}</span>
                  <span className={styles.fieldValue}>{field.value}</span>
                </div>
              </div>
            ))}
            <button className={styles.searchButton} aria-label="Search stays">
              <span className={styles.searchIcon} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
