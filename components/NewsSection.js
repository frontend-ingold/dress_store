import Image from 'next/image';
import { newsCards } from '@/data/siteData';
import styles from './NewsSection.module.css';

export default function NewsSection() {
  return (
    <section className="section" id="news">
      <div className="container">
        <div className={styles.topRow}>
          <div>
            <span className="section-kicker">
              <span className="eyebrow-dot" />
              Feature news
            </span>
            <h2 className="section-title">Editorial blocks for travel content and updates</h2>
          </div>
          <div className={styles.arrows}>
            <span />
            <span />
          </div>
        </div>

        <div className={styles.grid}>
          {newsCards.map((card) => (
            <article key={card.title} className={`${styles.card} card`}>
              <div className={styles.imageWrap}>
                <Image src={card.image} alt={card.title} fill className={styles.image} />
              </div>
              <div className={styles.body}>
                <p className={styles.date}>February 20, 2024</p>
                <h3>{card.title}</h3>
                <p className={styles.text}>
                  Structured content cards let you wire up blogs, offers, or local travel guides
                  later without changing the layout.
                </p>
                <a href="#home" className={styles.link}>
                  See more
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
