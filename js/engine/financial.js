/**
 * OmniCalc Pro - Financial & Business Math Engine
 * TVM, Loan/Mortgage Amortization, Compound Interest, ROI, Inflation, Tip & Tax.
 */

class FinancialEngine {
  /**
   * TVM (Time Value of Money) - Calculate Payment (PMT)
   * @param {number} rate Annual interest rate in percent (e.g. 6 for 6%)
   * @param {number} nper Total number of payment periods (e.g. 360 for 30yr monthly)
   * @param {number} pv Present Value (Principal amount)
   * @param {number} fv Future Value (Default 0)
   * @param {number} type 0 = end of period, 1 = beginning of period
   */
  static calcPMT(rate, nper, pv, fv = 0, type = 0) {
    const r = (rate / 100) / 12; // Monthly rate
    if (r === 0) return -(pv + fv) / nper;
    const pvif = Math.pow(1 + r, nper);
    let pmt = (r * (pv * pvif + fv)) / (pvif - 1);
    if (type === 1) pmt /= (1 + r);
    return -pmt;
  }

  /**
   * Calculate Present Value (PV)
   */
  static calcPV(rate, nper, pmt, fv = 0, type = 0) {
    const r = (rate / 100) / 12;
    if (r === 0) return -pmt * nper - fv;
    const pvif = Math.pow(1 + r, nper);
    let pv = ((-pmt * (pvif - 1) / r) - fv) / pvif;
    if (type === 1) pv /= (1 + r);
    return pv;
  }

  /**
   * Calculate Future Value (FV)
   */
  static calcFV(rate, nper, pmt, pv = 0, type = 0) {
    const r = (rate / 100) / 12;
    if (r === 0) return -pv - pmt * nper;
    const pvif = Math.pow(1 + r, nper);
    let fv = -pv * pvif - (pmt * (pvif - 1) / r) * (type === 1 ? (1 + r) : 1);
    return fv;
  }

  /**
   * Generate Full Loan Amortization Schedule
   */
  static calcLoanAmortization(principal, annualRate, years, monthlyExtra = 0) {
    const monthlyRate = (annualRate / 100) / 12;
    const totalMonths = Math.round(years * 12);
    const emi = Math.abs(this.calcPMT(annualRate, totalMonths, principal));

    let balance = principal;
    let totalInterest = 0;
    const schedule = [];

    for (let month = 1; month <= totalMonths; month++) {
      if (balance <= 0) break;

      const interest = balance * monthlyRate;
      let principalPayment = emi - interest + monthlyExtra;
      if (principalPayment > balance) {
        principalPayment = balance;
      }
      balance -= principalPayment;
      totalInterest += interest;

      schedule.push({
        month,
        payment: principalPayment + interest,
        principal: principalPayment,
        interest,
        totalInterest,
        remainingBalance: Math.max(0, balance)
      });
    }

    return {
      monthlyPayment: emi,
      totalPayment: principal + totalInterest,
      totalInterest,
      schedule
    };
  }

  /**
   * Compound Interest with Periodic Monthly Deposits
   */
  static calcCompoundInterest(principal, monthlyDeposit, annualRate, years, compoundFreq = 12) {
    const r = annualRate / 100;
    const n = compoundFreq;
    const t = years;
    const months = t * 12;

    let balance = principal;
    let totalDeposits = principal;
    const yearlyBreakdown = [];

    for (let yr = 1; yr <= t; yr++) {
      for (let m = 1; m <= 12; m++) {
        balance += monthlyDeposit;
        totalDeposits += monthlyDeposit;
        balance *= Math.pow(1 + r / n, n / 12);
      }
      yearlyBreakdown.push({
        year: yr,
        deposits: totalDeposits,
        interestEarned: balance - totalDeposits,
        totalBalance: balance
      });
    }

    return {
      finalBalance: balance,
      totalPrincipal: totalDeposits,
      totalInterest: balance - totalDeposits,
      breakdown: yearlyBreakdown
    };
  }

  /**
   * Return on Investment (ROI)
   */
  static calcROI(initialInvestment, finalValue, durationYears = 1) {
    const netProfit = finalValue - initialInvestment;
    const roiPercentage = (netProfit / initialInvestment) * 100;
    const annualizedROI = durationYears > 0 ? (Math.pow(finalValue / initialInvestment, 1 / durationYears) - 1) * 100 : roiPercentage;

    return {
      netProfit,
      roiPercentage,
      annualizedROI
    };
  }

  /**
   * Tip & Split Bill Calculator
   */
  static calcTip(billAmount, tipPercentage, numPeople = 1, taxPercentage = 0) {
    const taxAmount = (billAmount * taxPercentage) / 100;
    const tipAmount = (billAmount * tipPercentage) / 100;
    const totalAmount = billAmount + taxAmount + tipAmount;
    const perPerson = totalAmount / Math.max(1, numPeople);

    return {
      taxAmount,
      tipAmount,
      totalAmount,
      perPerson
    };
  }

  /**
   * Inflation Impact Calculator
   */
  static calcInflation(currentAmount, inflationRate, years) {
    const futureEquivalent = currentAmount * Math.pow(1 + inflationRate / 100, years);
    const purchasingPowerLoss = currentAmount - (currentAmount / Math.pow(1 + inflationRate / 100, years));

    return {
      futureCost: futureEquivalent,
      purchasingPowerLoss
    };
  }
}

window.FinancialEngine = FinancialEngine;
