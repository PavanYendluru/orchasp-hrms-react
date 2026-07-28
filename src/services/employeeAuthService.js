/** Provides a separate, prototype-only employee session over the local HR data. */
import { hrmsStore } from './hrmsStore';

const SESSION_KEY = 'orchasp-employee-session';
const PASSWORDS_KEY = 'orchasp-employee-passwords';
export const INITIAL_EMPLOYEE_PASSWORD = 'Employee@123';

function employeeCode(employee) {
  return `EMP-${String(employee.id).replace(/\D/g, '').padStart(3, '0')}`;
}

function publicEmployee(employee) {
  return {
    ...employee,
    employeeId: employeeCode(employee),
    name: `${employee.firstName} ${employee.lastName}`,
  };
}

function passwordFor(employee) {
  const passwords = JSON.parse(localStorage.getItem(PASSWORDS_KEY) || '{}');
  return passwords[employee.id] || INITIAL_EMPLOYEE_PASSWORD;
}

export const employeeAuthService = {
  login({ employeeId, password }) {
    const normalizedId = employeeId.trim().toUpperCase();
    const employee = hrmsStore.getSnapshot().employees.find((item) =>
      employeeCode(item) === normalizedId || item.id.toUpperCase() === normalizedId
    );

    if (!employee || employee.status !== 'active' || password !== passwordFor(employee)) {
      throw new Error('Invalid employee ID or password.');
    }

    const session = { employee: publicEmployee(employee) };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  changePassword(employeeId, password) {
    const passwords = JSON.parse(localStorage.getItem(PASSWORDS_KEY) || '{}');
    passwords[employeeId] = password;
    localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
  },
};
