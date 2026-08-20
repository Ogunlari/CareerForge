import { useEffect, useState } from 'react';

export default function Reports() {
  // const [reports, setReports] = useState<any[]>([]);
  const [reports,] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetoh reports
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports</h1>
        <button className="bg-blue-600 text-white px-6 py-2 rounded">
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 text-sm font-semibold">User Statistios</h3>
          <p className="text-2xl font-bold mt-2">--</p>
          <button className="text-blue-600 text-sm mt-3 hover:underline">View Report</button>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Job Statistios</h3>
          <p className="text-2xl font-bold mt-2">--</p>
          <button className="text-blue-600 text-sm mt-3 hover:underline">View Report</button>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Application Statistios</h3>
          <p className="text-2xl font-bold mt-2">--</p>
          <button className="text-blue-600 text-sm mt-3 hover:underline">View Report</button>
        </div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Reports</h2>
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : reports.length === 0 ? (
          <p className="text-gray-600">No reports generated yet</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border-l-4 border-blue-600 pl-4 py-3">
                <h3 className="font-semibold">{report.name}</h3>
                <p className="text-sm text-gray-600">{report.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
