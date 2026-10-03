import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, DEMO_USERS } from '../../store';
import { Role } from '../../types';
import { 
  Trophy, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  User, 
  Phone, 
  Calendar, 
  Compass, 
  Check, 
  ShieldCheck, 
  Coffee, 
  UserCheck,
  Users 
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { setRole, setCurrentUser, addToast, registerMember } = useAppStore();
  const navigate = useNavigate();

  // Mode toggle
  const [isRegister, setIsRegister] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('password');
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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      addToast({
        type: 'error',
        title: 'Input Required',
        message: 'Please fill in your Email or Member ID'
      });
      return;
    }

    // Attempt to log in with input email
    const emailLower = loginEmail.toLowerCase();
    let matchedRole: Role = 'visitor';

    if (emailLower.includes('owner') || emailLower.includes('rajesh')) {
      matchedRole = 'owner';
    } else if (emailLower.includes('priya') || emailLower.includes('front')) {
      matchedRole = 'front_desk';
    } else if (emailLower.includes('rohan') || emailLower.includes('bar')) {
      matchedRole = 'bar_staff';
    } else if (emailLower.includes('ananya') || emailLower.includes('shop')) {
      matchedRole = 'shop_staff';
    } else if (emailLower.includes('arjun') || emailLower.includes('manager')) {
      matchedRole = 'manager';
    } else {
      matchedRole = 'member'; // Default match is member
    }

    const matchedUser = DEMO_USERS[matchedRole];
    setCurrentUser({
      ...matchedUser,
      email: loginEmail
    });
    setRole(matchedRole);

    addToast({
      type: 'success',
      title: 'Login Successful',
      message: `Welcome back, ${matchedUser.name}! Session started as ${matchedRole.toUpperCase().replace('_', ' ')}.`
    });

    // Navigate to respective route
    if (matchedRole === 'member') {
      navigate('/member/home');
    } else if (matchedRole === 'bar_staff') {
      navigate('/staff/bar');
    } else if (matchedRole === 'shop_staff') {
      navigate('/staff/shop');
    } else {
      navigate('/staff/dashboard');
    }
  };

  const handleOneClickLogin = (role: Role) => {
    const user = DEMO_USERS[role];
    setCurrentUser(user);
    setRole(role);

    addToast({
      type: 'success',
      title: 'Session Started',
      message: `Switched to ${user.name} (${role.toUpperCase().replace('_', ' ')})`
    });

    if (role === 'member') {
      navigate('/member/home');
    } else if (role === 'bar_staff') {
      navigate('/staff/bar');
    } else if (role === 'shop_staff') {
      navigate('/staff/shop');
    } else {
      navigate('/staff/dashboard');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, email, phone, password, confirmPassword, dob, sport, agreed } = registerForm;

    if (!fullName || !email || !phone) {
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

    if (!agreed) {
      addToast({
        type: 'error',
        title: 'Terms Agreement Required',
        message: 'You must agree to the club court rules & etiquette.'
      });
      return;
    }

    // Detect Junior status
    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    const isJunior = (currentYear - birthYear) < 18;
    const tier = isJunior ? 'junior' : 'gold';

    const newMemberData = {
      fullName,
      phone,
      email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      tier: tier as any,
      preferredSports: [sport as any],
      status: 'active' as const,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year
      walletBalance: 2000, // Seed welcome balance
      activeTabBalance: 0,
      emergencyContact: {
        name: isJunior ? 'Guardian Registered' : 'Secondary Contact',
        phone,
        relation: isJunior ? 'Parent' : 'Spouse'
      },
      notes: `Self-registered online on ${new Date().toLocaleDateString()}`
    };

    // Register and log in
    const regResult = registerMember(newMemberData, 'card', 5000, 'annual');
    setCurrentUser({
      name: regResult.member.fullName,
      email: regResult.member.email,
      role: 'member',
      avatar: regResult.member.avatar,
      tier: regResult.member.tier,
      memberId: regResult.member.id
    });
    setRole('member');

    addToast({
      type: 'success',
      title: 'Account Created Successfully!',
      message: `Welcome to Champions Club, ${fullName}! Logged in as ${tier.toUpperCase()} Member.`
    });

    navigate('/member/home');
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
                  placeholder="e.g. member@championsclub.demo or M001"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
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
                  onClick={() => addToast({ type: 'info', title: 'Demo Password', message: 'Any password works for demo context!' })}
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
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
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
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
              />
              <span className="text-xs text-slate-300 font-medium">Remember me on this device</span>
            </label>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-transform active:scale-95"
            >
              <span>LOGIN TO ACCOUNT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* ONE-CLICK DEMO AUTH PANEL */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>ONE-CLICK ROLE LOGIN</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium font-mono uppercase">
                Evaluation Ready
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-left">
              {/* Member Card */}
              <button
                onClick={() => handleOneClickLogin('member')}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 transition text-left space-y-1 group"
              >
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Member Portal</span>
                </div>
                <p className="text-[10px] text-slate-400 group-hover:text-slate-300">Rahul Patel (Gold)</p>
              </button>

              {/* Owner Card */}
              <button
                onClick={() => handleOneClickLogin('owner')}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 transition text-left space-y-1 group"
              >
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Club Owner ERP</span>
                </div>
                <p className="text-[10px] text-slate-400 group-hover:text-slate-300">Full Executive Suite</p>
              </button>

              {/* Front Desk Card */}
              <button
                onClick={() => handleOneClickLogin('front_desk')}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 transition text-left space-y-1 group"
              >
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>Front Desk</span>
                </div>
                <p className="text-[10px] text-slate-400 group-hover:text-slate-300">Bookings & CRM</p>
              </button>

              {/* Bar Staff Card */}
              <button
                onClick={() => handleOneClickLogin('bar_staff')}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 transition text-left space-y-1 group"
              >
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Coffee className="w-3.5 h-3.5 text-blue-400" />
                  <span>Bar & Cafe Staff</span>
                </div>
                <p className="text-[10px] text-slate-400 group-hover:text-slate-300">POS & Table Tabs</p>
              </button>
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
              Sign up for a club membership session account
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
                  placeholder="e.g. Vikram Mehta"
                  value={registerForm.fullName}
                  onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
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
                    placeholder="you@example.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
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
                    placeholder="+91 98765 43210"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
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
                    placeholder="••••••••"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
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
                    placeholder="••••••••"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
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
                    value={registerForm.dob}
                    onChange={(e) => setRegisterForm({ ...registerForm, dob: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">
                  Preferred Primary Sport
                </label>
                <select
                  value={registerForm.sport}
                  onChange={(e) => setRegisterForm({ ...registerForm, sport: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
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
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-transform active:scale-95"
            >
              <span>CREATE ACCOUNT</span>
              <ArrowRight className="w-4 h-4" />
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
