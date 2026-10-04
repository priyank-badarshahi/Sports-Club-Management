import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Phone, Mail, MapPin, Clock, Award, ShieldCheck, Instagram, Twitter, Facebook } from 'lucide-react';
import { useAppStore } from '../store';

export const Footer: React.FC = () => {
  const { settings } = useAppStore();

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-sm mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1: Brand & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-lime-500 via-lime-400 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-lime-500/20">
                <Trophy className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                SPORTS CLUB <span className="text-lime-400">GUJARAT</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Sports Club Gujarat is a multi-sport destination in Ahmedabad offering dedicated facilities for Box Cricket, Table Tennis, Badminton, Volleyball, Kho Kho, and Hockey, along with training, recreation, bookings, and a sport-specific Pro Shop.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#social" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-lime-400 hover:border-lime-400/40 transition">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#social" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-lime-400 hover:border-lime-400/40 transition">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#social" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-lime-400 hover:border-lime-400/40 transition">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Sports & Courts */}
          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-white mb-3">
              Sports & Courts
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/courts" className="hover:text-lime-400 transition">Box Cricket</Link></li>
              <li><Link to="/courts" className="hover:text-lime-400 transition">Table Tennis</Link></li>
              <li><Link to="/courts" className="hover:text-lime-400 transition">Badminton</Link></li>
              <li><Link to="/courts" className="hover:text-lime-400 transition">Volleyball</Link></li>
              <li><Link to="/courts" className="hover:text-lime-400 transition">Kho Kho</Link></li>
              <li><Link to="/courts" className="hover:text-lime-400 transition">Hockey</Link></li>
              <li><Link to="/availability" className="hover:text-lime-400 transition">Facility Availability</Link></li>
              <li><Link to="/courts" className="hover:text-lime-400 transition">Sports Booking</Link></li>
            </ul>
          </div>

          {/* Col 3: Memberships & Perks */}
          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-white mb-3">
              Memberships
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/plans" className="hover:text-lime-400 transition">Gold Championship Tier</Link></li>
              <li><Link to="/plans" className="hover:text-lime-400 transition">Silver Club Membership</Link></li>
              <li><Link to="/plans" className="hover:text-lime-400 transition">Junior Academy (U-18)</Link></li>
              <li><Link to="/plans" className="hover:text-lime-400 transition">Casual Walk-in Rates</Link></li>
              <li><Link to="/shop" className="hover:text-lime-400 transition">Pro Gear Pro Shop</Link></li>
              <li><Link to="/contact" className="hover:text-lime-400 transition">Corporate Enquiries</Link></li>
            </ul>
          </div>

          {/* Col 4: Location & Operating Hours */}
          <div>
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-white mb-3">
              Club Hours & Desk
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-lime-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Mon - Fri:</strong> {settings.operatingHours.weekdays}<br />
                  <strong>Sat - Sun:</strong> {settings.operatingHours.weekends}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                <span>+91 8128559262</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                <span>ghmilan66@gmail.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-lime-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">Sports Club Gujarat, SP Stadium Area, Ahmedabad, Gujarat, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}

      </div>
    </footer>
  );
};
