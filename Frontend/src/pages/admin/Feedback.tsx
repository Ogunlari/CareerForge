import { useState } from 'react';
import { Mail, Inbox } from 'lucide-react';
import {
  useGetContactMessagesQuery,
  useMarkContactReadMutation,
} from '@/features/admin/adminApi';
import { extractErrorMessage } from '@/features/api/baseApi';

export default function Feedback() {
  const [page, setPage] = useState(1);
  const { data, isLoading: loading, error } = useGetContactMessagesQuery(page);
  const [markRead] = useMarkContactReadMutation();

  const messages = data?.data ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Inbox className="w-6 h-6 text-primary-600" />
        <h1 className="text-3xl font-bold">Feedback & Contact Messages</h1>
      </div>
      <p className="text-gray-600 -mt-2">Messages submitted through the public Contact page.</p>

      {error && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
          {extractErrorMessage(error)}
        </div>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Subject</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Message</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-600">Loading...</td>
              </tr>
            ) : messages.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-600">
                  <Mail className="w-5 h-5 inline-block mr-1 -mt-0.5" /> No messages yet.
                </td>
              </tr>
            ) : (
              messages.map((m) => (
                <tr key={m.id} className={`border-t ${m.status === 'new' ? 'bg-amber-50/60' : ''}`}>
                  <td className="px-6 py-4 text-sm font-medium">{m.name}</td>
                  <td className="px-6 py-4 text-sm">{m.email}</td>
                  <td className="px-6 py-4 text-sm">{m.subject || '—'}</td>
                  <td className="px-6 py-4 text-sm max-w-[280px]">
                    <div className="whitespace-pre-wrap line-clamp-3">{m.message}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {m.status === 'new' ? (
                      <button
                        onClick={() => markRead(m.id)}
                        className="inline-flex items-center rounded-full bg-primary-600 text-white text-xs font-semibold px-3 py-1 hover:bg-primary-700"
                      >
                        Mark as read
                      </button>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1">Read</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {m.created_at ? new Date(m.created_at).toLocaleString() : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">{total} total message(s)</p>
        {pages > 1 && (
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded bg-white border border-gray-300 text-sm disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm text-gray-700">Page {page} of {pages}</span>
            <button
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              className="px-3 py-1.5 rounded bg-white border border-gray-300 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
