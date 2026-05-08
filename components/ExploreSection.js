import Image from 'next/image';
import { exploreCards } from '@/data/siteData';
import styles from './ExploreSection.module.css';

export default function ExploreSection() {
  return (
    <section className={styles.section}>
      <Image
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80"
        alt="Ocean villas from above"
        fill
        className={styles.background}
      />
      <div className={styles.overlay} />
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <span className="section-kicker">
            <span className="eyebrow-dot" />
            Explore Maldives
          </span>
          <h2 className={styles.title}>A destination block designed to sell the mood first</h2>
          <p>
            This section mirrors the prototype’s large travel banner while keeping the content
            modular for future destination pages or seasonal campaigns.
          </p>
          <button className="ghost-button">See all</button>
        </div>

        <div className={styles.cards}>
          {exploreCards.map((card) => (
            <article key={card.title} className={styles.card}>
              <div className={styles.thumb}>
                <Image src={card.image} alt={card.title} fill className={styles.image} />
              </div>
              <span>{card.title}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
