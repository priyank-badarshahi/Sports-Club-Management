import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore, DEMO_USERS } from '../store';
import { Role } from '../types';
import { 
  Trophy, 
  Search, 
  Bell, 
  ChevronDown, 
  RotateCcw, 
  Check, 
  UserCheck, 
  ShieldAlert, 
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { formatDateTime } from '../lib/formatters';

interface HeaderProps {
  onOpenSearch: () => void;
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenSearch, 
  onToggleSidebar, 
  showSidebarToggle 
}) => {
  const { 
    currentRole, 
    currentUser, 
    setRole, 
    setCurrentUser,
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead,
    resetDemoData,
    addToast
  } = useAppStore();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const roleRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const unreadNotifs = notifications.filter((n) => !n.read);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSelect = (role: Role) => {
    setRole(role);
    setRoleDropdownOpen(false);
    // Route appropriately based on role
    if (role === 'visitor') {
      navigate('/');
    } else if (role === 'member') {
      navigate('/member/home');
    } else if (role === 'bar_staff') {
      navigate('/staff/bar');
    } else if (role === 'shop_staff') {
      navigate('/staff/shop');
    } else if (role === 'front_desk') {
      navigate('/staff/bookings');
    } else {
      navigate('/staff/dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(DEMO_USERS.visitor);
    setRole('visitor');
    setRoleDropdownOpen(false);
    navigate('/login');
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been successfully logged out.'
    });
  };

  const handleResetData = () => {
    resetDemoData();
    setResetConfirmOpen(false);
    navigate('/');
  };

  const roleLabels: Record<Role, { title: string; subtitle: string; badgeColor: string }> = {
    visitor: { title: 'Public Visitor', subtitle: 'Browse club & book trial', badgeColor: 'bg-slate-700 text-slate-200' },
    member: { title: 'Gold Member', subtitle: 'Vikram Malhotra (Court booking & tabs)', badgeColor: 'bg-amber-400 text-slate-950 font-bold' },
    front_desk: { title: 'Front Desk Lead', subtitle: 'Priya Sharma (Check-ins & bookings)', badgeColor: 'bg-sky-500 text-white font-bold' },
    bar_staff: { title: 'Bar & Café Lead', subtitle: 'Rohan Das (Tables, orders & tabs)', badgeColor: 'bg-purple-500 text-white font-bold' },
    shop_staff: { title: 'Pro Shop Lead', subtitle: 'Ananya Sen (Inventory & POS)', badgeColor: 'bg-emerald-500 text-white font-bold' },
    manager: { title: 'General Manager', subtitle: 'Arjun Rao (Operations, CRM, HR)', badgeColor: 'bg-indigo-500 text-white font-bold' },
    owner: { title: 'Club Owner', subtitle: 'Rajesh Singhania (Full control & P&L)', badgeColor: 'bg-gradient-to-r from-amber-400 to-lime-400 text-slate-950 font-bold' },
  };

  const isStaffArea = location.pathname.startsWith('/staff');
  const isMemberArea = location.pathname.startsWith('/member');

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Optional Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {showSidebarToggle && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Toggle Navigation Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-lime-500 via-lime-400 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-lime-500/20 group-hover:scale-105 transition-transform duration-200">
              <Trophy className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-lg tracking-tight text-white group-hover:text-lime-400 transition-colors">
                  CHAMPIONS
                </span>
                <span className="font-heading font-bold text-xs uppercase px-1.5 py-0.5 rounded bg-lime-400/10 text-lime-400 border border-lime-400/25 tracking-widest">
                  CLUB
                </span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium hidden sm:block -mt-1">
                Tennis • Padel • Badminton • Cricket
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Global Search trigger bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all text-sm group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-lime-400 group-hover:text-lime-300" />
              <span>Search members, courts, gear, menu...</span>
            </div>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 border border-slate-700 text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Controls: Notifications, Role Switcher, Theme Toggle, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Button */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition border border-transparent hover:border-slate-700"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-lime-400 ring-2 ring-slate-950 animate-pulse" />
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/60 overflow-hidden z-50 text-slate-100 animate-in fade-in zoom-in-95">
                <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-semibold text-sm">Notifications</span>
                    {unreadNotifs.length > 0 && (
                      <span className="text-[10px] bg-lime-400/20 text-lime-400 px-1.5 py-0.5 rounded-full font-bold">
                        {unreadNotifs.length} new
                      </span>
                    )}
                  </div>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-lime-400 hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No notifications at the moment
                    </div>
                  ) : (
                    notifications.slice(0, 6).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationRead(notif.id);
                          if (notif.link) {
                            navigate(notif.link);
                            setNotifDropdownOpen(false);
                          }
                        }}
                        className={`p-3 hover:bg-slate-800/60 cursor-pointer transition-colors ${
                          !notif.read ? 'bg-slate-800/30' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-200">{notif.title}</p>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {formatDateTime(notif.timestamp).split(',')[1]}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 bg-slate-950/60 border-t border-slate-800 text-center">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(false);
                      if (currentRole === 'visitor') navigate('/availability');
                      else if (currentRole === 'member') navigate('/member/home');
                      else navigate('/staff/dashboard');
                    }}
                    className="text-[11px] text-slate-400 hover:text-lime-400 font-medium"
                  >
                    View All Activity Logs
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher Dropdown */}
          <div className="relative" ref={roleRef}>
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
              aria-label="Switch Active Persona"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-lime-400/40"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1.5">
                  <span className="truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</span>
                  <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded ${roleLabels[currentRole].badgeColor}`}>
                    {currentRole.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 overflow-hidden z-50 animate-in fade-in zoom-in-95 text-slate-100">
                <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{currentUser.email || 'guest@championsclub.in'}</p>
                  </div>
                </div>

                <div className="p-4 space-y-3 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Current Role:</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${roleLabels[currentRole].badgeColor}`}>
                      {currentRole.replace('_', ' ')}
                    </span>
                  </div>
                  {currentRole === 'member' && currentUser.tier && currentUser.tier !== 'none' && currentUser.tier !== 'walk_in' && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Membership Tier:</span>
                      <span className="font-semibold uppercase text-amber-400">{currentUser.tier}</span>
                    </div>
                  )}
                </div>

                <div className="p-2 bg-slate-950/80 border-t border-slate-800 flex flex-col gap-1.5 text-xs">
                  {currentRole !== 'visitor' ? (
                    <button
                      onClick={handleLogout}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-2 transition"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Sign Out of Account</span>
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setRoleDropdownOpen(false)}
                      className="w-full p-2.5 rounded-xl hover:bg-blue-500/10 text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-2 transition text-left"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Log In / Sign In</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      setResetConfirmOpen(true);
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-white font-medium flex items-center gap-2 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Club Demo Data</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reset Demo Data Confirm Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Reset Demo Data?</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              This will restore all 60 members, 8 courts, orders, tabs, invoices, and settings back to their pristine factory seed data in localStorage.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition"
              >
                Yes, Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
