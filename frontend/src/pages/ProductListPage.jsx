import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import { footerSections } from "../data/landingContent";
import useCategories from "../hooks/useCategories";
import useCart from "../hooks/useCart";
import useFavorites from "../hooks/useFavorites";
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

function getFiltersFromHash() {
  const [, query = ""] = window.location.hash.split("?");
  const params = new URLSearchParams(query);
  return {
    category: params.get("category") || "All",
    search: params.get("q") || "",
    page: Math.max(1, Number(params.get("page")) || 1)
  };
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

function getVisiblePageNumbers(currentPage, totalPages) {
  const pageNumbers = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

  return Array.from(pageNumbers)
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages)
    .sort((left, right) => left - right);
}

function ProductListPage() {
  const [selectedCategory, setSelectedCategory] = useState(() => getFiltersFromHash().category);
  const [searchQuery, setSearchQuery] = useState(() => getFiltersFromHash().search);
  const [currentPage, setCurrentPage] = useState(() => getFiltersFromHash().page);
  const [sortBy, setSortBy] = useState("featured");
  const [priceFilter, setPriceFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const { products, pagination, isLoading, error } = useProducts({
    page: currentPage,
    pageSize: 9,
    category: selectedCategory !== "All" ? selectedCategory : "",
    q: searchQuery.trim(),
    sort: sortBy,
    price: priceFilter !== "all" ? priceFilter : "",
    stock: stockFilter !== "all" ? stockFilter : ""
  });
  const { categories: apiCategories } = useCategories();
  const { itemCount } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const sliderRef = useRef(null);

  const categories = useMemo(
    () => [
      "All",
      ...new Set([
        ...apiCategories.map((category) => category.category),
        ...products.map((product) => product.category)
      ])
    ],
    [apiCategories, products]
  );

  const filteredProducts = products;
  const visiblePageNumbers = useMemo(
    () => getVisiblePageNumbers(currentPage, pagination.totalPages),
    [currentPage, pagination.totalPages]
  );

  const categoryCards = useMemo(() => {
    const categoryMap = new Map(
      apiCategories.map((category) => [category.category, category])
    );

    return categories.map((category) => {
      if (category === "All") {
        const allCount = apiCategories.reduce(
          (sum, item) => sum + Number(item.productCount || 0),
          0
        );
        return {
          name: "All",
          count: `${allCount} pieces`,
          imageUrl: products[0]?.imageUrl || "",
          description: "View the full dress collection"
        };
      }

      const apiCategory = categoryMap.get(category);
      const categoryCount = Number(apiCategory?.productCount || 0);

      return {
        name: category,
        count: `${categoryCount} pieces`,
        imageUrl: apiCategory?.imageUrl || products.find((product) => product.category === category)?.imageUrl || "",
        description:
          apiCategory?.description ||
          products.find((product) => product.category === category)?.description ||
          "Curated category selection"
      };
    });
  }, [apiCategories, categories, products]);
  const activeCategoryCard =
    categoryCards.find((item) => item.name === selectedCategory) || categoryCards[0];

  useEffect(() => {
    function syncCategoryFromHash() {
      const nextFilters = getFiltersFromHash();
      setSelectedCategory(nextFilters.category);
      setSearchQuery(nextFilters.search);
      setCurrentPage(nextFilters.page);
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
    setCurrentPage(1);
    const params = new URLSearchParams();

    if (category !== "All") {
      params.set("category", category);
    }

    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }

    params.set("page", "1");

    const queryString = params.toString();
    window.location.hash = queryString ? `#/products?${queryString}` : "#/products";
  }

  function handlePageChange(nextPage) {
    const safePage = Math.min(Math.max(1, nextPage), pagination.totalPages || 1);
    setCurrentPage(safePage);

    const params = new URLSearchParams();

    if (selectedCategory !== "All") {
      params.set("category", selectedCategory);
    }

    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }

    params.set("page", String(safePage));
    window.location.hash = `#/products?${params.toString()}`;
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
                {pagination.totalCount} piece{pagination.totalCount === 1 ? "" : "s"}
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
              {pagination.totalCount
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

        <section className="catalog-filters">
          <div className="catalog-filters-header">
            <div>
              <p className="section-subtitle">Filter products</p>
              <h2 className="catalog-heading">Refine the selection</h2>
            </div>
            <span className="catalog-banner-note">
              {pagination.totalCount} result{pagination.totalCount === 1 ? "" : "s"}
            </span>
          </div>

          <div className="catalog-filters-panel">
            <label className="catalog-filter-field">
              <span>Sort by</span>
              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </label>

            <label className="catalog-filter-field">
              <span>Price</span>
              <select
                value={priceFilter}
                onChange={(event) => {
                  setPriceFilter(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All prices</option>
                <option value="under-200">Under $200</option>
                <option value="200-260">$200 - $260</option>
                <option value="over-260">Above $260</option>
              </select>
            </label>

            <label className="catalog-filter-field">
              <span>Availability</span>
              <select
                value={stockFilter}
                onChange={(event) => {
                  setStockFilter(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All products</option>
                <option value="in-stock">In stock only</option>
              </select>
            </label>

            <button
              type="button"
              className="catalog-filter-clear"
              onClick={() => {
                setSortBy("featured");
                setPriceFilter("all");
                setStockFilter("all");
                setCurrentPage(1);
              }}
            >
              Reset filters
            </button>
          </div>
        </section>

        <section className="catalog-grid" id="new-arrivals">
          {filteredProducts.map((product) => (
            <article key={product.id} className="catalog-card">
              <a
                href={`#/products/${encodeURIComponent(product.slug || product.id)}`}
                className="catalog-card-image"
              >
                <img src={product.imageUrl} alt={product.name} />
                {getDiscountLabel(product) ? (
                  <span className="discount-ribbon catalog-discount-ribbon">
                    {getDiscountLabel(product)}
                  </span>
                ) : null}
              </a>
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
                <button
                  type="button"
                  className={isFavorite(product.id) ? "favorite-toggle-button active" : "favorite-toggle-button"}
                  onClick={() => toggleFavorite(product.id)}
                >
                  {isFavorite(product.id) ? "Remove favourite" : "Add to favourites"}
                </button>
              </div>
            </article>
          ))}
        </section>

        {!isLoading && !filteredProducts.length ? (
          <section className="catalog-empty">
            <h2>No products match these filters.</h2>
            <p>Change your filters, search term, or category selection and try again.</p>
          </section>
        ) : null}

        {!isLoading && pagination.totalPages > 1 ? (
          <section className="catalog-pagination">
            <button
              type="button"
              className="catalog-page-button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </button>

            <div className="catalog-page-number-row" aria-label="Pagination">
              {visiblePageNumbers.map((pageNumber, index) => {
                const previousPage = visiblePageNumbers[index - 1];
                const shouldShowGap = previousPage && pageNumber - previousPage > 1;

                return (
                  <Fragment key={pageNumber}>
                    {shouldShowGap ? <span className="catalog-page-gap">...</span> : null}
                    <button
                      type="button"
                      className={
                        pageNumber === currentPage
                          ? "catalog-page-number active"
                          : "catalog-page-number"
                      }
                      onClick={() => handlePageChange(pageNumber)}
                      aria-current={pageNumber === currentPage ? "page" : undefined}
                    >
                      {pageNumber}
                    </button>
                  </Fragment>
                );
              })}
            </div>

            <div className="catalog-page-status">
              <strong>Page {currentPage}</strong>
              <span>of {pagination.totalPages}</span>
            </div>
            <button
              type="button"
              className="catalog-page-button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pagination.totalPages}
            >
              Next
            </button>
          </section>
        ) : null}
      </main>

      <Footer footerSections={footerSections} />
    </>
  );
}

export default ProductListPage;


