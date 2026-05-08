import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import { footerSections } from "../data/landingContent";
import useFavorites from "../hooks/useFavorites";
import useOrders from "../hooks/useOrders";
import useProfile from "../hooks/useProfile";
import useShopSession from "../hooks/useShopSession";

const profileLinks = [
  { label: "Home", href: "#/" },
  { label: "Products", href: "#/products" },
  { label: "Profile", href: "#/account/profile" },
  { label: "Contact", href: "#contact" }
];

function ProfilePage() {
  const { session, currentUser, isAuthenticated, isGuest } = useShopSession();
  const { favoriteCount } = useFavorites();
  const { orders } = useOrders();
  const { profile, isLoading: isProfileLoading, error: profileError } = useProfile(
    !isGuest ? currentUser?.id : null
  );
  const displayProfile = profile || currentUser;
  const displayOrderCount = profile?.orderCount ?? orders.length;
  const displayMemberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString()
    : "Recently";
  const displaySpent = profile?.totalSpent ?? 0;

  return (
    <>
      <Header navigationLinks={profileLinks} />

      <main className="account-page">
        {!isAuthenticated ? (
          <section className="account-empty-state">
            <h2>You are not signed in.</h2>
            <p>Use the account icon in the header to login, register, or continue as guest.</p>
            <a href="#/products" className="catalog-banner-link primary">
              Browse products
            </a>
          </section>
        ) : (
          <>
            {profileError ? <p className="catalog-status error">{profileError}</p> : null}
            {isProfileLoading ? <p className="catalog-status">Loading profile...</p> : null}
            <section className="account-hero">
              <div className="account-hero-copy">
                <p className="section-subtitle">My account</p>
                <h1 className="catalog-heading">Profile dashboard</h1>
                <p className="account-hero-text">
                  Manage your saved pieces, review order history, and keep your boutique
                  shopping activity in one polished space.
                </p>
                <div className="account-stat-row">
                  <div className="account-stat-card">
                    <strong>{favoriteCount}</strong>
                    <span>Saved favourites</span>
                  </div>
                  <div className="account-stat-card">
                    <strong>{displayOrderCount}</strong>
                    <span>Recorded orders</span>
                  </div>
                  <div className="account-stat-card">
                    <strong>{session?.mode === "guest" ? "Guest" : "Member"}</strong>
                    <span>Account type</span>
                  </div>
                </div>
              </div>
              <div className="account-hero-badge">
                <div className="account-avatar">
                  {(displayProfile?.name || "A").slice(0, 1).toUpperCase()}
                </div>
                <strong>{displayProfile?.name || "Customer account"}</strong>
                <span>{displayProfile?.email || "No email added yet"}</span>
              </div>
            </section>

            <section className="account-dashboard">
              <aside className="account-nav-card">
                <p className="account-nav-label">Account navigation</p>
                <a href="#/account/profile" className="account-nav-link active">
                  Profile overview
                </a>
                <a href="#/account/favorites" className="account-nav-link">
                  Favourite page
                </a>
                <a href="#/account/orders" className="account-nav-link">
                  Orders list
                </a>
              </aside>

              <div className="account-content-stack">
                <article className="account-card feature">
                  <p className="section-subtitle">Account summary</p>
                  <h2>{displayProfile?.name || "Customer account"}</h2>
                  <div className="account-meta-grid">
                    <div>
                      <span>Name</span>
                      <strong>{displayProfile?.name || "Guest shopper"}</strong>
                    </div>
                    <div>
                      <span>Email</span>
                      <strong>{displayProfile?.email || "Not provided"}</strong>
                    </div>
                    <div>
                      <span>Account type</span>
                      <strong>{session?.mode === "guest" ? "Guest" : "Registered"}</strong>
                    </div>
                    <div>
                      <span>Member since</span>
                      <strong>{displayMemberSince}</strong>
                    </div>
                    <div>
                      <span>Total spent</span>
                      <strong>${Number(displaySpent || 0).toFixed(0)}</strong>
                    </div>
                    <div>
                      <span>Orders</span>
                      <strong>{displayOrderCount}</strong>
                    </div>
                  </div>
                </article>

                <div className="account-highlight-grid">
                  <a href="#/account/favorites" className="account-highlight-card">
                    <p className="section-subtitle">Saved pieces</p>
                    <h3>Favourite page</h3>
                    <span>{favoriteCount} product{favoriteCount === 1 ? "" : "s"} saved</span>
                  </a>
                  <a href="#/account/orders" className="account-highlight-card">
                    <p className="section-subtitle">Purchase history</p>
                    <h3>Orders list</h3>
                    <span>
                      {displayOrderCount} order{displayOrderCount === 1 ? "" : "s"} available
                    </span>
                  </a>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer footerSections={footerSections} />
    </>
  );
}

export default ProfilePage;
