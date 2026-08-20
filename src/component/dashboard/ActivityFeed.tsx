import { getRelativeTime } from '@/utilities/formatDate';
import { Bell, FileText, CheckCircle2, Briefcase } from 'lucide-react';

export interface ActivityItem {
  id: string;
  type: 'application' | 'job' | 'status' | 'message';
  title: string;
  description: string;
  date: string;
}

const iconMap = {
  application: { icon: FileText, color: 'text-primary-500 bg-primary-50' },
  job: { icon: Briefcase, color: 'text-accent-500 bg-accent-50' },
  status: { icon: CheckCircle2, color: 'text-success-500 bg-success-50' },
  message: { icon: Bell, color: 'text-blue-500 bg-blue-50' },
};

export default function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="font-bold text-slate-900 mb-4">Recent Activity</h3>
        <p className="text-sm text-slate-400 text-center py-8">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="font-bold text-slate-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {items.map((item, i) => {
          const config = iconMap[item.type] || iconMap.message;
          const Icon = config.icon;
          return (
            <div key={item.id} className="flex gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>
                <p className="text-xs text-slate-400 mt-1">{getRelativeTime(item.date)}</p>
              </div>
              {i < items.length - 1 && <div className="absolute" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
