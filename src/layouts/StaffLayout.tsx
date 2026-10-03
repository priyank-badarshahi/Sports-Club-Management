import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { StaffSidebar } from '../components/StaffSidebar';
import { ToastContainer } from '../components/ToastContainer';
import { GlobalSearchModal } from '../components/GlobalSearchModal';
import { Member360Drawer } from '../components/Member360Drawer';
import { StaffGlobalSearchBar } from '../components/StaffGlobalSearchBar';
import { useAppStore } from '../store';
import { ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';

export const StaffLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { currentRole, setRole } = useAppStore();

  const isStaffRole = ['front_desk', 'bar_staff', 'shop_staff', 'manager', 'owner'].includes(currentRole);

  return (
    <div className="min-h-screen flex flex-col bg-[#080d1a] text-slate-100 transition-colors">
      <Header 
        onOpenSearch={() => setSearchOpen(true)}
        showSidebarToggle={true}
        onToggleSidebar={() => setMobileOpen(!mobileOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <StaffSidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Universal Staff Member Search & QR Scan Bar */}
          {isStaffRole && (
            <div className="max-w-7xl mx-auto">
              <StaffGlobalSearchBar />
            </div>
          )}

          {!isStaffRole ? (
            <div className="max-w-md mx-auto my-12 p-6 rounded-2xl bg-slate-900 border border-amber-500/30 text-center shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="font-heading font-bold text-lg text-white">Staff Credentials Required</h2>
              <p className="text-xs text-slate-400 mt-2">
                You are currently viewing as <strong>{currentRole}</strong>. Switch to a staff role to access administrative modules:
              </p>
              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={() => setRole('manager')}
                  className="w-full py-2.5 px-4 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Switch to General Manager (Arjun Rao)</span>
                </button>
                <button
                  onClick={() => setRole('front_desk')}
                  className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
                >
                  <span>Switch to Front Desk (Priya Sharma)</span>
                </button>
                <Link
                  to="/"
                  className="text-xs text-slate-400 hover:text-white mt-2 block"
                >
                  ← Return to Public Homepage
                </Link>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          )}
        </main>
      </div>

      <Member360Drawer />
      <ToastContainer />
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};
