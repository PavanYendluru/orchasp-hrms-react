import { departments,
  jobTitles,
  locations,
  skillPool,
 } from '../constants/app';
const firstNames = [
  'Aarav', 'Sophia', 'Liam', 'Olivia', 'Noah', 'Emma', 'Ethan', 'Ava', 'Mason', 'Isabella',
  'Lucas', 'Mia', 'Aiden', 'Charlotte', 'Elijah', 'Amelia', 'James', 'Harper', 'Benjamin', 'Evelyn',
  'Henry', 'Abigail', 'Alexander', 'Emily', 'Sebastian', 'Ella', 'Jack', 'Scarlett', 'Daniel', 'Grace',
  'Matthew', 'Chloe', 'Samuel', 'Victoria', 'David', 'Riley', 'Joseph', 'Aria', 'Carter', 'Lily',
  'Owen', 'Aubrey', 'Wyatt', 'Penelope', 'John', 'Layla', 'Jack', 'Nora', 'Luke', 'Zoey',
];
const lastNames = [
  'Patel', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
];

const rand  = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
const id = (prefix, index) => `${prefix}_${String(index).padStart(3, '0')}`;

const employeeStatuses = ['active', 'active', 'active', 'on-leave', 'inactive'];
const employmentTypes = ['full-time', 'full-time', 'full-time', 'part-time', 'contract', 'intern'];

function dateBetween(start, end) {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().slice(0, 10);
}
function datetimeBetween(start, end) {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString();
}

export function generateDepartments(n = 10) {
  const colors = ['#2563eb', '#7c3aed', '#16a34a', '#ea580c', '#dc2626', '#0891b2', '#ca8a04', '#db2777', '#4f46e5', '#0d9488'];
  return departments.slice(0, n).map((name, i) => ({
    id: id('dept', i + 1),
    name,
    description: `${name} department — responsible for ${name.toLowerCase()} operations and strategy.`,
    color: colors[i % colors.length],
    budget: randInt(250_000, 2_500_000),
  }));
}

export function generateEmployees(n = 60, departmentRecords = generateDepartments()) {
  return Array.from({ length: n }, (_, i) => {
    const first = rand(firstNames);
    const last = rand(lastNames);
    const dept = rand(departmentRecords);
    return {
      id: id('emp', i + 1),
      firstName: first,
      lastName: last,
      email: `${first}.${last}${i + 1}@nexushrms.com`.toLowerCase(),
      phone: `+1-${randInt(200, 999)}-${randInt(100, 999)}-${randInt(1000, 9999)}`,
      jobTitle: rand(jobTitles),
      departmentId: dept.id,
      status: rand(employeeStatuses),
      employmentType: rand(employmentTypes),
      hireDate: dateBetween(new Date(2018, 0, 1), new Date(2025, 6, 1)),
      location: rand(locations),
      salary: randInt(45_000, 220_000),
      skills: pick(skillPool, randInt(3, 6)),
      performanceScore: randInt(60, 98),
    };
  });
}

export function generateAttendance(employees, days = 30) {
  const records = [];
  const statuses = ['present', 'present', 'present', 'late', 'remote', 'absent', 'half-day'];
  employees.slice(0, 40).forEach((emp, ei) => {
    for (let d = 0; d < days; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const status = rand(statuses);
      const checkIn = status === 'absent' ? undefined : `08:${randInt(45, 59).toString().padStart(2, '0')}`;
      const checkOut = status === 'absent' || status === 'half-day' ? undefined : `17:${randInt(0, 30).toString().padStart(2, '0')}`;
      records.push({
        id: `att_${ei}_${d}`,
        employeeId: emp.id,
        date: date.toISOString().slice(0, 10),
        checkIn,
        checkOut,
        status,
        workHours: status === 'present' ? 8 : status === 'half-day' ? 4 : status === 'absent' ? 0 : randInt(6, 9),
      });
    }
  });
  return records;
}

export function generateLeaves(employees, n = 60) {
  const types = ['annual', 'sick', 'personal', 'maternity', 'unpaid', 'remote'];
  const statuses = ['pending', 'approved', 'rejected', 'cancelled'];
  return Array.from({ length: n }, (_, i) => {
    const emp = rand(employees);
    const start = new Date();
    start.setDate(start.getDate() + randInt(-20, 30));
    const end = new Date(start);
    end.setDate(end.getDate() + randInt(1, 7));
    return {
      id: id('leave', i + 1),
      employeeId: emp.id,
      type: rand(types),
      status: rand(statuses),
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      reason: ['Family event', 'Medical appointment', 'Vacation', 'Personal work', 'Relocation', 'Conference'][randInt(0, 5)],
      appliedAt: datetimeBetween(new Date(2025, 0, 1), new Date()),
    };
  });
}

export function generatePayroll(employees) {
  const months = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'];
  const statuses = ['pending', 'processed', 'paid'];
  const records = [];
  employees.forEach((emp) => {
    months.forEach((month, mi) => {
      const bonus = Math.random() > 0.7 ? randInt(500, 3000) : 0;
      const deductions = randInt(200, 800);
      records.push({
        id: `pay_${emp.id}_${month}`,
        employeeId: emp.id,
        month,
        baseSalary: emp.salary,
        bonus,
        deductions,
        netSalary: emp.salary + bonus - deductions,
        status: mi === months.length - 1 ? 'pending' : rand(statuses.slice(1)),
      });
    });
  });
  return records;
}

export function generateAssets(n = 60) {
  const categories = ['Laptop', 'Monitor', 'Phone', 'Tablet', 'Headset', 'Keyboard', 'Mouse', 'Desk', 'Chair'];
  const statuses = ['assigned', 'available', 'damaged', 'returned'];
  return Array.from({ length: n }, (_, i) => ({
    id: id('asset', i + 1),
    name: `${rand(categories)} ${randInt(2022, 2025)}`,
    category: rand(categories),
    serial: `SN-${randInt(10000, 99999)}`,
    status: rand(statuses),
    assignedDate: dateBetween(new Date(2023, 0, 1), new Date()),
    value: randInt(150, 3500),
  }));
}

export function generateProjects(employees, n = 12) {
  const statuses = ['planning', 'active', 'on-hold', 'completed', 'cancelled'];
  const names = ['Atlas Migration', 'Phoenix Launch', 'Quantum Analytics', 'Orion Mobile', 'Nebula CRM', 'Pulsar Payroll', 'Vortex Auth', 'Helios Dashboard', 'Cosmos API', 'Stellar Reports', 'Galaxy Chat', 'Meteor Search'];
  return Array.from({ length: n }, (_, i) => {
    const lead = rand(employees);
    return {
      id: id('proj', i + 1),
      name: names[i % names.length],
      description: `Cross-functional initiative to deliver ${names[i % names.length].toLowerCase()} capabilities across the platform.`,
      status: rand(statuses),
      startDate: dateBetween(new Date(2024, 0, 1), new Date(2025, 6, 1)),
      endDate: Math.random() > 0.5 ? dateBetween(new Date(2025, 6, 1), new Date(2026, 0, 1)) : undefined,
      leadId: lead.id,
      memberIds: pick(employees, randInt(3, 7)).map((e) => e.id),
      progress: randInt(10, 95),
      budget: randInt(50_000, 500_000),
    };
  });
}

export function generateTasks(employees, projects, n = 50) {
  const statuses = ['todo', 'in-progress', 'review', 'done'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const titles = ['Implement auth flow', 'Fix pagination bug', 'Design onboarding', 'Write API docs', 'Refactor hooks', 'Set up CI', 'Migrate database', 'Optimize bundle', 'Add dark mode', 'Build export feature', 'Review PR', 'Update deps'];
  return Array.from({ length: n }, (_, i) => ({
    id: id('task', i + 1),
    title: `${rand(titles)} — ${randInt(1, 99)}`,
    description: 'Detailed task description with acceptance criteria and context for the assignee.',
    status: rand(statuses),
    priority: rand(priorities),
    assigneeId: rand(employees).id,
    projectId: rand(projects).id,
    dueDate: dateBetween(new Date(2025, 6, 1), new Date(2025, 11, 31)),
  }));
}

export function generateNotifications(n = 20) {
  const types = ['info', 'success', 'warning', 'error'];
  const titles = ['New leave request', 'Payroll processed', 'Asset returned', 'Task assigned', 'Performance review due', 'Birthday reminder', 'System update', 'Meeting scheduled'];
  return Array.from({ length: n }, (_, i) => ({
    id: id('notif', i + 1),
    type: rand(types),
    title: rand(titles),
    message: 'You have a new item that requires your attention. Tap to view details.',
    read: Math.random() > 0.5,
    createdAt: datetimeBetween(new Date(2025, 6, 10), new Date()),
  }));
}

export function generateAnnouncements(n = 6) {
  const titles = ['Q3 All-Hands Meeting', 'New Wellness Program', 'Office Renovation Update', 'Policy Handbook v3', 'Holiday Party Save-the-Date', 'Engineering Roadmap'];
  return Array.from({ length: n }, (_, i) => ({
    id: id('ann', i + 1),
    title: titles[i % titles.length],
    body: 'Please review the full announcement on the company portal. Key dates and action items are included for your reference.',
    author: 'HR Team',
    createdAt: datetimeBetween(new Date(2025, 6, 1), new Date()),
  }));
}

export function generateHolidays(n = 8) {
  const names = ['New Year\'s Day', 'Memorial Day', 'Independence Day', 'Labor Day', 'Thanksgiving', 'Christmas Day', 'Company Retreat', 'Foundation Day'];
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(2025, randInt(0, 11), randInt(1, 28));
    return {
      id: id('hol', i + 1),
      name: names[i % names.length],
      date: d.toISOString().slice(0, 10),
      type: i % 3 === 0 ? 'company' : 'public',
    };
  });
}
