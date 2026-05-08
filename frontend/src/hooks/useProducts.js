import { useEffect, useState } from "react";
import { apiBaseUrl } from "../config/api";

function buildProductsUrl(options = {}) {
  const params = new URLSearchParams();

  Object.entries(options).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === false) {
      return;
    }

    params.set(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? `${apiBaseUrl}/products?${queryString}` : `${apiBaseUrl}/products`;
}

function useProducts(options = {}) {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 0,
    totalCount: 0,
    totalPages: 1
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const requestKey = JSON.stringify(options);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(buildProductsUrl(options), {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("Unable to load products.");
        }

        const data = await response.json();
        setProducts(data.products ?? []);
        setPagination(
          data.pagination || {
            page: 1,
            pageSize: data.products?.length || 0,
            totalCount: data.products?.length || 0,
            totalPages: 1
          }
        );
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

    loadProducts();
    return () => controller.abort();
  }, [requestKey]);

  return { products, pagination, isLoading, error };
}

export default useProducts;
