import { Loader2 } from 'lucide-react';

interface LoaderProps {
  size?: number;
  label?: string;
  fullPage?: boolean;
}

export default function Loader({ size = 24, label, fullPage = false }: LoaderProps) {
  if (fullPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" style={{ width: size, height: size }} />
        {label && <p className="text-sm text-slate-500">{label}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8 gap-2">
      <Loader2 className="text-primary-500 animate-spin" style={{ width: size, height: size }} />
      {label && <span className="text-sm text-slate-500">{label}</span>}
    </div>
  );
}
