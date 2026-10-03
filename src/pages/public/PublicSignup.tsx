import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import {
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const PublicSignup: React.FC = () => {
  const { signup, setCurrentView } = useClub();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('2000-01-15');
  const [preferredSport, setPreferredSport] = useState('Tennis');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreedTerms) {
      setError('Please agree to the Champions Club Terms & Conditions.');
      return;
    }

    const res = signup({
      name,
      email,
      phone,
      password,
      preferredSport,
      dateOfBirth,
    });

    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error || 'Failed to create account.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-lg w-full space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-xs">
              CC
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Create Your Champions Account
            </h2>
            <p className="text-xs text-slate-500">
              Join Champions Club for court booking, member privileges, pro shop discounts, and cafeteria lounge access.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Account Created Successfully!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Welcome to Champions Club, {name}! Your member profile has been registered with active privileges.
              </p>
              <button
                onClick={() => setCurrentView('member_portal')}
                className="mt-4 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-2 mx-auto"
              >
                <span>Enter Member Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Mehta"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Preferred Primary Sport
                  </label>
                  <select
                    value={preferredSport}
                    onChange={(e) => setPreferredSport(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                  >
                    <option value="Tennis">Tennis (Center & Grandstand)</option>
                    <option value="Padel">Padel (Glass Court)</option>
                    <option value="Badminton">Badminton (Arena)</option>
                    <option value="Cricket">Cricket & Multi-sport</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    required
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                  />
                  <span className="text-[11px] leading-relaxed">
                    I agree to the Champions Club Court Rules, Member Etiquette, and Safety Terms & Conditions.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <span className="text-slate-500 text-xs">Already have a Champions Club account? </span>
            <button
              onClick={() => setCurrentView('public_login')}
              className="font-bold text-blue-600 hover:underline text-xs"
            >
              Log in here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
