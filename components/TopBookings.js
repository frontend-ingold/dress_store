import Image from 'next/image';
import { properties } from '@/data/siteData';
import styles from './TopBookings.module.css';

export default function TopBookings() {
  return (
    <section className="section" id="destinations">
      <div className="container">
        <div className={styles.heading}>
          <span className="section-kicker">
            <span className="eyebrow-dot" />
            Top book now
          </span>
          <h2 className="section-title">Trending stays with a premium resort look</h2>
          <p className="section-subtitle">
            A reusable property grid ready for real inventory, filters, and navigation later.
          </p>
        </div>

        <div className={styles.grid}>
          {properties.map((property) => (
            <article key={property.name} className={`${styles.card} card`}>
              <div className={styles.imageWrap}>
                <Image src={property.image} alt={property.name} fill className={styles.image} />
                <span className={styles.badge}>★ {property.rating}</span>
              </div>
              <div className={styles.body}>
                <div>
                  <h3>{property.name}</h3>
                  <p>{property.location}</p>
                </div>
                <strong>{property.price}</strong>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.actionRow}>
          <button className="ghost-button">See all</button>
        </div>
      </div>
    </section>
  );
}
