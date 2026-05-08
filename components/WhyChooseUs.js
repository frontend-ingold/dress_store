import { reasonCards } from '@/data/siteData';
import styles from './WhyChooseUs.module.css';

export default function WhyChooseUs() {
  return (
    <section className="section" id="deals">
      <div className="container">
        <div className={styles.heading}>
          <span className="section-kicker">
            <span className="eyebrow-dot" />
            Why choose us
          </span>
          <h2 className="section-title">Crafted for effortless luxury booking</h2>
        </div>

        <div className={styles.grid}>
          {reasonCards.map((card, index) => (
            <article key={card.title} className={`${styles.card} card`}>
              <div className={styles.icon}>{index + 1}</div>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
