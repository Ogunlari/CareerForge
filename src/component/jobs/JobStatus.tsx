import { JOB_STATUS } from '@/utilities/constants';
import type { JobStatus as JobStatusType } from '@/types';

export default function JobStatus({ status }: { status: JobStatusType }) {
  const config = JOB_STATUS[status];
  return (
    <span className={`badge ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
