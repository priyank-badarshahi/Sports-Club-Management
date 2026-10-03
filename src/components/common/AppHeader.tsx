import React, { useState } from 'react';
import { useClub, AppView } from '../../context/ClubContext';
import { UserRole } from '../../types';
import {
  Bell,
  Search,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  UserCheck,
  Menu,
} from 'lucide-react';

interface AppHeaderProps {
  onToggleSidebar?: () => void;
  onOpenSearch?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onToggleSidebar, onOpenSearch }) => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    switchRole,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadNotificationsCount,
  } = useClub();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  // Derive human-readable breadcrumbs
  const getBreadcrumb = (view: AppView) => {
    switch (view) {
      case 'admin_dashboard':
        return ['Champions ERP', 'Owner Executive Overview'];
      case 'admin_members':
        return ['Memberships', 'Member Directory & Renewals'];
      case 'admin_courts':
        return ['Facilities', 'Court Management & Pricing'];
      case 'admin_bookings':
        return ['Operations', 'Court Schedule & Reservations'];
      case 'admin_shop':
        return ['Commercial', 'Sports Pro Shop & Unified Inventory'];
      case 'admin_bar':
        return ['Hospitality', 'Bar & Cafeteria Point of Sale'];
      case 'admin_crm':
        return ['Growth', 'Enquiries & Lead Conversion Pipeline'];
      case 'admin_employees':
        return ['Human Resources', 'Staff Roster & Leave Approval'];
      case 'admin_accounting':
        return ['Financials', 'Revenue, Cashflow & Payment Ledger'];
      case 'admin_reports':
        return ['Analytics', 'Club Performance Reports & Exports'];
      case 'member_portal':
        return ['Member Space', 'Personal Dashboard & Benefits'];
      default:
        return ['Portal', 'Overview'];
    }
  };

  const breadcrumbs = getBreadcrumb(currentView);

  const roles: { role: UserRole; title: string; subtitle: string }[] = [
    { role: 'owner', title: 'Club Owner', subtitle: 'Full Admin & Financials' },
    { role: 'frontdesk', title: 'Front Desk', subtitle: 'Bookings & Members' },
    { role: 'member', title: 'Member (Rahul Patel)', subtitle: 'Personal Portal' },
    { role: 'shop', title: 'Shop Staff', subtitle: 'Inventory & Store POS' },
    { role: 'bar', title: 'Bar Staff', subtitle: 'Tables & Kitchen Orders' },
    { role: 'manager', title: 'Club Manager', subtitle: 'Shifts & Leave Approval' },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors shadow-xs">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <span>{breadcrumbs[0]}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold">{breadcrumbs[1]}</span>
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Global Search Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 text-xs border border-slate-200 transition-colors group"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
          <span className="hidden sm:inline">Search members, courts, products...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-500 rounded border border-slate-200">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {notificationsOpen && (
            <div
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              onMouseLeave={() => setNotificationsOpen(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Activity Notifications</span>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        if (notif.linkAction) {
                           setCurrentView(notif.linkAction as AppView);
                        }
                        setNotificationsOpen(false);
                      }}
                      className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                        !notif.read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">
                          {notif.type === 'stock' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                          {notif.type === 'booking' && <Calendar className="w-3.5 h-3.5 text-emerald-600" />}
                          {notif.type === 'membership' && <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
                          {notif.type === 'crm' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                          {notif.type === 'leave' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                          {notif.type === 'bar' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">{notif.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{notif.timestamp}</span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5">{notif.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Demo Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-800 border border-slate-200 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="capitalize font-semibold">{currentUser.role}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {roleMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              onMouseLeave={() => setRoleMenuOpen(false)}
            >
              <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Switch Active Role
              </div>
              {roles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    switchRole(r.role);
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    currentUser.role === r.role ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-900">{r.title}</div>
                    <div className="text-[10px] text-slate-500">{r.subtitle}</div>
                  </div>
                  {currentUser.role === r.role && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Avatar & Name */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {currentUser.avatarUrl || currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-left text-xs leading-tight">
            <div className="font-semibold text-slate-900 truncate max-w-[120px]">{currentUser.name}</div>
            <div className="text-[10px] text-slate-500 capitalize">{currentUser.role}</div>
          </div>
        </div>

        {/* Exit back to Public Website button */}
        <button
          onClick={() => setCurrentView('public_home')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          title="Back to Public Website"
        >
          <span className="hidden sm:inline">Website</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>
    </header>
  );
};
