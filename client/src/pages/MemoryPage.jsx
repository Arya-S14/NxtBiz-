import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { http } from '../api/http.js';

export default function MemoryPage() {
  const [query, setQuery] = useState('customer');
  const { data, isLoading, isError } = useQuery({
    queryKey: ['memory', query],
    queryFn: () => http.get(`/memory/search?q=${encodeURIComponent(query)}`).then((response) => response.data.memory),
    enabled: Boolean(query.trim())
  });

  const items = useMemo(() => data || [], [data]);

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-blue-700">Memory</p>
          <h2 className="mt-1 text-3xl font-bold">Operational memory search</h2>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
        <label className="text-sm font-medium">
          Search memory
          <input
            className="mt-2 w-full rounded border p-2"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try customer, renewal, invoice, meeting..."
          />
        </label>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-sm text-slate-500">
            <tr>
              <th className="px-5 py-3">Key</th>
              <th className="px-5 py-3">Value</th>
              <th className="px-5 py-3">Tags</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td className="px-5 py-5" colSpan="3">Searching memory…</td></tr>
            ) : isError ? (
              <tr><td className="px-5 py-5" colSpan="3">Unable to load memory right now.</td></tr>
            ) : items.length ? items.map((item) => (
              <tr className="border-t" key={item._id}>
                <td className="px-5 py-4 font-medium">{item.key}</td>
                <td className="px-5 py-4">{item.value}</td>
                <td className="px-5 py-4">{item.tags?.join(', ') || '—'}</td>
              </tr>
            )) : (
              <tr><td className="px-5 py-5" colSpan="3">No memory entries matched your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
