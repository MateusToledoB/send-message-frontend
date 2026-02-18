const API_BASE_URL = (import.meta.env.VITE_API_URL || '').trim();

function buildUrl(path) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(buildUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

export function authenticate({ name, password }) {
  return apiRequest('http://localhost:8000/api/v1/authenticate', {
    method: 'POST',
    body: JSON.stringify({ name, password }),
  });
}
