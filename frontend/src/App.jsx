import { useEffect, useState } from "react";
import FavoritesPage from "./pages/FavoritesPage";
import CartPage from "./pages/CartPage";
import LandingPage from "./pages/LandingPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ProductListPage from "./pages/ProductListPage";

function getRouteFromHash() {
  if (/^#\/account\/orders\/[^/]+/.test(window.location.hash)) {
    return "account-order-details";
  }

  if (window.location.hash.startsWith("#/account/profile")) {
    return "account-profile";
  }

  if (window.location.hash.startsWith("#/account/favorites")) {
    return "account-favorites";
  }

  if (window.location.hash.startsWith("#/account/orders")) {
    return "account-orders";
  }

  if (window.location.hash.startsWith("#/success")) {
    return "success";
  }

  if (window.location.hash.startsWith("#/cart")) {
    return "cart";
  }

  if (/^#\/products\/[^/]+/.test(window.location.hash)) {
    return "product-details";
  }

  if (window.location.hash.startsWith("#/products")) {
    return "products";
  }

  return "landing";
}

function App() {
  const [route, setRoute] = useState(getRouteFromHash);

  useEffect(() => {
    function handleHashChange() {
      setRoute(getRouteFromHash());
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (route === "products") {
    return <ProductListPage />;
  }

  if (route === "account-profile") {
    return <ProfilePage />;
  }

  if (route === "account-favorites") {
    return <FavoritesPage />;
  }

  if (route === "account-orders") {
    return <OrdersPage />;
  }

  if (route === "account-order-details") {
    return <OrderDetailsPage />;
  }

  if (route === "product-details") {
    return <ProductDetailsPage />;
  }

  if (route === "cart") {
    return <CartPage />;
  }

  if (route === "success") {
    return <OrderSuccessPage />;
  }

  return <LandingPage />;
}

export default App;
