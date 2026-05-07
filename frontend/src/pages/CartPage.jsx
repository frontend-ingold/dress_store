import { useMemo, useState } from "react";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import { footerSections } from "../data/landingContent";
import useCart from "../hooks/useCart";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const cartPageLinks = [
  { label: "Home", href: "#/" },
  { label: "Products", href: "#/products" },
  { label: "Cart", href: "#/cart" },
  { label: "Contact", href: "#contact" }
];

const initialForm = {
  customerName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: ""
};

function CartPage() {
  const { cart, isLoading, error, updateItem, removeItem, checkout } = useCart();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [feedback, setFeedback] = useState("");

  const hasItems = cart.items.length > 0;
  const totalLabel = useMemo(() => currency.format(Number(cart.subtotal || 0)), [cart.subtotal]);

  async function handleCheckout(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setSubmitError("");
      const result = await checkout(form);
      setForm(initialForm);
      window.location.hash = `#/success?orderId=${encodeURIComponent(
        result.orderId
      )}&total=${encodeURIComponent(result.totalAmount)}`;
    } catch (requestError) {
      setSubmitError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleQuantityChange(productId, quantity) {
    try {
      setFeedback("");
      setSubmitError("");
      await updateItem(productId, quantity);
    } catch (requestError) {
      setSubmitError(requestError.message);
    }
  }

  async function handleRemove(productId) {
    try {
      setFeedback("");
      setSubmitError("");
      await removeItem(productId);
      setFeedback("Item removed from cart.");
    } catch (requestError) {
      setSubmitError(requestError.message);
    }
  }

  return (
    <>
      <Header navigationLinks={cartPageLinks} cartCount={cart.itemCount} />

      <main className="cart-page">
        <section className="cart-header">
          <p className="section-subtitle">Shopping cart</p>
          <div className="cart-header-row">
            <h1 className="catalog-heading">Review your selections</h1>
            <span className="catalog-mini-count">
              {cart.itemCount} item{cart.itemCount === 1 ? "" : "s"}
            </span>
          </div>
        </section>

        {error ? <p className="catalog-status error">{error}</p> : null}
        {submitError ? <p className="catalog-status error">{submitError}</p> : null}
        {feedback ? <p className="catalog-status">{feedback}</p> : null}
        {isLoading ? <p className="catalog-status">Loading cart...</p> : null}

        {!isLoading && !hasItems ? (
          <section className="cart-empty">
            <h2>Your cart is empty.</h2>
            <p>Add a few pieces from the catalog to continue.</p>
            <a href="#/products" className="catalog-banner-link primary">
              Browse products
            </a>
          </section>
        ) : null}

        {hasItems ? (
          <section className="cart-layout">
            <div className="cart-items-panel">
              {cart.items.map((item) => (
                <article key={item.productId} className="cart-item-card">
                  <a
                    href={`#/products/${encodeURIComponent(item.slug || item.productId)}`}
                    className="cart-item-image"
                  >
                    <img src={item.imageUrl} alt={item.name} />
                  </a>

                  <div className="cart-item-copy">
                    <span className="cart-item-category">{item.category}</span>
                    <h3>{item.name}</h3>
                    <div className="price-pair">
                      {item.specialPrice ? (
                        <span className="price-original">
                          {currency.format(Number(item.price))}
                        </span>
                      ) : null}
                      <strong className="price-current">
                        {currency.format(Number(item.unitPrice))}
                      </strong>
                    </div>
                  </div>

                  <div className="cart-item-controls">
                    <label className="cart-quantity-label">
                      Qty
                      <input
                        type="number"
                        min="1"
                        max={item.stock}
                        value={item.quantity}
                        onChange={(event) =>
                          handleQuantityChange(item.productId, Number(event.target.value))
                        }
                      />
                    </label>

                    <strong className="cart-line-total">
                      {currency.format(Number(item.lineTotal))}
                    </strong>

                    <button
                      type="button"
                      className="cart-remove-button"
                      onClick={() => handleRemove(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="checkout-panel">
              <div className="checkout-summary-card">
                <p className="section-subtitle">Checkout</p>
                <div className="checkout-summary-row">
                  <span>Subtotal</span>
                  <strong>{totalLabel}</strong>
                </div>
                <div className="checkout-summary-row">
                  <span>Delivery</span>
                  <strong>Calculated at order</strong>
                </div>
                <div className="checkout-summary-row total">
                  <span>Total</span>
                  <strong>{totalLabel}</strong>
                </div>
              </div>

              <form className="checkout-form" onSubmit={handleCheckout}>
                <input
                  type="text"
                  placeholder="Full name"
                  value={form.customerName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, customerName: event.target.value }))
                  }
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={form.address}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, address: event.target.value }))
                  }
                />
                <div className="checkout-form-row">
                  <input
                    type="text"
                    placeholder="City"
                    value={form.city}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, city: event.target.value }))
                    }
                  />
                  <input
                    type="text"
                    placeholder="Postal code"
                    value={form.postalCode}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, postalCode: event.target.value }))
                    }
                  />
                </div>

                <button type="submit" className="catalog-banner-link primary checkout-submit">
                  {isSubmitting ? "Placing order..." : "Place order"}
                </button>
              </form>
            </aside>
          </section>
        ) : null}
      </main>

      <Footer footerSections={footerSections} />
    </>
  );
}

export default CartPage;
