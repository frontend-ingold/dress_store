function Footer({ footerSections }) {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div>
          <div className="footer-brand">ATELIER</div>
          <p className="footer-description">
            Curating timeless pieces for the discerning woman. Each dress is crafted with attention
            to detail and sustainable practices.
          </p>
        </div>

        {footerSections.map((section) => (
          <div key={section.title} className="footer-section">
            <h3>{section.title}</h3>
            <ul className="footer-links">
              {section.links.map((link) => (
                <li key={link}>
                  <a href="#">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom">© 2026 Atelier. All rights reserved. Designed with care.</div>
    </footer>
  );
}

export default Footer;
