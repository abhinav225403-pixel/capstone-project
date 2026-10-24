import api from './api';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.token) {
      localStorage.setItem('devpulse_token', res.token);
      localStorage.setItem('devpulse_user', JSON.stringify(res.user));
    }
    return res;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.token) {
      localStorage.setItem('devpulse_token', res.token);
      localStorage.setItem('devpulse_user', JSON.stringify(res.user));
    }
    return res;
  },

  getMe: async () => {
    return await api.get('/auth/me');
  },

  updateProfile: async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.user) {
      localStorage.setItem('devpulse_user', JSON.stringify(res.user));
    }
    return res;
  },

  logout: () => {
    localStorage.removeItem('devpulse_token');
    localStorage.removeItem('devpulse_user');
  },
};

export default authService;
