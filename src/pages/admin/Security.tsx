import { useState } from 'react';

export default function Security() {
  const [settings, setSettings] = useState({
    two_factor_enabled: false,
    ip_whitelist_enabled: false,
    session_timeout: 30,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Update security settings
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Security Settings</h1>

      <div className="bg-white rounded shadow p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
              </div>
              <input
                type="checkbox"
                name="two_factor_enabled"
                checked={settings.two_factor_enabled}
                onChange={handleChange}
                className="w-6 h-6"
              />
            </div>
          </div>

          <div className="border-b pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">IP Whitelist</h3>
                <p className="text-sm text-gray-600">Only allow access from whitelisted IPs</p>
              </div>
              <input
                type="checkbox"
                name="ip_whitelist_enabled"
                checked={settings.ip_whitelist_enabled}
                onChange={handleChange}
                className="w-6 h-6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Session Timeout (minutes)</label>
            <select
              name="session_timeout"
              value={settings.session_timeout}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold">
            Save Settings
          </button>
        </form>

        <div className="mt-8 pt-6 border-t">
          <h3 className="font-bold mb-4">Danger Zone</h3>
          <button className="px-6 py-2 border-2 border-red-600 text-red-600 rounded hover:bg-red-50">
            Clear All Sessions
          </button>
        </div>
      </div>
    </div>
  );
}
