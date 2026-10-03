import { 
  Booking, 
  Court, 
  Plan, 
  ClubSettings, 
  MembershipTier, 
  SportType, 
  SocialSession, 
  BookingPriceBreakdown,
  BookingStatus,
  BookingType,
  BookingChannel
} from '../types';

/**
 * Standard operating time slots starting every 30 minutes.
 * Default operational hours: 06:00 to 22:00.
 * A session lasts 60 minutes (e.g. 06:00 - 07:00, 06:30 - 07:30).
 */
export const OPERATING_HOURS_START = 6; // 6:00 AM
export const OPERATING_HOURS_END = 22;   // 10:00 PM (last slot starts at 21:00 or 21:30)
export const SESSION_DURATION_MINUTES = 60;
export const SLOT_INTERVAL_MINUTES = 30;

/**
 * Convert time string "HH:mm" to total minutes from midnight.
 */
export function timeToMinutes(time: string): number {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Convert minutes from midnight to "HH:mm" formatted string.
 */
export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Given a start time (e.g. "06:30"), calculates end time based on 60-min session duration.
 */
export function calculateEndTime(startTime: string, durationMinutes = SESSION_DURATION_MINUTES): string {
  const startMins = timeToMinutes(startTime);
  return minutesToTime(startMins + durationMinutes);
}

/**
 * Generate standard 30-minute start slots between startHour and endHour.
 * e.g. ["06:00", "06:30", "07:00", ..., "21:30"]
 */
export function generateTimeSlots(
  startHour = OPERATING_HOURS_START, 
  endHour = OPERATING_HOURS_END, 
  interval = SLOT_INTERVAL_MINUTES
): string[] {
  const slots: string[] = [];
  const startMins = startHour * 60;
  const endMins = endHour * 60;

  for (let m = startMins; m < endMins; m += interval) {
    slots.push(minutesToTime(m));
  }
  return slots;
}

/**
 * Checks if two time windows [startA, endA) and [startB, endB) overlap.
 * e.g. 06:00-07:00 overlaps with 06:30-07:30.
 */
export function isTimeOverlapping(startA: string, endA: string, startB: string, endB: string): boolean {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);

  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

/**
 * Evaluates whether a given date & time falls within club peak hours.
 * Default peak hours:
 * - Weekdays (Mon-Fri): 17:00 - 22:00
 * - Weekends (Sat-Sun): 07:00 - 11:00 & 16:00 - 22:00
 */
export function isPeakHour(dateStr: string, timeStr: string, settings?: ClubSettings): boolean {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = day === 0 || day === 6;
  const timeMins = timeToMinutes(timeStr);

  if (isWeekend) {
    const morningPeak = timeMins >= 7 * 60 && timeMins < 11 * 60;
    const eveningPeak = timeMins >= 16 * 60 && timeMins < 22 * 60;
    return morningPeak || eveningPeak;
  } else {
    // Weekday evening prime floodlit peak
    return timeMins >= 17 * 60 && timeMins < 22 * 60;
  }
}

/**
 * Validates slot availability on a specific court.
 * Strictly prevents overlapping bookings (regular, maintenance, tournament, social play).
 * If another booking occupies or overlaps with this slot, validation fails.
 */
export function validateSlotAvailability(
  courtId: string,
  date: string,
  startTime: string,
  endTime: string,
  existingBookings: Booking[],
  socialSessions: SocialSession[] = [],
  excludeBookingId?: string
): { available: boolean; conflictReason?: string; conflictBooking?: Booking } {
  // 1. Check against existing active bookings on the same court and date
  for (const b of existingBookings) {
    if (b.id === excludeBookingId) continue;
    if (b.courtId !== courtId) continue;
    if (b.date !== date) continue;
    if (b.status === 'cancelled') continue; // Cancelled bookings free up the slot immediately

    if (isTimeOverlapping(startTime, endTime, b.startTime, b.endTime)) {
      if (b.bookingType === 'maintenance') {
        return {
          available: false,
          conflictReason: `Court is blocked for Maintenance (${b.startTime} - ${b.endTime}): ${b.notes || 'Routine resurfacing'}`,
          conflictBooking: b,
        };
      }
      if (b.bookingType === 'tournament') {
        return {
          available: false,
          conflictReason: `Court is reserved for Club Tournament (${b.startTime} - ${b.endTime})`,
          conflictBooking: b,
        };
      }
      if (b.bookingType === 'coaching') {
        return {
          available: false,
          conflictReason: `Court is reserved for Coaching Clinic (${b.startTime} - ${b.endTime})`,
          conflictBooking: b,
        };
      }
      return {
        available: false,
        conflictReason: 'Slot just taken, pick another',
        conflictBooking: b,
      };
    }
  }

  // 2. Check against Social Play sessions (e.g. Friday Night Social Play blocks exclusive bookings)
  for (const s of socialSessions) {
    if (s.date !== date) continue;
    if (!s.courtIds.includes(courtId)) continue;

    if (isTimeOverlapping(startTime, endTime, s.startTime, s.endTime)) {
      return {
        available: false,
        conflictReason: `Court is reserved for ${s.title} (${s.startTime} - ${s.endTime}). Exclusive booking is blocked during social play.`,
      };
    }
  }

  return { available: true };
}

/**
 * Counts how many confirmed/checked-in bookings a member already has across all courts on a specific date.
 */
export function getMemberDailyBookingCount(
  memberId: string | undefined,
  date: string,
  bookings: Booking[],
  excludeBookingId?: string
): number {
  if (!memberId) return 0;
  return bookings.filter(
    (b) =>
      b.memberId === memberId &&
      b.date === date &&
      b.status !== 'cancelled' &&
      b.id !== excludeBookingId &&
      b.bookingType !== 'maintenance' &&
      b.bookingType !== 'tournament'
  ).length;
}

/**
 * Validates the strictly enforced rule: Max 2 bookings per member per day across all courts.
 * Returns allowed status, used count, and human-friendly blocking message.
 */
export function validateMemberDailyCap(
  memberId: string | undefined,
  date: string,
  bookings: Booking[],
  maxCap = 2,
  excludeBookingId?: string
): { allowed: boolean; usedToday: number; maxAllowed: number; message?: string } {
  if (!memberId) {
    return { allowed: true, usedToday: 0, maxAllowed: maxCap };
  }

  const usedToday = getMemberDailyBookingCount(memberId, date, bookings, excludeBookingId);

  if (usedToday >= maxCap) {
    return {
      allowed: false,
      usedToday,
      maxAllowed: maxCap,
      message: `Daily limit reached (${usedToday} of ${maxCap} used today on ${date}). Club rules permit a maximum of ${maxCap} court sessions per member per day.`,
    };
  }

  return {
    allowed: true,
    usedToday,
    maxAllowed: maxCap,
    message: `${usedToday} of ${maxCap} used today`,
  };
}

/**
 * Calculates itemized pricing for a court booking.
 * Enforces tier rates (Gold lowest/free, Silver member rate, Junior discounted, Walk-in highest).
 * Adds peak multiplier and calculates 18% GST with full breakdown.
 */
export function calculateBookingPrice(params: {
  court: Court;
  memberTier: MembershipTier;
  date: string;
  startTime: string;
  plan?: Plan;
  settings?: ClubSettings;
  overrideFree?: boolean;
}): BookingPriceBreakdown {
  const { court, memberTier, date, startTime, plan, settings, overrideFree } = params;

  // 1. Base rate for this court by member tier
  const tierBaseRate = court.hourlyRate[memberTier] ?? court.hourlyRate.walk_in;
  const walkInRate = court.hourlyRate.walk_in;

  // 2. Peak hour evaluation
  const peak = isPeakHour(date, startTime, settings);
  const peakMultiplier = peak ? 1.25 : 1.0;
  const baseRateWithPeak = Math.round(tierBaseRate * peakMultiplier);

  // 3. Plan entitlement discount check
  let courtDiscountPercent = 0;
  if (plan?.entitlements?.courtDiscountPercent) {
    courtDiscountPercent = plan.entitlements.courtDiscountPercent;
  }

  // Gold members have preferential discounts or free complimentary bookings
  let freeHourApplied = false;
  if (overrideFree || (memberTier === 'gold' && plan?.entitlements?.freeBookingsPerMonth && !peak)) {
    // If explicitly complimentary or off-peak gold free hour
    // freeHourApplied = true;
  }

  let subtotal = baseRateWithPeak;
  let tierDiscount = Math.round((walkInRate * peakMultiplier) - baseRateWithPeak);

  if (freeHourApplied) {
    tierDiscount = baseRateWithPeak;
    subtotal = 0;
  }

  // 4. GST calculation (18%)
  const gstRate = (settings?.defaultGstPercent || 18) / 100;
  const gstAmount = Math.round(subtotal * gstRate);
  const totalAmount = subtotal + gstAmount;

  return {
    baseRate: tierBaseRate,
    isPeak: peak,
    peakMultiplier,
    subtotal,
    tierDiscount: Math.max(0, tierDiscount),
    courtDiscountPercent,
    freeHourApplied,
    netAmount: subtotal,
    gstRate,
    gstAmount,
    totalAmount,
  };
}

/**
 * Recalculates price if a member's tier or plan changed prior to session execution.
 */
export function recalculateBookingPriceForMember(
  booking: Booking,
  currentMemberTier: MembershipTier,
  court: Court,
  plan?: Plan,
  settings?: ClubSettings
): BookingPriceBreakdown {
  return calculateBookingPrice({
    court,
    memberTier: currentMemberTier,
    date: booking.date,
    startTime: booking.startTime,
    plan,
    settings,
  });
}

/**
 * Validates cancellation eligibility and computes refunds / late cancellation fees.
 * Configurable cancellation window (e.g. 4 or 6 hours before slot).
 * If cancelled before the window -> 100% refund to wallet.
 * If late cancellation -> late-cancel fee deducted (e.g. 50%), balance refunded to wallet.
 */
export function validateCancellation(
  booking: Booking,
  settings?: ClubSettings
): {
  eligibleForFreeCancel: boolean;
  hoursRemaining: number;
  lateCancelFee: number;
  refundAmount: number;
  lateFeePercent: number;
} {
  const windowHours = settings?.bookingCancellationWindowHours || 4;
  const lateFeePercent = 50; // 50% late cancel penalty

  const bookingDateTime = new Date(`${booking.date}T${booking.startTime}:00`);
  const now = new Date();
  const diffHours = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  const isFreeCancel = diffHours >= windowHours;
  const totalPaid = booking.totalPrice || 0;

  if (isFreeCancel) {
    return {
      eligibleForFreeCancel: true,
      hoursRemaining: Math.round(diffHours * 10) / 10,
      lateCancelFee: 0,
      refundAmount: totalPaid,
      lateFeePercent: 0,
    };
  } else {
    // Late cancel
    const lateFee = Math.round(totalPaid * (lateFeePercent / 100));
    const refund = Math.max(0, totalPaid - lateFee);
    return {
      eligibleForFreeCancel: false,
      hoursRemaining: Math.max(0, Math.round(diffHours * 10) / 10),
      lateCancelFee: lateFee,
      refundAmount: refund,
      lateFeePercent,
    };
  }
}

/**
 * Validates reschedule request:
 * 1. Checks cancellation/reschedule policy window
 * 2. Checks new slot availability on target court
 * 3. Checks daily booking cap on target date
 */
export function validateReschedule(
  booking: Booking,
  newCourtId: string,
  newDate: string,
  newStartTime: string,
  newEndTime: string,
  existingBookings: Booking[],
  socialSessions: SocialSession[] = [],
  settings?: ClubSettings
): { allowed: boolean; reason?: string } {
  // 1. Check window
  const cancelCheck = validateCancellation(booking, settings);
  if (!cancelCheck.eligibleForFreeCancel) {
    return {
      allowed: false,
      reason: `Rescheduling is permitted up to ${settings?.bookingCancellationWindowHours || 4} hours in advance. This booking starts in ${cancelCheck.hoursRemaining} hours.`,
    };
  }

  // 2. Check slot availability on target court
  const slotCheck = validateSlotAvailability(
    newCourtId,
    newDate,
    newStartTime,
    newEndTime,
    existingBookings,
    socialSessions,
    booking.id
  );
  if (!slotCheck.available) {
    return { allowed: false, reason: slotCheck.conflictReason };
  }

  // 3. If changing date, check daily cap on new date
  if (booking.date !== newDate && booking.memberId) {
    const capCheck = validateMemberDailyCap(booking.memberId, newDate, existingBookings, settings?.dailyBookingCap || 2);
    if (!capCheck.allowed) {
      return { allowed: false, reason: capCheck.message };
    }
  }

  return { allowed: true };
}

/**
 * Validates recurring weekly bookings (e.g. Every Tuesday 6:00 PM for 4 weeks).
 * Validates all weeks upfront. If any week has a conflict, reports which dates succeed and fail.
 */
export function validateRecurringBookings(params: {
  courtId: string;
  startDate: string;
  weeksCount: number;
  startTime: string;
  endTime: string;
  memberId?: string;
  existingBookings: Booking[];
  socialSessions: SocialSession[];
}): {
  valid: boolean;
  validDates: string[];
  conflicts: { date: string; reason: string }[];
} {
  const { courtId, startDate, weeksCount, startTime, endTime, memberId, existingBookings, socialSessions } = params;
  const validDates: string[] = [];
  const conflicts: { date: string; reason: string }[] = [];

  const baseDate = new Date(startDate);

  for (let i = 0; i < weeksCount; i++) {
    const targetDate = new Date(baseDate);
    targetDate.setDate(baseDate.getDate() + i * 7);
    const dateStr = targetDate.toISOString().split('T')[0];

    // Check slot
    const slotCheck = validateSlotAvailability(courtId, dateStr, startTime, endTime, existingBookings, socialSessions);
    if (!slotCheck.available) {
      conflicts.push({ date: dateStr, reason: slotCheck.conflictReason || 'Slot occupied' });
      continue;
    }

    // Check daily cap
    if (memberId) {
      const capCheck = validateMemberDailyCap(memberId, dateStr, existingBookings);
      if (!capCheck.allowed) {
        conflicts.push({ date: dateStr, reason: capCheck.message || 'Daily cap reached' });
        continue;
      }
    }

    validDates.push(dateStr);
  }

  return {
    valid: conflicts.length === 0,
    validDates,
    conflicts,
  };
}

/**
 * "What's free right now?" enquiry engine for front desk / phone operators.
 * Filters courts available at requested date & time for requested duration.
 */
export interface CourtAvailabilityResult {
  court: Court;
  isAvailable: boolean;
  conflictReason?: string;
  nextAvailableTime?: string;
  rateForTier: number;
}

export function getAvailableCourtsAtTime(
  courts: Court[],
  date: string,
  time: string,
  durationMinutes = 60,
  bookings: Booking[],
  socialSessions: SocialSession[] = [],
  sportFilter?: SportType,
  tier: MembershipTier = 'gold'
): CourtAvailabilityResult[] {
  const endTime = calculateEndTime(time, durationMinutes);

  return courts
    .filter((c) => !sportFilter || c.sport === sportFilter)
    .map((court) => {
      const check = validateSlotAvailability(court.id, date, time, endTime, bookings, socialSessions);
      return {
        court,
        isAvailable: check.available,
        conflictReason: check.conflictReason,
        rateForTier: court.hourlyRate[tier] || court.hourlyRate.walk_in,
      };
    });
}

/**
 * Social Play Spots calculation.
 * Capacity per court (e.g. 8 players per court).
 */
export function getSocialSessionSpots(session: SocialSession, capacityPerCourt = 8) {
  const totalCapacity = session.maxParticipants || session.courtIds.length * capacityPerCourt;
  const takenSpots = (session.currentParticipants || []).length;
  const spotsLeft = Math.max(0, totalCapacity - takenSpots);
  const isFull = spotsLeft === 0;
  const waitlistCount = (session.waitlist || []).length;

  return {
    totalSpots: totalCapacity,
    takenSpots,
    spotsLeft,
    isFull,
    waitlistCount,
  };
}

/**
 * Court Utilization and Analytics calculator.
 * Computes:
 * - Occupancy % overall and per court
 * - Peak vs off-peak utilization
 * - Total revenue generated per court
 * - Heatmap distribution by hour (06:00 to 22:00)
 */
export interface UtilizationAnalytics {
  overallOccupancyPercent: number;
  totalBookingsCount: number;
  totalRevenue: number;
  courtStats: {
    courtId: string;
    courtName: string;
    sport: SportType;
    hoursBooked: number;
    occupancyPercent: number;
    revenue: number;
  }[];
  hourlyHeatmap: {
    hour: string; // e.g. "18:00"
    bookingCount: number;
    isPeak: boolean;
  }[];
}

export function calculateCourtUtilization(
  courts: Court[],
  bookings: Booking[],
  startDate: string,
  endDate: string
): UtilizationAnalytics {
  // Filter confirmed or completed bookings in range
  const relevantBookings = bookings.filter((b) => {
    return (
      b.date >= startDate &&
      b.date <= endDate &&
      b.status !== 'cancelled' &&
      b.bookingType !== 'maintenance'
    );
  });

  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const dayCount = Math.max(1, Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const operationalHoursPerDay = OPERATING_HOURS_END - OPERATING_HOURS_START; // e.g. 16 hours
  const totalAvailableCourtHours = courts.length * operationalHoursPerDay * dayCount;

  let totalHoursBooked = 0;
  let totalRevenue = 0;

  const courtHoursMap: Record<string, { hours: number; revenue: number }> = {};
  courts.forEach((c) => {
    courtHoursMap[c.id] = { hours: 0, revenue: 0 };
  });

  // Hourly heatmap accumulator
  const hourMap: Record<string, number> = {};
  const standardHours = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];
  standardHours.forEach((h) => (hourMap[h] = 0));

  relevantBookings.forEach((b) => {
    const [startH] = b.startTime.split(':');
    const hourKey = `${startH.padStart(2, '0')}:00`;
    if (hourMap[hourKey] !== undefined) {
      hourMap[hourKey] += 1;
    }

    if (courtHoursMap[b.courtId]) {
      courtHoursMap[b.courtId].hours += 1;
      courtHoursMap[b.courtId].revenue += b.totalPrice || 0;
    }
    totalHoursBooked += 1;
    totalRevenue += b.totalPrice || 0;
  });

  const courtStats = courts.map((c) => {
    const data = courtHoursMap[c.id] || { hours: 0, revenue: 0 };
    const courtCapacityHours = operationalHoursPerDay * dayCount;
    const occupancy = Math.round((data.hours / courtCapacityHours) * 100);

    return {
      courtId: c.id,
      courtName: c.name,
      sport: c.sport,
      hoursBooked: data.hours,
      occupancyPercent: Math.min(100, occupancy),
      revenue: data.revenue,
    };
  });

  const overallOccupancyPercent = Math.min(
    100,
    Math.round((totalHoursBooked / totalAvailableCourtHours) * 100)
  );

  const hourlyHeatmap = standardHours.map((h) => ({
    hour: h,
    bookingCount: hourMap[h] || 0,
    isPeak: isPeakHour('2026-10-06', h), // Sample weekday peak check
  }));

  return {
    overallOccupancyPercent,
    totalBookingsCount: relevantBookings.length,
    totalRevenue,
    courtStats,
    hourlyHeatmap,
  };
}
