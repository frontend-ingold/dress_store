import { useCallback, useEffect, useMemo, useState } from "react";
import { apiBaseUrl } from "../config/api";
import useShopSession from "./useShopSession";

const CART_TOKEN_KEY = "atelier-cart-token";

function createCartToken() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getCartToken() {
  const storedToken = window.localStorage.getItem(CART_TOKEN_KEY);

  if (storedToken) {
    return storedToken;
  }

  const nextToken = createCartToken();
  window.localStorage.setItem(CART_TOKEN_KEY, nextToken);
  return nextToken;
}

function normalizeCart(cart) {
  return (
    cart || {
      cartToken: "",
      itemCount: 0,
      subtotal: 0,
      items: []
    }
  );
}

function useCart() {
  const { currentUser, isGuest } = useShopSession();
  const [cartToken] = useState(getCartToken);
  const [cart, setCart] = useState(() =>
    normalizeCart({
      cartToken,
      itemCount: 0,
      subtotal: 0,
      items: []
    })
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(`${apiBaseUrl}/cart/${encodeURIComponent(cartToken)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load cart.");
      }

      setCart(normalizeCart(data.cart));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, [cartToken]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const mutateCart = useCallback(async (url, options, fallbackMessage) => {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || fallbackMessage);
    }

    setCart(normalizeCart(data.cart));
    return data;
  }, []);

  const addItem = useCallback(
    async (productId, quantity = 1, variantId = null) =>
      mutateCart(
        `${apiBaseUrl}/cart/items`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartToken, productId, quantity, variantId })
        },
        "Unable to add product to cart."
      ),
    [cartToken, mutateCart]
  );

  const updateItem = useCallback(
    async (cartItemId, quantity) =>
      mutateCart(
        `${apiBaseUrl}/cart/items`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartToken, cartItemId, quantity })
        },
        "Unable to update cart item."
      ),
    [cartToken, mutateCart]
  );

  const removeItem = useCallback(
    async (cartItemId) =>
      mutateCart(
        `${apiBaseUrl}/cart/items/${cartItemId}?cartToken=${encodeURIComponent(cartToken)}`,
        { method: "DELETE" },
        "Unable to remove cart item."
      ),
    [cartToken, mutateCart]
  );

  const checkout = useCallback(
    async (payload) => {
      const response = await fetch(`${apiBaseUrl}/cart/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartToken,
          userId: !isGuest ? currentUser?.id : null,
          ...payload
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to place order.");
      }

      setCart(
        normalizeCart({
          cartToken,
          itemCount: 0,
          subtotal: 0,
          items: []
        })
      );

      return data;
    },
    [cartToken, currentUser?.id, isGuest]
  );

  return useMemo(
    () => ({
      cartToken,
      cart,
      itemCount: cart.itemCount || 0,
      isLoading,
      error,
      loadCart,
      addItem,
      updateItem,
      removeItem,
      checkout
    }),
    [addItem, cart, cartToken, checkout, error, isLoading, loadCart, removeItem, updateItem]
  );
}

export default useCart;
