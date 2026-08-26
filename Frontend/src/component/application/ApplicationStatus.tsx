import { APPLICATION_STATUS } from '@/utilities/constants';
import type { ApplicationStatus as AppStatusType } from '@/types';

export default function ApplicationStatus({ status }: { status: AppStatusType }) {
  const config = APPLICATION_STATUS[status];
  return (
    <span className={`badge ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
