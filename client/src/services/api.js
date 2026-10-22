const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const BASE_URL = API_BASE_URL;

export async function fetchProfile() {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Not authenticated');
  }

  const data = await response.json();
  return data;
}

export async function getBinders() {
  const res = await fetch(`${BASE_URL}/api/binders`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to fetch binders');
  }

  const data = await res.json();
  return Array.isArray(data) ? data : data.binders || [];
}

export async function getItems() {
  const res = await fetch(`${BASE_URL}/api/items`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to fetch items');
  }

  const data = await res.json();
  return Array.isArray(data) ? data : data.items || [];
}

export async function createItem(payload) {
  const res = await fetch(`${BASE_URL}/api/items`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to create item');
  }

  return res.json();
}

export async function updateItem(itemId, payload) {
  const res = await fetch(`${BASE_URL}/api/items/${itemId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to update item');
  }

  return res.json();
}

export async function deleteItem(itemId) {
  const res = await fetch(`${BASE_URL}/api/items/${itemId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to delete item');
  }

  return res.json();
}

// Backward-compatible alias for existing call sites.
export const fetchBinders = getBinders;

export async function createBinder({ name, color, parentBinderId = null }) {
  const res = await fetch(`${BASE_URL}/api/binders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, color, parentBinderId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to create binder');
  }

  return res.json();
}

export async function editBinder(binderId, { name, color }) {
  const res = await fetch(`${BASE_URL}/api/binders/${binderId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to edit binder');
  }

  return res.json();
}

export async function deleteBinder(binderId) {
  const res = await fetch(`${BASE_URL}/api/binders/${binderId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to delete binder');
  }

  return res.json();
}

export { API_BASE_URL, BASE_URL };