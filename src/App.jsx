/** Composes global providers, routes, and toast notifications for the application. */
import { ThemeProvider  } from './context/ThemeContext';
import { AuthProvider  } from './context/AuthContext';
import { EmployeeAuthProvider } from './context/EmployeeAuthContext';
import { AppRoutes  } from './routes/AppRoutes';
import { Toaster  } from 'sonner';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EmployeeAuthProvider>
          <AppRoutes />
          <Toaster position="top-right" richColors closeButton />
        </EmployeeAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
