import { useEffect, useState } from "react";
import { apiBaseUrl } from "../config/api";

function useCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`${apiBaseUrl}/categories`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("Unable to load categories.");
        }

        const data = await response.json();
        setCategories(data.categories ?? []);
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

    loadCategories();
    return () => controller.abort();
  }, []);

  return { categories, isLoading, error };
}

export default useCategories;
