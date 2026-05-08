const DEFAULT_API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://booking-api-zae7.vercel.app/api'
    : 'http://localhost:4000/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });

  const payload = response.status === 204 ? null : await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed');
  }

  return payload;
}

export async function fetchProperties(filters = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  const payload = await request(`/properties${query ? `?${query}` : ''}`);
  return payload.properties || [];
}

export async function createBooking(body) {
  const payload = await request('/bookings', {
    method: 'POST',
    headers: getAuthHeaders(body.token),
    body: JSON.stringify(body),
  });

  return payload.booking;
}

export async function fetchPropertyDetail(slug) {
  const payload = await request(`/properties/${slug}`);
  return payload.property;
}

export async function registerUser(body) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function loginUser(body) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function logoutUser(token) {
  await request('/auth/logout', {
    method: 'POST',
    headers: getAuthHeaders(token),
  });
}

export async function fetchCurrentUser(token) {
  const payload = await request('/auth/me', {
    headers: getAuthHeaders(token),
  });

  return payload.user;
}

export async function updateAccount(body, token) {
  const payload = await request('/account', {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify(body),
  });

  return payload.user;
}

export async function fetchMyBookings(token) {
  const payload = await request('/account/bookings', {
    headers: getAuthHeaders(token),
  });

  return payload.bookings || [];
}

function getAuthHeaders(token) {
  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export { API_BASE_URL };
