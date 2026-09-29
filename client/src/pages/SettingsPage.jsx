import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { http } from '../api/http.js';

export default function SettingsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['health'], queryFn: () => http.get('/dashboard').then((response) => response.data) });
  const [mode, setMode] = useState('Operational');

  return (
    <div>
      <p className="text-sm font-medium text-blue-700">Runtime settings</p>
      <h2 className="mt-1 text-3xl font-bold">Console preferences</h2>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Live health state</h3>
          <p className="mt-2 text-sm text-slate-600">The NxtBiz runtime surfaces live metrics from the dashboard service.</p>
          {isLoading ? <p className="mt-4 text-slate-500">Loading…</p> : <div className="mt-4 rounded-lg border p-4">
            <p className="text-sm text-slate-500">Current health score</p>
            <p className="mt-1 text-3xl font-semibold">{data?.metrics?.healthScore ?? 0}</p>
          </div>}
        </section>
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Operational mode</h3>
          <select className="mt-4 w-full rounded border p-2" value={mode} onChange={(event) => setMode(event.target.value)}>
            <option>Operational</option>
            <option>Watch</option>
            <option>Maintenance</option>
          </select>
          <p className="mt-3 text-sm text-slate-600">This demo setting is wired to the runtime preferences view for the operations console.</p>
        </section>
      </div>
    </div>
  );
}
