import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { CRMLead } from '../../types';
import { Mail, Phone, MapPin, Send, CheckCircle2, ArrowRight } from 'lucide-react';

export const PublicContact: React.FC = () => {
  const { addLead, setCurrentView } = useClub();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interestedIn: 'Gold Membership' as CRMLead['interestedIn'],
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) return;

    addLead({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      interestedIn: formData.interestedIn,
      source: 'Website',
      notes: formData.message || `Website enquiry received for ${formData.interestedIn}.`,
      estimatedValue:
        formData.interestedIn === 'Gold Membership'
          ? 45000
          : formData.interestedIn === 'Silver Membership'
          ? 28000
          : formData.interestedIn === 'Junior Membership'
          ? 22000
          : 15000,
    });

    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold mb-3">
          <Mail className="w-3.5 h-3.5 text-emerald-600" />
          <span>Membership & Club Concierge</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Get in Touch with Champions Club
        </h1>
        <p className="text-slate-600 text-sm mt-3 leading-relaxed">
          Inquire about executive memberships, trial coaching sessions, corporate tournament hosting, or book a guided club facility walkthrough.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-5xl mx-auto">
        {/* Contact Info Card */}
        <div className="lg:col-span-5 bg-white text-slate-900 rounded-3xl p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
              Grounds & Concierge
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-1">Champions Club Grounds</h3>
            <p className="text-xs text-slate-500 mt-1">
              Main Arena, Courts 1-4 & Club House
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span className="text-slate-600">
                Plot 12B, Champions Sports Boulevard, Olympic Greens, Bangalore 560001
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-slate-700 font-mono font-medium">+91 (80) 4122-8800 / +91 98200 11223</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-slate-600">concierge@championsclub.in</span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-2 text-xs font-mono">
            <div className="text-slate-400 uppercase tracking-wider text-[11px] font-semibold">Operating Hours:</div>
            <div className="flex justify-between text-slate-700">
              <span>Courts 1 – 4:</span>
              <span className="font-semibold text-slate-900">06:00 AM – 10:30 PM Daily</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Pro Shop & Stringing:</span>
              <span className="font-semibold text-slate-900">08:00 AM – 09:00 PM</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Lounge & Cafeteria:</span>
              <span className="font-semibold text-slate-900">07:00 AM – 11:00 PM</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900">Send an Enquiry</h3>
              <p className="text-xs text-slate-500">
                Submissions automatically create a CRM lead for our front-desk concierge.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Jay Shah"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jay.shah@example.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98199 88776"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Interested In</label>
                <select
                  value={formData.interestedIn}
                  onChange={(e) => setFormData({ ...formData, interestedIn: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                >
                  <option value="Gold Membership">Gold Membership Plan</option>
                  <option value="Silver Membership">Silver Membership Plan</option>
                  <option value="Junior Membership">Junior Membership Plan</option>
                  <option value="Court Booking">Court Booking & League Play</option>
                  <option value="Trial Session">Trial Coaching Clinic</option>
                  <option value="Shop">Pro Shop Equipment & Bulk Inquiries</option>
                  <option value="General Enquiry">General / Event Hosting</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message / Requirements</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your sporting interests, preferred court days, or family requirements..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Enquiry</span>
              </button>
            </form>
          ) : (
            <div className="py-12 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">Thank you, {formData.name}!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Our team will contact you shortly. Your request has been logged directly into our CRM Pipeline.
              </p>
              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => setCurrentView('public_home')}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5 shadow-xs"
                >
                  <span>Return to Home</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Submit Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
