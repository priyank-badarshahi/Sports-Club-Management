import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { ToastContainer } from '../components/ToastContainer';
import { GlobalSearchModal } from '../components/GlobalSearchModal';

export const PublicLayout: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#080d1a] text-slate-100 transition-colors">
      <Header onOpenSearch={() => setSearchOpen(true)} />
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};
