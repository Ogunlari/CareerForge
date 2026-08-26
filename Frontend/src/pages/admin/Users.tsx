import { useState } from 'react';
import { useGetAdminUsersQuery, useBlockUserMutation, useUnblockUserMutation } from '@/features/admin/adminApi';
import { extractErrorMessage } from '@/features/api/baseApi';
import type { Profile } from '@/types';

export default function ManageUsers() {
  const [filter, setFilter] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: users = [], isLoading: loading, error } = useGetAdminUsersQuery();
  const [blockUser] = useBlockUserMutation();
  const [unblockUser] = useUnblockUserMutation();

  const visible = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(filter.toLowerCase()) ||
      user.email.toLowerCase().includes(filter.toLowerCase()),
  );

  const handleToggleBlock = async (user: Profile) => {
    setActionError(null);
    try {
      if (user.is_blocked) {
        await unblockUser(user.id).unwrap();
      } else {
        await blockUser(user.id).unwrap();
      }
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <input
          type="text"
          placeholder="Search users..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded"
        />
      </div>

      {(error || actionError) && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
          {actionError ?? extractErrorMessage(error)}
        </div>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Joined</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-600">
                  Loading...
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-600">
                  No users found
                </td>
              </tr>
            ) : (
              visible.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-6 py-4">
                    {user.full_name}
                    {user.is_blocked && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">Blocked</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-sm bg-gray-100">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => handleToggleBlock(user)}
                      disabled={user.role === 'admin'}
                      className={`text-sm hover:underline disabled:text-gray-400 disabled:no-underline ${
                        user.is_blocked ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {user.is_blocked ? 'Unblock' : 'Block'}
                    </button>
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
