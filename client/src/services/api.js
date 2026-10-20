const API_BASE_URL = 'http://localhost:3000';

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

export async function createBinder({ name, color, parentBinderId = null }) {
  const res = await fetch(`${BASE_URL}/api/binders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, color, parentBinderId }),
  });
  if (!res.ok) throw new Error('Failed to create binder');
  return res.json();
}

export { API_BASE_URL };
