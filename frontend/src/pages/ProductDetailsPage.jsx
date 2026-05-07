import { useEffect, useMemo, useState } from "react";
import AuthModal from "../components/landing/AuthModal";
import Header from "../components/landing/Header";
import Toast from "../components/landing/Toast";
import Footer from "../components/landing/Footer";
import { footerSections } from "../data/landingContent";
import useCart from "../hooks/useCart";
import useProducts from "../hooks/useProducts";
import useShopSession from "../hooks/useShopSession";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function getDisplayPrice(product) {
  return Number(product.specialPrice ?? product.price);
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

const productPageLinks = [
  { label: "Home", href: "#/" },
  { label: "Products", href: "#/products" },
  { label: "New Arrivals", href: "#/products" },
  { label: "Contact", href: "#contact" }
];

function getProductPathParamFromHash() {
  const match = window.location.hash.match(/^#\/products\/([^?]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function ProductDetailsPage() {
  const { products, isLoading, error } = useProducts();
  const { addItem, itemCount } = useCart();
  const { isAuthenticated, continueAsGuest, login, register, forgotPassword, resetPassword } =
    useShopSession();
  const productPathParam = getProductPathParamFromHash();
  const [quantity, setQuantity] = useState(1);
  const [cartFeedback, setCartFeedback] = useState("");
  const [cartError, setCartError] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authInfo, setAuthInfo] = useState("");
  const [pendingAction, setPendingAction] = useState(null);

  const product = useMemo(
    () =>
      products.find(
        (item) =>
          item.slug === productPathParam || String(item.id) === String(productPathParam)
      ),
    [productPathParam, products]
  );

  const relatedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return products
      .filter((item) => item.category === product.category && item.id !== product.id)
      .slice(0, 4);
  }, [product, products]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [productPathParam]);

  useEffect(() => {
    setQuantity(1);
    setCartFeedback("");
    setCartError("");
  }, [product?.id]);

  useEffect(() => {
    if (!cartFeedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCartFeedback("");
    }, 2600);

    return () => window.clearTimeout(timeoutId);
  }, [cartFeedback]);

  useEffect(() => {
    if (!isAuthenticated || !pendingAction) {
      return;
    }

    setIsAuthModalOpen(false);
    setAuthError("");
    const nextAction = pendingAction;
    setPendingAction(null);
    handleAddToCart(nextAction === "buy");
  }, [isAuthenticated, pendingAction]);

  async function handleAddToCart(redirectToCart = false) {
    if (!product) {
      return;
    }

    try {
      setCartError("");
      setCartFeedback("");

      if (redirectToCart) {
        setIsBuyingNow(true);
      } else {
        setIsAddingToCart(true);
      }

      await addItem(product.id, quantity);

      if (redirectToCart) {
        window.location.hash = "#/cart";
        return;
      }

      setCartFeedback("Product added to cart.");
    } catch (requestError) {
      setCartError(requestError.message);
    } finally {
      setIsAddingToCart(false);
      setIsBuyingNow(false);
    }
  }

  function requestProtectedAction(action) {
    if (isAuthenticated) {
      handleAddToCart(action === "buy");
      return;
    }

    setAuthError("");
    setAuthInfo("");
    setAuthMode("login");
    setPendingAction(action);
    setIsAuthModalOpen(true);
  }

  function handleGuestContinue() {
    setAuthError("");
    setAuthInfo("");
    continueAsGuest();
  }

  async function handleLogin(credentials) {
    try {
      setAuthError("");
      setAuthInfo("");
      await login(credentials);
    } catch (requestError) {
      setAuthError(requestError.message);
    }
  }

  async function handleRegister(payload) {
    try {
      setAuthError("");
      setAuthInfo("");
      await register(payload);
    } catch (requestError) {
      setAuthError(requestError.message);
    }
  }

  async function handleForgotPassword(payload) {
    try {
      setAuthError("");
      const result = await forgotPassword(payload);
      setAuthInfo(
        result.resetToken
          ? `Reset token: ${result.resetToken}. Use it below to set a new password.`
          : result.message
      );
      setAuthMode("reset");
    } catch (requestError) {
      setAuthError(requestError.message);
    }
  }

  async function handleResetPassword(payload) {
    try {
      setAuthError("");
      setAuthInfo("");
      await resetPassword(payload);
    } catch (requestError) {
      setAuthError(requestError.message);
    }
  }

  return (
    <>
      <Header navigationLinks={productPageLinks} cartCount={itemCount} />
      <Toast message={cartFeedback} />

      <main className="product-detail-page">
        {error ? <p className="catalog-status error">{error}</p> : null}
        {cartError ? <p className="catalog-status error">{cartError}</p> : null}
        {isLoading ? <p className="catalog-status">Loading product...</p> : null}

        {!isLoading && !error && !product ? (
          <section className="product-detail-empty">
            <p className="section-subtitle">Product details</p>
            <h1>Product not found</h1>
            <p>The requested product is unavailable or the link is invalid.</p>
            <a href="#/products" className="catalog-banner-link primary">
              Back to products
            </a>
          </section>
        ) : null}

        {product ? (
          <>
            <section className="product-detail-shell">
              <div className="product-detail-media">
                <div className="product-detail-image-frame">
                  <img src={product.imageUrl} alt={product.name} />
                  {getDiscountLabel(product) ? (
                    <span className="discount-ribbon product-detail-ribbon">
                      {getDiscountLabel(product)}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="product-detail-copy">
                <div className="product-detail-breadcrumbs">
                  <a href="#/">Home</a>
                  <span>/</span>
                  <a href={`#/products?category=${encodeURIComponent(product.category)}`}>
                    {product.category}
                  </a>
                </div>

                <p className="section-subtitle">Product details</p>
                <h1 className="product-detail-title">{product.name}</h1>

                <div className="product-detail-meta">
                  <span className="product-detail-category">{product.category}</span>
                  <div className="price-pair product-detail-price-pair">
                    {product.specialPrice ? (
                      <span className="price-original">
                        {currency.format(Number(product.price))}
                      </span>
                    ) : null}
                    <strong className="price-current">
                      {currency.format(getDisplayPrice(product))}
                    </strong>
                  </div>
                </div>

                <p className="product-detail-description">{product.description}</p>

                <div className="product-detail-panels">
                  <div className="product-detail-panel">
                    <span>Availability</span>
                    <strong>{Number(product.stock) > 0 ? `${product.stock} in stock` : "Out of stock"}</strong>
                  </div>
                  <div className="product-detail-panel">
                    <span>Delivery</span>
                    <strong>Ready for dispatch</strong>
                  </div>
                  <div className="product-detail-panel">
                    <span>Styling note</span>
                    <strong>Editorial fit with premium drape</strong>
                  </div>
                </div>

                <div className="product-detail-actions">
                  <div className="product-quantity-block">
                    <label className="cart-quantity-label">
                      Qty
                      <input
                        type="number"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={(event) =>
                          setQuantity(
                            Math.max(
                              1,
                              Math.min(product.stock, Number(event.target.value) || 1)
                            )
                          )
                        }
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    className="catalog-banner-link primary"
                    onClick={() => requestProtectedAction("cart")}
                    disabled={isAddingToCart || product.stock < 1}
                  >
                    {isAddingToCart ? "Adding..." : "Add to cart"}
                  </button>
                  <button
                    type="button"
                    className="catalog-banner-link secondary"
                    onClick={() => requestProtectedAction("buy")}
                    disabled={isBuyingNow || product.stock < 1}
                  >
                    {isBuyingNow ? "Processing..." : "Buy now"}
                  </button>
                  <a
                    href={`#/products?category=${encodeURIComponent(product.category)}`}
                    className="product-detail-secondary-link"
                  >
                    More from {product.category}
                  </a>
                </div>
              </div>
            </section>

            {relatedProducts.length ? (
              <section className="related-products">
                <div className="catalog-strip-head">
                  <div>
                    <p className="section-subtitle">Similar styles</p>
                    <h2 className="catalog-heading">More from this collection</h2>
                  </div>
                </div>

                <div className="related-products-grid">
                  {relatedProducts.map((item) => (
                    <article key={item.id} className="related-product-card">
                      <a
                        href={`#/products/${encodeURIComponent(item.slug || item.id)}`}
                        className="related-product-image"
                      >
                        <img src={item.imageUrl} alt={item.name} />
                        {getDiscountLabel(item) ? (
                          <span className="discount-ribbon related-product-ribbon">
                            {getDiscountLabel(item)}
                          </span>
                        ) : null}
                      </a>
                      <div className="related-product-copy">
                        <span>{item.category}</span>
                        <h3>{item.name}</h3>
                        <div className="related-product-footer">
                          <div className="price-pair">
                            {item.specialPrice ? (
                              <span className="price-original">
                                {currency.format(Number(item.price))}
                              </span>
                            ) : null}
                            <strong className="price-current">
                              {currency.format(getDisplayPrice(item))}
                            </strong>
                          </div>
                          <a href={`#/products/${encodeURIComponent(item.slug || item.id)}`}>
                            View details
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : null}
      </main>

      {isAuthModalOpen ? (
        <AuthModal
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={() => {
            setIsAuthModalOpen(false);
            setPendingAction(null);
            setAuthError("");
            setAuthInfo("");
          }}
          onGuest={handleGuestContinue}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onForgotPassword={handleForgotPassword}
          onResetPassword={handleResetPassword}
          errorMessage={authError}
          infoMessage={authInfo}
        />
      ) : null}

      <Footer footerSections={footerSections} />
    </>
  );
}

export default ProductDetailsPage;
