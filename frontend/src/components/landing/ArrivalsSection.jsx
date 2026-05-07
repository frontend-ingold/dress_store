import SectionHeader from "./SectionHeader";

function ArrivalsSection({ newArrivals }) {
  function getDiscountLabel(item) {
    if (!item.specialPrice) {
      return "";
    }

    const price = Number(item.price);
    const specialPrice = Number(item.specialPrice);

    if (!price || specialPrice >= price) {
      return "";
    }

    return `${Math.round(((price - specialPrice) / price) * 100)}% Off`;
  }

  return (
    <section className="arrivals" id="new">
      <SectionHeader subtitle="Just Landed" title="New Arrivals" />

      <div className="products-grid">
        {newArrivals.map((item) => (
          <article key={item.name} className="product-card">
            <div className="product-image">
              <img src={item.imageUrl} alt={item.name} />
              {getDiscountLabel(item) ? (
                <span className="discount-ribbon arrival-discount-ribbon">
                  {getDiscountLabel(item)}
                </span>
              ) : null}
              <button type="button" className="quick-add">
                Quick Add
              </button>
            </div>
            <div className="product-info">
              <h3 className="product-name">{item.name}</h3>
              <p className="product-price">
                {item.specialPriceLabel ? (
                  <>
                    <span className="price-original">{item.priceLabel}</span>
                    <span className="price-current">{item.specialPriceLabel}</span>
                  </>
                ) : (
                  <span className="price-current">{item.priceLabel}</span>
                )}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ArrivalsSection;
