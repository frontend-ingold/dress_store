function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 16L21 21" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5.5 19c1.7-3 4.1-4.5 6.5-4.5S16.8 16 18.5 19"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 5h2l1.3 8.2a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L19.5 8H7.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="18.5" r="1.2" fill="currentColor" />
      <circle cx="17" cy="18.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function Header({ navigationLinks, cartCount = 0 }) {
  return (
    <nav className="site-nav-shell">
      <a href="#/" className="logo">
        ATELIER
      </a>

      <ul className="nav-links">
        {navigationLinks.map((item) => (
          <li key={item.label}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>

      <div className="nav-icons" aria-label="Utility links">
        <button type="button" className="nav-icon-button" aria-label="Search">
          <SearchIcon />
        </button>
        <button type="button" className="nav-icon-button" aria-label="Account">
          <AccountIcon />
        </button>
        <a href="#/cart" className="nav-cart-link nav-icon-button" aria-label="Cart">
          <CartIcon />
          {cartCount > 0 ? <span className="nav-cart-badge">{cartCount}</span> : null}
        </a>
      </div>
    </nav>
  );
}

export default Header;
