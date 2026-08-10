/** Exposes HTTP APIs that connect to the Spring Boot backend. */
import { http } from './http';

export const api = {
  employees: {
    create: async (values) => (await http.post('/admin/employees', values)).data,
    update: async (id, values) => (await http.put(`/admin/employees/${id}`, values)).data,
    remove: async (id) => http.delete(`/admin/employees/${id}`),
    all: async (params = {}) => (await http.get('/employees', { params })).data,
    get: async (id) => (await http.get(`/employees/${id}`)).data,
  },
  departments: {
    list: async () => (await http.get('/departments')).data,
    create: async (values) => (await http.post('/admin/departments', values)).data,
    update: async (id, values) => (await http.put(`/admin/departments/${id}`, values)).data,
    remove: async (id) => http.delete(`/admin/departments/${id}`),
    get: async (id) => {
      const { data } = await http.get('/departments');
      return data.find((item) => item.id === id) || null;
    },
  },
  profile: {
    me: async () => (await http.get('/me')).data,
    update: async (values) => (await http.patch('/me/profile', values)).data,
  },
  attendance: {
    punchIn: async (employeeId) => (await http.post(`/attendance/punch-in/${employeeId}`)).data,
    punchOut: async (employeeId) => (await http.post(`/attendance/punch-out/${employeeId}`)).data,
    today: async () => (await http.get('/attendance/today')).data,
    history: async (month, year) => (await http.get('/attendance/history', { params: { month, year } })).data,
    summary: async (employeeId) => (await http.get(`/attendance/summary/${employeeId}`)).data,
    record: async (employeeId, data) => (await http.post(`/attendance/employee/${employeeId}`, null, { params: data })).data,
    forEmployee: async (employeeId, month, year) => (await http.get(`/attendance/employee/${employeeId}`, { params: { month, year } })).data,
  },
  leaves: {
    list: async () => (await http.get('/leaves')).data,
    forEmployee: async (employeeId) => (await http.get(`/leaves/employee/${employeeId}`)).data,
    create: async (request) => (await http.post('/leaves', request)).data,
    approve: async (leaveId) => (await http.put(`/leaves/${leaveId}/approve`)).data,
    reject: async (leaveId) => (await http.put(`/leaves/${leaveId}/reject`)).data,
    cancel: async (leaveId) => http.delete(`/leaves/${leaveId}`),
  },
  payroll: {
    list: async (month) => (await http.get('/payroll', { params: { month } })).data,
    forEmployee: async (employeeId) => (await http.get(`/payroll/employee/${employeeId}`)).data,
    summary: async (month) => (await http.get('/payroll/summary', { params: { month } })).data,
    create: async (request) => (await http.post('/payroll', request)).data,
    update: async (id, request) => (await http.put(`/payroll/${id}`, request)).data,
    generate: async (month) => (await http.post('/payroll/generate', null, { params: { month } })).data,
  },
  assets: {
    list: async () => (await http.get('/assets')).data,
    create: async (values) => (await http.post('/admin/assets', values)).data,
    update: async (id, values) => (await http.put(`/admin/assets/${id}`, values)).data,
    remove: async (id) => http.delete(`/admin/assets/${id}`),
    mine: async () => (await http.get('/me/assets')).data,
    assign: async ({ assetId, employeeId }) => (await http.post(`/admin/assets/${assetId}/assign`, { employeeId })).data,
    returnAsset: async (assetId) => (await http.post(`/admin/assets/${assetId}/return`)).data,
  },
  notifications: {
    forEmployee: async (employeeId) => (await http.get(`/notifications/employee/${employeeId}`)).data,
    unreadCount: async (employeeId) => (await http.get(`/notifications/employee/${employeeId}/unread-count`)).data,
    markRead: async (notificationId) => (await http.put(`/notifications/${notificationId}/read`)).data,
  },
  dashboard: {
    overview: async () => (await http.get('/dashboard/overview')).data,
    hr: async () => (await http.get('/dashboard/hr')).data,
    employee: async (employeeId) => (await http.get(`/dashboard/employee/${employeeId}`)).data,
    birthdays: async () => (await http.get('/dashboard/birthdays')).data,
    activities: async () => (await http.get('/dashboard/activities')).data,
  },
  projects: {
    list: async () => (await http.get('/projects')).data,
    mine: async () => (await http.get('/me/projects')).data,
    create: async (values) => (await http.post('/admin/projects', values)).data,
    update: async (id, values) => (await http.put(`/admin/projects/${id}`, values)).data,
    remove: async (id) => http.delete(`/admin/projects/${id}`),
  },
  tasks: {
    list: async () => (await http.get('/tasks')).data,
    mine: async () => (await http.get('/me/tasks')).data,
    byStatus: async (status) => (await http.get(`/tasks/status/${status}`)).data,
    create: async (values) => (await http.post('/admin/tasks', values)).data,
    update: async (id, values) => (await http.put(`/admin/tasks/${id}`, values)).data,
    transition: async (id, status) => (await http.put(`/tasks/${id}/status/${status}`)).data,
    remove: async (id) => http.delete(`/admin/tasks/${id}`),
  },
  performance: {
    list: async () => (await http.get('/performance')).data,
    forEmployee: async (employeeId) => (await http.get(`/performance/employee/${employeeId}`)).data,
    create: async (values) => (await http.post('/admin/performance', values)).data,
    update: async (id, values) => (await http.put(`/admin/performance/${id}`, values)).data,
  },
  recruitment: {
    jobs: {
      list: async () => (await http.get('/job-openings')).data,
      create: async (values) => (await http.post('/admin/job-openings', values)).data,
      update: async (id, values) => (await http.put(`/admin/job-openings/${id}`, values)).data,
      remove: async (id) => http.delete(`/admin/job-openings/${id}`),
    },
    candidates: {
      list: async () => (await http.get('/candidates')).data,
      create: async (values) => (await http.post('/admin/candidates', values)).data,
      update: async (id, values) => (await http.put(`/admin/candidates/${id}`, values)).data,
      setStage: async (id, stage) => (await http.put(`/candidates/${id}/stage/${stage}`)).data,
      remove: async (id) => http.delete(`/admin/candidates/${id}`),
    },
    summary: async () => (await http.get('/recruitment/summary')).data,
  },
};

