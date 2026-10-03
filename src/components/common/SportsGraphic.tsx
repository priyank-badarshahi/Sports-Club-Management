import React from 'react';

interface GraphicProps {
  type: 'hero' | 'court' | 'racket' | 'balls' | 'shoes' | 'burger' | 'coffee' | 'trophy' | 'padel' | 'badminton' | 'shirt' | 'hoodie' | 'grip' | 'shuttle' | 'cap' | 'wristband' | 'accessories';
  className?: string;
}

export const SportsGraphic: React.FC<GraphicProps> = ({ type, className = 'w-full h-full' }) => {
  switch (type) {
    case 'hero':
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 flex flex-col justify-between text-white ${className}`}>
          {/* Subtle court lines SVG background */}
          <svg className="absolute inset-0 w-full h-full opacity-15 stroke-white" viewBox="0 0 600 350" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="50" y="30" width="500" height="290" strokeWidth="2" />
            <line x1="300" y1="30" x2="300" y2="320" strokeWidth="3" />
            <line x1="50" y1="175" x2="550" y2="175" strokeWidth="2" strokeDasharray="6 6" />
            <circle cx="300" cy="175" r="45" strokeWidth="2" />
            <rect x="120" y="75" width="360" height="200" strokeWidth="1.5" />
          </svg>
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">Champions Athletic Grounds</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Court Radar
            </span>
          </div>
          <div className="relative z-10 my-8">
            <div className="text-3xl font-extrabold text-white tracking-tight">Center Court 1 & Padel Arena</div>
            <p className="text-slate-300 text-sm mt-1 max-w-md">ITF Tournament Spec · Floodlit 1200 Lux · Pro Hybrid Cushion Surface</p>
          </div>
          <div className="relative z-10 flex items-center gap-4 text-xs font-mono text-slate-300 border-t border-white/10 pt-4">
            <div>Courts: <span className="text-white font-bold">4 Active</span></div>
            <div>·</div>
            <div>Today Booked: <span className="text-emerald-400 font-bold">88%</span></div>
            <div>·</div>
            <div>Surface: <span className="text-white font-bold">All-Weather Pro</span></div>
          </div>
        </div>
      );

    case 'court':
      return (
        <div className={`relative overflow-hidden rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-center p-4 ${className}`}>
          <svg className="w-full h-full opacity-70 stroke-blue-600" viewBox="0 0 200 120" fill="none">
            <rect x="10" y="10" width="180" height="100" strokeWidth="1.5" rx="4" />
            <line x1="100" y1="10" x2="100" y2="110" strokeWidth="2" />
            <line x1="10" y1="60" x2="190" y2="60" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="100" cy="60" r="16" strokeWidth="1.5" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-mono font-bold tracking-wider text-blue-700 uppercase bg-white/90 px-2.5 py-1 rounded shadow-xs border border-blue-200">
              Tournament Court
            </span>
          </div>
        </div>
      );

    case 'racket':
    case 'padel':
      return (
        <div className={`relative overflow-hidden rounded-xl bg-slate-100/70 border border-slate-200/80 flex items-center justify-center p-6 ${className}`}>
          <svg className="w-28 h-28 stroke-blue-600 text-blue-600" viewBox="0 0 100 100" fill="none">
            <ellipse cx="50" cy="40" rx="30" ry="32" stroke="currentColor" strokeWidth="2.5" />
            <line x1="30" y1="40" x2="70" y2="40" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
            <line x1="35" y1="28" x2="65" y2="28" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
            <line x1="35" y1="52" x2="65" y2="52" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
            <line x1="50" y1="15" x2="50" y2="65" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
            <line x1="40" y1="18" x2="40" y2="62" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
            <line x1="60" y1="18" x2="60" y2="62" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
            <path d="M44 72 L46 95 L54 95 L56 72 Z" fill="#334155" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="94" r="3" fill="currentColor" />
          </svg>
        </div>
      );

    case 'badminton':
    case 'shuttle':
      return (
        <div className={`relative overflow-hidden rounded-xl bg-slate-100/70 border border-slate-200/80 flex items-center justify-center p-6 ${className}`}>
          <svg className="w-24 h-24 text-blue-600 stroke-blue-600" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="72" r="14" fill="#3b82f6" stroke="#2563eb" strokeWidth="2" />
            <path d="M36 70 L25 30 L40 26 L48 60" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
            <path d="M64 70 L75 30 L60 26 L52 60" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
            <path d="M42 66 L42 24 L58 24 L58 66" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" />
          </svg>
        </div>
      );

    case 'balls':
      return (
        <div className={`relative overflow-hidden rounded-xl bg-slate-100/70 border border-slate-200/80 flex items-center justify-center p-6 ${className}`}>
          <svg className="w-24 h-24 text-lime-500" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="38" fill="#bef264" stroke="#84cc16" strokeWidth="2" />
            <path d="M22 30 C35 45 35 60 22 70" stroke="#ffffff" strokeWidth="3.5" fill="none" />
            <path d="M78 30 C65 45 65 60 78 70" stroke="#ffffff" strokeWidth="3.5" fill="none" />
          </svg>
        </div>
      );

    case 'shoes':
      return (
        <div className={`relative overflow-hidden rounded-xl bg-slate-100/70 border border-slate-200/80 flex items-center justify-center p-6 ${className}`}>
          <svg className="w-28 h-28 stroke-blue-600 text-blue-600" viewBox="0 0 100 100" fill="none">
            <path d="M15 65 L25 45 L50 48 L75 55 L88 65 L88 72 L15 72 Z" stroke="currentColor" strokeWidth="2.5" fill="#e2e8f0" />
            <path d="M25 45 L35 30 L45 30 L48 45" stroke="currentColor" strokeWidth="2" />
            <line x1="15" y1="72" x2="88" y2="72" stroke="currentColor" strokeWidth="5" />
            <line x1="50" y1="48" x2="65" y2="62" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      );

    case 'burger':
      return (
        <div className={`relative overflow-hidden rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-center p-6 ${className}`}>
          <svg className="w-24 h-24 text-amber-500" viewBox="0 0 100 100" fill="none">
            {/* Top Bun */}
            <path d="M20 40 Q50 18 80 40 L80 46 L20 46 Z" fill="#f59e0b" />
            {/* Greens */}
            <path d="M18 48 Q30 52 40 48 Q50 54 60 48 Q70 54 82 48" stroke="#16a34a" strokeWidth="4" />
            {/* Patty */}
            <rect x="20" y="54" width="60" height="12" rx="4" fill="#92400e" />
            {/* Bottom Bun */}
            <path d="M20 70 L80 70 Q80 82 50 82 Q20 82 20 70 Z" fill="#f59e0b" />
          </svg>
        </div>
      );

    case 'coffee':
      return (
        <div className={`relative overflow-hidden rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-center p-6 ${className}`}>
          <svg className="w-24 h-24 text-amber-600" viewBox="0 0 100 100" fill="none">
            <path d="M25 35 L75 35 L68 75 Q65 85 50 85 Q35 85 32 75 Z" fill="#92400e" stroke="currentColor" strokeWidth="2.5" />
            <path d="M72 42 Q86 42 86 54 Q86 66 69 66" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <path d="M40 25 Q45 18 40 12" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M50 25 Q55 18 50 12" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M60 25 Q65 18 60 12" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    default:
      return (
        <div className={`relative overflow-hidden rounded-xl bg-slate-100/70 border border-slate-200/80 flex items-center justify-center p-6 ${className}`}>
          <svg className="w-20 h-20 text-blue-600 stroke-blue-600" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#dbeafe" />
          </svg>
        </div>
      );
  }
};
