import { useEffect, useState } from "react";
import { apiBaseUrl } from "../config/api";

function useProductDetails(pathParam) {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pathParam) {
      setProduct(null);
      setIsLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();

    async function loadProduct() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `${apiBaseUrl}/products/${encodeURIComponent(pathParam)}`,
          { signal: controller.signal }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load product.");
        }

        setProduct(data.product || null);
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

    loadProduct();
    return () => controller.abort();
  }, [pathParam]);

  return { product, isLoading, error };
}

export default useProductDetails;
