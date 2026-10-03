import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CalendarPlus, ShoppingBag, Coffee, User } from 'lucide-react';
import { useAppStore } from '../store';

export const MemberBottomNav: React.FC = () => {
  const { tabs, currentUser } = useAppStore();

  const userTab = tabs.find((t) => t.memberId === currentUser.memberId && t.status === 'open');

  const items = [
    { label: 'Home', path: '/member/home', icon: Home },
    { label: 'Book Court', path: '/member/book', icon: CalendarPlus },
    { label: 'Pro Shop', path: '/member/shop', icon: ShoppingBag },
    { 
      label: 'Bar Tab', 
      path: '/member/tab', 
      icon: Coffee,
      badge: userTab ? 'Active' : undefined 
    },
    { label: 'Profile', path: '/member/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full relative py-1 transition-colors ${
                  isActive
                    ? 'text-lime-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {item.badge && (
                      <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-lime-400 ring-2 ring-slate-950" />
                    )}
                  </div>
                  <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-lime-400" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
