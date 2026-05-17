import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const bumilApi = {
  getAll: (params?: { page?: number, limit?: number, search?: string }) => api.get('/bumil', { params }),
  getMe: () => api.get('/bumil/me'),
  getById: (id: string) => api.get(`/bumil/${id}`),
  create: (data: any) => api.post('/bumil', data),
  update: (id: string, data: any) => api.put(`/bumil/${id}`, data),
  delete: (id: string) => api.delete(`/bumil/${id}`),
  getTtd: (id: string) => api.get(`/bumil/${id}/ttd`),
  updateTtdMetadata: (id: string, data: any) => api.post(`/bumil/${id}/ttd/metadata`, data),
  toggleTtdLog: (id: string, data: any) => api.post(`/bumil/${id}/ttd/toggle`, data),
  getCheckups: (id: string) => api.get(`/bumil/${id}/checkups`),
  createCheckup: (id: string, data: any) => api.post(`/bumil/${id}/checkups`, data),
  deleteCheckup: (id: string, checkupId: number) => api.delete(`/bumil/${id}/checkups/${checkupId}`),
  getDoctorCheckups: (id: string) => api.get(`/bumil/${id}/doctor-checkups`),
  createDoctorCheckup: (id: string, data: any) => api.post(`/bumil/${id}/doctor-checkups`, data),
  deleteDoctorCheckup: (id: string, checkupId: number) => api.delete(`/bumil/${id}/doctor-checkups/${checkupId}`),
};

export const authApi = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (data: any) => api.post('/auth/register', data),
  getUsers: () => api.get('/auth/users'), 
};

export default api;
