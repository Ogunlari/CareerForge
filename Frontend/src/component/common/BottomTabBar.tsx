import { NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';

export interface TabItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Props {
  items: TabItem[];
  onMenu?: () => void;
}

export default function BottomTabBar({ items, onMenu }: Props) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {onMenu && (
          <button
            onClick={onMenu}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-slate-600 hover:text-primary-600"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-semibold">Menu</span>
          </button>
        )}
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 flex-1 py-2 ${
                isActive ? 'text-primary-600' : 'text-slate-600'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-semibold">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
