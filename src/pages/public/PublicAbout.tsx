import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { SportsGraphic } from '../../components/common/SportsGraphic';
import {
  Zap,
  Award,
  Coffee,
  ShoppingBag,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Car,
  Users,
} from 'lucide-react';

export const PublicAbout: React.FC = () => {
  const { setCurrentView } = useClub();
  const [directionsNotice, setDirectionsNotice] = useState(false);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Header Banner */}
      <section className="bg-gradient-to-b from-white via-slate-50 to-blue-50/20 text-slate-900 py-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Established 2021 · Premier Athletic Community</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              About Champions Club
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Champions Club is a modern, tournament-grade athletic and recreation destination built for players who demand the best. From pristine floodlit acrylic hard courts and panoramic glass padel arenas to artisanal dining and a fully stocked pro shop, every detail is engineered for sporting excellence.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Our Sports */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-mono uppercase tracking-widest text-blue-600 font-semibold mb-2">
            Sports & Disciplines
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Our Championship Disciplines
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2">
            Professional facilities configured for both competitive play and social athletic recreation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              sport: 'Tennis',
              surface: 'Championship Acrylic Hard Court',
              specs: 'ITF Level 3 surface with 1200 lux LED tournament illumination. Ideal for singles, doubles, and coaching drills.',
              iconType: 'racket',
            },
            {
              sport: 'Padel',
              surface: 'Panoramic 12mm Tempered Glass Arena',
              specs: 'Mondo Supercourt turf with textured sand infill. Features open corner exits for pro tournament returns.',
              iconType: 'padel',
            },
            {
              sport: 'Badminton',
              surface: 'BWF-Approved Shock Absorbent Arena',
              specs: 'Multi-layer wood subfloor with anti-glare high-bay lighting and thermal climate conditioning.',
              iconType: 'badminton',
            },
            {
              sport: 'Cricket Turf & Nets',
              surface: 'High-Density All-Weather Turf',
              specs: 'Enclosed multi-lane practice cages equipped with precision automated programmable bowling machines.',
              iconType: 'balls',
            },
          ].map((item) => (
            <div
              key={item.sport}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-32 rounded-xl bg-slate-50 overflow-hidden mb-4 border border-slate-100">
                  <SportsGraphic type={item.iconType as any} className="w-full h-full" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{item.sport}</h3>
                <div className="text-[11px] font-mono text-blue-600 font-semibold mt-0.5">
                  {item.surface}
                </div>
                <p className="text-slate-600 text-xs mt-2.5 leading-relaxed">{item.specs}</p>
              </div>
              <button
                onClick={() => setCurrentView('public_courts')}
                className="mt-4 w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors"
              >
                Check Availability
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Our Facilities */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-mono uppercase tracking-widest text-blue-600 font-semibold mb-2">
              World-Class Amenities
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Club Facilities & Services
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              Everything athletes need before, during, and after competitive match sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Tournament Courts',
                desc: '4 professional courts (Center Court, Grandstand, Indoor Arena, Padel Glass) maintained twice daily with digital booking.',
                icon: Zap,
              },
              {
                title: 'Locker & Shower Suites',
                desc: 'Spacious climate-controlled changing quarters with biometric lockers, rain showers, and dry sauna facilities.',
                icon: ShieldCheck,
              },
              {
                title: 'Courtside Bar & Cafe',
                desc: 'Artisan sourdough pizzas, high-protein recovery bowls, electrolyte blends, and specialty Arabica roasts.',
                icon: Coffee,
              },
              {
                title: 'Sports Pro Shop',
                desc: 'Authorized dealership for tour rackets, custom precision stringing, footwear, and Champions technical apparel.',
                icon: ShoppingBag,
              },
              {
                title: 'Dedicated Parking & EV Charging',
                desc: 'Private secure parking lot with 80+ vehicle bays and four rapid Level-2 EV vehicle charging points.',
                icon: Car,
              },
              {
                title: 'Social Mixers & Tournaments',
                desc: 'Weekly Friday evening community social play, inter-club ranking tournaments, and coached youth clinics.',
                icon: Users,
              },
            ].map((fac) => {
              const Icon = fac.icon;
              return (
                <div
                  key={fac.title}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{fac.title}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed">{fac.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Membership Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white text-slate-900 p-8 sm:p-12 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="text-xs font-mono uppercase tracking-widest text-blue-600 font-semibold">
                Membership Privileges
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Gold, Silver & Junior Tiers
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Whether you train daily or play weekend matches, our membership tiers provide up to 20% discount on all court bookings, exclusive pro-shop savings, cafeteria tab privileges, and priority reservation windows.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setCurrentView('public_memberships')}
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-xs"
                >
                  <span>Explore Membership Comparison</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 gap-3">
              {[
                { name: 'Gold Tier', rate: '20% Court & Shop Discounts', tag: 'Full Club Privilege' },
                { name: 'Silver Tier', rate: '10% Court Discount', tag: 'Standard Access' },
                { name: 'Junior Tier', rate: '15% Off-Peak Discount', tag: 'Under 18 Years' },
              ].map((tier) => (
                <div key={tier.name} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{tier.name}</div>
                    <div className="text-[11px] text-blue-600 font-mono font-semibold">{tier.rate}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 shadow-2xs">
                    {tier.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Location & Operating Hours */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Location Info */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-widest text-blue-600 font-semibold">
                Club Location & Hours
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Find Champions Club
              </h2>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">Champions Club Facility</span>
                    <div>42 Champions Boulevard, Olympic Greens District</div>
                    <div>Bengaluru, Karnataka, 560034, India</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>+91 (80) 4122-8800 · Front Desk Extensions 101/102</div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>frontdesk@champions.club · support@champions.club</div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Operating Schedule</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-slate-400">Courts & Lighting</div>
                    <div className="font-bold text-slate-900">06:00 – 22:30 Daily</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-slate-400">Sports Pro Shop</div>
                    <div className="font-bold text-slate-900">08:00 – 21:00 Daily</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-slate-400">Bar & Cafeteria</div>
                    <div className="font-bold text-slate-900">07:00 – 23:00 Daily</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-slate-400">Coaching Clinics</div>
                    <div className="font-bold text-slate-900">06:30 – 19:30 Daily</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <button
                onClick={() => {
                  setDirectionsNotice(true);
                  setTimeout(() => setDirectionsNotice(false), 5000);
                }}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <MapPin className="w-4 h-4 text-white" />
                <span>Get Directions via GPS</span>
              </button>

              {directionsNotice && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                  <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>GPS Destination set to: 42 Champions Blvd, Olympic Greens District, Bengaluru (Lat: 12.9716° N, Long: 77.5946° E).</span>
                </div>
              )}
            </div>
          </div>

          {/* Map Graphic / Interactive Area */}
          <div className="lg:col-span-6 bg-gradient-to-br from-blue-50 via-slate-100 to-blue-100/50 rounded-3xl border border-slate-200 overflow-hidden relative min-h-[380px] p-6 flex flex-col justify-between">
            {/* Map styling grid graphic */}
            <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-mono shadow-xs">
                Olympic Greens Sports Hub
              </div>
              <div className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                Live Venue Open
              </div>
            </div>

            {/* Map pin presentation */}
            <div className="relative z-10 text-center my-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
                <MapPin className="w-8 h-8" />
              </div>
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200 max-w-sm mx-auto shadow-md">
                <div className="font-bold text-slate-900 text-sm">CHAMPIONS.CLUB Main Complex</div>
                <div className="text-slate-500 text-xs mt-0.5">4 Championship Courts · Pro Shop · Cafe Lounge</div>
                <div className="text-[11px] font-mono text-blue-600 mt-2 font-semibold">Lat: 12.9716° N · Long: 77.5946° E</div>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-200 pt-3">
              <span>Exit 14 off Outer Ring Expressway</span>
              <span>Dedicated Visitor Parking</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
