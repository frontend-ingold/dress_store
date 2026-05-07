function HeroSection({ heroImage, heroSubtitle, heroTitle, heroDescription }) {
  return (
    <section className="hero" id="about">
      <div className="hero-content">
        <p className="hero-subtitle">{heroSubtitle}</p>
        <h1 className="hero-title">{heroTitle}</h1>
        <p className="hero-description">{heroDescription}</p>

        <div className="cta-group">
          <a href="#/products" className="btn btn-primary">
            Shop All Dresses
          </a>
          <a href="#about" className="btn btn-secondary">
            Our Story
          </a>
        </div>
      </div>

      <div className="hero-image">
        <img
          src={heroImage?.imageUrl || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=80"}
          alt={heroImage?.name || "Elegant dress on model"}
        />
      </div>
    </section>
  );
}

export default HeroSection;
