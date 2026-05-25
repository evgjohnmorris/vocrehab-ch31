export const calculateCombinedRating = (ratings) => {
  if (ratings.length === 0) return { rounded: 0, finalVal: 0, steps: ["No disability ratings added."] };
  
  // Sort ratings
  const ratingsList = [...ratings].map(r => ({ ...r, value: Number(r.value) }));
  
  // Calculate unique extremities affected across all ratings to see if bilateral rules apply
  const allLimbs = {
    leftArm: ratingsList.some(r => r.affectedLimbs?.leftArm),
    rightArm: ratingsList.some(r => r.affectedLimbs?.rightArm),
    leftLeg: ratingsList.some(r => r.affectedLimbs?.leftLeg),
    rightLeg: ratingsList.some(r => r.affectedLimbs?.rightLeg)
  };
  const numAffectedLimbs = (allLimbs.leftArm ? 1 : 0) + 
                           (allLimbs.rightArm ? 1 : 0) + 
                           (allLimbs.leftLeg ? 1 : 0) + 
                           (allLimbs.rightLeg ? 1 : 0);
  const useBilateralMath = numAffectedLimbs >= 2;

  const bilateralRatings = useBilateralMath 
    ? ratingsList.filter(r => r.affectedLimbs && Object.values(r.affectedLimbs).some(v => v === true)).map(r => r.value).sort((a, b) => b - a)
    : [];
  
  const normalRatings = useBilateralMath
    ? ratingsList.filter(r => !r.affectedLimbs || !Object.values(r.affectedLimbs).some(v => v === true)).map(r => r.value).sort((a, b) => b - a)
    : ratingsList.map(r => r.value).sort((a, b) => b - a);
  
  let bilateralCombined = 0;
  let steps = [];
  if (bilateralRatings.length > 0) {
    let current = 100;
    let combinationStr = "";
    bilateralRatings.forEach((val, i) => {
      if (i === 0) {
        combinationStr += `${val}%`;
      } else {
        combinationStr += ` + ${val}% = ${(100 - current).toFixed(1)}%`;
      }
      current = current * (1 - val / 100);
    });
    const combined = 100 - current;
    const bilateralFactor = combined * 0.1;
    bilateralCombined = combined + bilateralFactor;
    steps.push(`Combine Bilateral Extremities: ${combinationStr}`);
    steps.push(`Apply 10% Bilateral Factor (since multiple extremities are affected): ${combined.toFixed(1)}% + 10% (${bilateralFactor.toFixed(1)}%) = ${bilateralCombined.toFixed(2)}%`);
  }
  
  const allRatings = [...normalRatings];
  if (bilateralRatings.length > 0) {
    allRatings.push(bilateralCombined);
  }
  allRatings.sort((a, b) => b - a);
  
  let currentVal = 100;
  let combStepsStr = [];
  allRatings.forEach((val) => {
    const prev = currentVal;
    currentVal = currentVal * (1 - val / 100);
    const combined = 100 - currentVal;
    combStepsStr.push(`Combine ${val.toFixed(1)}%: ${prev.toFixed(1)}% remaining × (1 - ${val}%) = ${currentVal.toFixed(1)}% remaining (${combined.toFixed(1)}% combined)`);
  });
  
  const finalVal = 100 - currentVal;
  if (combStepsStr.length > 0) {
    steps.push(combStepsStr.join(" -> "));
  }
  const rounded = Math.round(finalVal / 10) * 10;
  steps.push(`Final combined rating: ${finalVal.toFixed(2)}% -> Rounded to nearest 10% = ${rounded}%`);
  
  return { rounded: Math.min(100, rounded), finalVal, steps };
};

export const calculateDisabilityPay = ({
  combinedRating,
  smcLevel,
  hasSmcK,
  smcKCount,
  depSpouse,
  depSpouseAa,
  depChildrenUnder18,
  depChildrenSchool,
  depParents,
  VA_DISABILITY_COMP_TABLE_2026,
  SMC_RATES_2026
}) => {
  let baseRate = VA_DISABILITY_COMP_TABLE_2026.base_rates[combinedRating] || 0;
  let isSmcActive = smcLevel !== 'none';
  let smcBase = SMC_RATES_2026[smcLevel] || 0;
  let totalPay = isSmcActive ? smcBase : baseRate;
  
  if (combinedRating >= 30 || isSmcActive) {
    const depRating = isSmcActive ? 100 : combinedRating;
    const addons = VA_DISABILITY_COMP_TABLE_2026.addons;
    let depAddon = 0;
    if (depSpouse) {
      if (depChildrenUnder18 > 0) {
        depAddon += addons.spouse_child[depRating] || 0;
        depAddon += (addons.add_child_under18[depRating] || 0) * (depChildrenUnder18 - 1);
        depAddon += (addons.add_schoolchild_over18[depRating] || 0) * depChildrenSchool;
      } else {
        depAddon += addons.spouse[depRating] || 0;
        depAddon += (addons.add_schoolchild_over18[depRating] || 0) * depChildrenSchool;
      }
      if (depSpouseAa) {
        depAddon += addons.spouse_aid_attendance[depRating] || 0;
      }
    } else {
      if (depChildrenUnder18 > 0) {
        depAddon += addons.child[depRating] || 0;
        depAddon += (addons.add_child_under18[depRating] || 0) * (depChildrenUnder18 - 1);
        depAddon += (addons.add_schoolchild_over18[depRating] || 0) * depChildrenSchool;
      } else {
        depAddon += (addons.add_schoolchild_over18[depRating] || 0) * depChildrenSchool;
      }
    }
    depAddon += (addons.parent[depRating] || 0) * depParents;
    
    if (smcLevel !== 'smc_r1' && smcLevel !== 'smc_r2') {
      totalPay += depAddon;
    }
  }
  
  if (hasSmcK) {
    totalPay += SMC_RATES_2026.smc_k * smcKCount;
  }
  return totalPay;
};

export const calculatePensionResult = ({
  pensionNetWorth,
  pensionExpenses,
  pensionIncome,
  pensionCategory,
  depSpouse,
  depChildrenUnder18,
  depChildrenSchool,
  VA_PENSION_MAPR_2026
}) => {
  const table = VA_PENSION_MAPR_2026;
  const dependentsCount = (depSpouse ? 1 : 0) + depChildrenUnder18 + depChildrenSchool;
  if (pensionNetWorth > table.net_worth_limit) {
    return { eligible: false, reason: `Net Worth ($${pensionNetWorth.toLocaleString()}) exceeds the 2026 limit of $${table.net_worth_limit.toLocaleString()}.` };
  }
  
  let baseMapr = 0;
  let rateLabel = "";
  if (pensionCategory === 'basic') {
    baseMapr = dependentsCount > 0 ? table.basic_dependent : table.basic_alone;
    rateLabel = dependentsCount > 0 ? "Basic with Dependents" : "Basic Alone";
  } else if (pensionCategory === 'housebound') {
    baseMapr = dependentsCount > 0 ? table.housebound_dependent : table.housebound_alone;
    rateLabel = dependentsCount > 0 ? "Housebound with Dependents" : "Housebound Alone";
  } else if (pensionCategory === 'aa') {
    baseMapr = dependentsCount > 0 ? table.aa_dependent : table.aa_alone;
    rateLabel = dependentsCount > 0 ? "Aid & Attendance with Dependents" : "Aid & Attendance Alone";
  }
  
  const extraChildren = dependentsCount > 1 ? (dependentsCount - 1) : 0;
  const totalMapr = baseMapr + extraChildren * table.add_child;
  
  const medicalThreshold = totalMapr * 0.05;
  const allowableMedical = Math.max(0, pensionExpenses - medicalThreshold);
  const countableIncome = Math.max(0, pensionIncome - allowableMedical);
  
  const pensionAnnual = Math.max(0, totalMapr - countableIncome);
  const pensionMonthly = pensionAnnual / 12;
  
  return {
    eligible: pensionAnnual > 0,
    reason: pensionAnnual > 0 ? "Eligible" : "Countable income exceeds Maximum Annual Pension Rate (MAPR).",
    totalMapr,
    medicalThreshold,
    allowableMedical,
    countableIncome,
    pensionAnnual,
    pensionMonthly,
    rateLabel
  };
};

export const calculateRetirementResult = ({
  retSystem,
  retYearsService,
  retBasePay,
  retMedical,
  retDodRating,
  retCombat,
  retCombatRating,
  calculatedDisabilityPay,
  combinedRating,
  VA_DISABILITY_COMP_TABLE_2026
}) => {
  const mult = retSystem === 'high3' ? 0.025 : 0.02;
  const longevityRate = retYearsService * mult;
  
  const longevityRetiredPay = retBasePay * longevityRate;
  const disabilityRetiredPay = retMedical ? Math.min(retBasePay * 0.75, retBasePay * (retDodRating / 100)) : 0;
  
  const initialDoDRetiredPay = retMedical ? disabilityRetiredPay : longevityRetiredPay;
  
  // Normal offset
  const offsetAmount = Math.min(initialDoDRetiredPay, calculatedDisabilityPay);
  const remainingDoDRetiredPay = Math.max(0, initialDoDRetiredPay - calculatedDisabilityPay);
  
  // CRDP restoration (regular, or medical with 20+ active years, and VA rating >= 50%)
  const crdpEligible = combinedRating >= 50 && (retYearsService >= 20 || !retMedical);
  const crdpRestored = crdpEligible ? Math.min(longevityRetiredPay, offsetAmount) : 0;
  
  // CRSC restoration
  const combatVaPay = VA_DISABILITY_COMP_TABLE_2026.base_rates[retCombatRating] || 0;
  const crscEligible = retCombat;
  const crscRestored = crscEligible ? Math.min(combatVaPay, offsetAmount, longevityRetiredPay) : 0;
  
  return {
    longevityRetiredPay,
    disabilityRetiredPay,
    initialDoDRetiredPay,
    offsetAmount,
    remainingDoDRetiredPay,
    crdpEligible,
    crdpRestored,
    crscEligible,
    crscRestored
  };
};
