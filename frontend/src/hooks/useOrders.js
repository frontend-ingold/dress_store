import { useEffect, useMemo, useState } from "react";
import { apiBaseUrl } from "../config/api";
import useOrderHistory from "./useOrderHistory";
import useShopSession from "./useShopSession";

function useOrders() {
  const { currentUser, isAuthenticated, isGuest } = useShopSession();
  const { orders: localOrders } = useOrderHistory();
  const [apiOrders, setApiOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || isGuest || !currentUser?.id) {
      setApiOrders([]);
      setIsLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();

    async function loadOrders() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `${apiBaseUrl}/orders/user/${encodeURIComponent(currentUser.id)}`,
          { signal: controller.signal }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load orders.");
        }

        setApiOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadOrders();
    return () => controller.abort();
  }, [currentUser?.id, isAuthenticated, isGuest]);

  const mergedOrders = useMemo(() => {
    if (!isAuthenticated || isGuest) {
      return localOrders;
    }

    const orderMap = new Map();

    [...apiOrders, ...localOrders].forEach((order) => {
      if (!order?.orderId) {
        return;
      }

      if (!orderMap.has(order.orderId)) {
        orderMap.set(order.orderId, order);
      }
    });

    return Array.from(orderMap.values()).sort(
      (left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
    );
  }, [apiOrders, isAuthenticated, isGuest, localOrders]);

  return useMemo(
    () => ({
      orders: mergedOrders,
      isLoading: isAuthenticated && !isGuest ? isLoading : false,
      error: isAuthenticated && !isGuest ? error : ""
    }),
    [error, isAuthenticated, isGuest, isLoading, mergedOrders]
  );
}

export default useOrders;
