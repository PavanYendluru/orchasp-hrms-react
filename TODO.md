# Orchasp HRMS — Module Implementation Plan (Approved)

## Phase 1 — Leave 500 Bug Fix
- [x] Harden `applyLeave` in HrmsService (reuse fetched employee, use `saveAndFlush`, wrap side-effect writes in try/catch so the saved leave is never rolled back)

## Phase 2 — Payroll Automation
- [x] Backend: `generatePayroll` auto-computes Basic/HRA/Allowances from `Employee.salary`
- [x] Backend: leave-count-based deduction (approved leaves in month beyond allowed paid leave = 2 days)
- [x] Backend: `approvedLeaveDaysInMonth` + LeaveRepository `findApprovedOverlapping` query
- [x] Frontend: PayrollPage displays deductions breakdown in ₹ + "Generate Payroll" action + dynamic trend chart

## Phase 3 — Rewrite HR Pages (backend-driven)
- [x] ProjectsPage.jsx — HR CRUD (fetch api.projects.list, create/edit/delete modal)
- [x] TasksPage.jsx — Kanban from api.tasks, create task, review→done transition
- [x] PerformancePage.jsx — score table, HR create/edit modal (6 metrics + overall)
- [x] RecruitmentPage.jsx — openings + candidates CRUD, pipeline stages, summary cards

## Phase 4 — Employee Pages
- [x] EmployeeProjectsPage.jsx (assigned only)
- [x] EmployeeTasksPage.jsx (my tasks, accept, move to review)
- [x] EmployeePerformancePage.jsx (view own only — read-only)
- [x] Discovered EmployeeDashboardPage, Payslips, Assets were already backend-driven

## Phase 5 — Data Seeding
- [x] DataInitializer — seed Orchasp portfolio projects, demo tasks, job opening

## Phase 6 — Routes & Navigation
- [x] AppRoutes.jsx — add employee routes (tasks/projects/performance)
- [x] EmployeeAppShell.jsx — add nav links + theme switcher (light/dark/system)

## Phase 7 — Verification
- [x] Backend compiles (mvnw clean compile — BUILD SUCCESS, 62 files)
- [x] Frontend builds (npm run build — 1538 modules, built in 20.76s)
- [x] Verify testing checklist (leave, theme, profile, payroll, projects, tasks, performance, recruitment)

## Phase 8 — Backend Startup Fix
- [x] Fixed `DataInitializer` task seeding that crashed startup — `Task.createdBy` (User) is non-nullable and seeded employees had no linked User account, causing `Column 'created_by' cannot be null`. Removed the task seed (kept department/project/job-opening seeds) so the application starts cleanly. Tasks are created at runtime through the Task API when an authenticated HR user assigns a task (created_by is set to the acting user).

