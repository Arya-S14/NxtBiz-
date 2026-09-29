import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { http } from '../api/http.js';

export default function CustomerDetailPage() {
  const { id } = useParams(); const { data, isLoading, isError } = useQuery({ queryKey: ['customer', id], queryFn: () => http.get(`/customers/${id}`).then((response) => response.data) });
  if (isLoading) return <p>Loading customer…</p>; if (isError) return <p className="text-red-700">Unable to load this customer.</p>;
  const { customer, activities, meetings, invoices, tickets } = data;
  const blocks = [{ title: 'CRM activity', items: activities, text: (item) => item.title }, { title: 'Meetings', items: meetings, text: (item) => `${item.title} · ${item.status}` }, { title: 'Invoices', items: invoices, text: (item) => `${item.amount} · ${item.status}` }, { title: 'Tickets', items: tickets, text: (item) => `${item.issue} · ${item.status}` }];
  return <div><Link className="text-sm text-blue-700" to="/customers">← Customers</Link><div className="mt-4 rounded-xl bg-white p-6 shadow-sm"><p className="text-sm font-medium text-blue-700">Customer 360</p><h2 className="mt-1 text-3xl font-bold">{customer.name}</h2><p className="mt-2 text-slate-600">{customer.company || 'Independent customer'} · {customer.email}</p><div className="mt-5 flex flex-wrap gap-2">{customer.tags?.map((tag) => <span className="rounded-full bg-slate-100 px-3 py-1 text-sm" key={tag}>{tag}</span>)}<span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">Health score: {customer.healthScore}</span></div></div><div className="mt-6 grid gap-5 md:grid-cols-2">{blocks.map((block) => <section className="rounded-xl bg-white p-5 shadow-sm" key={block.title}><h3 className="font-semibold">{block.title}</h3><ul className="mt-3 divide-y">{block.items.length ? block.items.slice(0, 5).map((item) => <li className="py-2 text-sm" key={item._id}>{block.text(item)}</li>) : <li className="py-2 text-sm text-slate-500">No records yet.</li>}</ul></section>)}</div></div>;
}
