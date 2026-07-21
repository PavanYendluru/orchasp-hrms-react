/** Exposes a delayed in-memory API that mirrors the application's HR endpoints. */
import { db  } from '../data/db';
function delay(value, ms = 250) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function paginate(items, page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize;
  return { data: items.slice(start, start + pageSize), total: items.length, page, pageSize };
}

export const api = {
  employees: {
    list: (params = {}) => {
      let items = [...db.employees];
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
    all: () => delay(db.employees),
    get: (id) => delay(db.employees.find((e) => e.id === id) || null),
  },
  departments: {
    list: () => delay(db.departments),
    get: (id) => delay(db.departments.find((d) => d.id === id) || null),
  },
  attendance: {
    list: () => delay(db.attendance),
    forEmployee: (employeeId) => delay(db.attendance.filter((a) => a.employeeId === employeeId)),
  },
  leaves: {
    list: () => delay(db.leaves),
    forEmployee: (employeeId) => delay(db.leaves.filter((l) => l.employeeId === employeeId)),
  },
  payroll: {
    list: () => delay(db.payroll),
    forEmployee: (employeeId) => delay(db.payroll.filter((p) => p.employeeId === employeeId)),
  },
  assets: {
    list: () => delay(db.assets),
    forEmployee: (employeeId) => delay(db.assets.filter((a) => a.assignedToId === employeeId)),
  },
  projects: {
    list: () => delay(db.projects),
    forEmployee: (employeeId) => delay(db.projects.filter((p) => p.memberIds.includes(employeeId))),
  },
  tasks: {
    list: () => delay(db.tasks),
    forEmployee: (employeeId) => delay(db.tasks.filter((t) => t.assigneeId === employeeId)),
  },
  notifications: {
    list: () => delay(db.notifications),
  },
  announcements: {
    list: () => delay(db.announcements),
  },
  holidays: {
    list: () => delay(db.holidays),
  },
  stats: {
    overview: () =>
      delay({
        totalEmployees: db.employees.length,
        activeEmployees: db.employees.filter((employee) => employee.status === 'active').length,
        onLeave: db.employees.filter((e) => e.status === 'on-leave').length,
        pendingLeaves: db.leaves.filter((l) => l.status === 'pending').length,
        totalDepartments: db.departments.length,
        totalAssets: db.assets.length,
        assignedAssets: db.assets.filter((a) => a.status === 'assigned').length,
        monthlyPayroll: db.payroll
          .filter((p) => p.month === '2025-06')
          .reduce((s, p) => s + p.netSalary, 0),
        activeProjects: db.projects.filter((p) => p.status === 'active').length,
      }),
  },
};
