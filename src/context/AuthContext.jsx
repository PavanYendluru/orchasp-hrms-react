import { createContext, useContext, useState } from 'react';
import { http } from '../services/http';

const AuthContext = createContext(null);
const loadUser = () => JSON.parse(localStorage.getItem('orchasp-user') || sessionStorage.getItem('orchasp-user') || 'null');

/** Owns the HR/Admin JWT session. */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);
  const login = async ({ email, password, rememberMe }) => {
    const { data } = await http.post('/auth/login', { email, password });
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('orchasp-token', data.token);
    storage.setItem('orchasp-user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };
  const logout = () => { localStorage.removeItem('orchasp-token'); localStorage.removeItem('orchasp-user'); sessionStorage.removeItem('orchasp-token'); sessionStorage.removeItem('orchasp-user'); setUser(null); };
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used within AuthProvider'); return context; }
