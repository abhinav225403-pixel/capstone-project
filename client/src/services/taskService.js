import api from './api';

export const taskService = {
  getTasks: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.project) query.append('project', params.project);
    if (params.status) query.append('status', params.status);
    if (params.priority) query.append('priority', params.priority);
    if (params.assignee) query.append('assignee', params.assignee);
    if (params.type) query.append('type', params.type);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.order) query.append('order', params.order);

    const queryString = query.toString();
    const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
    return await api.get(endpoint);
  },

  getTaskById: async (id) => {
    return await api.get(`/tasks/${id}`);
  },

  createTask: async (taskData) => {
    return await api.post('/tasks', taskData);
  },

  updateTask: async (id, taskData) => {
    return await api.put(`/tasks/${id}`, taskData);
  },

  updateTaskStatus: async (id, status) => {
    return await api.patch(`/tasks/${id}/status`, { status });
  },

  deleteTask: async (id) => {
    return await api.delete(`/tasks/${id}`);
  },

  addComment: async (id, text) => {
    return await api.post(`/tasks/${id}/comments`, { text });
  },

  addChecklistItem: async (id, title) => {
    return await api.post(`/tasks/${id}/checklist`, { title });
  },

  toggleChecklistItem: async (id, itemId) => {
    return await api.patch(`/tasks/${id}/checklist/${itemId}`, {});
  },
};

export default taskService;
