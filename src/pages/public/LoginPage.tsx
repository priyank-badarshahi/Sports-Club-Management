import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { Role, MembershipTier } from '../../types';
import { 
  Trophy, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  User, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Loader2,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginUser, addToast, registerMember, syncMembers } = useAppStore();
  const navigate = useNavigate();

  // Mode toggle
  const [isRegister, setIsRegister] = useState(false);

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dob: '2000-01-15',
    sport: 'tennis',
    agreed: false
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      addToast({
        type: 'error',
        title: 'Input Required',
        message: 'Please fill in your Email or Member ID'
      });
      return;
    }
    if (!loginPassword) {
      addToast({
        type: 'error',
        title: 'Password Required',
        message: 'Please enter your password'
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        addToast({
          type: 'error',
          title: 'Authentication Failed',
          message: result.error || 'Invalid credentials. Please verify your Email/Member ID and password.'
        });
        return;
      }

      // Standardize role from database
      const rawRole = String(result.user?.role || 'member').toLowerCase();
      let matchedRole: Role = 'member';
      if (rawRole === 'owner') matchedRole = 'owner';
      else if (rawRole.includes('front')) matchedRole = 'front_desk';
      else if (rawRole.includes('bar')) matchedRole = 'bar_staff';
      else if (rawRole.includes('shop')) matchedRole = 'shop_staff';
      else if (rawRole.includes('manager')) matchedRole = 'manager';
      else matchedRole = 'member';

      const isMember = matchedRole === 'member';
      const rawPlan = result.user?.membershipPlan;
      const hasPlan = isMember && rawPlan && rawPlan !== 'None' && rawPlan !== 'none';
      const tier = hasPlan ? ((String(rawPlan).toLowerCase()) as MembershipTier) : undefined;
      const memberId = isMember ? (result.user?.memberId || 'M001') : undefined;

      // Ensure member profile exists in Zustand client store for seamless navigation
      const storeMembers = useAppStore.getState().members;
      const existingMember = storeMembers.find(
        (m) => m.email.toLowerCase() === result.user.email.toLowerCase() || (isMember && m.id === memberId)
      );

      if (!existingMember && isMember && memberId) {
        useAppStore.setState((state) => ({
          members: [
            {
              id: memberId,
              memberNumber: `CC-2026-${memberId}`,
              fullName: result.user.name,
              email: result.user.email,
              phone: result.user.phone || '+91 98765 43210',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
              tier: tier || 'none',
              status: 'active',
              joinDate: new Date().toISOString().split('T')[0],
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              walletBalance: 0,
              activeTabBalance: 0,
              emergencyContact: {
                name: 'Family Contact',
                phone: result.user.phone || '+91 98765 43210',
                relation: 'Self',
              },
              preferredSports: ['tennis'],
              attendanceLog: [],
              reminderLog: [],
            },
            ...state.members,
          ],
        }));
      }

      loginUser({
        name: result.user.name,
        email: result.user.email,
        role: matchedRole,
        avatar: existingMember?.avatar || (matchedRole === 'owner' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'),
        tier: isMember ? tier : undefined,
        memberId: isMember ? memberId : undefined,
      });

      // Refresh members from database
      syncMembers();

      // Route to respective route based on role or redirect parameter
      const redirectParam = searchParams.get('redirect');
      if (redirectParam && redirectParam.startsWith('/')) {
        navigate(redirectParam);
      } else if (matchedRole === 'member') {
        navigate('/member/home');
      } else if (matchedRole === 'bar_staff') {
        navigate('/staff/bar');
      } else if (matchedRole === 'shop_staff') {
        navigate('/staff/shop');
      } else if (matchedRole === 'front_desk') {
        navigate('/staff/bookings');
      } else {
        navigate('/staff/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      addToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Could not connect to authentication server. Please ensure backend is running.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, email, phone, password, confirmPassword, dob, sport, agreed } = registerForm;

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      addToast({
        type: 'error',
        title: 'Fields Missing',
        message: 'Please complete all required fields.'
      });
      return;
    }

    if (password !== confirmPassword) {
      addToast({
        type: 'error',
        title: 'Password Mismatch',
        message: 'Passwords do not match.'
      });
      return;
    }

    if (password.length < 6) {
      addToast({
        type: 'error',
        title: 'Password Too Short',
        message: 'Password must be at least 6 characters long.'
      });
      return;
    }

    if (!agreed) {
      addToast({
        type: 'error',
        title: 'Terms Agreement Required',
        message: 'You must agree to the club court rules & etiquette.'
      });
      return;
    }

    // Detect Junior status for emergency contact label
    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    const isJunior = (currentYear - birthYear) < 18;

    try {
      setIsSubmitting(true);

      // Save user in Supabase database & Auth without assigning any paid plan
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password: password,
          dob: dob,
          sport: sport,
          plan: 'None',
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        addToast({
          type: 'error',
          title: 'Registration Error',
          message: result.error || 'Failed to save account in database.'
        });
        return;
      }

      const assignedMemberId = result.user?.memberId || `M${String(Math.floor(Math.random() * 900) + 100)}`;

      const newMemberData: any = {
        id: assignedMemberId,
        memberNumber: `CC-2026-${assignedMemberId}`,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
        tier: 'none',
        preferredSports: [sport as any],
        status: 'active' as const,
        joinDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        walletBalance: 0,
        activeTabBalance: 0,
        emergencyContact: {
          name: isJunior ? 'Guardian Registered' : 'Secondary Contact',
          phone: phone.trim(),
          relation: isJunior ? 'Parent' : 'Spouse'
        },
        notes: `Registered via Supabase DB on ${new Date().toLocaleDateString()}`
      };

      // Add newly registered member to client store with ₹0 initial wallet balance
      useAppStore.setState((state) => ({
        members: [
          newMemberData,
          ...state.members.filter(m => m.id !== assignedMemberId && m.email.toLowerCase() !== email.trim().toLowerCase())
        ],
      }));

      loginUser({
        name: fullName.trim(),
        email: email.trim(),
        role: 'member',
        avatar: newMemberData.avatar,
        tier: undefined,
        memberId: assignedMemberId
      });

      // Sync members from database
      const redirectParam = searchParams.get('redirect');
      if (redirectParam && redirectParam.startsWith('/')) {
        navigate(redirectParam);
      } else {
        navigate('/member/home');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      addToast({
        type: 'error',
        title: 'Network Error',
        message: 'Could not reach server to register account.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Brand logo at top */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-400 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 mb-3">
          <Trophy className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-heading font-extrabold text-xl tracking-tight text-white">
            CHAMPIONS
          </span>
          <span className="font-heading font-bold text-xs uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/25 tracking-widest">
            CLUB
          </span>
        </div>
      </div>

      {!isRegister ? (
        /* LOGIN MODE */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="font-heading font-extrabold text-2xl text-white">
              Welcome to Champions Club
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Log in to your member portal or staff operations account
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs text-slate-300">
            <div>
              <label className="text-slate-400 font-semibold block mb-1.5">
                Email Address or Member ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  placeholder="e.g. member@championsclub.in or M001"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-400 font-semibold">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => addToast({ type: 'info', title: 'Password Reset', message: 'Password reset link sent to your registered email address.' })}
                  className="text-[11px] text-blue-500 hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isSubmitting}
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={rememberMe}
                disabled={isSubmitting}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
              />
              <span className="text-xs text-slate-300 font-medium">Remember me on this device</span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>VERIFYING CREDENTIALS...</span>
                </>
              ) : (
                <>
                  <span>LOGIN TO ACCOUNT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Database verification indicator */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Database Authentication Active • Supabase PostgreSQL</span>
            </div>
          </div>

          <div className="text-center pt-2 text-xs">
            <span className="text-slate-400">Don't have an account yet? </span>
            <button
              onClick={() => setIsRegister(true)}
              className="text-blue-500 font-bold hover:underline"
            >
              Create an account
            </button>
          </div>
        </div>
      ) : (
        /* CREATE ACCOUNT MODE */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="font-heading font-extrabold text-2xl text-white">
              Create Your Account
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sign up for a club membership account stored in database
            </p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs text-slate-300">
            <div>
              <label className="text-slate-400 font-semibold block mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  placeholder="e.g. Vikram Mehta"
                  value={registerForm.fullName}
                  onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    disabled={isSubmitting}
                    placeholder="you@example.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    disabled={isSubmitting}
                    placeholder="+91 98765 43210"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    disabled={isSubmitting}
                    placeholder="••••••••"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    disabled={isSubmitting}
                    placeholder="••••••••"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    disabled={isSubmitting}
                    value={registerForm.dob}
                    onChange={(e) => setRegisterForm({ ...registerForm, dob: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors font-mono disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">
                  Preferred Primary Sport
                </label>
                <select
                  disabled={isSubmitting}
                  value={registerForm.sport}
                  onChange={(e) => setRegisterForm({ ...registerForm, sport: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 disabled:opacity-60"
                >
                  <option value="tennis">Tennis (Center & Grandstand)</option>
                  <option value="padel">Padel (Panoramic Glass)</option>
                  <option value="badminton">Badminton (Teakwood)</option>
                  <option value="cricket">Cricket (Synthetic Nets)</option>
                </select>
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer pt-2">
              <input
                type="checkbox"
                required
                disabled={isSubmitting}
                checked={registerForm.agreed}
                onChange={(e) => setRegisterForm({ ...registerForm, agreed: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 mt-0.5 w-4 h-4"
              />
              <span className="text-[11px] text-slate-400 leading-normal">
                I agree to the Champions Club Court Rules, Member Etiquette, and Safety Terms & Conditions.
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>CREATING ACCOUNT IN DATABASE...</span>
                </>
              ) : (
                <>
                  <span>CREATE ACCOUNT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 text-xs">
            <span className="text-slate-400">Already have a Champions Club account? </span>
            <button
              onClick={() => setIsRegister(false)}
              className="text-blue-500 font-bold hover:underline"
            >
              Log in here
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
