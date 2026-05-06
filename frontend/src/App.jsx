import { useEffect, useMemo, useState } from "react";

const apiBaseUrl =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://dress-store-seey.vercel.app/api");

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const emptyCheckout = {
  customerName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: ""
};

function getRouteFromHash() {
  return window.location.hash === "#/success" ? "success" : "store";
}

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [checkout, setCheckout] = useState(emptyCheckout);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [route, setRoute] = useState(getRouteFromHash);
  const [latestOrder, setLatestOrder] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStore() {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/products`, { signal: controller.signal }),
          fetch(`${apiBaseUrl}/categories`, { signal: controller.signal })
        ]);

        if (!productsResponse.ok || !categoriesResponse.ok) {
          throw new Error("Unable to load catalog.");
        }

        const [productsData, categoriesData] = await Promise.all([
          productsResponse.json(),
          categoriesResponse.json()
        ]);

        setProducts(productsData.products ?? []);
        setCategories(["All", ...(categoriesData.categories ?? [])]);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      }
    }

    loadStore();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    function handleHashChange() {
      setRoute(getRouteFromHash());
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") {
      return products;
    }

    return products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  );

  function addToCart(product) {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);
      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  }

  function updateQuantity(productId, nextQuantity) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(0, nextQuantity) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function handleCheckoutChange(event) {
    const { name, value } = event.target;
    setCheckout((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!cart.length) {
      setError("Add at least one dress to place an order.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...checkout,
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity
          }))
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Checkout failed.");
      }

      setLatestOrder({
        orderId: result.orderId,
        customerName: checkout.customerName,
        total: subtotal
      });
      setCart([]);
      setCheckout(emptyCheckout);
      window.location.hash = "/success";
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleContinueShopping() {
    setLatestOrder(null);
    setError("");
    window.location.hash = "/";
  }

  if (route === "success" && latestOrder) {
    return (
      <div className="page-shell">
        <section className="success-page">
          <p className="eyebrow">Order confirmed</p>
          <h1>Thank you, {latestOrder.customerName}</h1>
          <p className="success-copy">
            Your dress order has been placed successfully and is now waiting for confirmation from
            the boutique team.
          </p>
          <div className="success-summary">
            <div>
              <span>Reference</span>
              <strong>#{latestOrder.orderId}</strong>
            </div>
            <div>
              <span>Amount</span>
              <strong>{currency.format(latestOrder.total)}</strong>
            </div>
          </div>
          <button type="button" className="success-button" onClick={handleContinueShopping}>
            Continue shopping
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Spring edit 2026</p>
          <h1>Dressify boutique storefront</h1>
          <p className="hero-copy">
            A React storefront for occasion, casual, and evening dresses with a Node.js API and
            PgSQL order flow.
          </p>
        </div>
        <div className="hero-card">
          <p>Cart total</p>
          <strong>{currency.format(subtotal)}</strong>
          <span>{cart.reduce((count, item) => count + item.quantity, 0)} items selected</span>
        </div>
      </header>

      <main className="content-grid">
        <section>
          <div className="section-header">
            <h2>Shop dresses</h2>
            <div className="filter-row">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={category === selectedCategory ? "filter active" : "filter"}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {error ? <p className="status error">{error}</p> : null}

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article key={product.id} className="product-card">
                <div className="product-visual">
                  <img src={product.imageUrl} alt={product.name} />
                </div>
                <div className="product-copy">
                  <p className="product-category">{product.category}</p>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="product-footer">
                    <strong>{currency.format(product.price)}</strong>
                    <button type="button" onClick={() => addToCart(product)}>
                      Add to cart
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="sidebar">
          <section className="cart-panel">
            <div className="section-header">
              <h2>Your bag</h2>
              <span>{cart.length} styles</span>
            </div>
            {cart.length === 0 ? <p className="empty-note">Your selected dresses will appear here.</p> : null}
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div>
                  <strong>{item.name}</strong>
                  <p>{currency.format(item.price)} each</p>
                </div>
                <div className="quantity-controls">
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    +
                  </button>
                </div>
              </div>
            ))}
            <div className="subtotal-row">
              <span>Subtotal</span>
              <strong>{currency.format(subtotal)}</strong>
            </div>
          </section>

          <section className="checkout-panel">
            <div className="section-header">
              <h2>Checkout</h2>
            </div>
            <form onSubmit={handleSubmit} className="checkout-form">
              <input
                name="customerName"
                placeholder="Full name"
                value={checkout.customerName}
                onChange={handleCheckoutChange}
                required
              />
              <input name="email" type="email" placeholder="Email" value={checkout.email} onChange={handleCheckoutChange} required />
              <input name="phone" placeholder="Phone number" value={checkout.phone} onChange={handleCheckoutChange} required />
              <input name="address" placeholder="Delivery address" value={checkout.address} onChange={handleCheckoutChange} required />
              <div className="inline-fields">
                <input name="city" placeholder="City" value={checkout.city} onChange={handleCheckoutChange} required />
                <input
                  name="postalCode"
                  placeholder="Postal code"
                  value={checkout.postalCode}
                  onChange={handleCheckoutChange}
                  required
                />
              </div>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Placing order..." : "Place order"}
              </button>
            </form>
          </section>
        </aside>
      </main>
    </div>
  );
}

export default App;
