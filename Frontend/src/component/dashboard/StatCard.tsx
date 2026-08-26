import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: number;
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'error';
}

const colorMap = {
  primary: { bg: 'bg-primary-50', text: 'text-primary-600', icon: 'text-primary-500' },
  accent: { bg: 'bg-accent-50', text: 'text-accent-600', icon: 'text-accent-500' },
  success: { bg: 'bg-success-50', text: 'text-success-600', icon: 'text-success-500' },
  warning: { bg: 'bg-warning-50', text: 'text-warning-600', icon: 'text-warning-500' },
  error: { bg: 'bg-error-50', text: 'text-error-600', icon: 'text-error-500' },
};

export default function StatCard({ icon, label, value, trend, color = 'primary' }: StatCardProps) {
  const c = colorMap[color];

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center ${c.icon}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? 'text-success-600' : 'text-error-600'}`}>
            {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 mt-4">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}
