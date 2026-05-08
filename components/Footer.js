import styles from './Footer.module.css';

const groups = {
  Support: ['Help center', 'Safety information', 'Cancellation options'],
  Company: ['About us', 'Destinations', 'Terms of service'],
  Contact: ['FAQ', 'Call us today', 'Partnerships'],
  Social: ['Facebook', 'Twitter', 'Instagram'],
};

export default function Footer() {
  return (
    <footer className={styles.footer} id="contact">
      <div className={`container ${styles.grid}`}>
        {Object.entries(groups).map(([title, items]) => (
          <div key={title}>
            <h3>{title}</h3>
            <ul className={styles.list}>
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={`container ${styles.bottom}`}>
        <span>© Copyright Acenda 2026</span>
        <span>VISA · MasterCard · PayPal</span>
      </div>
    </footer>
  );
}
