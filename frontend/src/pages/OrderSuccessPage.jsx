import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import { footerSections } from "../data/landingContent";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const successLinks = [
  { label: "Home", href: "#/" },
  { label: "Products", href: "#/products" },
  { label: "Cart", href: "#/cart" },
  { label: "Contact", href: "#contact" }
];

function getSuccessParams() {
  const [, query = ""] = window.location.hash.split("?");
  const params = new URLSearchParams(query);

  return {
    orderId: params.get("orderId") || "",
    total: params.get("total") || ""
  };
}

function CheckBadge() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="31" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M18 33.5 27.4 43 46 23.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OrderSuccessPage() {
  const { orderId, total } = getSuccessParams();

  return (
    <>
      <Header navigationLinks={successLinks} />

      <main className="success-page">
        <section className="success-card">
          <div className="success-badge">
            <CheckBadge />
          </div>
          <p className="section-subtitle">Order confirmed</p>
          <h1>Your order has been placed successfully</h1>
          <p className="success-copy">
            Thank you for shopping with Atelier. Your order has been recorded and is now ready for processing.
          </p>

          <div className="success-summary">
            <div className="success-summary-card">
              <span>Order reference</span>
              <strong>#{orderId || "Pending"}</strong>
            </div>
            <div className="success-summary-card">
              <span>Total paid</span>
              <strong>{total ? currency.format(Number(total)) : "--"}</strong>
            </div>
            <div className="success-summary-card">
              <span>Status</span>
              <strong>Pending</strong>
            </div>
          </div>

          <div className="success-actions">
            <a href="#/products" className="catalog-banner-link primary">
              Continue shopping
            </a>
            <a href="#/account/orders" className="catalog-banner-link secondary">
              View orders
            </a>
            <a href="#/" className="product-detail-secondary-link">
              Return home
            </a>
          </div>
        </section>
      </main>

      <Footer footerSections={footerSections} />
    </>
  );
}

export default OrderSuccessPage;
