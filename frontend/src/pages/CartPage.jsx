import { useMemo, useState } from "react";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import { footerSections } from "../data/landingContent";
import useCart from "../hooks/useCart";
import useOrderHistory from "../hooks/useOrderHistory";
import useShopSession from "../hooks/useShopSession";

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

const DELIVERY_FEE = 15;

const initialForm = {
  customerName: "",
  email: "",
  phone: "",
  address: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: ""
};

function EmptyCartIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="24" cy="52" r="4" fill="currentColor" />
      <circle cx="46" cy="52" r="4" fill="currentColor" />
      <path
        d="M8 10h6l5.2 28.8a2 2 0 0 0 2 1.6h23.1a2 2 0 0 0 2-1.6L52 20H18.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CartPage() {
  const { cart, isLoading, error, updateItem, removeItem, checkout } = useCart();
  const { addOrder } = useOrderHistory();
  const { currentUser, isGuest } = useShopSession();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [feedback, setFeedback] = useState("");

  const hasItems = cart.items.length > 0;
  const subtotal = Number(cart.subtotal || 0);
  const grandTotal = useMemo(() => subtotal + DELIVERY_FEE, [subtotal]);
  const totalLabel = useMemo(() => currency.format(subtotal), [subtotal]);
  const deliveryFeeLabel = useMemo(() => currency.format(DELIVERY_FEE), []);
  const grandTotalLabel = useMemo(() => currency.format(grandTotal), [grandTotal]);

  async function handleCheckout(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setSubmitError("");
      const orderSnapshot = {
        sessionMode: isGuest ? "guest" : "member",
        sessionUserId: isGuest ? null : currentUser?.id || null,
        customerName: form.customerName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        addressLine2: form.addressLine2,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
        deliveryFee: result.deliveryFee,
        grandTotal: result.grandTotal,
        items: cart.items.map((item) => ({
          productId: item.productId,
          productVariantId: item.productVariantId,
          slug: item.slug,
          name: item.name,
          imageUrl: item.imageUrl,
          variantConfiguration: item.variantConfiguration,
          quantity: item.quantity,
          lineTotal: item.lineTotal
        }))
      };
      const result = await checkout(form);
      addOrder({
        ...orderSnapshot,
        orderId: result.orderId,
        totalAmount: result.totalAmount,
        deliveryFee: result.deliveryFee,
        grandTotal: result.grandTotal,
        status: "pending"
      });
      setForm(initialForm);
      window.location.hash = `#/success?orderId=${encodeURIComponent(
        result.orderId
      )}&total=${encodeURIComponent(result.grandTotal || result.totalAmount)}`;
    } catch (requestError) {
      setSubmitError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleQuantityChange(cartItemId, quantity) {
    try {
      setFeedback("");
      setSubmitError("");
      await updateItem(cartItemId, quantity);
    } catch (requestError) {
      setSubmitError(requestError.message);
    }
  }

  async function handleRemove(cartItemId) {
    try {
      setFeedback("");
      setSubmitError("");
      await removeItem(cartItemId);
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
            <div className="cart-empty-badge">
              <EmptyCartIcon />
            </div>
            <p className="section-subtitle">Cart empty</p>
            <h2>Your cart is empty.</h2>
            <p className="cart-empty-copy">
              Your curated picks will appear here once you add products from the collection.
            </p>
            <div className="cart-empty-actions">
              <a href="#/products" className="catalog-banner-link primary">
                Browse products
              </a>
              <a href="#/" className="catalog-banner-link secondary">
                Return home
              </a>
            </div>
          </section>
        ) : null}

        {hasItems ? (
          <section className="cart-layout">
            <div className="cart-items-panel">
              {cart.items.map((item) => (
                <article key={item.cartItemId} className="cart-item-card">
                  <a
                    href={`#/products/${encodeURIComponent(item.slug || item.productId)}`}
                    className="cart-item-image"
                  >
                    <img src={item.imageUrl} alt={item.name} />
                  </a>

                  <div className="cart-item-copy">
                    <span className="cart-item-category">{item.category}</span>
                    <h3>{item.name}</h3>
                    {item.variantConfiguration ? (
                      <p className="cart-item-variant">
                        {Object.entries(item.variantConfiguration)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(" / ")}
                      </p>
                    ) : null}
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
                          handleQuantityChange(item.cartItemId, Number(event.target.value))
                        }
                      />
                    </label>

                    <strong className="cart-line-total">
                      {currency.format(Number(item.lineTotal))}
                    </strong>

                    <button
                      type="button"
                      className="cart-remove-button"
                      onClick={() => handleRemove(item.cartItemId)}
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
                  <strong>{deliveryFeeLabel}</strong>
                </div>
                <div className="checkout-summary-row total">
                  <span>Total</span>
                  <strong>{grandTotalLabel}</strong>
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
                <input
                  type="text"
                  placeholder="Address line 2"
                  value={form.addressLine2}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, addressLine2: event.target.value }))
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
                    placeholder="State"
                    value={form.state}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, state: event.target.value }))
                    }
                  />
                </div>
                <div className="checkout-form-row">
                  <input
                    type="text"
                    placeholder="Postal code"
                    value={form.postalCode}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, postalCode: event.target.value }))
                    }
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={form.country}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, country: event.target.value }))
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
