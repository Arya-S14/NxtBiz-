import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ConsoleLayout from './components/ConsoleLayout.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CustomersPage from './pages/CustomersPage.jsx';
import OperationsPage from './pages/OperationsPage.jsx';
import CustomerDetailPage from './pages/CustomerDetailPage.jsx';
import EmailsPage from './pages/EmailsPage.jsx';
import AgentsPage from './pages/AgentsPage.jsx';
import WorkflowsPage from './pages/WorkflowsPage.jsx';
import RuntimeSettingsPage from './pages/RuntimeSettingsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import MemoryPage from './pages/MemoryPage.jsx';

export default function App() {
  return <Routes><Route path="/login" element={<AuthPage mode="login" />} /><Route path="/register" element={<AuthPage mode="register" />} /><Route element={<ProtectedRoute />}><Route element={<ConsoleLayout />}><Route index element={<DashboardPage />} /><Route path="users" element={<UsersPage />} /><Route path="customers" element={<CustomersPage />} /><Route path="customers/:id" element={<CustomerDetailPage />} /><Route path="emails" element={<EmailsPage />} /><Route path="meetings" element={<OperationsPage kind="meetings" />} /><Route path="invoices" element={<OperationsPage kind="invoices" />} /><Route path="tickets" element={<OperationsPage kind="tickets" />} /><Route path="reports" element={<OperationsPage kind="reports" />} /><Route path="crm" element={<OperationsPage kind="crm" />} /><Route path="workflows" element={<WorkflowsPage />} /><Route path="ai-control" element={<AgentsPage />} /><Route path="settings" element={<RuntimeSettingsPage />} /><Route path="memory" element={<MemoryPage />} /></Route></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes>;
}
