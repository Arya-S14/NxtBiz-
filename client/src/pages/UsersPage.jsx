import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { http } from '../api/http.js';
import { useAuthStore } from '../features/auth/auth.store.js';

const emptyForm = { name: '', email: '', password: '', role: 'Employee' };

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const users = useQuery({ queryKey: ['users'], queryFn: () => http.get('/users').then((response) => response.data.users) });

  const create = useMutation({
    mutationFn: (payload) => http.post('/users', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setForm(emptyForm);
      setOpen(false);
      toast.success('User created.');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Unable to create user.')
  });

  const remove = useMutation({
    mutationFn: (id) => http.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User removed.');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Unable to remove user.')
  });

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-blue-700">User management</p>
          <h2 className="mt-1 text-3xl font-bold">Team access and roles</h2>
        </div>
        {user?.role === 'Admin' ? (
          <button className="rounded bg-blue-600 px-4 py-2 font-medium text-white" onClick={() => setOpen((value) => !value)}>
            {open ? 'Close' : 'New user'}
          </button>
        ) : null}
      </div>

      {open && user?.role === 'Admin' ? (
        <form
          className="mt-6 grid gap-4 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            create.mutate(form);
          }}
        >
          <label className="text-sm font-medium">
            Name
            <input required className="mt-1 w-full rounded border p-2" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label className="text-sm font-medium">
            Email
            <input required type="email" className="mt-1 w-full rounded border p-2" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <label className="text-sm font-medium">
            Password
            <input required type="password" className="mt-1 w-full rounded border p-2" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>
          <label className="text-sm font-medium">
            Role
            <select className="mt-1 w-full rounded border p-2" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
              <option value="Viewer">Viewer</option>
            </select>
          </label>
          <button disabled={create.isPending} className="rounded bg-slate-900 px-4 py-2 font-medium text-white md:col-span-2">
            {create.isPending ? 'Creating…' : 'Create user'}
          </button>
        </form>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-sm text-slate-500">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.isLoading ? (
              <tr><td className="px-5 py-5" colSpan="4">Loading users…</td></tr>
            ) : users.data?.length ? (
              users.data.map((item) => (
                <tr className="border-t" key={item.id}>
                  <td className="px-5 py-4">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.email}</p>
                  </td>
                  <td className="px-5 py-4">{item.role}</td>
                  <td className="px-5 py-4">{item.active ? 'Active' : 'Inactive'}</td>
                  <td className="px-5 py-4">
                    {user?.role === 'Admin' && item.id !== user.id ? (
                      <button className="text-sm text-red-600" onClick={() => remove.mutate(item.id)}>Delete</button>
                    ) : '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td className="px-5 py-5" colSpan="4">No users yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
