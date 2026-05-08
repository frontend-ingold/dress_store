import Image from 'next/image';
import { testimonials } from '@/data/siteData';
import styles from './TestimonialsSection.module.css';

export default function TestimonialsSection() {
  return (
    <section className={styles.section}>
      <Image
        src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80"
        alt="Poolside luxury resort"
        fill
        className={styles.background}
      />
      <div className={styles.overlay} />
      <div className={`container ${styles.inner}`}>
        <div className={styles.heading}>
          <span className="section-kicker">
            <span className="eyebrow-dot" />
            Testimonials
          </span>
          <h2 className={styles.title}>Social proof in a compact card carousel style</h2>
        </div>

        <div className={styles.grid}>
          {testimonials.map((item) => (
            <article key={item.name} className={styles.card}>
              <div className={styles.profile}>
                <Image src={item.image} alt={item.name} width={56} height={56} className={styles.avatar} />
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.role}</p>
                </div>
              </div>
              <span className={styles.stars}>★★★★★</span>
              <p className={styles.text}>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
