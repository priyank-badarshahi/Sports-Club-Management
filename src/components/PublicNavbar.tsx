import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Calendar, Compass, ShieldCheck, ShoppingBag, PhoneCall, Sparkles, LogIn, Menu, X } from 'lucide-react';
import { useAppStore } from '../store';

export const PublicNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentRole } = useAppStore();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Courts', path: '/courts' },
    { label: 'Plans & Pricing', path: '/plans' },
    { label: 'Court Availability', path: '/availability' },
    { label: 'Coaching & Events', path: '/coaching' },
    { label: 'Pro Shop', path: '/shop' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-slate-900/60 border-b border-slate-800/60 sticky top-16 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-lime-400/10 text-lime-400 font-semibold border border-lime-400/30 shadow-sm shadow-lime-400/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right Action CTAs */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/book-trial"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Book a Trial Session</span>
            </Link>

            {currentRole === 'visitor' ? (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                <LogIn className="w-3.5 h-3.5 text-lime-400" />
                <span>Portal Login</span>
              </Link>
            ) : currentRole === 'member' ? (
              <Link
                to="/member/home"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/30 text-xs font-semibold hover:bg-amber-400/20 transition"
              >
                <span>Member Portal →</span>
              </Link>
            ) : (
              <Link
                to="/staff/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-semibold hover:bg-sky-500/20 transition"
              >
                <span>Staff Console →</span>
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center justify-between w-full py-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Champions Navigation
            </span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-lime-400/15 text-lime-400 font-semibold border border-lime-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <Link
              to="/book-trial"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-lime-400 text-slate-950 font-bold text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Book a Trial Session</span>
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 text-sm font-medium border border-slate-700"
            >
              <LogIn className="w-4 h-4 text-lime-400" />
              <span>Member & Staff Login</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
