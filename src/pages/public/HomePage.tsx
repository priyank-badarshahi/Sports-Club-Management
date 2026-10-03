import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../store';
import { 
  Trophy, 
  Flame, 
  Wind, 
  Target, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  ArrowRight, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Coffee, 
  ShoppingBag,
  Layers,
  Award
} from 'lucide-react';
import { formatINR, getCourtStatusBadge } from '../../lib/formatters';

export const HomePage: React.FC = () => {
  const { courts, settings, plans } = useAppStore();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const sports = [
    {
      id: 'tennis',
      name: 'Tennis',
      badge: 'Red Clay & DecoTurf',
      description: 'Championship European Red Clay and 9-layer cushioned DecoTurf hard courts with tournament-grade Musco LED floodlights.',
      specs: ['2 Championship Courts', 'Roland Garros Red Clay', 'DecoTurf Indoor', 'Pro Stringing Service'],
      image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
      icon: Trophy,
      color: 'from-amber-500/20 to-lime-500/10 border-amber-500/30',
    },
    {
      id: 'padel',
      name: 'Padel',
      badge: 'World Padel Tour Spec',
      description: 'The fastest growing racquet sport in the world. Frameless panoramic 12mm glass with Mondo Supercourt XN turf.',
      specs: ['2 Panoramic Glass Arenas', 'Mondo Textured Turf', 'Spectator Seating', 'Social Americano Mixers'],
      image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
      icon: Flame,
      color: 'from-sky-500/20 to-indigo-500/10 border-sky-500/30',
    },
    {
      id: 'badminton',
      name: 'Badminton',
      badge: 'BWF Grade 1 Mats',
      description: 'Air-conditioned 32ft ceiling courts featuring BWF-approved anti-skid vinyl PVC mats atop Burma Teakwood sprung floors.',
      specs: ['2 Dedicated Indoor Courts', 'BWF Grade 1 Matting', 'Zero-glare Lighting', 'Yonex Shuttlecocks'],
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
      icon: Wind,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
    },
    {
      id: 'cricket',
      name: 'Cricket Nets',
      badge: 'Speed Lanes & Bowling Machines',
      description: 'Full 22-yard AstroTurf pitches with high-speed automated bowling machines (up to 145 km/h) and video replay angle.',
      specs: ['2 Pitch Speed Lanes', 'Bowling Machine (145km/h)', 'Turf & Hybrid Bounce', 'Leather & Dimple Balls'],
      image: 'https://images.unsplash.com/photo-1531415074868-036b107e7742?auto=format&fit=crop&w=800&q=80',
      icon: Target,
      color: 'from-rose-500/20 to-orange-500/10 border-rose-500/30',
    },
  ];

  const facilities = [
    {
      icon: ShoppingBag,
      title: 'Pro Shop & Equipment Desk',
      description: 'Official gear from Wilson, Babolat, Yonex & Bullpadel. Professional 24-hour racquet stringing, custom weights & demo kits.',
    },
    {
      icon: Coffee,
      title: 'Courtside Café & Sports Bar',
      description: 'Cold-pressed electrolyte juices, high-protein recovery bowls, nitro espresso, Belgian craft witbier, and post-match cocktails with live match screenings.',
    },
    {
      icon: Zap,
      title: 'Musco Stadium Floodlights',
      description: 'Full LED glare-free arena illumination exceeding 750 lux standards, allowing crisp ball tracking until 11:00 PM every night.',
    },
    {
      icon: Award,
      title: 'Elite Coaching Academy',
      description: 'Certified ATP/ITF/BWF instructors offering 1-on-1 performance analysis, group clinics, and junior youth development pathways.',
    },
  ];

  const testimonials = [
    {
      name: 'Rohan Bopanna fan / Rahul Mehta',
      tier: 'Gold Championship Member',
      sport: 'Tennis & Padel',
      comment: 'The Roland Garros red clay court is unmatched in Bangalore. As a Gold member, booking a 7 AM slot takes two taps, and having a protein bowl ready at the lounge afterward is exceptional.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
      rating: 5,
    },
    {
      name: 'Isha Kothari',
      tier: 'Silver Club Member',
      sport: 'Padel',
      comment: 'Padel at Champions Club has completely transformed our weekend routine! The Saturday Americano mixers are so well-organized, friendly, and competitive.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
      rating: 5,
    },
    {
      name: 'Lt. Col. Sanjeev Nair',
      tier: 'Gold Member',
      sport: 'Badminton & Cricket',
      comment: 'The teakwood sprung floor is easy on older knees, and the automated bowling machine in the cricket net delivers ferocious 130 km/h inswingers. Superb staff and pristine facilities.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: 'Can non-members / walk-in guests book courts?',
      a: 'Yes! Walk-in guests can book any available court up to 24 hours in advance at standard public rack rates. However, club members enjoy priority 7-14 day booking windows, free prime-time hours, and discounts up to 50-100% on court fees.',
    },
    {
      q: 'What is included in the complimentary "Trial Session"?',
      a: 'Your trial session includes a 60-minute session on your sport of choice (Tennis, Padel, Badminton, or Cricket Nets), complimentary racquet and ball rental, and a 15-minute consultation with a senior coach to evaluate your game.',
    },
    {
      q: 'Do you offer racquet demo loans and restringing?',
      a: 'Absolutely. Our Pro Shop stocks the latest performance racquets from Wilson, Babolat, Yonex, and Bullpadel for members to test on-court before buying. We also offer 24-hour electronic stringing with premium poly, synthetic gut, or hybrid strings.',
    },
    {
      q: 'How does the Member Bar Tab work?',
      a: 'Gold and Silver members can charge cafeteria and sports bar orders directly to their digital club tab via their member ID. Tabs can be reviewed anytime in the member portal and settled via UPI, credit card, or club wallet at the end of the day or month.',
    },
    {
      q: 'What are the peak and non-peak court hours?',
      a: 'Non-peak hours run on weekdays from 10:00 AM to 4:00 PM. Peak hours are morning 06:00 AM to 10:00 AM and evening 04:00 PM to 11:00 PM, as well as all day on weekends and public holidays.',
    },
  ];

  // Quick live court snapshot
  const availableCourts = courts.filter((c) => c.status === 'available');

  return (
    <div className="space-y-16 lg:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-lime-500/15 via-emerald-500/10 to-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Pill Announcement */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-lime-400/30 text-lime-400 text-xs font-semibold shadow-lg shadow-lime-400/10 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bangalore's Premier Racquet & Sports Club • Roland Garros Clay & WPT Padel</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white leading-[1.1]">
              Elevate Your Game at <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-300 to-amber-300">
                Champions Club
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              World-class Red Clay Tennis, Panoramic Padel, BWF Grade-1 Badminton, and Automated Cricket Nets. Complete with a pro shop, sports bar, and executive locker lounge.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/book-trial"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-lime-400 via-lime-500 to-emerald-400 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-lime-500/25 flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              >
                <Sparkles className="w-5 h-5" />
                <span>Book a Complimentary Trial Session</span>
              </Link>
              <Link
                to="/plans"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-semibold text-sm sm:text-base border border-slate-700/80 hover:border-slate-600 flex items-center justify-center gap-2 transition"
              >
                <span>View Membership Plans</span>
                <ArrowRight className="w-4 h-4 text-lime-400" />
              </Link>
            </div>

            {/* Live Stats Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 max-w-3xl mx-auto">
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
                <div className="font-heading font-extrabold text-2xl text-lime-400">8+</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Championship Courts</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
                <div className="font-heading font-extrabold text-2xl text-amber-400">4</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Racquet & Bat Sports</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
                <div className="font-heading font-extrabold text-2xl text-sky-400">500+</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Active Club Members</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
                <div className="font-heading font-extrabold text-2xl text-emerald-400">11 PM</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Late Night Floodlit</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE REAL-TIME AVAILABILITY TEASER WIDGET */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-heading font-bold text-lg text-white">Live Court Status & Quick Booking</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {availableCourts.length} of {courts.length} championship courts currently available for play today.
              </p>
            </div>
            <Link
              to="/availability"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-lime-400/10 hover:bg-lime-400/20 text-lime-400 font-semibold text-xs border border-lime-400/30 transition self-start md:self-auto"
            >
              <Calendar className="w-4 h-4" />
              <span>Full Interactive Matrix →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {courts.slice(0, 4).map((court) => {
              const badge = getCourtStatusBadge(court.status);
              return (
                <div
                  key={court.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                        {court.sport}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <h4 className="font-heading font-bold text-sm text-white line-clamp-1">{court.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{court.surface}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">From</span>
                      <span className="font-heading font-bold text-xs text-lime-400">
                        {formatINR(court.hourlyRate.gold)}/hr
                      </span>
                    </div>
                    <Link
                      to={`/courts`}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. SPORTS OFFERED GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-lime-400">
            Four Premier Sporting Disciplines
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white mt-2">
            Built for Serious Athletic Excellence
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-3">
            Every surface engineered to official international federation specifications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {sports.map((sport) => {
            const Icon = sport.icon;
            return (
              <div
                key={sport.id}
                className="group rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image header with overlay */}
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src={sport.image}
                    alt={sport.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-950/80 text-lime-400 border border-lime-400/30 backdrop-blur-md">
                      {sport.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center font-bold shadow-lg">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading font-extrabold text-2xl text-white">{sport.name}</h3>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">{sport.description}</p>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {sport.specs.map((spec, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                        <span className="truncate">{spec}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <Link
                      to="/courts"
                      className="text-xs font-semibold text-lime-400 hover:text-lime-300 flex items-center gap-1.5 transition"
                    >
                      <span>Explore {sport.name} Courts</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to="/book-trial"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition"
                    >
                      Book Free Trial
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. CLUB FACILITIES & AMENITIES */}
      <section className="bg-slate-950/60 border-y border-slate-800/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Beyond the Court
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white mt-2">
              World-Class Club Amenities
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Relax, refuel, and socialise in high style before and after your matches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((fac, idx) => {
              const Icon = fac.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 transition flex flex-col"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lime-400 mb-4 shadow-md">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-heading font-bold text-base text-white mb-2">{fac.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed flex-1">{fac.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. MEMBERSHIP TIERS HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-lime-400">
              Exclusive Memberships
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white mt-2">
              Choose Your Membership Tier
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Complimentary court hours, 14-day booking window, bar tabs & gear discounts.
            </p>
          </div>
          <Link
            to="/plans"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-400 text-slate-950 font-bold text-xs shadow-md shadow-lime-400/20 hover:bg-lime-300 transition"
          >
            <span>Compare Full Plan Matrix</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.filter((p) => p.tier !== 'walk_in').map((plan) => {
            const isGold = plan.tier === 'gold';
            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                  isGold
                    ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-400/60 shadow-2xl shadow-amber-500/10'
                    : 'bg-slate-900/70 border border-slate-800'
                }`}
              >
                {isGold && (
                  <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-extrabold text-[11px] shadow-md uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="font-heading font-bold text-xl text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.tagline}</p>

                  <div className="mt-5 pb-5 border-b border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
                        {formatINR(plan.monthlyPrice)}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">/ month</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      + 18% GST • or {formatINR(plan.annualPrice)} billed annually
                    </span>
                  </div>

                  {/* Highlights */}
                  <ul className="space-y-3 my-6 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-lime-400 shrink-0" />
                      <span><strong>{plan.entitlements.bookingWindowDays}-day</strong> advance booking window</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-lime-400 shrink-0" />
                      <span><strong>{plan.entitlements.freeBookingsPerMonth} Free</strong> court hours every month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-lime-400 shrink-0" />
                      <span><strong>{plan.entitlements.shopDiscountPercent}% off</strong> Pro Shop & racquets</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-lime-400 shrink-0" />
                      <span><strong>{plan.entitlements.barDiscountPercent}% off</strong> Courtside Café & Bar</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-lime-400 shrink-0" />
                      <span><strong>{plan.entitlements.guestPassesPerMonth} Guest passes</strong> per month</span>
                    </li>
                  </ul>
                </div>

                <Link
                  to="/plans"
                  className={`w-full py-3 rounded-xl font-bold text-xs text-center transition ${
                    isGold
                      ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-105'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  Join {plan.name}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. MEMBER REVIEWS & TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-lime-400">
            Player Voices
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white mt-2">
            Loved by Elite Athletes & Casual Enthusiasts
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{t.comment}"
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-800/80">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-lime-400/30"
                />
                <div>
                  <h4 className="font-heading font-bold text-xs text-white">{t.name}</h4>
                  <p className="text-[10px] text-lime-400">{t.tier}</p>
                  <p className="text-[10px] text-slate-500">{t.sport}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CLUB FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-lime-400">
            Got Questions?
          </span>
          <h2 className="font-heading font-extrabold text-3xl text-white mt-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-heading font-semibold text-sm text-white hover:text-lime-300"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-lime-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. CLUB LOCATION, HOURS & CONTACT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-lime-400">
                Visit Champions Club
              </span>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
                Ready to Experience the Club in Person?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                We are conveniently situated along the Outer Ring Road with ample valet parking, dedicated gear storage, and private lounge access.
              </p>
              <div className="space-y-2 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-lime-400 shrink-0" />
                  <span>{settings.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-lime-400 shrink-0" />
                  <span>Open Daily: {settings.operatingHours.weekdays}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-4">
                <Link
                  to="/book-trial"
                  className="px-6 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs shadow-lg shadow-lime-400/20 transition"
                >
                  Schedule Trial Session
                </Link>
                <Link
                  to="/contact"
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
                >
                  Get Directions & Contact Desk
                </Link>
              </div>
            </div>

            {/* Simulated interactive map card */}
            <div className="h-64 sm:h-72 rounded-2xl bg-slate-950 border border-slate-800 p-4 relative overflow-hidden flex flex-col justify-between group">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#a3e635_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative z-10 flex justify-between items-start">
                <span className="px-3 py-1 rounded-lg bg-slate-900/90 text-[11px] font-mono text-lime-400 border border-slate-800">
                  GPS: 12.9352° N, 77.6945° E
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                  Open Now
                </span>
              </div>
              <div className="relative z-10 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-white font-heading font-bold text-sm">
                  <Trophy className="w-4 h-4 text-lime-400" />
                  <span>Champions Club Sports Complex</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Outer Ring Road, Bengaluru • Valet parking & EV charging stations available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
