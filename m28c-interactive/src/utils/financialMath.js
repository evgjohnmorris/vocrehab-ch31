export const getPellEstimate = (pellDependency, pellFamilySize, pellAgi) => {
  const maxPell = 7395;
  let threshold = pellDependency === 'independent' && pellFamilySize === 1 ? 30000 : 45000;
  let phaseoutMax = pellDependency === 'independent' && pellFamilySize === 1 ? 65000 : 90000;
  
  if (pellAgi <= threshold) return maxPell;
  if (pellAgi >= phaseoutMax) return 0;
  
  const fraction = (pellAgi - threshold) / (phaseoutMax - threshold);
  return Math.max(0, Math.round(maxPell * (1 - fraction)));
};

export const getLoanRepayments = (loanInterest, loanDebt, loanFamilySize, loanAgi, loanUndergrad) => {
  const r = (loanInterest / 100) / 12;
  const n = 120; // 10 years
  
  let standardMonthly = 0;
  if (r > 0) {
    standardMonthly = loanDebt * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  } else {
    standardMonthly = loanDebt / n;
  }
  const standardTotalPaid = standardMonthly * n;
  const standardTotalInterest = standardTotalPaid - loanDebt;
  
  const graduatedInitial = standardMonthly * 0.6;
  const graduatedFinal = standardMonthly * 1.4;
  const graduatedTotalPaid = graduatedInitial * 24 + (standardMonthly * 0.8) * 24 + standardMonthly * 24 + (standardMonthly * 1.2) * 24 + graduatedFinal * 24;
  const graduatedTotalInterest = graduatedTotalPaid - loanDebt;
  
  const povertyBase = 15060 + (loanFamilySize - 1) * 5380;
  const saveThreshold = povertyBase * 2.25; 
  
  const discretionaryIncome = Math.max(0, loanAgi - saveThreshold);
  const multiplier = loanUndergrad ? 0.05 : 0.10; 
  const saveMonthly = (discretionaryIncome * multiplier) / 12;
  
  return {
    standardMonthly,
    standardTotalPaid,
    standardTotalInterest,
    graduatedInitial,
    graduatedFinal,
    graduatedTotalPaid,
    graduatedTotalInterest,
    saveThreshold,
    saveMonthly,
    povertyBase
  };
};

export const calculateDebtSnowball = (debtsList, snowballExtra) => {
  let list = debtsList.map(d => ({ ...d, balance: Number(d.balance), minPayment: Number(d.minPayment) }));
  list.sort((a, b) => a.balance - b.balance);
  let months = 0;
  const payoffProjection = [];
  
  // We clone the list to keep track of active balances
  let activeDebts = list.filter(d => d.balance > 0).map(d => ({ ...d }));
  
  if (activeDebts.length === 0) return { months: 0, payoffProjection: [] };
  
  while (activeDebts.length > 0 && months < 360) {
    months++;
    
    // Calculate total available pool: extra snowball + min payments of all active debts.
    let totalAvailablePool = Number(snowballExtra);
    list.forEach(d => {
      if (d.balance > 0) {
        totalAvailablePool += d.minPayment;
      }
    });
    
    // First, satisfy the minimum payments for all remaining active debts.
    let remainingPool = totalAvailablePool;
    const monthlyPayments = activeDebts.map(d => {
      const payment = Math.min(d.balance, d.minPayment);
      remainingPool -= payment;
      return { debtId: d.id, amount: payment };
    });
    
    // Apply the paid amounts to the balances
    activeDebts.forEach(d => {
      const payment = monthlyPayments.find(p => p.debtId === d.id);
      if (payment) {
        d.balance -= payment.amount;
      }
    });
    
    // Now, apply the remaining pool (extra snowball + leftovers from paid min payments)
    // to the active debts, starting from the smallest balance.
    for (let i = 0; i < activeDebts.length; i++) {
      if (activeDebts[i].balance > 0) {
        const extraPayment = Math.min(activeDebts[i].balance, remainingPool);
        activeDebts[i].balance -= extraPayment;
        remainingPool -= extraPayment;
      }
    }
    
    // Record any debts that were fully paid off this month
    activeDebts.forEach(d => {
      if (d.balance <= 0 && !payoffProjection.some(p => p.name === d.name)) {
        payoffProjection.push({ name: d.name, month: months });
      }
    });
    
    // Filter out paid-off debts for the next month
    activeDebts = activeDebts.filter(d => d.balance > 0);
  }
  
  return { months, payoffProjection };
};
