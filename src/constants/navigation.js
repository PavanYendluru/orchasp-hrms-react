import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
export { appName, appTagline } from './app';

export const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: DashboardOutlinedIcon, group: 'main' },
  { label: 'Employees', path: '/employees', icon: PeopleAltOutlinedIcon, group: 'main' },
  { label: 'Departments', path: '/departments', icon: CorporateFareOutlinedIcon, group: 'main' },
  { label: 'Attendance', path: '/attendance', icon: HowToRegOutlinedIcon, group: 'main' },
  { label: 'Leave Management', path: '/leave', icon: EventAvailableOutlinedIcon, group: 'main' },
  { label: 'Payroll', path: '/payroll', icon: PaymentsOutlinedIcon, group: 'hr' },
  { label: 'Assets', path: '/assets', icon: Inventory2OutlinedIcon, group: 'hr' },
  { label: 'Projects', path: '/projects', icon: FolderOutlinedIcon, group: 'hr' },
  { label: 'Tasks', path: '/tasks', icon: TaskAltOutlinedIcon, group: 'hr' },
  { label: 'Performance', path: '/performance', icon: TrendingUpOutlinedIcon, group: 'hr' },
  { label: 'Recruitment', path: '/recruitment', icon: PersonAddAltOutlinedIcon, group: 'hr' },
  { label: 'Reports', path: '/reports', icon: AssessmentOutlinedIcon, group: 'insights' },
  { label: 'Analytics', path: '/analytics', icon: InsightsOutlinedIcon, group: 'insights' },
  { label: 'Settings', path: '/settings', icon: SettingsOutlinedIcon, group: 'account' },
  { label: 'Profile', path: '/profile', icon: PersonOutlinedIcon, group: 'account' },
];

export const logoutItem = { label: 'Logout', path: '/login', icon: LogoutOutlinedIcon };

export const navGroups = [
  { id: 'main', label: 'Workspace' },
  { id: 'hr', label: 'Human Resources' },
  { id: 'insights', label: 'Insights' },
  { id: 'account', label: 'Account' },
];

export const departments = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
  'Customer Success',
  'Legal',
];

export const jobTitles = [
  'Software Engineer',
  'Senior Software Engineer',
  'Engineering Manager',
  'Product Manager',
  'Product Designer',
  'UX Researcher',
  'Marketing Lead',
  'Account Executive',
  'HR Business Partner',
  'Financial Analyst',
  'Operations Manager',
  'Customer Success Manager',
  'Legal Counsel',
  'Data Scientist',
  'DevOps Engineer',
];

export const locations = [
  'San Francisco, US',
  'New York, US',
  'London, UK',
  'Berlin, DE',
  'Toronto, CA',
  'Singapore, SG',
  'Sydney, AU',
  'Bengaluru, IN',
  'Tokyo, JP',
  'Remote',
];

export const skillPool = [
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'Go',
  'AWS',
  'Kubernetes',
  'PostgreSQL',
  'GraphQL',
  'Figma',
  'Product Strategy',
  'SEO',
  'Salesforce',
  'Analytics',
  'Leadership',
  'Negotiation',
  'Figma',
  'Tailwind CSS',
  'Machine Learning',
  'Docker',
];
