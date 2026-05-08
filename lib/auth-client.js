export const SESSION_STORAGE_KEY = 'booking.auth.token';
export const PENDING_BOOKING_STORAGE_KEY = 'booking.pending';

export function getStoredAuthToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(SESSION_STORAGE_KEY) || '';
}

export function storeAuthToken(token) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, token);
}

export function clearStoredAuthToken() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getPendingBooking() {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(PENDING_BOOKING_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch (_error) {
    clearPendingBooking();
    return null;
  }
}

export function storePendingBooking(payload) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(PENDING_BOOKING_STORAGE_KEY, JSON.stringify(payload));
}

export function clearPendingBooking() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(PENDING_BOOKING_STORAGE_KEY);
}
