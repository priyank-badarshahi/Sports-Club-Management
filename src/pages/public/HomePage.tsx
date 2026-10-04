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
      name: 'Hardik Patel',
      tier: 'Gold Member',
      sport: 'Box Cricket',
      comment: 'The Box Cricket arena at Sports Club Gujarat is unmatched. The high-tension turf and enclosed netting make night matches under floodlights with friends and colleagues thrilling and competitive.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
      rating: 5,
    },
    {
      name: 'Pooja Shah',
      tier: 'Silver Member',
      sport: 'Badminton',
      comment: 'The synthetic badminton courts have superb shock absorption and zero glare. Booking prime morning slots takes just seconds, and the arena is always immaculately maintained.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
      rating: 5,
    },
    {
      name: 'Aarav Desai',
      tier: 'Gold Member',
      sport: 'Table Tennis',
      comment: 'Playing at the Table Tennis arena with tournament-grade tables and pro flooring has elevated my game. The Pro Shop even stocked my exact rubber and blade combination!',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
      rating: 5,
    },
    {
      name: 'Mehul Joshi',
      tier: 'Club Member',
      sport: 'Volleyball',
      comment: 'Our weekend volleyball matches at the outdoor floodlit court are the highlight of the week. Professional net tension, clear line markings, and an energetic team atmosphere.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80',
      rating: 5,
    },
    {
      name: 'Darshan Trivedi',
      tier: 'Gold Member',
      sport: 'Kho Kho',
      comment: 'Finding a dedicated, properly marked Kho Kho ground with high-quality posts and night lighting in Ahmedabad was a dream come true for our team practice.',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&h=120&q=80',
      rating: 5,
    },
    {
      name: 'Kinjal Vora',
      tier: 'Silver Member',
      sport: 'Hockey',
      comment: 'The synthetic hockey turf provides consistent ball roll and excellent traction. Having access to genuine hockey gear and protective equipment at the club makes it complete.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80',
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: 'What sports facilities are available at Sports Club Gujarat?',
      a: 'Sports Club Gujarat offers dedicated facilities for 6 sports: Box Cricket, Table Tennis, Badminton, Volleyball, Kho Kho, and Hockey. Each facility is equipped with specialized sports surfaces, professional markings, and floodlighting for day and night play.',
    },
    {
      q: 'How does facility booking work for members and visitors?',
      a: 'Club members enjoy priority advance booking windows, complimentary prime hours, and discounted rates. Walk-in guests and non-members can also book any available facility online or at the reception desk.',
    },
    {
      q: 'Can I book the Box Cricket arena for group matches or corporate teams?',
      a: 'Yes! The Box Cricket arena is available for hourly bookings, team practice sessions, and corporate friendly matches. It features high-quality synthetic turf, enclosed perimeter netting, and high-intensity LED floodlights.',
    },
    {
      q: 'Do you provide equipment for Table Tennis and Badminton?',
      a: 'Yes. Players can either bring their personal gear or rent and purchase high-performance racquets, paddles, shuttlecocks, and balls directly from our on-site Pro Shop.',
    },
    {
      q: 'Are facilities available for team sports like Volleyball, Kho Kho, and Hockey?',
      a: 'Absolutely. We offer full-size, dedicated grounds for Volleyball, Kho Kho, and Hockey suitable for full-squad training, competitive league matches, and friendly scrimmages.',
    },
    {
      q: 'Is Sports Club Gujarat open to beginners and recreational players?',
      a: 'Yes, players of all skill levels are warmly welcome. Whether you are picking up a racquet for the first time, enjoying casual box cricket with friends, or training competitively, our club provides a supportive and friendly environment.',
    },
    {
      q: 'What equipment and services are available at the Pro Shop?',
      a: 'Our on-site Pro Shop provides sport-specific equipment, footwear, apparel, and accessories for Box Cricket, Table Tennis, Badminton, Volleyball, Kho Kho, and Hockey. Our staff is ready to help you select the ideal gear for your game.',
    },
    {
      q: 'Where is Sports Club Gujarat located in Ahmedabad?',
      a: 'We are conveniently located at SP Stadium Area, Ahmedabad, Gujarat, India. The complex features ample secure parking, locker facilities, and convenient road connectivity across the city.',
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
              <span>SPORTS CLUB GUJARAT • AHMEDABAD</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white leading-[1.1]">
              Elevate Your Game at <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-300 to-amber-300">
                Sports Club Gujarat
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Experience a complete sports destination in Ahmedabad with dedicated facilities for Box Cricket, Table Tennis, Badminton, Volleyball, Kho Kho, and Hockey. Train, compete, play with friends, and shop for sport-specific equipment at our Pro Shop.
            </p>

            {/* Live Stats Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 max-w-3xl mx-auto">
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
                <div className="font-heading font-extrabold text-2xl text-lime-400">6</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Sports</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
                <div className="font-heading font-extrabold text-2xl text-amber-400">Multi-Sport</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Facilities</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
                <div className="font-heading font-extrabold text-2xl text-sky-400">Pro Shop</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Sport-Specific Gear</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
                <div className="font-heading font-extrabold text-2xl text-emerald-400">Daily Open</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">6 AM – 11 PM</div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                Visit Sports Club Gujarat
              </span>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
                Ready to Experience the Club in Person?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                We are conveniently situated in the SP Stadium Area of Ahmedabad with ample parking, dedicated gear storage, and private lounge access.
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
                  GPS: 23.0416° N, 72.5627° E
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                  Open Now
                </span>
              </div>
              <div className="relative z-10 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-white font-heading font-bold text-sm">
                  <MapPin className="w-4 h-4 text-lime-400" />
                  <span>Sports Club Gujarat</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  SP Stadium Area, Ahmedabad, Gujarat, India • Ample parking & modern sports amenities available.
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
