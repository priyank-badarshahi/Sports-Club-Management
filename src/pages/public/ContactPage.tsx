import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { LeadInterest, SportType, MembershipTier } from '../../types';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Check, 
  ShieldCheck, 
  MessageSquare, 
  Sparkles, 
  Calendar,
  Building,
  GraduationCap,
  HelpCircle,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ContactPage: React.FC = () => {
  const { settings, addLead, addToast } = useAppStore();
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'membership' as LeadInterest,
    sports: ['tennis', 'padel'] as SportType[],
    interestedTier: 'gold' as MembershipTier,
    companyName: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) return;

    const refNum = `ENQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newLead = addLead({
      referenceNumber: refNum,
      fullName: formData.name,
      phone: formData.phone,
      email: formData.email,
      companyName: formData.companyName || undefined,
      interest: formData.interest,
      sportInterest: formData.sports,
      interestedTier: formData.interestedTier,
      source: 'website_contact',
      status: 'new',
      notes: `Web Inquiry [${formData.interest.toUpperCase()}]: ${formData.message || 'No additional message provided.'}`,
      followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // next day follow-up
    });

    setSubmittedRef(refNum);
    addToast({
      type: 'success',
      title: 'Inquiry Submitted',
      message: `Enquiry #${refNum} created. Front Desk & General Manager notified.`,
    });
  };

  const handleCopyRef = () => {
    if (!submittedRef) return;
    navigator.clipboard.writeText(submittedRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSport = (sport: SportType) => {
    if (formData.sports.includes(sport)) {
      if (formData.sports.length > 1) {
        setFormData({ ...formData, sports: formData.sports.filter((s) => s !== sport) });
      }
    } else {
      setFormData({ ...formData, sports: [...formData.sports, sport] });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-lime-400">
          Concierge & Membership Desk
        </span>
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white">
          Get in Touch with Champions Club
        </h1>
        <p className="text-sm text-slate-300">
          Have questions about memberships, coaching academies, corporate tournaments, or court reservations? Every enquiry is logged instantly to ensure zero dropped conversations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Card */}
        <div className="lg:col-span-1 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-xl text-white mb-6">Club Contact Details</h3>

            <div className="space-y-5 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block text-sm mb-0.5">Champions Club Complex</strong>
                  <span className="leading-relaxed">{settings.address}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-lime-400 shrink-0" />
                <div>
                  <strong className="text-white block text-sm mb-0.5">Concierge Phone</strong>
                  <span>{settings.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-lime-400 shrink-0" />
                <div>
                  <strong className="text-white block text-sm mb-0.5">Direct Email</strong>
                  <span>{settings.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block text-sm mb-0.5">Hours of Play</strong>
                  <span>Weekdays: {settings.operatingHours.weekdays}</span>
                  <br />
                  <span>Weekends: {settings.operatingHours.weekends}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="text-lime-400 font-bold block flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Fast Response SLA:
              </span>
              <span>Our dedicated Front Desk Concierge responds to all digital submissions in under 2 hours during club operating hours.</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-lime-400/10 border border-lime-400/20 text-[11px] text-slate-300 flex items-center justify-between">
              <span>Looking for a free court test session?</span>
              <Link to="/book-trial" className="text-lime-400 font-bold hover:underline">
                Book VIP Trial →
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Form or Confirmation */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-xl">
          {!submittedRef ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-heading font-bold text-xl text-white">Send an Enquiry</h3>
                <span className="text-xs text-slate-400">Guaranteed response within 2 hours</span>
              </div>

              {/* Interest Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  What are you primarily interested in? *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'membership', label: 'Membership', icon: Sparkles },
                    { id: 'trial', label: 'Trial Session', icon: Calendar },
                    { id: 'corporate', label: 'Corporate SLA', icon: Building },
                    { id: 'coaching', label: 'Coaching', icon: GraduationCap },
                    { id: 'other', label: 'Other', icon: HelpCircle },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = formData.interest === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, interest: t.id as LeadInterest })}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                          isSelected
                            ? 'bg-lime-400/15 border-lime-400 text-lime-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Your Full Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Dr. Rajesh Verma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address *</label>
                  <input
                    required
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Phone / WhatsApp Number *</label>
                  <input
                    required
                    type="tel"
                    placeholder="+91 98XXX XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Company / Organization (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Infosys, TCS, Self-employed"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-lime-400"
                  />
                </div>
              </div>

              {/* Sport Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Sports of Interest
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['tennis', 'padel', 'badminton', 'cricket'] as SportType[]).map((sport) => {
                    const active = formData.sports.includes(sport);
                    return (
                      <button
                        key={sport}
                        type="button"
                        onClick={() => toggleSport(sport)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition ${
                          active
                            ? 'bg-lime-400/20 border-lime-400 text-lime-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {sport}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Your Message / Requirements</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about preferred playing times, skill level, or event details..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-lime-400 placeholder-slate-500"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-lg shadow-lime-400/20 flex items-center justify-center gap-2 transition"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          ) : (
            <div className="p-8 text-center space-y-6 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-lime-400/20 text-lime-400 flex items-center justify-center mx-auto ring-8 ring-lime-400/10">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-lime-400">
                  Inquiry Logged in Champions CRM
                </span>
                <h3 className="font-heading font-extrabold text-2xl text-white">
                  Thank You, {formData.name}!
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Your enquiry has been received and routed directly to the Front Desk & General Manager.
                </p>
              </div>

              {/* Reference Number Box */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto space-y-3">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Official Enquiry Reference Number
                </span>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono font-bold text-2xl text-lime-400 tracking-wider">
                    {submittedRef}
                  </span>
                  <button
                    onClick={handleCopyRef}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Copy reference number"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-lime-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Please quote this reference if calling our concierge directly at {settings.phone}.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSubmittedRef(null);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      interest: 'membership',
                      sports: ['tennis', 'padel'],
                      interestedTier: 'gold',
                      companyName: '',
                      message: '',
                    });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
                >
                  Submit Another Note
                </button>
                <Link
                  to="/courts"
                  className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs transition"
                >
                  Explore Courts & Facilities
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
