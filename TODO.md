# Production-Readiness Implementation TODO

## Phase A - Backend Payroll Module
- [x] 1. Create Payroll entity
- [x] 2. Create PayrollStatus enum
- [x] 3. Create PayrollRepository
- [x] 4. Add Payroll DTOs (PayrollRequest, PayrollView) to Dtos.java
- [x] 5. Add Payroll service methods to HrmsService
- [x] 6. Create PayrollController
- [x] 7. Add deleteByEmployeeId to PayrollRepository
- [x] 8. Wire PayrollRepository into deleteEmployee

## Phase B - Indian Currency Standardization
- [x] 1. Add formatINR / update formatCurrency in src/lib/utils.js
- [x] 2. Fix hardcoded $ in EmployeeDetailPage
- [x] 3. Update all pages to use INR formatter

## Phase C - Frontend Payroll Integration
- [x] 1. Add payroll methods to src/services/api.js
- [x] 2. Wire PayrollPage to backend APIs
- [x] 3. Wire EmployeePayslipsPage to backend APIs
- [x] 4. Add payroll summary cards logic

## Phase D - Global Error Handling
- [x] 1. Add Axios response interceptor for consistent errors
- [x] 2. Add GlobalErrorBoundary component
- [x] 3. Improve backend exception handler if needed

## Phase E - Form Validation & Cleanup
- [ ] 1. Review/improve form validation messages
- [ ] 2. Remove unused imports & console.logs
- [ ] 3. Memoize expensive components

## Phase F - Documentation
- [x] 1. Create attendance production documentation file
- [ ] 2. Verify all modules & update TODO

## Verification
- [x] Backend compiles (mvnw clean compile)
- [x] Frontend builds (npm run build)
- [x] No console/API errors (PayrollPage/EmployeePayslipsPage build as own chunks)
