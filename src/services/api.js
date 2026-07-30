/** Exposes delayed local APIs that mirror the future HTTP service boundary. */
import { hrmsStore } from './hrmsStore';
import { http } from './http';
const getData = () => hrmsStore.getSnapshot();
function delay(value, ms = 250) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function paginate(items, page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize;
  return { data: items.slice(start, start + pageSize), total: items.length, page, pageSize };
}

export const api = {
  employees: {
    create: async (values) => (await http.post('/admin/employees', values)).data,
    update: async (id, values) => (await http.put(`/admin/employees/${id}`, values)).data,
    remove: async (id) => http.delete(`/admin/employees/${id}`),
    list: (params = {}) => {
      let items = [...getData().employees];
      if (params?.search) {
        const q = params.search.toLowerCase();
        items = items.filter(
          (e) =>
            `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
            e.email.toLowerCase().includes(q) ||
            e.jobTitle.toLowerCase().includes(q)
        );
      }
      if (params?.departmentId) items = items.filter((e) => e.departmentId === params.departmentId);
      return delay(paginate(items, params?.page, params?.pageSize));
    },
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
    list: () => delay(getData().attendance),
    forEmployee: (employeeId) => delay(getData().attendance.filter((a) => a.employeeId === employeeId)),
  },
  leaves: {
    list: () => delay(getData().leaves),
    forEmployee: (employeeId) => delay(getData().leaves.filter((l) => l.employeeId === employeeId)),
    create: (request) => {
      const leave = {
        id: `leave_${Date.now()}`,
        status: 'pending',
        appliedAt: new Date().toISOString(),
        ...request,
      };
      getData().leaves.unshift(leave);
      return delay(leave);
    },
  },
  payroll: {
    list: () => delay(getData().payroll),
    forEmployee: (employeeId) => delay(getData().payroll.filter((p) => p.employeeId === employeeId)),
  },
  assets: {
    list: async () => (await http.get('/assets')).data,
    create: async (values) => (await http.post('/admin/assets', values)).data,
    update: async (id, values) => (await http.put(`/admin/assets/${id}`, values)).data,
    remove: async (id) => http.delete(`/admin/assets/${id}`),
    mine: async () => (await http.get('/me/assets')).data,
    forEmployee: (employeeId) => delay(getData().assets.filter((a) => a.assignedToId === employeeId)),
    assign: async ({ assetId, employeeId }) => (await http.post(`/admin/assets/${assetId}/assign`, { employeeId })).data,
    returnAsset: async (assetId) => (await http.post(`/admin/assets/${assetId}/return`)).data,
  },
  projects: {
    list: () => delay(getData().projects),
    forEmployee: (employeeId) => delay(getData().projects.filter((p) => p.memberIds.includes(employeeId))),
  },
  tasks: {
    list: () => delay(getData().tasks),
    forEmployee: (employeeId) => delay(getData().tasks.filter((t) => t.assigneeId === employeeId)),
  },
  notifications: {
    list: () => delay(getData().notifications),
  },
  announcements: {
    list: () => delay(getData().announcements),
  },
  holidays: {
    list: () => delay(getData().holidays),
  },
  stats: {
    dashboard: async () => (await http.get('/dashboard/overview')).data,
    overview: () =>
      delay({
        totalEmployees: getData().employees.length,
        activeEmployees: getData().employees.filter((employee) => employee.status === 'active').length,
        onLeave: getData().employees.filter((e) => e.status === 'on-leave').length,
        pendingLeaves: getData().leaves.filter((l) => l.status === 'pending').length,
        totalDepartments: getData().departments.length,
        totalAssets: getData().assets.length,
        assignedAssets: getData().assets.filter((a) => a.status === 'assigned').length,
        monthlyPayroll: getData().payroll
          .filter((p) => p.month === '2025-06')
          .reduce((s, p) => s + p.netSalary, 0),
        activeProjects: getData().projects.filter((p) => p.status === 'active').length,
      }),
  },
};
