function Header() {
  return (
    <header className="site-header">
      <a href="#" className="brand">
        <span className="brand-mark">D</span>
        <span className="brand-copy">
          <strong>Dressify</strong>
          <span>Elevated occasionwear</span>
        </span>
      </a>

      <nav className="site-nav">
        <a href="#collections">Collections</a>
        <a href="#story">Story</a>
        <a href="#promise">Why us</a>
        <a href="#cta">Shop soon</a>
      </nav>
    </header>
  );
}

export default Header;
