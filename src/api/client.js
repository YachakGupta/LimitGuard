/**
 * Centralized API Client for LimitGuard
 * Connects the frontend to the backend API using native browser fetch.
 * STRICT: credentials: 'include' on all requests, zero axios / external HTTP libraries.
 * Never reads, parses, or stores JWT tokens in local/sessionStorage.
 */

let storeRef = null;

/**
 * Injects the Redux store reference to dispatch actions on auth events (like 401).
 * Avoids circular dependencies.
 */
export function setStore(store) {
  storeRef = store;
}

/**
 * Resolves any path (relative, prefixed, or absolute URL) to a valid endpoint.
 */
export function resolveUrl(path) {
  if (!path) return '';

  // Already a full HTTP(S) URL
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // Handle placeholders gracefully
  if (path.startsWith('TODO_')) {
    const error = new Error(`Endpoint "${path}" is a placeholder and not yet configured.`);
    error.status = 501;
    throw error;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // If already prefixed with /api, use as-is (Vite proxy forwards /api to backend)
  if (cleanPath.startsWith('/api')) {
    return cleanPath;
  }

  // If it is a relative auth path like /login, /me, /logout, /register
  return `/api/v1/auth${cleanPath}`;
}

/**
 * Core native fetch request wrapper.
 * Accepts relative or absolute URLs, always includes credentials and JSON headers.
 */
export async function request(path, options = {}) {
  const { headers = {}, method = 'GET', body, ...restOptions } = options;

  const fullUrl = resolveUrl(path);

  // Dev mock preview mode (only when VITE_USE_MOCK === 'true')
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK === 'true') {
    if (fullUrl.includes('/me') || fullUrl.includes('/login')) {
      return {
        success: true,
        user: { id: 'usr_mock_1', name: 'Alex Rivera', email: 'alex@limitguard.io' },
      };
    }
    if (fullUrl.includes('/logout')) {
      return { success: true };
    }
  }

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

  let res;
  try {
    res = await fetch(fullUrl, config);
  } catch (networkError) {
    const error = new Error(
      networkError.message || 'Network error. Unable to reach backend server. Please check your connection.'
    );
    error.status = 0;
    error.isNetworkError = true;
    throw error;
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return { success: true };
  }

  // Parse JSON safely
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

  // 401 anywhere in the app => dispatch logout state clear and redirect to /login
  // Exception: wrong password / invalid credentials during actual /login attempt should show error in form
  if (res.status === 401) {
    const isLoginEndpoint = fullUrl.includes('/login') && method === 'POST';
    if (!isLoginEndpoint) {
      if (storeRef) {
        storeRef.dispatch({ type: 'auth/logout/fulfilled' });
      }

      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.replace('/login');
      }
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
        message = 'Resource already exists';
      } else if (res.status === 401) {
        message = 'Invalid credentials or session expired';
      } else if (res.status === 403) {
        message = 'Access forbidden';
      } else if (res.status === 400) {
        message = 'Validation failed. Please verify your inputs.';
      } else if (res.status === 404) {
        message = 'Requested resource not found.';
      } else if (res.status >= 500) {
        message = 'Server error. Please try again later.';
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
