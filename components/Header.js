import Link from 'next/link';
import styles from './Header.module.css';

const links = ['Home', 'Destinations', 'Deals', 'News', 'Contact'];

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          ACENDA
        </Link>

        <nav className={styles.nav}>
          {links.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className={styles.navLink}>
              {link}
            </a>
          ))}
        </nav>

        <button className={styles.cta}>Book Stay</button>
      </div>
    </header>
  );
}
