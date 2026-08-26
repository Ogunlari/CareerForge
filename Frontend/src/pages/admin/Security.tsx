import { useState } from 'react';
import {
  useGetSessionsQuery,
  useRevokeSessionMutation,
  useLogoutAllMutation,
} from '@/features/auth/authApi';
import { extractErrorMessage } from '@/features/api/baseApi';

export default function Security() {
  const { data: sessions, isLoading, error } = useGetSessionsQuery();
  const [revokeSession] = useRevokeSessionMutation();
  const [logoutAll, { isLoading: isRevokingAll }] = useLogoutAllMutation();
  const [actionError, setActionError] = useState<string | null>(null);

  const handleRevoke = async (jti: string) => {
    setActionError(null);
    try {
      await revokeSession(jti).unwrap();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm('This will sign you out of all other devices. Continue?')) return;
    setActionError(null);
    try {
      await logoutAll().unwrap();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Security Settings</h1>

      <div className="bg-white rounded shadow p-6 space-y-6">
        <div>
          <h2 className="font-bold text-lg mb-4">Active Sessions</h2>
          <p className="text-sm text-gray-600 mb-4">
            Manage devices where you&apos;re currently signed in.
          </p>

          {isLoading && <p className="text-gray-500">Loading sessions...</p>}
          {error && (
            <p className="text-red-600">{extractErrorMessage(error)}</p>
          )}

          {actionError && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
              {actionError}
            </div>
          )}

          {sessions && sessions.length === 0 && (
            <p className="text-gray-500">No active sessions found.</p>
          )}

          {sessions && sessions.length > 0 && (
            <div className="divide-y border rounded">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">
                      {session.user_agent || 'Unknown device'}
                      {session.is_current && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {session.ip_address || 'Unknown IP'} &middot;{' '}
                      {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {!session.is_current && (
                    <button
                      onClick={() => handleRevoke(session.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-6 border-t">
          <h3 className="font-bold mb-2">Danger Zone</h3>
          <p className="text-sm text-gray-600 mb-4">
            Sign out of all devices except this one.
          </p>
          <button
            onClick={handleRevokeAll}
            disabled={isRevokingAll}
            className="px-6 py-2 border-2 border-red-600 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
          >
            {isRevokingAll ? 'Revoking...' : 'Revoke All Other Sessions'}
          </button>
        </div>
      </div>
    </div>
  );
}
