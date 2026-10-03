import React, { useState } from 'react';
import { useClub, AppView } from '../../context/ClubContext';
import {
  Calendar,
  ShoppingBag,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    isAuthenticated,
    logout,
    cart,
  } = useClub();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const publicNavLinks: { label: string; view: AppView }[] = [
    { label: 'Home', view: 'public_home' },
    { label: 'About', view: 'public_about' },
    { label: 'Courts', view: 'public_courts' },
    { label: 'Shop', view: 'public_shop' },
    { label: 'Bar & Cafe', view: 'public_bar' },
    { label: 'Contact', view: 'public_contact' },
  ];

  const handleBookCourtClick = () => {
    setCurrentView('public_courts');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Champions Club logo: CHAMPIONS.CLUB */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('public_home')}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm tracking-tighter shadow-xs group-hover:scale-105 transition-transform">
              CC
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 uppercase group-hover:text-blue-600 transition-colors font-mono">
              CHAMPIONS.CLUB
            </span>
          </button>
        </div>

        {/* Center / Main navigation: Home, About, Courts, Shop, Bar & Cafe, Contact */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
          {publicNavLinks.map((link) => {
            const isActive = currentView === link.view;
            return (
              <button
                key={link.view}
                onClick={() => setCurrentView(link.view)}
                className={`transition-colors py-1 relative text-xs tracking-wide uppercase font-semibold ${
                  isActive
                    ? 'text-blue-600 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Login, Sign Up, "Book a Court" button */}
        <div className="flex items-center gap-3">
          {/* Cart Icon preview if visitor added products to cart */}
          {cartCount > 0 && (
            <button
              onClick={() => setCurrentView('public_shop')}
              className="relative p-2 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 transition-colors"
              title="View Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            </button>
          )}

          {!isAuthenticated ? (
            /* Unauthenticated Visitor Options */
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('public_login')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                Login
              </button>

              <button
                onClick={() => setCurrentView('public_signup')}
                className="hidden sm:inline-flex px-3.5 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                Sign Up
              </button>

              {/* Book a Court Button */}
              <button
                onClick={handleBookCourtClick}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book a Court</span>
              </button>
            </div>
          ) : (
            /* Authenticated User Options */
            <div className="flex items-center gap-2.5">
              {currentUser.role === 'member' ? (
                <button
                  onClick={() => setCurrentView('member_portal')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-700 border border-blue-200"
                >
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>My Member Portal</span>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentView('admin_dashboard')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 border border-slate-200"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Staff / Club ERP</span>
                </button>
              )}

              {/* Book a Court Button */}
              <button
                onClick={handleBookCourtClick}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Court</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200 shadow-md">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 px-3 py-1">
            Menu
          </div>
          {publicNavLinks.map((link) => (
            <button
              key={link.view}
              onClick={() => {
                setCurrentView(link.view);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                currentView === link.view
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {link.label}
            </button>
          ))}

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setCurrentView('public_login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold transition-colors"
                >
                  Login to Account
                </button>
                <button
                  onClick={() => {
                    setCurrentView('public_signup');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
                >
                  Create Account
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out ({currentUser.name})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
