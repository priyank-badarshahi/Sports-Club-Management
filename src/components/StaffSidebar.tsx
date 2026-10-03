import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../store';
import { Role } from '../types';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Users, 
  ShoppingBag, 
  Coffee, 
  UserPlus, 
  Receipt, 
  Briefcase, 
  Sliders, 
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageSquare
} from 'lucide-react';

interface StaffSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: Role[];
  badge?: number | string;
  badgeColor?: string;
}

export const StaffSidebar: React.FC<StaffSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { currentRole, tabs, leads, products, notifications } = useAppStore();

  const openTabsCount = tabs.filter((t) => t.status === 'open').length;
  const newLeadsCount = leads.filter((l) => l.status === 'new' || l.status === 'trial_booked').length;
  const lowStockCount = products.filter((p) => p.stockQty <= p.reorderLevel).length;

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/staff/dashboard',
      icon: LayoutDashboard,
      allowedRoles: ['front_desk', 'manager', 'owner'],
    },
    {
      label: 'Bookings & Courts',
      path: '/staff/bookings',
      icon: CalendarCheck,
      allowedRoles: ['front_desk', 'manager', 'owner'],
    },
    {
      label: 'Members & Passports',
      path: '/staff/members',
      icon: Users,
      allowedRoles: ['front_desk', 'manager', 'owner'],
    },
    {
      label: 'Pro Shop & Stock',
      path: '/staff/shop',
      icon: ShoppingBag,
      allowedRoles: ['shop_staff', 'manager', 'owner'],
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      label: 'Bar, Café & Tabs',
      path: '/staff/bar',
      icon: Coffee,
      allowedRoles: ['bar_staff', 'manager', 'owner'],
      badge: openTabsCount > 0 ? `${openTabsCount} Open` : undefined,
      badgeColor: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
    },
    {
      label: 'CRM & Trial Leads',
      path: '/staff/crm',
      icon: UserPlus,
      allowedRoles: ['front_desk', 'manager', 'owner'],
      badge: newLeadsCount > 0 ? newLeadsCount : undefined,
      badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    },
    {
      label: 'Finance & Invoices',
      path: '/staff/finance',
      icon: Receipt,
      allowedRoles: ['manager', 'owner'],
    },
    {
      label: 'HR, Shifts & Payroll',
      path: '/staff/hr',
      icon: Briefcase,
      allowedRoles: ['manager', 'owner'],
    },
    {
      label: 'Messages & Dispatch',
      path: '/staff/messages',
      icon: MessageSquare,
      allowedRoles: ['front_desk', 'bar_staff', 'shop_staff', 'manager', 'owner'],
    },
    {
      label: 'Club Settings & Audit',
      path: '/staff/settings',
      icon: Sliders,
      allowedRoles: ['manager', 'owner'],
    },
  ];

  // Filter items visible to current role
  const visibleItems = navItems.filter((item) =>
    item.allowedRoles.includes(currentRole)
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950/95 border-r border-slate-800/80 backdrop-blur-xl">
      {/* Top Banner / Role Status */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
        {!collapsed ? (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400 block">
              Staff Operations Console
            </span>
            <span className="text-xs text-slate-300 font-medium capitalize">
              Role: {currentRole.replace('_', ' ')}
            </span>
          </div>
        ) : (
          <div className="w-full text-center">
            <span className="text-[10px] font-bold text-lime-400">OPS</span>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-lime-400/20 to-lime-500/10 text-lime-300 font-semibold border border-lime-400/30 shadow-sm shadow-lime-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full border font-bold ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Live System Status Pill */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 m-2 rounded-xl text-[11px] text-slate-400">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-white font-semibold">Live Club Core</span>
          </div>
          <p className="text-[10px] text-slate-500">
            GST & Indian INR Active • All 8 courts online
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="sticky top-16 h-[calc(100vh-4rem)]">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85%] h-full bg-slate-950 z-50 animate-in slide-in-from-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
