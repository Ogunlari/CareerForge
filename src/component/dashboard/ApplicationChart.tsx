import type { ApplicationStatus } from '@/types';

interface ApplicationChartProps {
  data: Record<ApplicationStatus, number>;
}

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-slate-400' },
  reviewing: { label: 'Reviewing', color: 'bg-blue-500' },
  accepted: { label: 'Accepted', color: 'bg-success-500' },
  rejected: { label: 'Rejected', color: 'bg-error-500' },
  withdrawn: { label: 'Withdrawn', color: 'bg-slate-300' },
};

export default function ApplicationChart({ data }: ApplicationChartProps) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const entries = Object.entries(data) as [ApplicationStatus, number][];

  return (
    <div className="card p-6">
      <h3 className="font-bold text-slate-900 mb-4">Application Status</h3>

      {total === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">No applications yet</p>
      ) : (
        <>
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-4">
            {entries.map(([status, count]) =>
              count > 0 && (
                <div
                  key={status}
                  className={statusConfig[status].color}
                  style={{ width: `${(count / total) * 100}%` }}
                />
              )
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {entries.map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${statusConfig[status].color}`} />
                <span className="text-sm text-slate-600">{statusConfig[status].label}</span>
                <span className="text-sm font-semibold text-slate-900 ml-auto">{count}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
