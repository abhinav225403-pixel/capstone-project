import api from './api';

export const projectService = {
  getProjects: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.priority) query.append('priority', params.priority);
    if (params.category) query.append('category', params.category);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const queryString = query.toString();
    const endpoint = queryString ? `/projects?${queryString}` : '/projects';
    return await api.get(endpoint);
  },

  getProjectById: async (id) => {
    return await api.get(`/projects/${id}`);
  },

  createProject: async (projectData) => {
    return await api.post('/projects', projectData);
  },

  updateProject: async (id, projectData) => {
    return await api.put(`/projects/${id}`, projectData);
  },

  deleteProject: async (id) => {
    return await api.delete(`/projects/${id}`);
  },
};

export default projectService;
