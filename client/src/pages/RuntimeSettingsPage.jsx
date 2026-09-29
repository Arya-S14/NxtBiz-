import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { http } from '../api/http.js';

const modes = ['Operational', 'Watch', 'Maintenance'];

export default function RuntimeSettingsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: () => http.get('/dashboard').then((response) => response.data)
  });
  const [mode, setMode] = useState('Operational');
  const health = useMemo(() => data?.metrics?.healthScore ?? 0, [data]);
  const statusTone = health >= 80 ? 'text-emerald-700 bg-emerald-50' : health >= 60 ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50';

  return (
    <div>
      <p className="text-sm font-medium text-blue-700">Runtime settings</p>
      <h2 className="mt-1 text-3xl font-bold">Console preferences</h2>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Live health state</h3>
          <p className="mt-2 text-sm text-slate-600">The NxtBiz runtime surfaces live metrics from the dashboard service.</p>
          {isLoading ? (
            <p className="mt-4 text-slate-500">Loading…</p>
          ) : isError ? (
            <p className="mt-4 text-red-600">Unable to load runtime health right now.</p>
          ) : (
            <div className="mt-4 space-y-3">
              <div className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusTone}`}>
                {health >= 80 ? 'Healthy' : health >= 60 ? 'Watch' : 'Needs attention'}
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-slate-500">Current health score</p>
                <p className="mt-1 text-3xl font-semibold">{health}</p>
              </div>
              <div className="rounded-lg border p-4 text-sm text-slate-600">
                <p><span className="font-medium">Active customers:</span> {data?.metrics?.customerCount ?? 0}</p>
                <p className="mt-1"><span className="font-medium">Open tickets:</span> {data?.metrics?.openTickets ?? 0}</p>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Operational mode</h3>
          <select className="mt-4 w-full rounded border p-2" value={mode} onChange={(event) => setMode(event.target.value)}>
            {modes.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <p className="mt-3 text-sm text-slate-600">This console preference is wired to the runtime preferences view for the operations console.</p>
          <div className="mt-4 rounded-lg border border-dashed p-4 text-sm text-slate-600">
            <p className="font-medium">Current selection</p>
            <p className="mt-1">{mode}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
