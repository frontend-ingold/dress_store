import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import { footerSections } from "../data/landingContent";
import useOrders from "../hooks/useOrders";
import useShopSession from "../hooks/useShopSession";

const ordersLinks = [
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

function OrdersPage() {
  const { isAuthenticated, isGuest } = useShopSession();
  const { orders, isLoading, error } = useOrders();

  return (
    <>
      <Header navigationLinks={ordersLinks} />

      <main className="account-page">
        {error ? <p className="catalog-status error">{error}</p> : null}
        {isLoading ? <p className="catalog-status">Loading orders...</p> : null}
        <section className="account-hero compact">
          <div className="account-hero-copy">
            <p className="section-subtitle">My account</p>
            <h1 className="catalog-heading">Orders list</h1>
            <p className="account-hero-text">
              Review order references, totals, and open any record to inspect full order details.
            </p>
          </div>
          <div className="account-hero-badge small">
            <strong>{orders.length}</strong>
            <span>Order record{orders.length === 1 ? "" : "s"}</span>
          </div>
        </section>

        {!isAuthenticated ? (
          <section className="account-empty-state">
            <h2>You are not signed in.</h2>
            <p>Use the account icon in the header to login, register, or continue as guest.</p>
            <a href="#/products" className="catalog-banner-link primary">
              Browse products
            </a>
          </section>
        ) : null}

        {isAuthenticated && !isLoading && !orders.length ? (
          <section className="account-empty-state">
            <h2>No orders recorded yet.</h2>
            <p>
              {isGuest
                ? "Orders placed from this browser will appear here after checkout."
                : "Completed orders linked to your account email will appear here."}
            </p>
            <a href="#/products" className="catalog-banner-link primary">
              Start shopping
            </a>
          </section>
        ) : null}

        {isAuthenticated && orders.length ? (
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
              <section className="orders-list">
                <div className="orders-table-head">
                  <span>Order ID</span>
                  <span>Name</span>
                  <span>Email</span>
                  <span>Total Price</span>
                  <span>Status</span>
                </div>

                {orders.map((order) => (
                  <article key={order.orderId} className="order-card row-card">
                    <div className="order-summary-row active">
                      <span className="order-row-id">#{order.orderId}</span>
                      <span>{order.customerName}</span>
                      <span>{order.email}</span>
                      <strong>{currency.format(Number(order.totalAmount || 0))}</strong>
                      <span className="order-status-pill">{order.status || "pending"}</span>
                    </div>
                    <div className="order-list-actions">
                      <a
                        href={`#/account/orders/${encodeURIComponent(order.orderId)}`}
                        className="catalog-banner-link secondary"
                      >
                        View order details
                      </a>
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

export default OrdersPage;
