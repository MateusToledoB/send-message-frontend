const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8008')
  .trim()
  .replace(/\/+$/, '');
const API_LOGIN_PATH = (import.meta.env.VITE_API_LOGIN_PATH || '/api/v1/token').trim();

function buildUrl(path) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

async function apiRequest(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = { ...(options.headers || {}) };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(buildUrl(path), {
    credentials: 'include',
    ...options,
    headers,
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

function isTokenPath(path) {
  return path.endsWith('/token');
}

function buildLoginRequest(path, { name, password }) {
  if (isTokenPath(path)) {
    return {
      method: 'POST',
      body: new URLSearchParams({
        username: name,
        password,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
  }

  return {
    method: 'POST',
    body: JSON.stringify({ name, password }),
  };
}

export async function authenticate({ name, password }) {
  const attempts = [API_LOGIN_PATH, '/api/v1/authenticate'].filter(
    (path, index, list) => list.indexOf(path) === index,
  );
  let lastError;

  for (const path of attempts) {
    try {
      return await apiRequest(path, buildLoginRequest(path, { name, password }));
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

export function sendFolhaPonto({ file, columnName, columnMonth, columnContact }) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('column_name', columnName);
  formData.append('column_month', columnMonth);
  formData.append('column_contact', columnContact);

  return apiRequest('/api/v1/send_folha_ponto', {
    method: 'POST',
    body: formData,
  });
}
