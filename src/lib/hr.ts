import { 
  Employee, 
  Shift, 
  Leave, 
  Payroll, 
  StaffAttendance, 
  ShiftSwapRequest 
} from '../types';

export interface ShiftConflict {
  type: 'double_booking' | 'rest_period' | 'max_hours';
  message: string;
}

/**
 * Check if a shift assignment causes conflicts for an employee
 */
export function validateShiftConflict(
  employee: Employee,
  newShift: { date: string; startTime: string; endTime: string },
  existingShifts: Shift[],
  ignoreShiftId?: string
): ShiftConflict[] {
  const conflicts: ShiftConflict[] = [];

  // Filter employee's shifts on same or adjacent dates
  const empShifts = existingShifts.filter(
    (s) => s.employeeId === employee.id && s.id !== ignoreShiftId && s.status !== 'swapped'
  );

  const [nSh, nSm] = newShift.startTime.split(':').map(Number);
  const [nEh, nEm] = newShift.endTime.split(':').map(Number);
  const nStartMins = nSh * 60 + nSm;
  const nEndMins = nEh * 60 + nEm;

  empShifts.forEach((s) => {
    if (s.date === newShift.date) {
      const [sSh, sSm] = s.startTime.split(':').map(Number);
      const [sEh, sEm] = s.endTime.split(':').map(Number);
      const sStartMins = sSh * 60 + sSm;
      const sEndMins = sEh * 60 + sEm;

      // Overlap check
      if (nStartMins < sEndMins && nEndMins > sStartMins) {
        conflicts.push({
          type: 'double_booking',
          message: `Overlaps with existing ${s.role} shift (${s.startTime} - ${s.endTime}) on ${s.date}`,
        });
      }
    }
  });

  // Calculate total weekly hours
  const shiftHours = Math.max(0.5, (nEndMins - nStartMins) / 60);
  const weeklyHours = empShifts.reduce((acc, s) => {
    const [sSh, sSm] = s.startTime.split(':').map(Number);
    const [sEh, sEm] = s.endTime.split(':').map(Number);
    return acc + Math.max(0.5, (sEh * 60 + sEm - (sSh * 60 + sSm)) / 60);
  }, 0) + shiftHours;

  const maxAllowed = employee.shiftPreference?.maxWeeklyHours || 48;
  if (weeklyHours > maxAllowed) {
    conflicts.push({
      type: 'max_hours',
      message: `Weekly total (${weeklyHours}h) exceeds preferred cap of ${maxAllowed}h/week`,
    });
  }

  return conflicts;
}

/**
 * Calculate Payroll for a specific employee and month
 */
export function calculateEmployeePayroll(
  employee: Employee,
  monthYear: string,
  approvedLeaves: Leave[] = [],
  overtimeHours: number = 0
): Omit<Payroll, 'id'> {
  const baseSalary = employee.salaryStructure?.baseSalary || employee.monthlySalary;
  const hraAllowance = employee.salaryStructure?.hraAllowance || Math.round(baseSalary * 0.2);
  const specialAllowance = employee.salaryStructure?.specialAllowance || Math.round(baseSalary * 0.1);
  const grossBase = baseSalary + hraAllowance + specialAllowance;

  // Unpaid Leave Days calculation (30 days standard month)
  const unpaidLeaves = approvedLeaves.filter(
    (l) => l.employeeId === employee.id && l.type === 'unpaid' && l.status === 'approved'
  );
  const unpaidLeaveDays = unpaidLeaves.reduce((sum, l) => sum + (l.daysCount || 1), 0);
  const perDayRate = grossBase / 30;
  const unpaidLeaveDeduction = Math.round(unpaidLeaveDays * perDayRate);

  // Overtime Bonus
  const hourlyRate = (baseSalary / 160) * 1.5; // 1.5x OT rate
  const overtimeBonus = Math.round(overtimeHours * hourlyRate);

  // PF & Tax Deductions
  const pfDeduction = employee.salaryStructure?.pfEligible ? Math.round(baseSalary * 0.12) : 0;
  const taxRate = (employee.salaryStructure?.taxDeductionPercent || 5) / 100;
  const taxDeduction = Math.round((grossBase - unpaidLeaveDeduction + overtimeBonus) * taxRate);

  const grossEarnings = grossBase + overtimeBonus;
  const totalDeductions = pfDeduction + taxDeduction + unpaidLeaveDeduction;
  const netPay = Math.max(0, grossEarnings - totalDeductions);

  return {
    monthYear,
    employeeId: employee.id,
    employeeName: employee.name,
    role: employee.role.replace('_', ' ').toUpperCase(),
    department: employee.department,
    baseSalary,
    hraAllowance,
    specialAllowance,
    overtimeHours,
    overtimeBonus,
    unpaidLeaveDays,
    unpaidLeaveDeduction,
    pfDeduction,
    taxDeduction,
    totalDeductions,
    grossEarnings,
    netPay,
    status: 'pending',
    bankAccount: employee.salaryStructure?.bankAccount || 'HDFC-502000' + employee.empId.slice(-4),
  };
}

/**
 * Determine clock-in attendance status based on shift start
 */
export function getAttendanceStatus(
  shiftStartTime: string,
  clockInTimeIso: string
): 'on_time' | 'late' | 'overtime' {
  const clockIn = new Date(clockInTimeIso);
  const [sh, sm] = shiftStartTime.split(':').map(Number);
  
  const expected = new Date(clockIn);
  expected.setHours(sh, sm, 0, 0);

  const diffMins = (clockIn.getTime() - expected.getTime()) / (1000 * 60);
  if (diffMins > 15) return 'late';
  return 'on_time';
}
