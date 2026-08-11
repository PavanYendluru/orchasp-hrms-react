/** Declares lazy-loaded routes and the authenticated application shell. */
import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layouts/AppShell';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { PageLoader } from '../components/ui/Spinner';
import { EmployeeProtectedRoute } from './EmployeeProtectedRoute';
import { EmployeeAppShell } from '../components/layouts/EmployeeAppShell';
import { ProtectedRoute } from './ProtectedRoute';

const DashboardPage = lazy(() => import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const EmployeesPage = lazy(() => import('../pages/EmployeesPage').then((m) => ({ default: m.EmployeesPage })));
const EmployeeDetailPage = lazy(() => import('../pages/EmployeeDetailPage').then((m) => ({ default: m.EmployeeDetailPage })));
const DepartmentsPage = lazy(() => import('../pages/DepartmentsPage').then((m) => ({ default: m.DepartmentsPage })));
const AttendancePage = lazy(() => import('../pages/AttendancePage').then((m) => ({ default: m.AttendancePage })));
const LeavePage = lazy(() => import('../pages/LeavePage').then((m) => ({ default: m.LeavePage })));
const PayrollPage = lazy(() => import('../pages/PayrollPage').then((m) => ({ default: m.PayrollPage })));
const AssetsPage = lazy(() => import('../pages/AssetsPage').then((m) => ({ default: m.AssetsPage })));
const ProjectsPage = lazy(() => import('../pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const TasksPage = lazy(() => import('../pages/TasksPage').then((m) => ({ default: m.TasksPage })));
const PerformancePage = lazy(() => import('../pages/PerformancePage').then((m) => ({ default: m.PerformancePage })));
const RecruitmentPage = lazy(() => import('../pages/RecruitmentPage').then((m) => ({ default: m.RecruitmentPage })));
const ReportsPage = lazy(() => import('../pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const SettingsPage = lazy(() => import('../pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const ProfilePage = lazy(() => import('../pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const RecentActivityPage = lazy(() => import('../pages/RecentActivityPage').then((m) => ({ default: m.RecentActivityPage })));
const LoginPage = lazy(() => import('../pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const OtpPage = lazy(() => import('../pages/auth/OtpPage').then((m) => ({ default: m.OtpPage })));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const EmployeeLoginPage = lazy(() => import('../pages/employee/EmployeeLoginPage').then((m) => ({ default: m.EmployeeLoginPage })));
const EmployeeDashboardPage = lazy(() => import('../pages/employee/EmployeeDashboardPage').then((m) => ({ default: m.EmployeeDashboardPage })));
const EmployeeProfilePage = lazy(() => import('../pages/employee/EmployeeProfilePage').then((m) => ({ default: m.EmployeeProfilePage })));
const EmployeeLeavePage = lazy(() => import('../pages/employee/EmployeeLeavePage').then((m) => ({ default: m.EmployeeLeavePage })));
const EmployeePayslipsPage = lazy(() => import('../pages/employee/EmployeePayslipsPage').then((m) => ({ default: m.EmployeePayslipsPage })));
const EmployeeAssetsPage = lazy(() => import('../pages/employee/EmployeeAssetsPage').then((m) => ({ default: m.EmployeeAssetsPage })));
const EmployeeTasksPage = lazy(() => import('../pages/employee/EmployeeTasksPage').then((m) => ({ default: m.EmployeeTasksPage })));
const EmployeeProjectsPage = lazy(() => import('../pages/employee/EmployeeProjectsPage').then((m) => ({ default: m.EmployeeProjectsPage })));
const EmployeePerformancePage = lazy(() => import('../pages/employee/EmployeePerformancePage').then((m) => ({ default: m.EmployeePerformancePage })));

export function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
        <Route path="/forgot-password" element={<Suspense fallback={<PageLoader />}><ForgotPasswordPage /></Suspense>} />
        <Route path="/otp" element={<Suspense fallback={<PageLoader />}><OtpPage /></Suspense>} />
        <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPasswordPage /></Suspense>} />
        <Route path="/employee/login" element={<Suspense fallback={<PageLoader />}><EmployeeLoginPage /></Suspense>} />

        <Route element={<EmployeeProtectedRoute />}>
          <Route element={<EmployeeAppShell />}>
            <Route path="/employee/dashboard" element={<Suspense fallback={<PageLoader />}><EmployeeDashboardPage /></Suspense>} />
            <Route path="/employee/profile" element={<Suspense fallback={<PageLoader />}><EmployeeProfilePage /></Suspense>} />
            <Route path="/employee/leave" element={<Suspense fallback={<PageLoader />}><EmployeeLeavePage /></Suspense>} />
            <Route path="/employee/payslips" element={<Suspense fallback={<PageLoader />}><EmployeePayslipsPage /></Suspense>} />
            <Route path="/employee/assets" element={<Suspense fallback={<PageLoader />}><EmployeeAssetsPage /></Suspense>} />
            <Route path="/employee/tasks" element={<Suspense fallback={<PageLoader />}><EmployeeTasksPage /></Suspense>} />
            <Route path="/employee/projects" element={<Suspense fallback={<PageLoader />}><EmployeeProjectsPage /></Suspense>} />
            <Route path="/employee/performance" element={<Suspense fallback={<PageLoader />}><EmployeePerformancePage /></Suspense>} />
          </Route>
        </Route>

        {/* All HR pages require a live HR session. */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ErrorBoundary><AppShell /></ErrorBoundary>}>
          <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
          <Route path="/employees" element={<Suspense fallback={<PageLoader />}><EmployeesPage /></Suspense>} />
          <Route path="/employees/:id" element={<Suspense fallback={<PageLoader />}><EmployeeDetailPage /></Suspense>} />
          <Route path="/departments" element={<Suspense fallback={<PageLoader />}><DepartmentsPage /></Suspense>} />
          <Route path="/attendance" element={<Suspense fallback={<PageLoader />}><AttendancePage /></Suspense>} />
          <Route path="/leave" element={<Suspense fallback={<PageLoader />}><LeavePage /></Suspense>} />
          <Route path="/payroll" element={<Suspense fallback={<PageLoader />}><PayrollPage /></Suspense>} />
          <Route path="/assets" element={<Suspense fallback={<PageLoader />}><AssetsPage /></Suspense>} />
          <Route path="/projects" element={<Suspense fallback={<PageLoader />}><ProjectsPage /></Suspense>} />
          <Route path="/tasks" element={<Suspense fallback={<PageLoader />}><TasksPage /></Suspense>} />
          <Route path="/performance" element={<Suspense fallback={<PageLoader />}><PerformancePage /></Suspense>} />
          <Route path="/recruitment" element={<Suspense fallback={<PageLoader />}><RecruitmentPage /></Suspense>} />
          <Route path="/reports" element={<Suspense fallback={<PageLoader />}><ReportsPage /></Suspense>} />
          <Route path="/analytics" element={<Suspense fallback={<PageLoader />}><AnalyticsPage /></Suspense>} />
          <Route path="/settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
          <Route path="/profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
          <Route path="/activities" element={<Suspense fallback={<PageLoader />}><RecentActivityPage /></Suspense>} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
}
