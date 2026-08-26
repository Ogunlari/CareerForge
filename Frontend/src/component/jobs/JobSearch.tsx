import { Search } from 'lucide-react';

interface JobSearchProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  large?: boolean;
}

export default function JobSearch({ value, onChange, placeholder = 'Search jobs...', large = false }: JobSearchProps) {
  return (
    <div className="relative w-full">
      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 ${large ? 'w-5 h-5' : 'w-4 h-4'}`} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`input pl-12 ${large ? 'py-4 text-base' : ''}`}
      />
    </div>
  );
}
