import React from 'react';
import { ClubProvider, useClub } from './context/ClubContext';
import { Navbar } from './components/common/Navbar';

// Public Pages
import { PublicHome } from './pages/public/PublicHome';
import { PublicLogin } from './pages/public/PublicLogin';
import { PublicSignup } from './pages/public/PublicSignup';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView, isAuthenticated, currentUser } = useClub();

  // Render active public view
  const renderPublicView = () => {
    switch (currentView) {
      case 'public_home':
        return <PublicHome />;
      case 'public_login':
        return <PublicLogin />;
      case 'public_signup':
        return <PublicSignup />;
      default:
        return <PublicHome />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Public Website Experience */}
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
                    Home & About
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
                Member Access
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                {isAuthenticated
                  ? `Logged in as ${currentUser.name}.`
                  : 'Registered club members can log in.'}
              </p>
              {!isAuthenticated ? (
                <button
                  onClick={() => setCurrentView('public_login')}
                  className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  Log In to Account →
                </button>
              ) : (
                <button
                  onClick={() => setCurrentView('public_home')}
                  className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  Welcome back, {currentUser.name}
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
