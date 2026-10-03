import { MembershipTier, CourtStatus } from '../types';

/**
 * Format a number as Indian Currency (INR) with the ₹ symbol and Indian numbering format
 * e.g. 125000 -> ₹1,25,000
 */
export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Convert to fixed 2 if fractional, or integer string
  const rounded = Math.round(absAmount);
  const str = rounded.toString();
  
  let result = '';
  if (str.length <= 3) {
    result = str;
  } else {
    // Last 3 digits
    const lastThree = str.substring(str.length - 3);
    const otherNumbers = str.substring(0, str.length - 3);
    // Add commas every 2 digits for otherNumbers
    const formattedOthers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = formattedOthers + ',' + lastThree;
  }
  
  return (isNegative ? '-₹' : '₹') + result;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateTimeStr: string): string {
  if (!dateTimeStr) return '';
  const d = new Date(dateTimeStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getTierBadgeClass(tier: MembershipTier): string {
  switch (tier) {
    case 'gold':
      return 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20';
    case 'silver':
      return 'bg-gradient-to-r from-slate-200 via-slate-100 to-zinc-400 text-slate-900 font-bold shadow-sm shadow-slate-400/20';
    case 'junior':
      return 'bg-sky-500 text-white font-bold shadow-sm shadow-sky-500/20';
    case 'walk_in':
    case 'none':
    default:
      return 'bg-slate-800 text-slate-300 font-medium border border-slate-700';
  }
}

export function getTierName(tier: MembershipTier): string {
  switch (tier) {
    case 'gold':
      return 'Gold Tier';
    case 'silver':
      return 'Silver Tier';
    case 'junior':
      return 'Junior Tier';
    case 'none':
    case 'walk_in':
    default:
      return 'Walk-in Member';
  }
}

export function getCourtStatusBadge(status: CourtStatus): { label: string; className: string } {
  switch (status) {
    case 'available':
      return {
        label: 'Available',
        className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      };
    case 'booked':
      return {
        label: 'Booked',
        className: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
      };
    case 'social_play':
      return {
        label: 'Social Play',
        className: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
      };
    case 'maintenance':
      return {
        label: 'Maintenance',
        className: 'bg-slate-600/20 text-slate-400 border border-slate-500/30',
      };
  }
}

export function getSportIconName(sport: string): string {
  switch (sport) {
    case 'tennis':
      return 'Trophy';
    case 'padel':
      return 'Flame';
    case 'badminton':
      return 'Wind';
    case 'cricket':
      return 'Target';
    default:
      return 'Activity';
  }
}
