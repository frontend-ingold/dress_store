import { useEffect, useState } from "react";
import CartPage from "./pages/CartPage";
import LandingPage from "./pages/LandingPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ProductListPage from "./pages/ProductListPage";

function getRouteFromHash() {
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
