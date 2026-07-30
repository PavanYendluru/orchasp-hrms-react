import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { employeeAuthService } from '../services/employeeAuthService';

const EmployeeAuthContext = createContext(null);

export function EmployeeAuthProvider({ children }) {
  const [session, setSession] = useState(() => employeeAuthService.getSession());
  const login = useCallback(async (credentials) => {
    const nextSession = await employeeAuthService.login(credentials);
    setSession(nextSession);
    return nextSession;
  }, []);
  const logout = useCallback(() => {
    employeeAuthService.logout();
    setSession(null);
  }, []);
  const value = useMemo(() => ({
    employee: session?.employee || null,
    isAuthenticated: Boolean(session?.employee),
    login,
    logout,
  }), [session, login, logout]);

  return <EmployeeAuthContext.Provider value={value}>{children}</EmployeeAuthContext.Provider>;
}

export function useEmployeeAuth() {
  const context = useContext(EmployeeAuthContext);
  if (!context) throw new Error('useEmployeeAuth must be used within EmployeeAuthProvider');
  return context;
}
