/** Owns the mock authenticated user and login/logout session actions. */
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const demoUser = {
  id: 'usr_001',
  name: 'Alex Morgan',
  email: 'alex.morgan@orchasphrms.com',
  role: 'admin',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    sessionStorage.getItem('orchasp-user') ? demoUser : null
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        login: (email) => {
          setUser({ ...demoUser, email });
          sessionStorage.setItem('orchasp-user', '1');
        },
        logout: () => {
          setUser(null);
          sessionStorage.removeItem('orchasp-user');
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
