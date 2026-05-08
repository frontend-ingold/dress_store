import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import { footerSections } from "../data/landingContent";
import useFavorites from "../hooks/useFavorites";
import useProducts from "../hooks/useProducts";

const favoritesLinks = [
  { label: "Home", href: "#/" },
  { label: "Products", href: "#/products" },
  { label: "Favorites", href: "#/account/favorites" },
  { label: "Contact", href: "#contact" }
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function RemoveIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 7h10M9.2 7V5.8c0-.5.4-.8.8-.8H14c.5 0 .8.4.8.8V7M8.3 9.5l.5 8c0 .8.3 1.2 1.1 1.2h4.2c.8 0 1.1-.4 1.1-1.2l.5-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getDisplayPrice(product) {
  return Number(product.specialPrice ?? product.price);
}

function FavoritesPage() {
  const { products, isLoading, error } = useProducts();
  const { favorites, toggleFavorite } = useFavorites();

  const favoriteProducts = products.filter((product) => favorites.includes(String(product.id)));

  return (
    <>
      <Header navigationLinks={favoritesLinks} />

      <main className="account-page">
        <section className="account-hero compact">
          <div className="account-hero-copy">
            <p className="section-subtitle">My account</p>
            <h1 className="catalog-heading">Favourite page</h1>
            <p className="account-hero-text">
              Keep a refined shortlist of the pieces you want to revisit, compare, or purchase later.
            </p>
          </div>
          <div className="account-hero-badge small">
            <strong>{favoriteProducts.length}</strong>
            <span>Saved item{favoriteProducts.length === 1 ? "" : "s"}</span>
          </div>
        </section>

        {error ? <p className="catalog-status error">{error}</p> : null}
        {isLoading ? <p className="catalog-status">Loading favourites...</p> : null}

        {!isLoading && !favoriteProducts.length ? (
          <section className="account-empty-state">
            <h2>No favourites saved yet.</h2>
            <p>Add products to favourites from the catalog or product details page.</p>
            <a href="#/products" className="catalog-banner-link primary">
              Explore products
            </a>
          </section>
        ) : null}

        {favoriteProducts.length ? (
          <section className="account-dashboard">
            <aside className="account-nav-card">
              <p className="account-nav-label">Account navigation</p>
              <a href="#/account/profile" className="account-nav-link">
                Profile overview
              </a>
              <a href="#/account/favorites" className="account-nav-link active">
                Favourite page
              </a>
              <a href="#/account/orders" className="account-nav-link">
                Orders list
              </a>
            </aside>

            <div className="account-content-stack">
              <section className="favorites-list">
                {favoriteProducts.map((product) => (
                  <article key={product.id} className="favorite-product-row">
                    <a
                      href={`#/products/${encodeURIComponent(product.slug || product.id)}`}
                      className="favorite-product-thumb"
                    >
                      <img src={product.imageUrl} alt={product.name} />
                    </a>
                    <div className="favorite-product-copy">
                      <p className="section-subtitle">{product.category}</p>
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <div className="favorite-product-footer">
                        <strong className="price-current">
                          {currency.format(getDisplayPrice(product))}
                        </strong>
                        <a
                          href={`#/products/${encodeURIComponent(product.slug || product.id)}`}
                          className="catalog-link"
                        >
                          View details
                        </a>
                        <button
                          type="button"
                          className="favorite-remove-icon"
                          onClick={() => toggleFavorite(product.id)}
                          aria-label="Remove from favourites"
                          title="Remove from favourites"
                        >
                          <RemoveIcon />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            </div>
          </section>
        ) : null}
      </main>

      <Footer footerSections={footerSections} />
    </>
  );
}

export default FavoritesPage;
