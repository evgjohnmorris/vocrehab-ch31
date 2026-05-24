export const calculateAllowance = ({
  rates,
  calcTrainingType,
  calcTime,
  calcDependents,
  calcBahRate,
  calcActiveDuty,
  calcVenue,
  calcTier,
  calcUseCredits,
  calcCredits,
  calcFullTimeThreshold,
  calcTuition,
  calcSchoolType,
  calcYellowRibbon,
  calcYrSchoolContribution,
  calcKicker,
  calcScholarships,
  calcIncludeComputer,
  calcComputerCost,
  calcOjtTrainingWage,
  calcOjtJourneymanWage
}) => {
  // FY 2026 Regular Chapter 31 Subsistence Rates
  const ch31Rates = {
    institutional: {
      full: rates.ch31_institutional_full,
      threeQuarters: rates.ch31_institutional_threeQuarters,
      half: rates.ch31_institutional_half
    },
    ojt: {
      full: rates.ch31_ojt,
      threeQuarters: [0, 0, 0, 0], // OJT is full-time only under Ch 31
      half: [0, 0, 0, 0]
    }
  };

  const type = calcTrainingType;
  const time = calcTime;
  const deps = calcDependents;

  // 1. Regular Ch31 Calculate
  let regularRate = 0;
  if (calcActiveDuty) {
    // Active duty service members receive NO subsistence allowance under Ch31, only tuition/fees/books
    regularRate = 0;
  } else {
    const rateTable = ch31Rates[type][time];
    if (rateTable) {
      if (deps <= 2) {
        regularRate = rateTable[deps] || 0;
      } else {
        const extraDeps = deps - 2;
        regularRate = (rateTable[2] || 0) + (extraDeps * (rateTable[3] || 0));
      }
    }
  }

  // 2. Post-9/11 BAH Option Calculate
  let p911Rate = 0;
  let baseMhaRate = 0;
  let rateOfPursuit = 1.0;

  if (calcActiveDuty) {
    p911Rate = 0;
  } else {
    if (calcVenue === 'in-person') {
      baseMhaRate = calcBahRate;
    } else if (calcVenue === 'online') {
      baseMhaRate = rates.p911_online_rate;
    } else if (calcVenue === 'foreign') {
      baseMhaRate = rates.p911_foreign_rate;
    }

    // Rate of Pursuit (RoP) calculation matching VA's official step proration rules
    if (calcUseCredits) {
      const ratio = calcCredits / calcFullTimeThreshold;
      if (ratio >= 1.0) rateOfPursuit = 1.0;
      else if (ratio >= 0.75) rateOfPursuit = 0.8;
      else if (ratio >= 0.55) rateOfPursuit = 0.6;
      else if (ratio > 0) rateOfPursuit = 0.5;
      else rateOfPursuit = 0.0;
    } else {
      if (time === 'full') rateOfPursuit = 1.0;
      else if (time === 'three-quarters') rateOfPursuit = 0.8;
      else if (time === 'half') rateOfPursuit = 0.5;
    }

    // Check if eligible for MHA (must be > 50% pursuit and not flight/correspondence under Chapter 33)
    if (rateOfPursuit <= 0.5 || calcSchoolType === 'flight' || calcSchoolType === 'correspondence') {
      p911Rate = 0;
    } else {
      p911Rate = (baseMhaRate * rateOfPursuit) + (calcKicker * rateOfPursuit);
    }
  }

  // 3. OJT step progression array
  let ojtP911Steps = [];
  let ojtCh31Steps = [];
  if (type === 'ojt') {
    const ojtBaseCh31 = calcActiveDuty ? 0 : (deps <= 2 ? rates.ch31_ojt[deps] : rates.ch31_ojt[2] + (deps - 2) * rates.ch31_ojt[3]);
    const ojtBaseP911 = calcActiveDuty ? 0 : (calcBahRate + calcKicker);
    
    const multipliers = [1.0, 0.8, 0.6, 0.4, 0.2];
    ojtP911Steps = multipliers.map(m => ojtBaseP911 * m);
    ojtCh31Steps = Array(5).fill(ojtBaseCh31); // Flat
    
    // Apply wage cap if applicable
    const hours = 120; // benchmark hours per month
    const trainingWageMonthly = calcOjtTrainingWage * hours;
    const journeymanWageMonthly = calcOjtJourneymanWage * hours;
    
    ojtCh31Steps = ojtCh31Steps.map(rate => {
      if (trainingWageMonthly + rate > journeymanWageMonthly) {
        return Math.max(0, journeymanWageMonthly - trainingWageMonthly);
      }
      return rate;
    });

    ojtP911Steps = ojtP911Steps.map(rate => {
      if (trainingWageMonthly + rate > journeymanWageMonthly) {
        return Math.max(0, journeymanWageMonthly - trainingWageMonthly);
      }
      return rate;
    });
  }

  // 4. Tuition & Books Comparison
  const tuitionCh31Covered = calcTuition; // Ch31 pays 100%
  
  let tuitionP911CoveredBase = 0;
  if (calcSchoolType === 'public') {
    tuitionP911CoveredBase = calcTuition * calcTier;
  } else if (calcSchoolType === 'private' || calcSchoolType === 'foreign') {
    tuitionP911CoveredBase = Math.min(calcTuition, rates.p911_private_tuition_cap) * calcTier;
  } else if (calcSchoolType === 'flight') {
    tuitionP911CoveredBase = Math.min(calcTuition, rates.p911_flight_cap) * calcTier;
  } else if (calcSchoolType === 'correspondence') {
    tuitionP911CoveredBase = Math.min(calcTuition, rates.p911_correspondence_cap) * calcTier;
  } else if (calcSchoolType === 'ojt') {
    tuitionP911CoveredBase = 0;
  }

  // Yellow Ribbon logic (Active duty servicemembers and spouses are not eligible for Yellow Ribbon)
  const outOfPocketBeforeYr = Math.max(0, calcTuition - tuitionP911CoveredBase);
  let yrVaMatch = 0;
  let yrSchoolPaid = 0;
  if (calcYellowRibbon && calcTier === 1.0 && calcSchoolType !== 'ojt' && !calcActiveDuty) {
    yrVaMatch = Math.min(calcYrSchoolContribution, outOfPocketBeforeYr / 2);
    yrSchoolPaid = yrVaMatch;
  }
  
  const tuitionP911Covered = tuitionP911CoveredBase + yrVaMatch;

  // Post-9/11 books is up to $1000 prorated by credits and scaled by tier
  let booksP911Covered = 0;
  if (calcSchoolType !== 'flight' && calcSchoolType !== 'correspondence' && calcSchoolType !== 'ojt') {
    booksP911Covered = rates.p911_books_cap * calcTier * (calcUseCredits ? Math.min(1.0, calcCredits / calcFullTimeThreshold) : (time === 'full' ? 1.0 : time === 'three-quarters' ? 0.75 : 0.5));
  }

  const computerCh31Covered = calcIncludeComputer ? calcComputerCost : 0;
  const computerP911Covered = 0;

  const comparison = p911Rate > regularRate 
    ? { better: 'post911', diff: p911Rate - regularRate }
    : { better: 'ch31', diff: regularRate - p911Rate };

  return {
    regularRate: regularRate.toFixed(2),
    p911Rate: p911Rate.toFixed(2),
    rateOfPursuit,
    comparison,
    ojtP911Steps,
    ojtCh31Steps,
    tuitionCh31Covered,
    tuitionP911CoveredBase,
    tuitionP911Covered,
    yrVaMatch,
    yrSchoolPaid,
    booksP911Covered,
    computerCh31Covered,
    computerP911Covered
  };
};
