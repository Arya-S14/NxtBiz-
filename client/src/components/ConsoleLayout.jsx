import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Bell, Bot, CircleDollarSign, FileText, LayoutDashboard, LogOut, Mail, Moon, Settings, Ticket, Users, Workflow } from 'lucide-react';
import { useAuthStore } from '../features/auth/auth.store.js';
import { http } from '../api/http.js';

const links = [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }, { to: '/users', label: 'Users', icon: Users }, { to: '/customers', label: 'Customers', icon: Users }, { to: '/emails', label: 'Emails', icon: Mail }, { to: '/meetings', label: 'Meetings', icon: Users }, { to: '/invoices', label: 'Invoices', icon: CircleDollarSign }, { to: '/tickets', label: 'Tickets', icon: Ticket }, { to: '/reports', label: 'Reports', icon: FileText }, { to: '/crm', label: 'CRM timeline', icon: FileText }, { to: '/memory', label: 'Memory', icon: FileText }, { to: '/workflows', label: 'Workflows', icon: Workflow }, { to: '/ai-control', label: 'AI control', icon: Bot }, { to: '/settings', label: 'Settings', icon: Settings }];
export default function ConsoleLayout() {
  const { user, logout } = useAuthStore(); const navigate = useNavigate(); const queryClient = useQueryClient(); const [darkMode, setDarkMode] = useState(false);
  const { data: notifications = [] } = useQuery({ queryKey: ['notifications'], queryFn: () => http.get('/notifications').then((response) => response.data.notifications) });
  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);
  useEffect(() => { const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000', { withCredentials: true }); const events = ['new_email', 'new_ticket', 'invoice_created', 'meeting_created', 'agent_completed', 'workflow_executed']; events.forEach((event) => socket.on(event, () => { toast.success(event.replaceAll('_', ' ')); queryClient.invalidateQueries(); })); return () => socket.disconnect(); }, [queryClient]);
  async function signOut() { await logout(); navigate('/login'); }
  async function openNotifications() {
    if (!notifications.length) return;
    const firstUnread = notifications.find((item) => !item.read);
    if (!firstUnread) return;
    const targetPath = firstUnread.metadata?.targetPath || (firstUnread.metadata?.entityType === 'invoice' ? '/invoices' : firstUnread.metadata?.entityType === 'meeting' ? '/meetings' : firstUnread.metadata?.entityType === 'email' ? '/emails' : '/');
    navigate(targetPath);
    try { await http.put(`/notifications/${firstUnread._id}`); queryClient.invalidateQueries({ queryKey: ['notifications'] }); } catch { }
  }
  return <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}><aside className={`fixed inset-y-0 w-64 overflow-y-auto ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-950 text-slate-100'} p-5`}><h1 className="text-2xl font-bold">NxtBiz</h1><p className="mt-1 text-sm text-slate-400">Operations Console</p><nav className="mt-8 space-y-1 pb-28">{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 ${isActive ? 'bg-blue-600' : darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-800'}`}><Icon size={18} />{label}</NavLink>)}</nav><div className="fixed bottom-5 left-5 w-[216px] border-t border-slate-800 pt-4"><p className="font-medium">{user.name}</p><p className="text-sm text-slate-400">{user.role}</p><button onClick={signOut} className="mt-4 flex items-center gap-2 text-sm text-slate-300 hover:text-white"><LogOut size={16} />Log out</button></div></aside><main className="ml-64"><header className={`flex items-center justify-end gap-4 border-b px-8 py-4 ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}><div className="mr-auto text-sm text-slate-500">{unreadCount > 0 ? `${unreadCount} unread alerts` : 'All systems healthy'}</div><button aria-label="Notifications" className="relative" onClick={openNotifications}><Bell size={20} />{unreadCount > 0 ? <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">{unreadCount}</span> : null}</button><button aria-label="Dark-mode preferences" onClick={() => setDarkMode((value) => !value)} title="Toggle console theme"><Moon size={20} /></button></header><section className="p-8"><Outlet /></section></main></div>;
}
