import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export default function ErrorMessage({ message, onDismiss, className = '' }: ErrorMessageProps) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl bg-error-50 border border-error-200 text-error-700 animate-slide-down ${className}`}>
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="text-sm font-medium flex-1">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="p-0.5 rounded hover:bg-error-100 transition-colors">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
