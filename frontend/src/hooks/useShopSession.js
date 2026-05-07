import { useCallback, useEffect, useMemo, useState } from "react";
import { apiBaseUrl } from "../config/api";

const SESSION_STORAGE_KEY = "atelier-shop-session";

function readStoredSession() {
  const rawValue = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

function useShopSession() {
  const [session, setSession] = useState(() => readStoredSession());

  const persistSession = useCallback((nextSession) => {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }, []);

  const clearSession = useCallback(() => {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
  }, []);

  const continueAsGuest = useCallback(() => {
    persistSession({
      mode: "guest",
      name: "Guest shopper"
    });
  }, [persistSession]);

  const login = useCallback(
    async ({ email, password }) => {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to login.");
      }

      persistSession(data.session);
      return data.session;
    },
    [persistSession]
  );

  const register = useCallback(
    async ({ name, email, password }) => {
      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create account.");
      }

      persistSession(data.session);
      return data.session;
    },
    [persistSession]
  );

  const forgotPassword = useCallback(async ({ email }) => {
    const response = await fetch(`${apiBaseUrl}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to request password reset.");
    }

    return data;
  }, []);

  const resetPassword = useCallback(
    async ({ token, password }) => {
      const response = await fetch(`${apiBaseUrl}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to reset password.");
      }

      if (data.session) {
        persistSession(data.session);
      }

      return data;
    },
    [persistSession]
  );

  useEffect(() => {
    function syncSession() {
      setSession(readStoredSession());
    }

    window.addEventListener("storage", syncSession);
    return () => window.removeEventListener("storage", syncSession);
  }, []);

  return useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      continueAsGuest,
      login,
      register,
      forgotPassword,
      resetPassword,
      clearSession
    }),
    [clearSession, continueAsGuest, forgotPassword, login, register, resetPassword, session]
  );
}

export default useShopSession;
