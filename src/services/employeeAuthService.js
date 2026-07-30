import { http } from './http';
const SESSION_KEY = 'orchasp-employee-session';
/** Handles the employee JWT session; passwords are never stored in the browser. */
export const employeeAuthService = {
  async login({ employeeId, password }) { const { data } = await http.post('/auth/employee/login', { employeeId, password }); const session = { employee: data.user, token: data.token }; sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); sessionStorage.setItem('orchasp-token', data.token); return session; },
  getSession() { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } },
  logout() { sessionStorage.removeItem(SESSION_KEY); sessionStorage.removeItem('orchasp-token'); },
};
