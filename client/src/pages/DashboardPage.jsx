import { Activity, CircleDollarSign, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { http } from '../api/http.js';

const cards = [{ label: 'Customers', icon: Users }, { label: 'Revenue', icon: CircleDollarSign }, { label: 'Health score', icon: Activity }];
export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['dashboard'], queryFn: () => http.get('/dashboard').then((response) => response.data) });
  const values = [data?.metrics?.customers, data?.metrics?.revenue, data?.metrics?.healthScore];
  return <><div><p className="text-sm font-medium text-blue-700">Executive dashboard</p><h2 className="mt-1 text-3xl font-bold">Business operations at a glance</h2><p className="mt-2 text-slate-600">{isError ? 'Dashboard data is temporarily unavailable.' : 'Live customer, revenue, and support metrics.'}</p></div><div className="mt-8 grid gap-5 md:grid-cols-3">{cards.map(({ label, icon: Icon }, index) => <article key={label} className="rounded-xl bg-white p-5 shadow-sm"><Icon className="text-blue-600" size={22} /><p className="mt-5 text-sm text-slate-500">{label}</p><p className="mt-1 text-3xl font-semibold">{isLoading ? '…' : index === 1 ? Number(values[index] || 0).toLocaleString() : values[index] ?? 0}</p></article>)}</div>{data?.health ? <div className="mt-6 rounded-xl bg-white p-5 shadow-sm"><h3 className="font-semibold">Business health drivers</h3><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{Object.entries(data.health.factors).map(([key, value]) => <div key={key} className="rounded-lg border p-3"><p className="text-sm capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</p><p className="mt-1 font-semibold">{value}</p></div>)}</div></div> : null}</>;
}
