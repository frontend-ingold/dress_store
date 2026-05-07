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

function OrderSuccessPage() {
  const { orderId, total } = getSuccessParams();

  return (
    <>
      <Header navigationLinks={successLinks} />

      <main className="success-page">
        <section className="success-card">
          <p className="section-subtitle">Order confirmed</p>
          <h1>Your order has been placed</h1>
          <p>
            Reference <strong>#{orderId || "Pending"}</strong>
          </p>
          {total ? <p>Total paid: {currency.format(Number(total))}</p> : null}
          <div className="success-actions">
            <a href="#/products" className="catalog-banner-link primary">
              Continue shopping
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
