import { useCallback, useEffect, useMemo, useState } from "react";
import { apiBaseUrl } from "../config/api";
import useShopSession from "./useShopSession";

const FAVORITES_STORAGE_KEY = "atelier-favorites";

function readFavorites() {
  const rawValue = window.localStorage.getItem(FAVORITES_STORAGE_KEY);

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

function useFavorites() {
  const { currentUser, isGuest } = useShopSession();
  const [favorites, setFavorites] = useState(readFavorites);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const userId = !isGuest ? currentUser?.id : null;

  const persistFavorites = useCallback((nextFavorites) => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavorites));
    setFavorites(nextFavorites);
  }, []);

  const toggleFavorite = useCallback(
    async (productId) => {
      const normalizedId = String(productId);

      if (!userId) {
        setFavorites((current) => {
          const nextFavorites = current.includes(normalizedId)
            ? current.filter((item) => item !== normalizedId)
            : [...current, normalizedId];

          window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavorites));
          return nextFavorites;
        });
        return;
      }

      const alreadyFavorite = favorites.includes(normalizedId);
      const requestConfig = alreadyFavorite
        ? {
            url: `${apiBaseUrl}/favorites/${encodeURIComponent(userId)}/${encodeURIComponent(productId)}`,
            method: "DELETE"
          }
        : {
            url: `${apiBaseUrl}/favorites`,
            method: "POST",
            body: JSON.stringify({ userId, productId })
          };

      const response = await fetch(requestConfig.url, {
        method: requestConfig.method,
        headers: requestConfig.body ? { "Content-Type": "application/json" } : undefined,
        body: requestConfig.body
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update favorites.");
      }

      setFavorites(Array.isArray(data.favorites) ? data.favorites : []);
    },
    [favorites, userId]
  );

  const clearFavorites = useCallback(() => {
    persistFavorites([]);
  }, [persistFavorites]);

  useEffect(() => {
    if (!userId) {
      if (isGuest) {
        setFavorites(readFavorites());
      }
      setIsLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();

    async function loadFavorites() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`${apiBaseUrl}/favorites/${encodeURIComponent(userId)}`, {
          signal: controller.signal
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load favorites.");
        }

        setFavorites(Array.isArray(data.favorites) ? data.favorites : []);
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

    loadFavorites();
    return () => controller.abort();
  }, [isGuest, userId]);

  useEffect(() => {
    function syncFavorites() {
      if (!userId) {
        setFavorites(readFavorites());
      }
    }

    window.addEventListener("storage", syncFavorites);
    return () => window.removeEventListener("storage", syncFavorites);
  }, [userId]);

  return useMemo(
    () => ({
      favorites,
      favoriteCount: favorites.length,
      isLoading,
      error,
      isFavorite: (productId) => favorites.includes(String(productId)),
      toggleFavorite,
      clearFavorites
    }),
    [clearFavorites, error, favorites, isLoading, toggleFavorite]
  );
}

export default useFavorites;
