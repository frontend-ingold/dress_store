import Image from 'next/image';
import styles from './SubscribeSection.module.css';

export default function SubscribeSection() {
  return (
    <section className="section">
      <div className="container">
        <div className={styles.card}>
          <div className={styles.media}>
            <Image
              src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80"
              alt="Luxury seaside villa"
              fill
              className={styles.image}
            />
          </div>
          <div className={styles.content}>
            <h2>Get special offers, and more from travelworld</h2>
            <form className={styles.form}>
              <input type="email" placeholder="Enter your email" aria-label="Email address" />
              <button type="submit" className="pill-button">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
