import React from 'react';
import { useClub } from '../../context/ClubContext';
import { SportsGraphic } from '../../components/common/SportsGraphic';
import {
  Calendar,
  ShieldCheck,
  Award,
  Zap,
  Coffee,
  ShoppingBag,
  ArrowRight,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Car,
  ChevronDown,
} from 'lucide-react';

export const PublicHome: React.FC = () => {
  const { setCurrentView, courts, bookings, isAuthenticated } = useClub();
  const [directionsNotice, setDirectionsNotice] = React.useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Live court summary (anonymized preview without personal names)
  const getCourtStatusPreview = (courtId: string) => {
    const isBooked = bookings.some(
      (b) => b.courtId === courtId && b.date === today && b.status !== 'cancelled' && b.startTime >= '17:00'
    );
    return isBooked ? 'Booked' : 'Available';
  };

  const scrollToAbout = () => {
    const el = document.getElementById('about-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-blue-50/30 text-slate-900 pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Action Buttons */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>Premier Athletic & Racquet Club</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] text-balance">
                Play More. Connect More. <span className="text-blue-600">Live the Game.</span>
              </h1>

              <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed">
                Welcome to Champions Club. One unified destination to book tournament courts, discover sports memberships, shop professional gear, and enjoy courtside cafeteria dining.
              </p>

              {/* Hero Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={scrollToAbout}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 shadow-xs flex items-center gap-2 transition-all"
                >
                  <span>Explore Our Club</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => setCurrentView('public_courts')}
                  className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs flex items-center gap-2 transition-all hover:translate-y-[-1px]"
                >
                  <Calendar className="w-4 h-4" />
                  <span>View Courts</span>
                </button>

                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      setCurrentView('member_portal');
                    } else {
                      setCurrentView('public_signup');
                    }
                  }}
                  className="px-6 py-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm border border-blue-200 flex items-center gap-2 transition-all"
                >
                  <span>Become a Member</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Today's Court Availability Widget (Strictly Anonymized) */}
              <div className="pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-500 mb-3">
                  <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
                    <Clock className="w-3.5 h-3.5" /> Today's Court Availability (Evening Peak)
                  </span>
                  <span>4 Courts Active</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {courts.map((court) => {
                    const status = getCourtStatusPreview(court.id);
                    const isAvailable = status === 'Available';
                    return (
                      <div
                        key={court.id}
                        onClick={() => setCurrentView('public_courts')}
                        className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between cursor-pointer transition-colors shadow-xs ${
                          isAvailable
                            ? 'bg-white border-emerald-300 text-emerald-800 hover:border-emerald-500'
                            : 'bg-slate-100 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-bold truncate text-slate-800">Court {court.number}</div>
                        <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
                          <span className={isAvailable ? 'text-emerald-700 font-semibold flex items-center gap-1' : 'text-slate-500'}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {status}
                          </span>
                          <span className="text-[10px] text-slate-500">{court.sport}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Visual Showcase */}
            <div className="lg:col-span-5">
              <div className="relative">
                <SportsGraphic type="hero" className="w-full min-h-[380px] shadow-xl border border-slate-200" />
                <div className="absolute -bottom-4 -left-4 bg-white/95 border border-slate-200 backdrop-blur-md rounded-2xl p-4 shadow-lg hidden sm:flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-900">Championship Facilities</div>
                    <div className="text-slate-500 text-[11px]">ITF Surfaces · 1200 Lux Lighting</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Comprehensive About Section */}
      <section id="about-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="text-xs font-mono uppercase tracking-widest text-blue-600 font-semibold mb-2">
            About Champions Club
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            A Premier Sports & Recreation Destination
          </h2>
          <p className="text-slate-600 text-sm mt-3 leading-relaxed">
            Champions Club is a modern sports and recreation club dedicated to promoting sportsmanship, fitness, and athletic excellence. We provide world-class sporting facilities, structured membership plans, digital court scheduling, a fully stocked sports gear shop, and an artisan courtside bar and cafeteria.
          </p>
        </div>

        {/* Available Sports Cards */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="text-xl">🎾</span>
            <span>Available Sports & Disciplines</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                sport: 'Tennis',
                surface: 'Championship Acrylic Hard Court',
                desc: 'ITF Level-3 tournament surface with professional cushioning, anti-glare floodlights, and match-ready ball machine rental.',
                graphic: 'racket',
              },
              {
                sport: 'Badminton',
                surface: 'BWF-Approved Synthetic Arena',
                desc: 'Multi-court indoor stadium equipped with wooden subfloors, professional air circulation, and tournament referee podiums.',
                graphic: 'badminton',
              },
              {
                sport: 'Padel',
                surface: '12mm Panoramic Glass Court',
                desc: 'Textured turf with premium rebound acoustics. Weekly beginner mixers, social play ladders, and racket demo sessions.',
                graphic: 'padel',
              },
              {
                sport: 'Cricket Practice Nets',
                surface: 'All-Weather Bowling Turf',
                desc: 'Enclosed multi-lane practice turf with high-speed automated bowling machines for batting technique and spin coaching.',
                graphic: 'balls',
              },
            ].map((s) => (
              <div
                key={s.sport}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="h-32 rounded-xl bg-slate-50 overflow-hidden mb-3 border border-slate-100">
                    <SportsGraphic type={s.graphic as any} className="w-full h-full" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{s.sport}</h4>
                  <div className="text-[11px] font-mono text-blue-600 font-semibold mt-0.5">
                    {s.surface}
                  </div>
                  <p className="text-slate-600 text-xs mt-2 leading-relaxed">{s.desc}</p>
                </div>
                <button
                  onClick={() => setCurrentView('public_courts')}
                  className="mt-4 w-full py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors"
                >
                  View Schedule
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Facilities Grid */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span>🏟️</span>
            <span>Club Facilities & Infrastructure</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Professional Courts',
                desc: '4 tournament-grade courts with zero double-booking policy, automated floodlighting, and digital availability schedules.',
                icon: Zap,
              },
              {
                title: 'Locker & Shower Rooms',
                desc: 'Private digital locker suites, luxury rain showers, complimentary fresh towels, and dry sauna facilities for members.',
                icon: ShieldCheck,
              },
              {
                title: 'Courtside Bar & Cafe',
                desc: 'Stone-fired sourdough pizzas, lean protein burgers, cold-pressed electrolyte juice blends, and specialty barista coffee.',
                icon: Coffee,
              },
              {
                title: 'Pro Sports Shop',
                desc: 'Tour tennis and padel rackets, match balls, non-marking shoes, custom stringing, and technical athletic performance apparel.',
                icon: ShoppingBag,
              },
              {
                title: 'Dedicated Parking & EV Spots',
                desc: 'Secure private parking bays with CCTV monitoring and four dedicated Level-2 electric vehicle charging stations.',
                icon: Car,
              },
              {
                title: 'Social Play & Clinics',
                desc: 'Weekly community Friday social play mixers, junior athletic development camps, and certified coaching sessions.',
                icon: Award,
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{f.title}</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Membership Preview on Home */}
      <section className="bg-slate-50 text-slate-900 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-blue-600 font-semibold mb-2">
                Membership Plans
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">Flexible Membership Options</h2>
              <p className="text-slate-600 text-xs mt-2">
                Join Champions Club for exclusive court pricing, advance bookings, pro shop discounts, and lounge privileges.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('public_memberships')}
              className="mt-4 md:mt-0 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
            >
              <span>Compare All Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gold */}
            <div className="rounded-2xl bg-white border-2 border-blue-600 p-6 flex flex-col justify-between relative shadow-md">
              <div className="absolute -top-3 right-6 bg-blue-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                Most Popular
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">GOLD TIER</div>
                <div className="text-xs text-slate-500 mt-1">Premium full-access club membership.</div>
                <div className="my-4">
                  <span className="text-3xl font-extrabold font-mono text-slate-900">₹45,000</span>
                  <span className="text-slate-500 text-xs font-mono"> / year (Demo)</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>20% Member Court Rate Discount</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>20% Pro-Shop & Bar Discounts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>7-Day Advance Court Booking Window</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Locker Suites & VIP Lounge Access</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setCurrentView('public_memberships');
                  } else {
                    setCurrentView('public_signup');
                  }
                }}
                className="mt-6 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors uppercase tracking-wider shadow-xs"
              >
                Become a Member
              </button>
            </div>

            {/* Silver */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="text-lg font-bold text-slate-900">SILVER TIER</div>
                <div className="text-xs text-slate-500 mt-1">Standard membership for regular club players.</div>
                <div className="my-4">
                  <span className="text-3xl font-extrabold font-mono text-slate-900">₹28,000</span>
                  <span className="text-slate-500 text-xs font-mono"> / year (Demo)</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>10% Member Court Rate Discount</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>10% Discount on Selected Pro Shop Gear</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>3-Day Advance Booking Window</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setCurrentView('public_memberships');
                  } else {
                    setCurrentView('public_signup');
                  }
                }}
                className="mt-6 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors uppercase tracking-wider"
              >
                Become a Member
              </button>
            </div>

            {/* Junior */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="text-lg font-bold text-slate-900">JUNIOR TIER</div>
                <div className="text-xs text-slate-500 mt-1">For aspiring junior players under 18 years.</div>
                <div className="my-4">
                  <span className="text-3xl font-extrabold font-mono text-slate-900">₹22,000</span>
                  <span className="text-slate-500 text-xs font-mono"> / year (Demo)</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>15% Discount on Off-Peak Court Slots</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Youth Academy Drills Included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Coaching Clinic Benefits</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setCurrentView('public_memberships');
                  } else {
                    setCurrentView('public_signup');
                  }
                }}
                className="mt-6 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors uppercase tracking-wider"
              >
                Become a Member
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Find Champions Club / Location & Operating Hours */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Contact & Hours Card */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-widest text-blue-600 font-semibold">
                Location & Schedule
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Find Champions Club
              </h2>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">Champions Club Facility</div>
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
                <div className="text-xs font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Club Operating Hours</span>
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
                    <div className="text-slate-400">Floodlit Play</div>
                    <div className="font-bold text-slate-900">18:00 – 22:30 Daily</div>
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

          {/* Map Graphic Showcase */}
          <div className="lg:col-span-6 bg-gradient-to-br from-blue-50 via-slate-100 to-blue-100/50 rounded-3xl border border-slate-200 overflow-hidden relative min-h-[360px] p-6 flex flex-col justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-mono shadow-xs">
                Olympic Greens Sports Complex
              </div>
              <div className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                Facility Open
              </div>
            </div>

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
              <span>80+ Free Member Parking Bays</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
