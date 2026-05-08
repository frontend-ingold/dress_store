import { partners } from '@/data/siteData';
import styles from './PartnersStrip.module.css';

export default function PartnersStrip() {
  return (
    <section className={styles.wrap}>
      <div className={`container ${styles.inner}`}>
        <span className={styles.label}>Our partners</span>
        <div className={styles.items}>
          {partners.map((partner) => (
            <span key={partner} className={styles.item}>
              {partner}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
