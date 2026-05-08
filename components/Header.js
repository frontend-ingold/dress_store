import Link from 'next/link';
import styles from './Header.module.css';

const links = [
  { label: 'Home', href: '#home' },
  { label: 'Destinations', href: '#destinations' },
  { label: 'Account', href: '#account' },
  { label: 'News', href: '#news' },
  { label: 'Contact', href: '#contact' },
];

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          ACENDA
        </Link>

        <nav className={styles.nav}>
          {links.map((link) => (
            <a key={link.label} href={link.href} className={styles.navLink}>
              {link.label}
            </a>
          ))}
        </nav>

        <a href="#account" className={styles.cta}>
          My Account
        </a>
      </div>
    </header>
  );
}
