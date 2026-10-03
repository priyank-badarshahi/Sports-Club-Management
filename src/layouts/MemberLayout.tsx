import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { MemberBottomNav } from '../components/MemberBottomNav';
import { ToastContainer } from '../components/ToastContainer';
import { GlobalSearchModal } from '../components/GlobalSearchModal';
import { useAppStore } from '../store';
import { Home, CalendarPlus, ShoppingBag, Coffee, User, ShieldCheck } from 'lucide-react';
import { getTierBadgeClass, getTierName, formatINR } from '../lib/formatters';

export const MemberLayout: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const { currentUser, members, currentRole, setRole } = useAppStore();

  const currentMember = members.find((m) => m.id === currentUser.memberId) || members[0];
  const isMember = currentRole === 'member';

  const memberTabs = [
    { label: 'Member Hub', path: '/member/home', icon: Home },
    { label: 'Book Court', path: '/member/book', icon: CalendarPlus },
    { label: 'Member Pro Shop', path: '/member/shop', icon: ShoppingBag },
    { label: 'My Bar Tab & Café', path: '/member/tab', icon: Coffee },
    { label: 'Membership Profile', path: '/member/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#080d1a] text-slate-100 pb-16 md:pb-0 transition-colors">
      <Header onOpenSearch={() => setSearchOpen(true)} />

      {/* Member Banner & Desktop Tab Navigation */}
      <div className="bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Left Member Passport Info */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={currentMember.avatar}
                  alt={currentMember.fullName}
                  className="w-11 h-11 rounded-2xl object-cover ring-2 ring-amber-400/50 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-bold text-sm text-white">{currentMember.fullName}</h2>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${getTierBadgeClass(currentMember.tier)}`}>
                    {getTierName(currentMember.tier)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5">
                  <span>Pass: <strong className="text-slate-300">{currentMember.memberNumber}</strong></span>
                  <span>•</span>
                  <span>Wallet: <strong className="text-lime-400">{formatINR(currentMember.walletBalance)}</strong></span>
                  {currentMember.activeTabBalance > 0 && (
                    <>
                      <span>•</span>
                      <span>Tab: <strong className="text-amber-400">{formatINR(currentMember.activeTabBalance)}</strong></span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* If viewed by someone other than member, quick switch */}
            {!isMember && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRole('member')}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20"
                >
                  Switch to Vikram (Gold Member)
                </button>
              </div>
            )}
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-1 mt-3 pt-2 border-t border-slate-800/60">
            {memberTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  end={tab.path === '/member/home'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-lime-400/15 text-lime-400 font-semibold border border-lime-400/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <MemberBottomNav />

      <ToastContainer />
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};
