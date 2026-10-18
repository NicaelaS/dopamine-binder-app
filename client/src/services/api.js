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

export { API_BASE_URL };
