function Header({ navigationLinks }) {
  return (
    <nav className="site-nav-shell">
      <div className="logo">ATELIER</div>

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
        <button type="button" aria-label="Cart">
          Cart
        </button>
      </div>
    </nav>
  );
}

export default Header;
