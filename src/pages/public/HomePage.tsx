import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../store';
import { 
  Trophy, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  CheckCircle, 
  ArrowRight, 
  Star, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { settings } = useAppStore();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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

  return (
    <div className="space-y-10 lg:space-y-12">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-6 pb-12 lg:pt-10 lg:pb-16">
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

      {/* 5. MEMBER REVIEWS & TESTIMONIALS */}
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
            </div>

            {/* Map link card */}
            <a
              href="https://maps.app.goo.gl/xEuc7t1YQGtbawND6"
              target="_blank"
              rel="noreferrer"
              className="h-56 sm:h-64 rounded-2xl bg-slate-950 border border-slate-800 p-4 relative overflow-hidden flex flex-col justify-between group hover:border-lime-400/40 transition"
            >
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
                  <MapPin className="w-4 h-4 text-lime-400" />
                  <span>Champions Club Sports Complex</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Outer Ring Road, Bengaluru • Valet parking & EV charging stations available.
                </p>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-lime-400 text-slate-950 text-xs font-bold">
                  <span>Open in Google Maps</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
