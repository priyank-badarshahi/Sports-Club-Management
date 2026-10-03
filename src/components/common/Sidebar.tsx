import React from 'react';
import { useClub, AppView } from '../../context/ClubContext';
import {
  LayoutDashboard,
  Users,
  Grid,
  CalendarCheck,
  ShoppingBag,
  Coffee,
  UserPlus,
  Briefcase,
  DollarSign,
  FileBarChart,
  UserCheck,
  Package,
  Layers,
  Sparkles,
  CreditCard,
  UtensilsCrossed,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { currentView, setCurrentView, currentUser, shiftSwaps, leaves } = useClub();

  const pendingRequests = (shiftSwaps?.filter(s => s.status === 'pending').length || 0) +
    (leaves?.filter(l => l.status === 'pending').length || 0);

  interface NavItem {
    label: string;
    view: AppView;
    icon: React.ElementType;
    badge?: string;
  }

  const getNavItemsForRole = (): NavItem[] => {
    switch (currentUser.role) {
      case 'frontdesk':
        return [
          { label: 'Bookings & Courts', view: 'admin_bookings', icon: CalendarCheck },
          { label: 'Member Directory', view: 'admin_members', icon: Users },
          { label: 'Courts Overview', view: 'admin_courts', icon: Grid },
          { label: 'Enquiries / CRM', view: 'admin_crm', icon: UserPlus },
          { label: 'Payments Ledger', view: 'admin_accounting', icon: CreditCard },
        ];

      case 'member':
        return [
          { label: 'Member Overview', view: 'member_portal', icon: LayoutDashboard },
          { label: 'Book a Court', view: 'public_courts', icon: CalendarCheck },
          { label: 'Pro Sports Shop', view: 'public_shop', icon: ShoppingBag },
          { label: 'Club Social Play', view: 'public_social', icon: Sparkles },
          { label: 'Cafeteria & Bar', view: 'public_bar', icon: Coffee },
          { label: 'Membership Plan', view: 'public_memberships', icon: UserCheck },
        ];

      case 'shop':
        return [
          { label: 'Pro Shop & POS', view: 'admin_shop', icon: ShoppingBag },
          { label: 'Inventory Monitor', view: 'admin_shop', icon: Package, badge: 'Unified' },
          { label: 'Transactions', view: 'admin_accounting', icon: DollarSign },
        ];

      case 'bar':
        return [
          { label: 'Table Layout & POS', view: 'admin_bar', icon: Coffee },
          { label: 'Active Tabs', view: 'admin_bar', icon: UtensilsCrossed },
          { label: 'Bar Transactions', view: 'admin_accounting', icon: CreditCard },
        ];

      case 'manager':
        return [
          {
            label: 'Staff Shifts & Requests',
            view: 'admin_employees',
            icon: Briefcase,
            badge: pendingRequests > 0 ? `${pendingRequests} New` : undefined,
          },
          { label: 'Court Availability', view: 'admin_courts', icon: Grid },
          { label: 'Club Bookings', view: 'admin_bookings', icon: CalendarCheck },
          { label: 'Management Reports', view: 'admin_reports', icon: FileBarChart },
        ];

      case 'owner':
      default:
        return [
          { label: 'Overview Dashboard', view: 'admin_dashboard', icon: LayoutDashboard },
          { label: 'Members', view: 'admin_members', icon: Users },
          { label: 'Courts & Facilities', view: 'admin_courts', icon: Grid },
          { label: 'Bookings Calendar', view: 'admin_bookings', icon: CalendarCheck },
          { label: 'Shop & Inventory', view: 'admin_shop', icon: ShoppingBag },
          { label: 'Bar & Cafeteria POS', view: 'admin_bar', icon: Coffee },
          { label: 'CRM & Enquiries', view: 'admin_crm', icon: UserPlus },
          {
            label: 'Staff & Shift Requests',
            view: 'admin_employees',
            icon: Briefcase,
            badge: pendingRequests > 0 ? `${pendingRequests} New` : undefined,
          },
          { label: 'Accounting & Ledger', view: 'admin_accounting', icon: DollarSign },
          { label: 'Executive Reports', view: 'admin_reports', icon: FileBarChart },
        ];
    }
  };

  const navItems = getNavItemsForRole();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white text-slate-700 flex flex-col border-r border-slate-200 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Title Bar */}
        <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
              CC
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm tracking-tight leading-tight">CHAMPIONS CLUB</div>
              <div className="text-[10px] font-mono text-blue-600 uppercase tracking-wider font-semibold">Enterprise ERP</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Role Badge */}
        <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 uppercase">
            <span>Active Workspace</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-xs font-bold text-slate-900 mt-0.5 capitalize">{currentUser.role} Workspace</div>
          <div className="text-[11px] text-slate-500 truncate">{currentUser.name}</div>
        </div>

        {/* Navigation items list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.label}
                onClick={() => {
                  setCurrentView(item.view);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200 font-semibold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Workflow Navigation Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px]">
          <div className="text-slate-500 font-medium">Quick Navigation</div>
          <div className="flex items-center gap-1.5 mt-2">
            <button
              onClick={() => {
                setCurrentView('public_home');
                if (onClose) onClose();
              }}
              className="flex-1 py-1.5 px-2 text-center rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200 shadow-xs transition-colors"
            >
              Public Web
            </button>
            <button
              onClick={() => {
                setCurrentView('public_courts');
                if (onClose) onClose();
              }}
              className="flex-1 py-1.5 px-2 text-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-medium border border-blue-200 transition-colors"
            >
              Book Courts
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
