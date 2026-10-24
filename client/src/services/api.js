// Central API Client Module (ICTAK Section 7.2)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Universal request wrapper handling headers, auth tokens, JSON serialization, and normalized errors
 */
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Attach auth token if available
  const token = localStorage.getItem('devpulse_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // If unauthorized, token might be expired
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('devpulse_token');
        localStorage.removeItem('devpulse_user');
      }

      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // Re-throw with user-friendly error message
    if (!err.status && err.message === 'Failed to fetch') {
      const netError = new Error('Unable to connect to the backend server. Please verify the API is running.');
      netError.status = 0;
      throw netError;
    }
    throw err;
  }
};

export const api = {
  get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => request(endpoint, { method: 'POST', body, ...options }),
  put: (endpoint, body, options) => request(endpoint, { method: 'PUT', body, ...options }),
  patch: (endpoint, body, options) => request(endpoint, { method: 'PATCH', body, ...options }),
  delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options }),
};

export default api;
