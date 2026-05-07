import SectionHeader from "./SectionHeader";

function ArrivalsSection({ newArrivals }) {
  return (
    <section className="arrivals" id="new">
      <SectionHeader subtitle="Just Landed" title="New Arrivals" />

      <div className="products-grid">
        {newArrivals.map((item) => (
          <article key={item.name} className="product-card">
            <div className="product-image">
              <img src={item.imageUrl} alt={item.name} />
              <button type="button" className="quick-add">
                Quick Add
              </button>
            </div>
            <div className="product-info">
              <h3 className="product-name">{item.name}</h3>
              <p className="product-price">{item.priceLabel}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ArrivalsSection;
