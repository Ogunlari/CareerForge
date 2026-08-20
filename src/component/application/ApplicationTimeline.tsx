import { CheckCircle2, Circle, Clock, XCircle, FileText } from 'lucide-react';
import type { ApplicationStatus } from '@/types';
import { formatDate } from '@/utilities/formatDate';

interface TimelineEvent {
  status: ApplicationStatus;
  date: string | null;
  label: string;
  icon: typeof CheckCircle2;
  color: string;
}

export default function ApplicationTimeline({ currentStatus, createdAt }: { currentStatus: ApplicationStatus; createdAt: string }) {
  const statusOrder: ApplicationStatus[] = ['pending', 'reviewing', 'accepted'];

  const events: TimelineEvent[] = [
    { status: 'pending', date: createdAt, label: 'Application Submitted', icon: FileText, color: 'text-primary-500' },
    { status: 'reviewing', date: null, label: 'Under Review', icon: Clock, color: 'text-blue-500' },
    { status: 'accepted', date: null, label: 'Decision Made', icon: CheckCircle2, color: 'text-success-500' },
  ];

  const currentIndex = statusOrder.indexOf(currentStatus);
  const isRejected = currentStatus === 'rejected';
  const isWithdrawn = currentStatus === 'withdrawn';

  return (
    <div className="space-y-1">
      {events.map((event, i) => {
        const isCompleted = !isRejected && !isWithdrawn && i <= currentIndex;
        const isCurrent = !isRejected && !isWithdrawn && i === currentIndex;
        const Icon = event.icon;

        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-primary-50' : 'bg-slate-100'
              }`}>
                {isCompleted ? (
                  <Icon className={`w-4 h-4 ${event.color}`} />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300" />
                )}
              </div>
              {i < events.length - 1 && (
                <div className={`w-0.5 h-8 ${isCompleted && !isCurrent ? 'bg-primary-200' : 'bg-slate-100'}`} />
              )}
            </div>
            <div className="pt-1.5">
              <p className={`text-sm font-semibold ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                {event.label}
              </p>
              {event.date && isCompleted && (
                <p className="text-xs text-slate-500 mt-0.5">{formatDate(event.date, 'long')}</p>
              )}
            </div>
          </div>
        );
      })}

      {(isRejected || isWithdrawn) && (
        <div className="flex gap-3 mt-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-error-50">
            <XCircle className="w-4 h-4 text-error-500" />
          </div>
          <div className="pt-1.5">
            <p className="text-sm font-semibold text-error-600">
              {isRejected ? 'Application Rejected' : 'Application Withdrawn'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
