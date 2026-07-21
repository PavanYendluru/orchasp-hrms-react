/** Composes global providers, routes, and toast notifications for the application. */
import { ThemeProvider  } from './context/ThemeContext';
import { AuthProvider  } from './context/AuthContext';
import { AppRoutes  } from './routes/AppRoutes';
import { Toaster  } from 'sonner';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </ThemeProvider>
  );
}
