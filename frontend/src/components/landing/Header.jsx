import { useEffect, useMemo, useState } from "react";
import useShopSession from "../../hooks/useShopSession";
import AuthModal from "./AuthModal";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 16L21 21" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5.5 19c1.7-3 4.1-4.5 6.5-4.5S16.8 16 18.5 19"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 5h2l1.3 8.2a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L19.5 8H7.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="18.5" r="1.2" fill="currentColor" />
      <circle cx="17" cy="18.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function getSearchQueryFromHash() {
  const [, query = ""] = window.location.hash.split("?");
  const params = new URLSearchParams(query);
  return params.get("q") || "";
}

function Header({ navigationLinks, cartCount = 0 }) {
  const {
    session,
    currentUser,
    isAuthenticated,
    isGuest,
    continueAsGuest,
    login,
    register,
    forgotPassword,
    resetPassword,
    clearSession
  } = useShopSession();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(getSearchQueryFromHash);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authInfo, setAuthInfo] = useState("");

  const sessionLabel = useMemo(() => {
    if (!currentUser) {
      return "";
    }

    return currentUser.name || currentUser.email || "Account";
  }, [currentUser]);

  useEffect(() => {
    function syncHeaderStateFromHash() {
      setSearchValue(getSearchQueryFromHash());
      setIsSearchOpen(false);
      setIsAccountMenuOpen(false);
    }

    window.addEventListener("hashchange", syncHeaderStateFromHash);
    return () => window.removeEventListener("hashchange", syncHeaderStateFromHash);
  }, []);

  function handleSearchSubmit(event) {
    event.preventDefault();
    const trimmedQuery = searchValue.trim();

    if (!trimmedQuery) {
      window.location.hash = "#/products";
      return;
    }

    window.location.hash = `#/products?q=${encodeURIComponent(trimmedQuery)}`;
  }

  function handleSearchToggle() {
    setIsSearchOpen((current) => {
      const nextValue = !current;

      if (nextValue) {
        setIsAccountMenuOpen(false);
      }

      return nextValue;
    });
  }

  function handleAccountClick() {
    if (isAuthenticated) {
      setIsAccountMenuOpen((current) => {
        const nextValue = !current;

        if (nextValue) {
          setIsSearchOpen(false);
        }

        return nextValue;
      });
      return;
    }

    setAuthError("");
    setAuthInfo("");
    setAuthMode("login");
    setIsAuthModalOpen(true);
  }

  async function handleLogin(credentials) {
    try {
      setAuthError("");
      setAuthInfo("");
      await login(credentials);
      setIsAuthModalOpen(false);
    } catch (requestError) {
      setAuthError(requestError.message);
    }
  }

  async function handleRegister(payload) {
    try {
      setAuthError("");
      setAuthInfo("");
      await register(payload);
      setIsAuthModalOpen(false);
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
      setIsAuthModalOpen(false);
    } catch (requestError) {
      setAuthError(requestError.message);
    }
  }

  return (
    <>
      <nav className="site-nav-shell">
        <a href="#/" className="logo">
          ATELIER
        </a>

        <ul className="nav-links">
          {navigationLinks.map((item) => (
            <li key={item.label}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>

        <div className="nav-icons" aria-label="Utility links">
          <div className={isSearchOpen ? "header-search is-open" : "header-search"}>
            <button
              type="button"
              className="nav-icon-button"
              aria-label="Search products"
              onClick={handleSearchToggle}
            >
              <SearchIcon />
            </button>

            {isSearchOpen ? (
              <form className="header-search-panel" onSubmit={handleSearchSubmit}>
                <input
                  type="search"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search products"
                  aria-label="Search products"
                />
                <button type="submit" className="header-search-submit">
                  Go
                </button>
              </form>
            ) : null}
          </div>

          <div className="header-account">
            <button
              type="button"
              className="nav-icon-button"
              aria-label={isAuthenticated ? "Open account menu" : "Login or register"}
              onClick={handleAccountClick}
            >
              <AccountIcon />
            </button>

            {isAuthenticated && isAccountMenuOpen ? (
              <div className="header-account-menu">
                <p className="header-account-label">Signed in as</p>
                <strong>{sessionLabel}</strong>
                <span>{session?.mode === "guest" ? "Guest session" : "Customer account"}</span>
                <a
                  href="#/account/profile"
                  className="header-account-link"
                  onClick={() => setIsAccountMenuOpen(false)}
                >
                  Profile page
                </a>
                <a
                  href="#/account/favorites"
                  className="header-account-link"
                  onClick={() => setIsAccountMenuOpen(false)}
                >
                  Favourite page
                </a>
                <a
                  href="#/account/orders"
                  className="header-account-link"
                  onClick={() => setIsAccountMenuOpen(false)}
                >
                  Orders list page
                </a>
                {isGuest ? (
                  <button
                    type="button"
                    className="header-account-action"
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      setAuthError("");
                      setAuthInfo("");
                      setAuthMode("login");
                      setIsAuthModalOpen(true);
                    }}
                  >
                    Login
                  </button>
                ) : (
                  <button
                    type="button"
                    className="header-account-action"
                    onClick={() => {
                      clearSession();
                      setIsAccountMenuOpen(false);
                      window.location.hash = "#/";
                    }}
                  >
                    Logout
                  </button>
                )}
              </div>
            ) : null}
          </div>

          <a href="#/cart" className="nav-cart-link nav-icon-button" aria-label="Cart">
            <CartIcon />
            {cartCount > 0 ? <span className="nav-cart-badge">{cartCount}</span> : null}
          </a>
        </div>
      </nav>

      {isAuthModalOpen ? (
        <AuthModal
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={() => {
            setIsAuthModalOpen(false);
            setAuthError("");
            setAuthInfo("");
          }}
          onGuest={() => {
            setAuthError("");
            setAuthInfo("");
            continueAsGuest();
            setIsAuthModalOpen(false);
          }}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onForgotPassword={handleForgotPassword}
          onResetPassword={handleResetPassword}
          errorMessage={authError}
          infoMessage={authInfo}
        />
      ) : null}
    </>
  );
}

export default Header;
