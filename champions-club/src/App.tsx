import React, { useState } from 'react';
import { ClubProvider, useClub, AppView } from './context/ClubContext';
import { Navbar } from './components/common/Navbar';
import { AppHeader } from './components/common/AppHeader';
import { Sidebar } from './components/common/Sidebar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

// Public Pages
import { PublicHome } from './pages/public/PublicHome';
import { PublicAbout } from './pages/public/PublicAbout';
import { PublicMemberships } from './pages/public/PublicMemberships';
import { PublicCourts } from './pages/public/PublicCourts';
import { PublicShop } from './pages/public/PublicShop';
import { PublicBar } from './pages/public/PublicBar';
import { PublicSocialPlay } from './pages/public/PublicSocialPlay';
import { PublicContact } from './pages/public/PublicContact';
import { PublicLogin } from './pages/public/PublicLogin';
import { PublicSignup } from './pages/public/PublicSignup';

// Dashboard / ERP Pages
import { OwnerDashboard } from './pages/dashboard/OwnerDashboard';
import { MembersAdmin } from './pages/dashboard/MembersAdmin';
import { CourtsAdmin } from './pages/dashboard/CourtsAdmin';
import { BookingsAdmin } from './pages/dashboard/BookingsAdmin';
import { ShopAdmin } from './pages/dashboard/ShopAdmin';
import { BarPOS } from './pages/dashboard/BarPOS';
import { CRMAdmin } from './pages/dashboard/CRMAdmin';
import { EmployeesAdmin } from './pages/dashboard/EmployeesAdmin';
import { AccountingAdmin } from './pages/dashboard/AccountingAdmin';
import { ReportsAdmin } from './pages/dashboard/ReportsAdmin';
import { MemberPortal } from './pages/dashboard/MemberPortal';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView, isAuthenticated, currentUser } = useClub();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Check if current view is public or management portal
  const isPublicView = currentView.startsWith('public_');

  // Authorization check for ERP/admin views based on user role
  const isAuthorizedForView = (view: AppView): boolean => {
    if (view.startsWith('public_')) return true;
    if (!isAuthenticated) return false;

    // Member can only access member_portal
    if (currentUser.role === 'member') {
      return view === 'member_portal';
    }

    // Owner has full ERP access
    if (currentUser.role === 'owner') return true;

    // Front Desk
    if (currentUser.role === 'frontdesk') {
      return [
        'admin_bookings',
        'admin_members',
        'admin_courts',
        'admin_crm',
        'admin_accounting',
      ].includes(view);
    }

    // Shop Staff
    if (currentUser.role === 'shop') {
      return ['admin_shop', 'admin_accounting'].includes(view);
    }

    // Bar Staff
    if (currentUser.role === 'bar') {
      return ['admin_bar', 'admin_accounting'].includes(view);
    }

    // Manager
    if (currentUser.role === 'manager') {
      return [
        'admin_employees',
        'admin_courts',
        'admin_bookings',
        'admin_reports',
      ].includes(view);
    }

    return false;
  };

  // Render active public view
  const renderPublicView = () => {
    switch (currentView) {
      case 'public_home':
        return <PublicHome />;
      case 'public_about':
        return <PublicAbout />;
      case 'public_memberships':
        return <PublicMemberships />;
      case 'public_courts':
        return <PublicCourts />;
      case 'public_shop':
        return <PublicShop />;
      case 'public_bar':
        return <PublicBar />;
      case 'public_social':
        return <PublicSocialPlay />;
      case 'public_contact':
        return <PublicContact />;
      case 'public_login':
        return <PublicLogin />;
      case 'public_signup':
        return <PublicSignup />;
      default:
        return <PublicHome />;
    }
  };

  // Render active dashboard / ERP view
  const renderDashboardView = () => {
    switch (currentView) {
      case 'admin_dashboard':
        return <OwnerDashboard />;
      case 'admin_members':
        return <MembersAdmin />;
      case 'admin_courts':
        return <CourtsAdmin />;
      case 'admin_bookings':
        return <BookingsAdmin />;
      case 'admin_shop':
        return <ShopAdmin />;
      case 'admin_bar':
        return <BarPOS />;
      case 'admin_crm':
        return <CRMAdmin />;
      case 'admin_employees':
        return <EmployeesAdmin />;
      case 'admin_accounting':
        return <AccountingAdmin />;
      case 'admin_reports':
        return <ReportsAdmin />;
      case 'member_portal':
        return <MemberPortal />;
      default:
        return <OwnerDashboard />;
    }
  };

  // ENFORCE ROUTE PROTECTION
  if (!isPublicView) {
    // 1. Unauthenticated user trying to access private member/staff view
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1 flex flex-col justify-center">
            <PublicLogin />
          </main>
        </div>
      );
    }

    // 2. Authenticated user without required role permission
    if (!isAuthorizedForView(currentView)) {
      return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
          <Navbar />
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                You do not have permission to access this ERP module ({currentView}).
                Your current role is <span className="font-semibold capitalize text-slate-900">{currentUser.role}</span>.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (currentUser.role === 'member') {
                      setCurrentView('member_portal');
                    } else if (currentUser.role === 'bar') {
                      setCurrentView('admin_bar');
                    } else if (currentUser.role === 'shop') {
                      setCurrentView('admin_shop');
                    } else if (currentUser.role === 'frontdesk') {
                      setCurrentView('admin_bookings');
                    } else if (currentUser.role === 'manager') {
                      setCurrentView('admin_employees');
                    } else {
                      setCurrentView('admin_dashboard');
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 mx-auto shadow-xs transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Go to Authorized Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />

      {isPublicView ? (
        // Public Website Experience
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1">{renderPublicView()}</main>

          {/* Clean Editorial Light Public Footer */}
          <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-xs shadow-sm">
                    CC
                  </div>
                  <span className="font-extrabold text-slate-900 text-sm uppercase tracking-tight font-mono">
                    CHAMPIONS.CLUB
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Premier sports and recreation club offering championship courts, digital booking, high-performance pro shop, and courtside cafeteria dining.
                </p>
              </div>

              <div>
                <div className="font-bold text-slate-900 uppercase text-[11px] font-mono tracking-wider mb-3">
                  Explore Club
                </div>
                <ul className="space-y-2 text-xs">
                  <li>
                    <button onClick={() => setCurrentView('public_home')} className="hover:text-blue-600 transition-colors">
                      Home
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setCurrentView('public_about')} className="hover:text-blue-600 transition-colors">
                      About Champions Club
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setCurrentView('public_courts')} className="hover:text-blue-600 transition-colors">
                      Court Availability
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setCurrentView('public_shop')} className="hover:text-blue-600 transition-colors">
                      Pro Sports Shop
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setCurrentView('public_bar')} className="hover:text-blue-600 transition-colors">
                      Bar & Cafeteria Menu
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setCurrentView('public_contact')} className="hover:text-blue-600 transition-colors">
                      Contact & Enquiries
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <div className="font-bold text-slate-900 uppercase text-[11px] font-mono tracking-wider mb-3">
                  Operating Hours
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-500">
                  <div>Courts: 06:00 – 22:30 Daily</div>
                  <div>Pro Shop: 08:00 – 21:00</div>
                  <div>Cafeteria: 07:00 – 23:00</div>
                  <div>Floodlit Play: 18:00 – 22:30</div>
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-900 uppercase text-[11px] font-mono tracking-wider mb-3">
                  Member & Staff Access
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  {isAuthenticated
                    ? `Logged in as ${currentUser.name} (${currentUser.role}).`
                    : 'Registered club members and authorized staff can log in to access portals.'}
                </p>
                {!isAuthenticated ? (
                  <button
                    onClick={() => setCurrentView('public_login')}
                    className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
                  >
                    Log In to Account →
                  </button>
                ) : currentUser.role === 'member' ? (
                  <button
                    onClick={() => setCurrentView('member_portal')}
                    className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
                  >
                    Go to Member Portal →
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentView('admin_dashboard')}
                    className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-sm"
                  >
                    Open Staff / Club ERP →
                  </button>
                )}
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
              <div>© 2026 Champions Club · Built for Sports Excellence & Modern Club Operations</div>
              <div className="mt-2 sm:mt-0 font-mono">Bengaluru, Karnataka · All Systems Operational</div>
            </div>
          </footer>
        </div>
      ) : (
        // Authenticated ERP / Member Portal Experience
        <div className="flex-1 flex overflow-hidden bg-slate-50">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            <AppHeader
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              onOpenSearch={() => setSearchModalOpen(true)}
            />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {renderDashboardView()}
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ClubProvider>
      <AppContent />
    </ClubProvider>
  );
}
