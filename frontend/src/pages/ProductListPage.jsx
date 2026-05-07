import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import { footerSections } from "../data/landingContent";
import useCategories from "../hooks/useCategories";
import useCart from "../hooks/useCart";
import useProducts from "../hooks/useProducts";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function getDisplayPrice(product) {
  return Number(product.specialPrice ?? product.price);
}

const productPageLinks = [
  { label: "Home", href: "#/" },
  { label: "Products", href: "#/products" },
  { label: "New Arrivals", href: "#new-arrivals" },
  { label: "Contact", href: "#contact" }
];

function getCategoryFromHash() {
  const [, query = ""] = window.location.hash.split("?");
  const params = new URLSearchParams(query);
  return params.get("category") || "All";
}

function getDiscountLabel(product) {
  if (!product.specialPrice) {
    return "";
  }

  const price = Number(product.price);
  const specialPrice = Number(product.specialPrice);

  if (!price || specialPrice >= price) {
    return "";
  }

  return `${Math.round(((price - specialPrice) / price) * 100)}% Off`;
}

function ProductListPage() {
  const { products, isLoading, error } = useProducts();
  const { categories: apiCategories } = useCategories();
  const { itemCount } = useCart();
  const [selectedCategory, setSelectedCategory] = useState(getCategoryFromHash);
  const sliderRef = useRef(null);

  const categories = useMemo(
    () => ["All", ...new Set(products.map((product) => product.category))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") {
      return products;
    }

    return products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  const categoryCards = useMemo(() => {
    const categoryMap = new Map(
      apiCategories.map((category) => [category.category, category])
    );

    return categories.map((category) => {
      if (category === "All") {
        return {
          name: "All",
          count: `${products.length} pieces`,
          imageUrl: products[0]?.imageUrl || "",
          description: "View the full dress collection"
        };
      }

      const categoryProducts = products.filter((product) => product.category === category);
      const apiCategory = categoryMap.get(category);

      return {
        name: category,
        count: `${categoryProducts.length} pieces`,
        imageUrl: apiCategory?.imageUrl || categoryProducts[0]?.imageUrl || "",
        description:
          apiCategory?.description ||
          categoryProducts[0]?.description ||
          "Curated category selection"
      };
    });
  }, [apiCategories, categories, products]);
  const activeCategoryCard =
    categoryCards.find((item) => item.name === selectedCategory) || categoryCards[0];

  useEffect(() => {
    function syncCategoryFromHash() {
      setSelectedCategory(getCategoryFromHash());
    }

    window.addEventListener("hashchange", syncCategoryFromHash);
    return () => window.removeEventListener("hashchange", syncCategoryFromHash);
  }, []);

  useEffect(() => {
    if (selectedCategory !== "All" && categories.length > 1 && !categories.includes(selectedCategory)) {
      setSelectedCategory("All");
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto"
    });
  }, [selectedCategory]);

  useEffect(() => {
    if (!sliderRef.current) {
      return;
    }

    const activeCard = sliderRef.current.querySelector(".catalog-category-card.active");

    if (!activeCard) {
      sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    const sliderRect = sliderRef.current.getBoundingClientRect();
    const activeRect = activeCard.getBoundingClientRect();
    const nextLeft =
      sliderRef.current.scrollLeft + (activeRect.left - sliderRect.left) - 8;

    sliderRef.current.scrollTo({
      left: Math.max(0, nextLeft),
      behavior: "smooth"
    });
  }, [selectedCategory, categoryCards]);

  function handleCategoryChange(category) {
    setSelectedCategory(category);
    window.location.hash =
      category === "All"
        ? "/products"
        : `/products?category=${encodeURIComponent(category)}`;
  }

  function scrollCategories(direction) {
    if (!sliderRef.current) {
      return;
    }

    sliderRef.current.scrollBy({
      left: sliderRef.current.clientWidth * 0.75 * direction,
      behavior: "smooth"
    });
  }

  return (
    <>
      <Header navigationLinks={productPageLinks} cartCount={itemCount} />

      <main className="product-list-page">
        {error ? <p className="catalog-status error">{error}</p> : null}
        {isLoading ? <p className="catalog-status">Loading products...</p> : null}

        <section className="catalog-banner">
          <div className="catalog-banner-image">
            {activeCategoryCard?.imageUrl ? (
              <img src={activeCategoryCard.imageUrl} alt={activeCategoryCard.name} />
            ) : null}
          </div>
          <div className="catalog-banner-copy-block">
            <p className="section-subtitle">Product catalog</p>
            <div className="catalog-mini-row">
              <h1 className="catalog-mini-title">
                {selectedCategory === "All" ? "All Dresses" : selectedCategory}
              </h1>
              <span className="catalog-mini-count">
                {filteredProducts.length} piece{filteredProducts.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className="catalog-banner-copy">
              {activeCategoryCard?.description || "Browse the current dress selection."}
            </p>
            <div className="catalog-banner-details">
              <div className="catalog-detail-card">
                <span>Collection</span>
                <strong>{selectedCategory === "All" ? "House Edit" : selectedCategory}</strong>
              </div>
              <div className="catalog-detail-card">
                <span>Price Range</span>
                <strong>
                  {filteredProducts.length
                    ? `${currency.format(
                        Math.min(...filteredProducts.map((product) => getDisplayPrice(product)))
                      )} - ${currency.format(
                        Math.max(...filteredProducts.map((product) => getDisplayPrice(product)))
                      )}`
                    : "--"}
                </strong>
              </div>
              <div className="catalog-detail-card">
                <span>Availability</span>
                <strong>Ready to shop</strong>
              </div>
            </div>
            <div className="catalog-banner-actions">
              <a href="#new-arrivals" className="catalog-banner-link primary">
                View Products
              </a>
              <span className="catalog-banner-note">
                Curated for a cleaner boutique browsing experience.
              </span>
            </div>
          </div>
        </section>

        <section className="catalog-category-strip">
          <div className="catalog-strip-head">
            <div>
              <p className="section-subtitle">Browse by category</p>
              <h2 className="catalog-heading">Choose a collection</h2>
            </div>
            <div className="slider-controls">
              <button type="button" className="slider-arrow" onClick={() => scrollCategories(-1)}>
                Prev
              </button>
              <button type="button" className="slider-arrow" onClick={() => scrollCategories(1)}>
                Next
              </button>
            </div>
          </div>

          <div className="catalog-category-slider" ref={sliderRef}>
            {categoryCards.map((category) => (
              <button
                key={category.name}
                type="button"
                className={
                  category.name === selectedCategory ? "catalog-category-card active" : "catalog-category-card"
                }
                onClick={() => handleCategoryChange(category.name)}
              >
                <div className="catalog-category-image">
                  {category.imageUrl ? <img src={category.imageUrl} alt={category.name} /> : null}
                </div>
                <div className="catalog-category-copy">
                  <strong>{category.name}</strong>
                  <span>{category.count}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="catalog-grid" id="new-arrivals">
          {filteredProducts.map((product) => (
            <article key={product.id} className="catalog-card">
              <div className="catalog-card-image">
                <img src={product.imageUrl} alt={product.name} />
                {getDiscountLabel(product) ? (
                  <span className="discount-ribbon catalog-discount-ribbon">
                    {getDiscountLabel(product)}
                  </span>
                ) : null}
              </div>
              <div className="catalog-card-copy">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="catalog-card-footer">
                  <div className="price-pair">
                    {product.specialPrice ? (
                      <span className="price-original">
                        {currency.format(Number(product.price))}
                      </span>
                    ) : null}
                    <strong className="price-current">
                      {currency.format(getDisplayPrice(product))}
                    </strong>
                  </div>
                  <a
                    href={`#/products/${encodeURIComponent(product.slug || product.id)}`}
                    className="catalog-link"
                  >
                    View details
                  </a>
                </div>
              </div>
            </article>
          ))}
        </section>

        {!isLoading && !filteredProducts.length ? (
          <section className="catalog-empty">
            <h2>No products in this category yet.</h2>
            <p>Switch categories or add more products from the backend catalog.</p>
          </section>
        ) : null}
      </main>

      <Footer footerSections={footerSections} />
    </>
  );
}

export default ProductListPage;
