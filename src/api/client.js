/**
 * Centralized API Client for LimitGuard
 * Connects the frontend to the backend API using native browser fetch.
 * STRICT: credentials: 'include' on all requests, zero axios / external HTTP libraries.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1/auth';

export async function request(path, options = {}) {
  const { headers, method = 'GET', body, ...restOptions } = options;

  const config = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...headers,
    },
    ...restOptions,
  };

  if (body !== undefined) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  // Ensure leading slash formatting
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${BASE_URL}${endpoint}`;

  let res;
  try {
    res = await fetch(fullUrl, config);
  } catch (networkError) {
    const error = new Error('Network error. Unable to reach backend server. Please check your connection.');
    error.status = 0;
    error.isNetworkError = true;
    throw error;
  }

  // Handle empty responses (e.g. 204 No Content or empty body)
  if (res.status === 204) {
    return { success: true };
  }

  let data = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await res.text();
      if (text) {
        data = { message: text };
      }
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    let message = '';

    if (data) {
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        message = data.errors
          .map((err) => {
            if (typeof err === 'string') return err;
            return err.msg || err.message || err.error || '';
          })
          .filter(Boolean)
          .join(', ');
      } else if (data.errors && typeof data.errors === 'object') {
        message = Object.values(data.errors)
          .map((err) => {
            if (typeof err === 'string') return err;
            return err.msg || err.message || '';
          })
          .filter(Boolean)
          .join(', ');
      } else if (data.message) {
        message = data.message;
      } else if (data.error) {
        message = typeof data.error === 'string' ? data.error : data.error.message || JSON.stringify(data.error);
      }
    }

    if (!message) {
      if (res.status === 409) {
        message = 'User already exists';
      } else if (res.status === 401) {
        message = 'Invalid email or password';
      } else if (res.status === 400) {
        message = 'Validation failed. Please verify your inputs.';
      } else if (res.status === 404) {
        message = 'Requested resource not found.';
      } else if (res.status >= 500) {
        message = 'Server error. Please try again.';
      } else {
        message = `Request failed with status ${res.status}`;
      }
    }

    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Centralized generic HTTP methods
export const apiClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

// Specialized Auth API Endpoints (GET, POST)
export const authApi = {
  register: (userData) => apiClient.post('/register', userData),
  login: (credentials) => apiClient.post('/login', credentials),
  me: () => apiClient.get('/me'),
  logout: () => apiClient.post('/logout'),
};
