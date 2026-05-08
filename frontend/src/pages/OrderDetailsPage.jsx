import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import { footerSections } from "../data/landingContent";
import useOrders from "../hooks/useOrders";

const orderDetailsLinks = [
  { label: "Home", href: "#/" },
  { label: "Products", href: "#/products" },
  { label: "Orders", href: "#/account/orders" },
  { label: "Contact", href: "#contact" }
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function getOrderIdFromHash() {
  const match = window.location.hash.match(/^#\/account\/orders\/([^?]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function OrderDetailsPage() {
  const { orders, isLoading, error } = useOrders();
  const orderId = getOrderIdFromHash();
  const order = orders.find((item) => String(item.orderId) === String(orderId));

  return (
    <>
      <Header navigationLinks={orderDetailsLinks} />

      <main className="account-page">
        {error ? <p className="catalog-status error">{error}</p> : null}
        {isLoading ? <p className="catalog-status">Loading order details...</p> : null}
        {!isLoading && !order ? (
          <section className="account-empty-state">
            <h2>Order not found.</h2>
            <p>The requested order details are unavailable in this browser session.</p>
            <a href="#/account/orders" className="catalog-banner-link primary">
              Back to orders
            </a>
          </section>
        ) : null}

        {!isLoading && order ? (
          <>
            <section className="account-hero compact">
              <div className="account-hero-copy">
                <p className="section-subtitle">Order details</p>
                <h1 className="catalog-heading">Order #{order.orderId}</h1>
                <p className="account-hero-text">
                  Review the customer information, order status, and all items placed in this order.
                </p>
              </div>
              <div className="account-hero-badge small">
                <strong>{currency.format(Number(order.totalAmount || 0))}</strong>
                <span>{order.status || "pending"}</span>
              </div>
            </section>

            <section className="account-dashboard">
              <aside className="account-nav-card">
                <p className="account-nav-label">Account navigation</p>
                <a href="#/account/profile" className="account-nav-link">
                  Profile overview
                </a>
                <a href="#/account/favorites" className="account-nav-link">
                  Favourite page
                </a>
                <a href="#/account/orders" className="account-nav-link active">
                  Orders list
                </a>
              </aside>

              <div className="account-content-stack">
                <article className="account-card feature">
                  <p className="section-subtitle">Order summary</p>
                  <h2>Customer information</h2>
                  <div className="account-meta-grid">
                    <div>
                      <span>Order ID</span>
                      <strong>#{order.orderId}</strong>
                    </div>
                    <div>
                      <span>Name</span>
                      <strong>{order.customerName}</strong>
                    </div>
                    <div>
                      <span>Email</span>
                      <strong>{order.email}</strong>
                    </div>
                    <div>
                      <span>Phone</span>
                      <strong>{order.phone || "Not provided"}</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <strong>{order.status || "pending"}</strong>
                    </div>
                    <div>
                      <span>Total price</span>
                      <strong>{currency.format(Number(order.totalAmount || 0))}</strong>
                    </div>
                  </div>
                </article>

                <article className="account-card">
                  <p className="section-subtitle">Shipping details</p>
                  <h2>Address</h2>
                  <div className="order-detail-grid">
                    <div>
                      <p className="section-subtitle">Placed on</p>
                      <strong>{new Date(order.createdAt).toLocaleString()}</strong>
                    </div>
                    <div>
                      <p className="section-subtitle">City</p>
                      <strong>{order.city || "Not provided"}</strong>
                    </div>
                    <div>
                      <p className="section-subtitle">Postal code</p>
                      <strong>{order.postalCode || "Not provided"}</strong>
                    </div>
                  </div>
                  <div className="order-address-card">
                    <p className="section-subtitle">Address line</p>
                    <strong>{order.address || "No address provided"}</strong>
                  </div>
                </article>

                <section className="order-items-showcase">
                  <div className="catalog-strip-head">
                    <div>
                      <p className="section-subtitle">Purchased items</p>
                      <h2 className="catalog-heading">Order products</h2>
                    </div>
                  </div>

                  <div className="order-products-list">
                    {order.items?.map((item) => (
                      <article key={`${order.orderId}-${item.productId}`} className="order-product-row">
                        <a
                          href={`#/products/${encodeURIComponent(item.slug || item.productId)}`}
                          className="order-product-thumb"
                        >
                          <img src={item.imageUrl} alt={item.name} />
                        </a>
                        <div className="order-product-copy">
                          <h3>{item.name}</h3>
                          <div className="order-item-meta">
                            <span>Quantity: {item.quantity}</span>
                            <span>Line total: {currency.format(Number(item.lineTotal || 0))}</span>
                          </div>
                          <a
                            href={`#/products/${encodeURIComponent(item.slug || item.productId)}`}
                            className="catalog-link"
                          >
                            View product
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </section>
          </>
        ) : null}
      </main>

      <Footer footerSections={footerSections} />
    </>
  );
}

export default OrderDetailsPage;
