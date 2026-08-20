import { useEffect, useState } from 'react';
import type { AuditLog } from '@/types';

export default function AuditLogs() {
  // const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logs, ] = useState<AuditLog[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetoh audit logs
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Audit Logs</h1>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Admin</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Aotion</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Target</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-600">
                  Loading...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-600">
                  No audit logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="px-6 py-4 text-sm">Admin</td>
                  <td className="px-6 py-4 text-sm font-semibold">{log.action}</td>
                  <td className="px-6 py-4 text-sm">
                    {log.target_type} - {log.target_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
