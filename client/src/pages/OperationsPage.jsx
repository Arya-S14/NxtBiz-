import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { http } from '../api/http.js';

const configs = {
  crm: { title: 'CRM timeline', key: 'activities', list: '/crm', create: '/crm/note', initial: { customerId: '', title: '', body: '' }, fields: [['customerId', 'Customer ID', 'text'], ['title', 'Title', 'text'], ['body', 'Note', 'textarea']], columns: (item) => [item.customerId?.name || item.customerId, item.type, item.title, item.createdBy?.name || '—'] },
  meetings: { title: 'Meetings', key: 'meetings', list: '/meetings', create: '/meetings', initial: { title: '', customerId: '', startTime: '', endTime: '', attendees: '' }, fields: [['title', 'Title', 'text'], ['customerId', 'Customer ID', 'text'], ['startTime', 'Start', 'datetime-local'], ['endTime', 'End', 'datetime-local'], ['attendees', 'Attendees (comma-separated)', 'text']], columns: (item) => [item.title, item.customerId?.name || item.customerId, new Date(item.startTime).toLocaleString(), item.status] },
  tickets: { title: 'Support tickets', key: 'tickets', list: '/tickets', create: '/tickets', initial: { customerId: '', issue: '', priority: 'medium' }, fields: [['customerId', 'Customer ID', 'text'], ['issue', 'Issue', 'textarea'], ['priority', 'Priority', 'select']], columns: (item) => [item.issue, item.customerId?.name || item.customerId, item.priority, item.status] },
  invoices: { title: 'Invoices', key: 'invoices', list: '/invoices', create: '/invoices', initial: { customerId: '', amount: '', dueDate: '' }, fields: [['customerId', 'Customer ID', 'text'], ['amount', 'Amount', 'number'], ['dueDate', 'Due date', 'date']], columns: (item) => [item.customerId?.name || item.customerId, Number(item.amount).toLocaleString(), new Date(item.dueDate).toLocaleDateString(), item.status] },
  reports: { title: 'Reports', key: 'reports', list: '/reports', create: '/reports/generate', initial: { type: 'weekly', title: '' }, fields: [['type', 'Type', 'select'], ['title', 'Title (optional)', 'text']], columns: (item) => [item.title, item.type, new Date(item.createdAt).toLocaleDateString(), item.pdfUrl ? 'PDF ready' : 'Data ready'] }
};

function serialize(kind, values) {
  if (kind === 'meetings') return { ...values, attendees: values.attendees.split(',').map((name) => name.trim()).filter(Boolean) };
  if (kind === 'invoices') return { ...values, amount: Number(values.amount) };
  return values;
}

function Field({ field, value, onChange }) {
  const [name, label, type] = field;
  if (type === 'textarea') return <label className="block text-sm font-medium">{label}<textarea required={name !== 'body'} className="mt-1 min-h-20 w-full rounded border p-2" value={value} onChange={(event) => onChange(name, event.target.value)} /></label>;
  if (type === 'select') return <label className="block text-sm font-medium">{label}<select className="mt-1 w-full rounded border p-2" value={value} onChange={(event) => onChange(name, event.target.value)}>{(name === 'priority' ? ['low', 'medium', 'high', 'critical'] : ['weekly', 'executive']).map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
  return <label className="block text-sm font-medium">{label}<input required={name !== 'attendees'} type={type} className="mt-1 w-full rounded border p-2" value={value} onChange={(event) => onChange(name, event.target.value)} /></label>;
}

export default function OperationsPage({ kind }) {
  const config = configs[kind]; const queryClient = useQueryClient(); const [open, setOpen] = useState(false); const [values, setValues] = useState(config.initial);
  const records = useQuery({ queryKey: [config.key], queryFn: () => http.get(config.list).then((response) => response.data[config.key]) });
  const create = useMutation({ mutationFn: (payload) => http.post(config.create, serialize(kind, payload)), onSuccess: () => { queryClient.invalidateQueries({ queryKey: [config.key] }); queryClient.invalidateQueries({ queryKey: ['dashboard'] }); setValues(config.initial); setOpen(false); toast.success(`${config.title.slice(0, -1) || config.title} created.`); }, onError: (error) => toast.error(error.response?.data?.message || 'Unable to save this record.') });
  const headings = kind === 'crm' ? ['Customer', 'Type', 'Activity', 'Created by'] : kind === 'meetings' ? ['Meeting', 'Customer', 'Start', 'Status'] : kind === 'tickets' ? ['Issue', 'Customer', 'Priority', 'Status'] : kind === 'invoices' ? ['Customer', 'Amount', 'Due', 'Status'] : ['Report', 'Type', 'Created', 'Status'];
  return <div><div className="flex items-end justify-between"><div><p className="text-sm font-medium text-blue-700">NxtBiz operations</p><h2 className="mt-1 text-3xl font-bold">{config.title}</h2></div><button className="rounded bg-blue-600 px-4 py-2 font-medium text-white" onClick={() => setOpen(!open)}>{open ? 'Close' : kind === 'reports' ? 'Generate report' : 'New record'}</button></div>{open && <form className="mt-6 grid gap-4 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); create.mutate(values); }}>{config.fields.map((field) => <Field key={field[0]} field={field} value={values[field[0]]} onChange={(name, value) => setValues({ ...values, [name]: value })} />)}<button disabled={create.isPending} className="rounded bg-slate-900 px-4 py-2 font-medium text-white md:col-span-2">{create.isPending ? 'Saving…' : kind === 'reports' ? 'Generate report' : 'Create record'}</button></form>}<div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm"><table className="w-full text-left"><thead className="bg-slate-50 text-sm text-slate-500"><tr>{headings.map((heading) => <th className="px-5 py-3" key={heading}>{heading}</th>)}</tr></thead><tbody>{records.isLoading ? <tr><td className="px-5 py-5" colSpan="4">Loading…</td></tr> : records.data?.length ? records.data.map((item) => <tr className="border-t" key={item._id}>{config.columns(item).map((value, index) => <td className="px-5 py-4" key={index}>{value || '—'}</td>)}</tr>) : <tr><td className="px-5 py-5" colSpan="4">No records yet.</td></tr>}</tbody></table></div></div>;
}
