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
        <button type="button" aria-label="Search">
          Search
        </button>
        <button type="button" aria-label="Account">
          Account
        </button>
        <a href="#/cart" className="nav-cart-link" aria-label="Cart">
          Cart{cartCount > 0 ? ` (${cartCount})` : ""}
        </a>
      </div>
    </nav>
  );
}

export default Header;
