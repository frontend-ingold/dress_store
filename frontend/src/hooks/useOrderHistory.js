import { useCallback, useEffect, useMemo, useState } from "react";

const ORDER_HISTORY_STORAGE_KEY = "atelier-order-history";

function readOrders() {
  const rawValue = window.localStorage.getItem(ORDER_HISTORY_STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function useOrderHistory() {
  const [orders, setOrders] = useState(readOrders);

  const persistOrders = useCallback((nextOrders) => {
    window.localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(nextOrders));
    setOrders(nextOrders);
  }, []);

  const addOrder = useCallback(
    (order) => {
      const nextOrder = {
        ...order,
        createdAt: order.createdAt || new Date().toISOString(),
        status: order.status || "pending"
      };

      setOrders((current) => {
        const nextOrders = [nextOrder, ...current];
        window.localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(nextOrders));
        return nextOrders;
      });
    },
    []
  );

  useEffect(() => {
    function syncOrders() {
      setOrders(readOrders());
    }

    window.addEventListener("storage", syncOrders);
    return () => window.removeEventListener("storage", syncOrders);
  }, []);

  return useMemo(
    () => ({
      orders,
      addOrder,
      clearOrders: () => persistOrders([])
    }),
    [addOrder, orders, persistOrders]
  );
}

export default useOrderHistory;
