import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { StaffLayout } from './layouts/StaffLayout';
import { MemberLayout } from './layouts/MemberLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { CourtsPage } from './pages/public/CourtsPage';
import { PlansPage } from './pages/public/PlansPage';
import { AvailabilityPage } from './pages/public/AvailabilityPage';
import { ShopPage } from './pages/public/ShopPage';
import { BookTrialPage } from './pages/public/BookTrialPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/public/LoginPage';
import { CoachingEventsPage } from './pages/public/CoachingEventsPage';

// Member Pages
import { MemberHomePage } from './pages/member/MemberHomePage';
import { MemberBookPage } from './pages/member/MemberBookPage';
import { MemberShopPage } from './pages/member/MemberShopPage';
import { MemberTabPage } from './pages/member/MemberTabPage';
import { MemberProfilePage } from './pages/member/MemberProfilePage';

// Staff Pages
import { StaffDashboardPage } from './pages/staff/StaffDashboardPage';
import { StaffBookingsPage } from './pages/staff/StaffBookingsPage';
import { StaffMembersPage } from './pages/staff/StaffMembersPage';
import { StaffShopPage } from './pages/staff/StaffShopPage';
import { StaffBarPage } from './pages/staff/StaffBarPage';
import { StaffCrmPage } from './pages/staff/StaffCrmPage';
import { StaffFinancePage } from './pages/staff/StaffFinancePage';
import { StaffHrPage } from './pages/staff/StaffHrPage';
import { StaffSettingsPage } from './pages/staff/StaffSettingsPage';
import { StaffMessagesPage } from './pages/staff/StaffMessagesPage';

export default function App() {
  const { theme, runLifecycleRemindersCheck, pullFromSupabase } = useAppStore();

  useEffect(() => {
    runLifecycleRemindersCheck();
    pullFromSupabase().then(success => {
      if (success) {
        console.log('Successfully synchronized application data from Supabase backend tables.');
      }
    });

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'champions_club_app_state_v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          useAppStore.setState(parsed);
        } catch (err) {
          console.error('Failed to sync state from storage event:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [runLifecycleRemindersCheck]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="courts" element={<CourtsPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="availability" element={<AvailabilityPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="coaching" element={<CoachingEventsPage />} />
          <Route path="book-trial" element={<BookTrialPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="login" element={<LoginPage />} />
        </Route>

        {/* Member Routes */}
        <Route path="member" element={<MemberLayout />}>
          <Route index element={<Navigate to="/member/home" replace />} />
          <Route path="home" element={<MemberHomePage />} />
          <Route path="book" element={<MemberBookPage />} />
          <Route path="shop" element={<MemberShopPage />} />
          <Route path="tab" element={<MemberTabPage />} />
          <Route path="profile" element={<MemberProfilePage />} />
        </Route>

        {/* Staff Routes */}
        <Route path="staff" element={<StaffLayout />}>
          <Route index element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="dashboard" element={<StaffDashboardPage />} />
          <Route path="bookings" element={<StaffBookingsPage />} />
          <Route path="members" element={<StaffMembersPage />} />
          <Route path="shop" element={<StaffShopPage />} />
          <Route path="bar" element={<StaffBarPage />} />
          <Route path="crm" element={<StaffCrmPage />} />
          <Route path="finance" element={<StaffFinancePage />} />
          <Route path="hr" element={<StaffHrPage />} />
          <Route path="messages" element={<StaffMessagesPage />} />
          <Route path="settings" element={<StaffSettingsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
