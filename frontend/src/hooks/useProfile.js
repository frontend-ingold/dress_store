import { useEffect, useState } from "react";
import { apiBaseUrl } from "../config/api";

function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setIsLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();

    async function loadProfile() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`${apiBaseUrl}/auth/profile/${encodeURIComponent(userId)}`, {
          signal: controller.signal
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile.");
        }

        setProfile(data.profile || null);
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

    loadProfile();
    return () => controller.abort();
  }, [userId]);

  return { profile, isLoading, error };
}

export default useProfile;
