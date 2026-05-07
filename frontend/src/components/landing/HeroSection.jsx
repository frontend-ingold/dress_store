function HeroSection({ highlights }) {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <p className="eyebrow">New season landing page</p>
        <h1>Dress ecommerce with a sharper fashion identity.</h1>
        <p className="hero-text">
          Dressify is built for modern boutique retail: expressive visuals, richer color contrast,
          and a premium first impression that feels closer to a campaign page than a generic
          storefront.
        </p>

        <div className="hero-actions">
          <a href="#collections" className="button button-primary">
            Explore collections
          </a>
          <a href="#story" className="button button-secondary">
            Discover the brand
          </a>
        </div>

        <div className="hero-notes">
          {highlights.map((item) => (
            <div key={item} className="hero-note">
              <span className="hero-note-dot" />
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-visual">
        <article className="hero-card hero-card-large">
          <img
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80"
            alt="Editorial bridal-inspired dress styling"
          />
          <div className="hero-card-overlay">
            <p>Campaign Edit</p>
            <strong>Soft volume, sculpted lines, and warm neutrals.</strong>
          </div>
        </article>

        <div className="hero-stack">
          <article className="hero-card hero-card-small metric-card">
            <p>Brand Mood</p>
            <strong>Refined, feminine, modern</strong>
            <span>Purpose-built for a professional ecommerce first impression.</span>
          </article>

          <article className="hero-card hero-card-small">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80"
              alt="Fashion detail showing dress styling"
            />
          </article>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
