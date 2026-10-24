import api from './api';

export const statsService = {
  getDashboardStats: async () => {
    return await api.get('/stats/dashboard');
  },

  getUsers: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.role) query.append('role', params.role);
    const queryString = query.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    return await api.get(endpoint);
  },

  updateUserRole: async (id, role) => {
    return await api.patch(`/users/${id}/role`, { role });
  },

  toggleUserStatus: async (id) => {
    return await api.patch(`/users/${id}/status`, {});
  },
};

export default statsService;
