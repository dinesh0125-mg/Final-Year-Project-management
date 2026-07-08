import axiosInstance from './axiosInstance';

// ─── Auth ──────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => axiosInstance.post('auth/login/', data),
  register: (data) => axiosInstance.post('auth/register/', data),
  logout: (refresh) => axiosInstance.post('auth/logout/', { refresh }),
  getMe: () => axiosInstance.get('auth/me/'),
  updateMe: (data) => axiosInstance.patch('auth/me/', data),
  refreshToken: (refresh) => axiosInstance.post('auth/token/refresh/', { refresh }),
  requestOtp: (data) => axiosInstance.post('auth/request-otp/', data),
  verifyOtp: (data) => axiosInstance.post('auth/verify-otp/', data),
  resetPassword: (data) => axiosInstance.post('auth/reset-password/', data),
};

// ─── Users (Admin) ─────────────────────────────────────────────────
export const userAPI = {
  list: (params) => axiosInstance.get('users/', { params }),
  get: (id) => axiosInstance.get(`users/${id}/`),
  create: (data) => axiosInstance.post('users/', data),
  update: (id, data) => axiosInstance.patch(`users/${id}/`, data),
  delete: (id) => axiosInstance.delete(`users/${id}/`),
};

// ─── Departments ───────────────────────────────────────────────────
export const departmentAPI = {
  list: (params) => axiosInstance.get('departments/', { params }),
  get: (id) => axiosInstance.get(`departments/${id}/`),
  create: (data) => axiosInstance.post('departments/', data),
  update: (id, data) => axiosInstance.patch(`departments/${id}/`, data),
  delete: (id) => axiosInstance.delete(`departments/${id}/`),
};

// ─── Teams ─────────────────────────────────────────────────────────
export const teamAPI = {
  list: (params) => axiosInstance.get('teams/', { params }),
  get: (id) => axiosInstance.get(`teams/${id}/`),
  createTeam: (data) => axiosInstance.post('teams/create-team/', data),
  join: (data) => axiosInstance.post('teams/join/', data),
  myTeam: () => axiosInstance.get('teams/my-team/'),
  allocateGuide: (teamId, data) => axiosInstance.post(`teams/${teamId}/allocate-guide/`, data),
  removeMember: (teamId, data) => axiosInstance.post(`teams/${teamId}/remove-member/`, data),
  addMember: (teamId, data) => axiosInstance.post(`teams/${teamId}/add-member/`, data),
  update: (id, data) => axiosInstance.patch(`teams/${id}/`, data),
};

// ─── Projects ──────────────────────────────────────────────────────
export const projectAPI = {
  list: (params) => axiosInstance.get('projects/', { params }),
  get: (id) => axiosInstance.get(`projects/${id}/`),
  create: (data) => axiosInstance.post('projects/', data),
  update: (id, data) => axiosInstance.patch(`projects/${id}/`, data),
  review: (id, data) => axiosInstance.post(`projects/${id}/review/`, data),
  approve: (id) => axiosInstance.post(`projects/${id}/review/`, { action: 'APPROVE' }),
  reject: (id) => axiosInstance.post(`projects/${id}/review/`, { action: 'REJECT' }),
};

// ─── Milestones ────────────────────────────────────────────────────
export const milestoneAPI = {
  list: (params) => axiosInstance.get('milestones/', { params }),
  get: (id) => axiosInstance.get(`milestones/${id}/`),
  create: (data) => axiosInstance.post('milestones/', data),
  update: (id, data) => axiosInstance.patch(`milestones/${id}/`, data),
  review: (id, data) => axiosInstance.post(`milestones/${id}/review/`, data),
};

// ─── Documents ─────────────────────────────────────────────────────
export const documentAPI = {
  list: (params) => axiosInstance.get('documents/', { params }),
  get: (id) => axiosInstance.get(`documents/${id}/`),
  upload: (data) => axiosInstance.post('documents/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => axiosInstance.patch(`documents/${id}/`, data),
  delete: (id) => axiosInstance.delete(`documents/${id}/`),
  review: (id, data) => axiosInstance.post(`documents/${id}/review/`, data),
};

// ─── Meetings ──────────────────────────────────────────────────────
export const meetingAPI = {
  list: (params) => axiosInstance.get('meetings/', { params }),
  get: (id) => axiosInstance.get(`meetings/${id}/`),
  create: (data) => axiosInstance.post('meetings/', data),
  approve: (id) => axiosInstance.post(`meetings/${id}/approve/`),
  cancel: (id) => axiosInstance.post(`meetings/${id}/cancel/`),
  reschedule: (id, data) => axiosInstance.post(`meetings/${id}/reschedule/`, data),
};

// ─── Reviews ───────────────────────────────────────────────────────
export const reviewAPI = {
  list: (params) => axiosInstance.get('reviews/', { params }),
  create: (data) => axiosInstance.post('reviews/', data),
  update: (id, data) => axiosInstance.patch(`reviews/${id}/`, data),
};

// ─── Viva ──────────────────────────────────────────────────────────
export const vivaAPI = {
  list: (params) => axiosInstance.get('viva/', { params }),
  create: (data) => axiosInstance.post('viva/', data),
  update: (id, data) => axiosInstance.patch(`viva/${id}/`, data),
};

// ─── Notifications ─────────────────────────────────────────────────
export const notificationAPI = {
  list: (params) => axiosInstance.get('notifications/', { params }),
  markRead: (id) => axiosInstance.post(`notifications/${id}/read/`),
  markAllRead: () => axiosInstance.post('notifications/mark-all-read/'),
  unreadCount: () => axiosInstance.get('notifications/unread-count/'),
};

// ─── Dashboards ────────────────────────────────────────────────────
export const dashboardAPI = {
  student: () => axiosInstance.get('dashboard/student/'),
  guide: () => axiosInstance.get('dashboard/guide/'),
  hod: () => axiosInstance.get('dashboard/hod/'),
  admin: () => axiosInstance.get('dashboard/admin/'),
};
