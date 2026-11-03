/**
 * Utilitas dan Fungsi Kalkulasi Finansial Pinjaman (Loan Calculations)
 * Koperasi Konsumen Makmur Bersama Nusantara (KMB)
 *
 * Mengacu pada Business Rules BR-03.3, BR-03.8, dan BR-04.3:
 * - Integer Rupiah precision (tanpa desimal, Math.round).
 * - Sisa pembulatan pokok (residual rounding) dialokasikan ke angsuran bulan terakhir.
 * - Flat Rate (default), Anuitas, dan Efektif didukung.
 * - Prioritas alokasi pembayaran: Denda -> Bunga -> Pokok.
 * - Klasifikasi Kolektibilitas OJK/Koperasi (Lancar, DPK, Kurang Lancar, Diragukan, Macet).
 */

import {
  InterestCalculationMethod,
  LoanCollectibility,
  LoanInstallment,
} from "../types";

export interface ScheduleCalculationItem {
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  remainingPrincipalAfter: number;
}

export interface LoanSimulationResult {
  principalAmount: number;
  tenorMonths: number;
  annualInterestRatePct: number;
  calculationMethod: InterestCalculationMethod;
  adminFeePct: number;
  adminFeeAmount: number;
  netDisbursementAmount: number;
  monthlyInstallmentEstimate: number; // Angsuran bulan 1 sebagai indikator
  totalInterestAmount: number;
  totalRepaymentAmount: number;
  schedule: ScheduleCalculationItem[];
}

/**
 * Format tanggal YYYY-MM-DD dengan penambahan N bulan dari startDate
 */
export function addMonthsToDate(startDateStr: string, monthsToAdd: number): string {
  const date = new Date(startDateStr);
  const originalDay = date.getDate();
  date.setMonth(date.getMonth() + monthsToAdd);

  // Penanganan tanggal rollover akhir bulan (misal 31 Jan -> 28 Feb)
  if (date.getDate() !== originalDay) {
    date.setDate(0);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Hitung selisih hari kalender antara dua tanggal ISO (targetDate - baseDate)
 */
export function differenceInCalendarDays(targetDateStr: string, baseDateStr: string): number {
  const target = new Date(targetDateStr);
  const base = new Date(baseDateStr);
  const targetUtc = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const baseUtc = Date.UTC(base.getFullYear(), base.getMonth(), base.getDate());
  return Math.floor((targetUtc - baseUtc) / (1000 * 60 * 60 * 24));
}

/**
 * Kalkulasi Jadwal Angsuran Metode Flat Rate
 * Pokok Per Bulan = Math.floor(Jumlah Pinjaman / Tenor)
 * Bunga Per Bulan = Math.round((Jumlah Pinjaman * Suku Bunga Tahunan) / (12 * 100))
 * Sisa pembulatan pokok dialokasikan pada angsuran bulan terakhir.
 */
export function calculateFlatSchedule(
  principal: number,
  tenorMonths: number,
  annualInterestRatePct: number,
  startDateStr: string = new Date().toISOString().slice(0, 10)
): ScheduleCalculationItem[] {
  if (tenorMonths <= 0 || principal <= 0) return [];

  const basePrincipalMonthly = Math.floor(principal / tenorMonths);
  const monthlyInterest = Math.round((principal * annualInterestRatePct) / (12 * 100));
  const principalResidual = principal - (basePrincipalMonthly * tenorMonths);

  const schedule: ScheduleCalculationItem[] = [];
  let currentRemaining = principal;

  for (let k = 1; k <= tenorMonths; k++) {
    const isLastMonth = k === tenorMonths;
    const principalForMonth = isLastMonth
      ? basePrincipalMonthly + principalResidual
      : basePrincipalMonthly;
    const interestForMonth = monthlyInterest;
    const totalAmount = principalForMonth + interestForMonth;

    currentRemaining = isLastMonth ? 0 : currentRemaining - principalForMonth;

    schedule.push({
      installmentNumber: k,
      dueDate: addMonthsToDate(startDateStr, k),
      principalAmount: principalForMonth,
      interestAmount: interestForMonth,
      totalAmount,
      remainingPrincipalAfter: Math.max(0, currentRemaining),
    });
  }

  return schedule;
}

/**
 * Kalkulasi Jadwal Angsuran Metode Anuitas (Equal Monthly Installment)
 * Cicilan bulanan bernilai konstan, porsi bunga menurun, porsi pokok naik.
 */
export function calculateAnnuitySchedule(
  principal: number,
  tenorMonths: number,
  annualInterestRatePct: number,
  startDateStr: string = new Date().toISOString().slice(0, 10)
): ScheduleCalculationItem[] {
  if (tenorMonths <= 0 || principal <= 0) return [];

  // Jika bunga 0%, berlaku seperti flat rate murni
  if (annualInterestRatePct <= 0) {
    return calculateFlatSchedule(principal, tenorMonths, 0, startDateStr);
  }

  const monthlyRate = (annualInterestRatePct / 100) / 12;
  const factor = Math.pow(1 + monthlyRate, tenorMonths);
  const totalInstallmentMonthly = Math.round(
    principal * ((monthlyRate * factor) / (factor - 1))
  );

  const schedule: ScheduleCalculationItem[] = [];
  let currentRemaining = principal;

  for (let k = 1; k <= tenorMonths; k++) {
    const isLastMonth = k === tenorMonths;
    const interestForMonth = Math.round(currentRemaining * monthlyRate);
    let principalForMonth = totalInstallmentMonthly - interestForMonth;

    if (isLastMonth || principalForMonth > currentRemaining) {
      principalForMonth = currentRemaining;
    }

    currentRemaining = isLastMonth ? 0 : currentRemaining - principalForMonth;

    schedule.push({
      installmentNumber: k,
      dueDate: addMonthsToDate(startDateStr, k),
      principalAmount: principalForMonth,
      interestAmount: interestForMonth,
      totalAmount: principalForMonth + interestForMonth,
      remainingPrincipalAfter: Math.max(0, currentRemaining),
    });
  }

  return schedule;
}

/**
 * Kalkulasi Jadwal Angsuran Metode Efektif (Declining Balance)
 * Pokok konstan setiap bulan, bunga dihitung dari sisa saldo pokok.
 */
export function calculateEffectiveSchedule(
  principal: number,
  tenorMonths: number,
  annualInterestRatePct: number,
  startDateStr: string = new Date().toISOString().slice(0, 10)
): ScheduleCalculationItem[] {
  if (tenorMonths <= 0 || principal <= 0) return [];

  const basePrincipalMonthly = Math.floor(principal / tenorMonths);
  const principalResidual = principal - (basePrincipalMonthly * tenorMonths);

  const schedule: ScheduleCalculationItem[] = [];
  let currentRemaining = principal;

  for (let k = 1; k <= tenorMonths; k++) {
    const isLastMonth = k === tenorMonths;
    const principalForMonth = isLastMonth
      ? basePrincipalMonthly + principalResidual
      : basePrincipalMonthly;
    const interestForMonth = Math.round((currentRemaining * annualInterestRatePct) / (12 * 100));
    const totalAmount = principalForMonth + interestForMonth;

    currentRemaining = isLastMonth ? 0 : currentRemaining - principalForMonth;

    schedule.push({
      installmentNumber: k,
      dueDate: addMonthsToDate(startDateStr, k),
      principalAmount: principalForMonth,
      interestAmount: interestForMonth,
      totalAmount,
      remainingPrincipalAfter: Math.max(0, currentRemaining),
    });
  }

  return schedule;
}

/**
 * Router kalkulator berdasarkan metode kalkulasi yang dipilih
 */
export function generateSchedule(
  method: InterestCalculationMethod,
  principal: number,
  tenorMonths: number,
  annualInterestRatePct: number,
  startDateStr: string = new Date().toISOString().slice(0, 10)
): ScheduleCalculationItem[] {
  switch (method) {
    case "anuitas":
      return calculateAnnuitySchedule(principal, tenorMonths, annualInterestRatePct, startDateStr);
    case "efektif":
      return calculateEffectiveSchedule(principal, tenorMonths, annualInterestRatePct, startDateStr);
    case "flat":
    default:
      return calculateFlatSchedule(principal, tenorMonths, annualInterestRatePct, startDateStr);
  }
}

/**
 * Simulasi Lengkap Pinjaman untuk UI Wizard, Public Catalog, dan Persetujuan
 */
export function calculateLoanSimulation(
  principal: number,
  tenorMonths: number,
  annualInterestRatePct: number,
  calculationMethod: InterestCalculationMethod = "flat",
  adminFeePct: number = 1,
  startDateStr: string = new Date().toISOString().slice(0, 10)
): LoanSimulationResult {
  const safePrincipal = Math.max(0, Math.round(principal));
  const safeTenor = Math.max(1, Math.round(tenorMonths));
  const adminFeeAmount = Math.round((safePrincipal * adminFeePct) / 100);
  const netDisbursementAmount = Math.max(0, safePrincipal - adminFeeAmount);

  const schedule = generateSchedule(
    calculationMethod,
    safePrincipal,
    safeTenor,
    annualInterestRatePct,
    startDateStr
  );

  const totalInterestAmount = schedule.reduce((sum, item) => sum + item.interestAmount, 0);
  const totalRepaymentAmount = safePrincipal + totalInterestAmount;
  const monthlyInstallmentEstimate = schedule.length > 0 ? schedule[0].totalAmount : 0;

  return {
    principalAmount: safePrincipal,
    tenorMonths: safeTenor,
    annualInterestRatePct,
    calculationMethod,
    adminFeePct,
    adminFeeAmount,
    netDisbursementAmount,
    monthlyInstallmentEstimate,
    totalInterestAmount,
    totalRepaymentAmount,
    schedule,
  };
}

/**
 * Penentuan Status Kolektibilitas Berdasarkan Hari Keterlambatan Tertinggi
 * - 0 hari: Lancar
 * - 1–90 hari: DPK (Dalam Perhatian Khusus)
 * - 91–120 hari: Kurang Lancar
 * - 121–180 hari: Diragukan
 * - >180 hari: Macet
 */
export function determineCollectibility(daysPastDue: number): LoanCollectibility {
  if (daysPastDue <= 0) return "Lancar";
  if (daysPastDue <= 90) return "DPK";
  if (daysPastDue <= 120) return "Kurang Lancar";
  if (daysPastDue <= 180) return "Diragukan";
  return "Macet";
}

/**
 * Kalkulasi Denda Keterlambatan Angsuran
 * Sesuai BR-03.8:
 * - Masa tenggang (grace period): default 3 hari kalender
 * - Denda: 0.5% per hari dari sisa total angsuran yang terlambat
 * - Jika terlambat <= gracePeriodDays: denda = 0
 * - Jika terlambat > gracePeriodDays: denda dihitung dari hari keterlambatan penuh
 */
export function calculateLateFee(
  unpaidInstallmentAmount: number,
  daysLate: number,
  gracePeriodDays: number = 3,
  lateFeeDailyPct: number = 0.5
): number {
  if (unpaidInstallmentAmount <= 0 || daysLate <= gracePeriodDays) {
    return 0;
  }
  return Math.round(unpaidInstallmentAmount * (lateFeeDailyPct / 100) * daysLate);
}

/**
 * Alokasi Pembayaran Angsuran Berdasarkan Prioritas BR-04.3:
 * 1. Denda Keterlambatan
 * 2. Bunga Pinjaman
 * 3. Pokok Pinjaman
 */
export function allocateInstallmentPayment(
  paymentAmount: number,
  outstandingLateFee: number,
  outstandingInterest: number,
  outstandingPrincipal: number
): {
  allocatedLateFee: number;
  allocatedInterest: number;
  allocatedPrincipal: number;
  remainingUnallocated: number;
} {
  let funds = Math.max(0, paymentAmount);

  // 1. Denda
  const allocatedLateFee = Math.min(funds, Math.max(0, outstandingLateFee));
  funds -= allocatedLateFee;

  // 2. Bunga
  const allocatedInterest = Math.min(funds, Math.max(0, outstandingInterest));
  funds -= allocatedInterest;

  // 3. Pokok
  const allocatedPrincipal = Math.min(funds, Math.max(0, outstandingPrincipal));
  funds -= allocatedPrincipal;

  return {
    allocatedLateFee,
    allocatedInterest,
    allocatedPrincipal,
    remainingUnallocated: funds,
  };
}

/**
 * Simulasi Pelunasan Dipercepat (Early Repayment Simulation)
 * - Pokok pinjaman tersisa dilunasi penuh.
 * - Bunga berjalan bulan aktif diperhitungkan jika ada.
 * - Bunga masa mendatang dihapuskan (insentif bagi anggota koperasi).
 * - Denda keterlambatan (jika ada) tetap ditagihkan.
 */
export function calculateEarlyRepayment(installments: LoanInstallment[]): {
  unpaidPrincipalTotal: number;
  unpaidInterestCurrent: number;
  unpaidLateFeeTotal: number;
  totalEarlySettlementAmount: number;
  waivedFutureInterestAmount: number;
  unpaidInstallmentCount: number;
} {
  let unpaidPrincipalTotal = 0;
  let unpaidInterestCurrent = 0;
  let unpaidLateFeeTotal = 0;
  let waivedFutureInterestAmount = 0;
  let unpaidInstallmentCount = 0;

  let firstUnpaidFound = false;

  for (const inst of installments) {
    if (inst.status !== "paid") {
      unpaidInstallmentCount++;
      const unpaidPrincipalForInst = Math.max(0, inst.principalAmount - inst.paidPrincipal);
      const unpaidInterestForInst = Math.max(0, inst.interestAmount - inst.paidInterest);
      const unpaidLateFeeForInst = inst.lateFeeWaived
        ? 0
        : Math.max(0, inst.lateFeeAmount - inst.paidLateFee);

      unpaidPrincipalTotal += unpaidPrincipalForInst;
      unpaidLateFeeTotal += unpaidLateFeeForInst;

      if (!firstUnpaidFound) {
        // Angsuran berjalan pertama yang belum lunas tetap menagihkan sisa bunganya
        unpaidInterestCurrent += unpaidInterestForInst;
        firstUnpaidFound = true;
      } else {
        // Angsuran periode mendatang bunganya dihapuskan
        waivedFutureInterestAmount += unpaidInterestForInst;
      }
    }
  }

  const totalEarlySettlementAmount =
    unpaidPrincipalTotal + unpaidInterestCurrent + unpaidLateFeeTotal;

  return {
    unpaidPrincipalTotal,
    unpaidInterestCurrent,
    unpaidLateFeeTotal,
    totalEarlySettlementAmount,
    waivedFutureInterestAmount,
    unpaidInstallmentCount,
  };
}
