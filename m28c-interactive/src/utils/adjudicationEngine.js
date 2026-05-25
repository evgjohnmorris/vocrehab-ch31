/**
 * VR&E Adjudication & Entitlement Rules Engine
 * Encapsulates the 13-stage sequential legal analysis for Chapter 31.
 */

// Helper to calculate delimiting date status
export function getDelimitingDateStatus(dischargeDate, ratingDecisionDate, todayStr = '2026-05-25') {
  if (!dischargeDate || !ratingDecisionDate) return null;
  const dTime = new Date(dischargeDate).getTime();
  const rTime = new Date(ratingDecisionDate).getTime();
  if (isNaN(dTime) || isNaN(rTime)) return null;

  const baseDate = dTime > rTime ? new Date(dischargeDate) : new Date(ratingDecisionDate);
  const delimitingDate = new Date(baseDate);
  delimitingDate.setFullYear(delimitingDate.getFullYear() + 12);
  
  const today = new Date(todayStr);
  const diffTime = delimitingDate.getTime() - today.getTime();
  const isExpired = diffTime < 0;
  const diffDays = Math.ceil(Math.abs(diffTime) / (1000 * 60 * 60 * 24));
  const diffYears = (diffDays / 365).toFixed(1);
  const delimitingStr = delimitingDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return { isExpired, delimitingStr, diffYears };
}

// Main entry point for adjudication analysis
export function analyzeEntitlement(facts) {
  const {
    rating = 0,
    dischargeStatus = 'honorable', // 'honorable' | 'general' | 'oth' | 'bad_conduct' | 'dishonorable' | 'uncharacterized'
    isActiveDuty = false,
    dischargeDate = '',
    ratingDecisionDate = '',
    scContributionPresent = true,
    currentEmploymentStatus = 'unemployed', // 'unemployed' | 'employed'
    caseStage = 'evaluation',
    jobSuitability = {}, // { aggravates_disability: bool, underemployed: bool, job_loss: bool, accommodations_needed: bool, contraindicated: bool, mismatch: bool }
    hasProposedDenial = false,
    denialReason = 'none', // 'none' | 'not_eligible' | 'no_eh' | 'not_feasible' | 'suitable_employment'
    hasWrittenDecision = false,
    checkedBarriers = {}, // e.g. { lifting: true }
    manualSehIndicators = {}, // e.g. { long_term_unemployment: true }
    checkedFeasibility = {}, // e.g. { unstable: true }
    checkedEvidence = {}, // e.g. { rating_decision: true }
    todayStr = '2026-05-25'
  } = facts;

  // Compute Delimiting Date
  const delimitingStatus = getDelimitingDateStatus(dischargeDate, ratingDecisionDate, todayStr);
  const is12YearExpired = delimitingStatus?.isExpired || false;

  // STAGE 1: Discharge Characterization & Bars (38 U.S.C. § 5303; 38 C.F.R. § 21.42)
  const isStatutoryDischargeBar = dischargeStatus === 'dishonorable' && !isActiveDuty;
  const isCharacterReviewNeeded = ['oth', 'bad_conduct', 'uncharacterized'].includes(dischargeStatus) && !isActiveDuty;

  // STAGE 2: Active Duty / IDES Pathway (38 C.F.R. § 21.40)
  const isIdesPathway = isActiveDuty;

  // STAGE 3: Basic Rating Threshold (38 U.S.C. § 3102)
  const isBelowRatingThreshold = rating === 0 && !isActiveDuty;

  // STAGE 4: Delimiting Date Expiration (38 C.F.R. § 21.44)
  // Handled above.

  // STAGE 5 & 6: Basic EH vs SEH requirement derivation (38 C.F.R. § 21.52)
  const requiresSEH = rating === 10 || is12YearExpired || isCharacterReviewNeeded;
  const requiresEH = rating >= 20 && !requiresSEH;

  // STAGE 7: Employment Handicap (EH) Scoring & Suitability Analysis (38 C.F.R. § 21.51)
  const physicalBarriers = ['lifting', 'sitting_standing', 'repetitive_wrist', 'mobility', 'ergonomic', 'sensory'];
  const cognitiveBarriers = ['ptsd_crowds', 'concentration', 'social_interaction'];
  const scheduleBarriers = ['appointments', 'flareups'];

  const physicalCount = Object.keys(checkedBarriers).filter(k => checkedBarriers[k] && physicalBarriers.includes(k)).length;
  const cognitiveCount = Object.keys(checkedBarriers).filter(k => checkedBarriers[k] && cognitiveBarriers.includes(k)).length;
  const scheduleCount = Object.keys(checkedBarriers).filter(k => checkedBarriers[k] && scheduleBarriers.includes(k)).length;
  const totalBarrierCount = physicalCount + cognitiveCount + scheduleCount;

  // Suitability check: detailed occupational suitability analyzer
  const isJobUnsuitable = currentEmploymentStatus === 'employed' && !!(
    jobSuitability.aggravates_disability ||
    jobSuitability.underemployed ||
    jobSuitability.job_loss ||
    jobSuitability.accommodations_needed ||
    jobSuitability.contraindicated ||
    jobSuitability.mismatch
  );

  let ehScore = totalBarrierCount;
  if (currentEmploymentStatus === 'employed') {
    if (isJobUnsuitable) {
      ehScore += 1;
    } else {
      ehScore = 0; // Current suitable employment defeats basic EH
    }
  }

  const isEhEstablished = scContributionPresent && ehScore >= 1 && (currentEmploymentStatus === 'unemployed' || isJobUnsuitable);

  // STAGE 8: Serious Employment Handicap (SEH) Scoring (38 C.F.R. § 21.52)
  const manualSehCount = Object.keys(manualSehIndicators).filter(k => manualSehIndicators[k]).length;
  let sehScore = manualSehCount;
  if (rating === 10) sehScore += 1;
  if (isCharacterReviewNeeded) sehScore += 1;
  if (is12YearExpired) sehScore += 1;
  // Neuropsychiatric severe factors contribute to SEH
  if (checkedBarriers['ptsd_crowds'] || checkedBarriers['concentration'] || checkedBarriers['social_interaction']) {
    sehScore += 1;
  }

  const isSehEstablished = isEhEstablished && (sehScore >= 2 || is12YearExpired || rating === 10 || isCharacterReviewNeeded);

  // STAGE 9: SC Disability Contribution Check
  const hasScContribution = scContributionPresent;

  // STAGE 10: Feasibility Assessment (38 C.F.R. § 21.53 / § 21.57 / § 21.74 / § 21.188)
  const isFeasibilityUncertain = Object.values(checkedFeasibility).filter(Boolean).length > 0;

  // STAGE 11: Calculate separate evidence scores for EH, SEH, Feasibility, and Denial challenge
  // We compute scores on a scale of 0-100 based on checked evidence items
  const basicEvidenceItems = ['rating_decision', 'dd214'];
  const ehEvidenceItems = ['treatment_notes', 'personal_statement'];
  const sehEvidenceItems = ['resume', 'job_demand', 'employment_rejection_letters'];
  const feasibilityEvidenceItems = ['medical_clearance', 'vocational_evaluation'];
  const denialEvidenceItems = ['written_denial_letter', 'eva_correspondence'];

  const calcSubScore = (items, checked) => {
    if (items.length === 0) return 100;
    const found = items.filter(id => checked[id]).length;
    return Math.round((found / items.length) * 100);
  };

  const basicEligibilityScore = calcSubScore(basicEvidenceItems, checkedEvidence);
  const ehEvidenceScore = calcSubScore(ehEvidenceItems, checkedEvidence);
  const sehEvidenceScore = calcSubScore(sehEvidenceItems, checkedEvidence);
  const feasibilityEvidenceScore = calcSubScore(feasibilityEvidenceItems, checkedEvidence);
  const denialChallengeScore = calcSubScore(denialEvidenceItems, checkedEvidence);

  const evidenceScore = (checkedEvidence.rating_decision ? 20 : 0) +
                        (checkedEvidence.treatment_notes ? 25 : 0) +
                        (checkedEvidence.syllabus ? 15 : 0) +
                        (checkedEvidence.resume ? 15 : 0) +
                        (checkedEvidence.job_demand ? 15 : 0) +
                        (checkedEvidence.personal_statement ? 10 : 0);

  // STAGE 12: Procedural VA Errors Spotting
  const activeErrors = [];
  if (rating === 10 && caseStage === 'discontinued' && denialReason === 'not_eligible') {
    activeErrors.push({
      id: "10-percent-categorical-denial",
      error: "VA may have treated a 10% Veteran as categorically ineligible.",
      whyItMatters: "A 10% rating supports entitlement if the VA finds a Serious Employment Handicap.",
      authorities: ["38-usc-3102", "38-cfr-21-40", "38-cfr-21-52"],
      bestMove: "Request a Serious Employment Handicap determination and submit supporting SEH evidence."
    });
  }
  if (currentEmploymentStatus === 'employed' && denialReason === 'suitable_employment' && isJobUnsuitable) {
    activeErrors.push({
      id: "current-employment-improper-denial",
      error: "VA may have treated current employment as categorically overcoming impairment.",
      whyItMatters: "The analysis must address suitability, stability, and whether impairment has actually been overcome under 38 C.F.R. § 21.51.",
      authorities: ["38-cfr-21-51"],
      bestMove: "Submit medical and occupational evidence that the job is unsuitable, unstable, or aggravates your conditions."
    });
  }
  if (denialReason === 'no_eh' && hasScContribution && !isEhEstablished) {
    activeErrors.push({
      id: "no-sc-contribution-analysis",
      error: "VA may have failed to analyze service-connected disability contribution.",
      whyItMatters: "An Employment Handicap requires analyzing whether service-connected disability contributes to vocational impairment.",
      authorities: ["38-cfr-21-51"],
      bestMove: "Submit a direct service-connected contribution statement and functional clinical evidence."
    });
  }
  if (rating === 10 && denialReason === 'no_eh' && (is12YearExpired || Object.keys(manualSehIndicators).filter(k => manualSehIndicators[k]).length > 0)) {
    activeErrors.push({
      id: "seh-not-separately-analyzed",
      error: "VA may have failed to perform a separate Serious Employment Handicap determination.",
      whyItMatters: "A separate SEH determination is required when basic Employment Handicap criteria are not fully met but SEH indicators exist.",
      authorities: ["38-cfr-21-52"],
      bestMove: "Request a written, formal SEH determination."
    });
  }
  if (denialReason === 'not_feasible' && isFeasibilityUncertain) {
    activeErrors.push({
      id: "unsupported-infeasibility",
      error: "VA may have made an unsupported feasibility denial.",
      whyItMatters: "Feasibility evaluations must resolve doubt in the Veteran's favor, consider appropriate supports/accommodations, or authorize an Extended Evaluation.",
      authorities: ["38-cfr-21-53", "38-cfr-21-57", "38-cfr-21-74"],
      bestMove: "Request an Extended Evaluation under 38 C.F.R. § 21.74 to test capacity with support."
    });
  }
  if (!hasWrittenDecision && hasProposedDenial) {
    activeErrors.push({
      id: "no-written-rationale",
      error: "Counselor proposed denial or closed case without providing written rationale.",
      whyItMatters: "Veterans must be provided a written decision notice containing reasons, evidence relied upon, and review-rights.",
      authorities: ["38-cfr-21-50"],
      bestMove: "Request a formal written decision and counseling narrative (VA Form 28-1902b)."
    });
  }

  // STAGE 13: Derive Adjudication Pathway
  let path;
  let law;
  let title;
  
  if (isStatutoryDischargeBar || isBelowRatingThreshold) {
    path = 'STATUTORY_BAR_ACTIVE';
    law = '38 U.S.C. § 5303; 38 C.F.R. § 21.42';
    title = 'Statutory Criteria Not Satisfied';
  } else if (isCharacterReviewNeeded) {
    path = 'CHARACTER_REVIEW_PATH';
    law = '38 U.S.C. § 5303; 38 C.F.R. § 3.12';
    title = 'Administrative Character of Discharge Review Required';
  } else if (hasProposedDenial && !hasWrittenDecision) {
    path = 'WRITTEN_DECISION_NEEDED';
    law = '38 C.F.R. § 21.50';
    title = 'Denial Posture (Formal Written Rationale Requested)';
  } else if (isFeasibilityUncertain && (isEhEstablished || isSehEstablished)) {
    path = 'FEASIBILITY_DISPUTE';
    law = '38 U.S.C. § 3106; 38 C.F.R. § 21.57; 38 C.F.R. § 21.74';
    title = 'Entitled, but Vocational Feasibility Disputed';
  } else if (requiresSEH) {
    if (isSehEstablished) {
      path = 'LIKELY_10_SEH_SUPPORT';
      law = '38 U.S.C. § 3102; 38 C.F.R. § 21.52';
      title = 'Likely entitlement support — VRC determination still required (SEH Path)';
    } else {
      path = 'TEN_PERCENT_SEH_EVIDENCE_NEEDED';
      law = '38 U.S.C. § 3102; 38 C.F.R. § 21.52';
      title = 'Eligible, but SEH Evidence Required (10% / Expired Path)';
    }
  } else {
    if (isEhEstablished) {
      path = 'LIKELY_20_EH_SUPPORT';
      law = '38 U.S.C. § 3102; 38 C.F.R. § 21.51';
      title = 'Likely entitlement support — VRC determination still required (EH Path)';
    } else {
      path = 'TWENTY_PERCENT_EH_EVIDENCE_NEEDED';
      law = '38 U.S.C. § 3102; 38 C.F.R. § 21.51';
      title = 'Eligible, but EH Evidence Required (20%+ Path)';
    }
  }

  // Facts Supporting & Hurting
  const factsSupport = [];
  const factsHurt = [];

  // Derive Missing Evidence Lists
  const evidenceMissing = {
    basic: [],
    eh: [],
    seh: [],
    feasibility: [],
    denial: []
  };

  if (!checkedEvidence.rating_decision) evidenceMissing.basic.push('VA Disability Rating Decision Letter');
  if (!checkedEvidence.dd214) evidenceMissing.basic.push('DD-214 Certificate of Release/Discharge');
  
  if (!checkedEvidence.treatment_notes) evidenceMissing.eh.push("Treatment notes or doctor's letter detailing work limitations");
  if (!checkedEvidence.personal_statement) evidenceMissing.eh.push('Personal statement of necessity (remarks narrative)');

  if (!checkedEvidence.resume) evidenceMissing.seh.push('Resume showing past job attempts and transitions');
  if (!checkedEvidence.job_demand) evidenceMissing.seh.push('Local labor market demand indicators (LMI)');
  if (!checkedEvidence.employment_rejection_letters) evidenceMissing.seh.push('Job rejection letters or unemployment history logs');

  if (!checkedEvidence.medical_clearance) evidenceMissing.feasibility.push('Medical clearance statement from physician');
  if (!checkedEvidence.vocational_evaluation) evidenceMissing.feasibility.push('Vocational testing and aptitude assessment reports');

  if (!checkedEvidence.written_denial_letter) evidenceMissing.denial.push('Official written Decision Notice (VAF 20-0998 equivalent)');
  if (!checkedEvidence.eva_correspondence) evidenceMissing.denial.push('Written messages/emails from VRC proposing denial');

  // Supporting Facts
  if (isIdesPathway) {
    factsSupport.push('Active-duty service member undergoing IDES satisfies basic eligibility under 38 C.F.R. § 21.40.');
  } else {
    if (rating >= 20) {
      factsSupport.push(`Disability rating of ${rating}% satisfies baseline application criteria for standard Employment Handicap evaluation.`);
    } else if (rating === 10) {
      factsSupport.push('Disability rating of 10% satisfies basic eligibility to apply.');
    }
  }

  if (dischargeStatus === 'honorable' || dischargeStatus === 'general') {
    factsSupport.push(`Discharge characterization (${dischargeStatus}) represents a non-barring military service record.`);
  }

  if (delimitingStatus && !delimitingStatus.isExpired) {
    factsSupport.push(`Basic eligibility window is active and remains open until ${delimitingStatus.delimitingStr}.`);
  }

  if (hasScContribution) {
    factsSupport.push('Rated service-connected conditions contribute to current vocational impairment.');
  }

  if (totalBarrierCount > 0) {
    factsSupport.push(`Factual record documents ${totalBarrierCount} active physical/cognitive occupational barriers.`);
  }

  if (currentEmploymentStatus === 'employed' && isJobUnsuitable) {
    factsSupport.push('Current employment is unsuitable due to disability aggravation, mismatch, or underemployment.');
  } else if (currentEmploymentStatus === 'unemployed') {
    factsSupport.push('Unemployed status demonstrates vocational displacement caused in part by rating limitations.');
  }

  // Hurting Facts
  if (dischargeStatus === 'dishonorable') {
    factsHurt.push('Dishonorable discharge status acts as a statutory bar under 38 U.S.C. § 5303.');
  } else if (isCharacterReviewNeeded) {
    factsHurt.push(`Discharge characterization (${dischargeStatus}) necessitates administrative Character of Service review under 38 C.F.R. § 3.12.`);
  }

  if (rating === 0 && !isActiveDuty) {
    factsHurt.push('VA disability rating is 0%, failing to satisfy basic application requirements.');
  }

  if (is12YearExpired) {
    factsHurt.push('Basic 12-year eligibility period has expired, requiring an assessed Serious Employment Handicap (SEH) under 38 C.F.R. § 21.52.');
  }

  if (!hasScContribution) {
    factsHurt.push('Lacking direct connection between service-connected rating and vocational impairment.');
  }

  if (totalBarrierCount === 0) {
    factsHurt.push('No physical or cognitive occupational barriers documented, failing to demonstrate vocational impairment.');
  }

  if (currentEmploymentStatus === 'employed' && !isJobUnsuitable) {
    factsHurt.push('Employed in a job not marked as unsuitable, which the VA may interpret as having overcome impairment under 38 C.F.R. § 21.51.');
  }

  if (isFeasibilityUncertain) {
    factsHurt.push('Medical instability or treatment schedule introduces uncertainty regarding immediate training feasibility.');
  }

  // Next steps formulation
  const nextSteps = [];
  if (path === 'STATUTORY_BAR_ACTIVE') {
    if (dischargeStatus === 'dishonorable') {
      nextSteps.push('Apply to the Discharge Review Board (DRB) or Board for Correction of Military Records (BCMR) for character upgrade.');
    } else {
      nextSteps.push('File for a rating increase or new service connections on VA.gov to reach the 10% threshold.');
    }
  } else if (path === 'CHARACTER_REVIEW_PATH') {
    nextSteps.push('Request a formal administrative Character of Discharge review by the VA Regional Office.');
    nextSteps.push('Submit service records, character references, and a statement explaining the circumstances of discharge.');
  } else if (path === 'WRITTEN_DECISION_NEEDED') {
    nextSteps.push('Request a formal written Decision Notice and counseling narrative (VA Form 28-1902b) under 38 C.F.R. § 21.50.');
    nextSteps.push('Do not file a Higher-Level Review (HLR) appeal yet: there is no written decision to review.');
  } else if (path === 'FEASIBILITY_DISPUTE') {
    nextSteps.push('Submit a formal request for an Extended Evaluation plan (up to 12 months) under 38 C.F.R. § 21.74.');
    nextSteps.push('Gather treating doctor statements explaining that you can train with accommodations.');
    nextSteps.push('If a vocational goal is ruled completely infeasible, ensure VA evaluates you for Independent Living (IL) services.');
  } else if (requiresSEH && !isSehEstablished) {
    nextSteps.push('Gather evidence of failed work or training attempts to demonstrate significant impairment.');
    nextSteps.push('Submit a Serious Employment Handicap (SEH) statement detailing severe functional barriers.');
  } else if (requiresEH && !isEhEstablished) {
    nextSteps.push('Document how your service-connected conditions interfere with specific physical or cognitive job tasks.');
    nextSteps.push('Submit an Employment Handicap Remarks Narrative to detail occupational barriers.');
  } else {
    nextSteps.push('File VA Form 28-1900 on VA.gov.');
    nextSteps.push('Assemble your evidence portfolio (VA rating letter, resume, doctor letters) for your evaluation.');
  }

  // Authorities list
  const authorities = [];
  if (isStatutoryDischargeBar) authorities.push("38-usc-5303", "38-cfr-21-42");
  if (isCharacterReviewNeeded) authorities.push("38-usc-5303", "38-cfr-21-42", "38-cfr-3-12");
  if (isBelowRatingThreshold) authorities.push("38-usc-3102", "38-cfr-21-40");
  if (isIdesPathway) authorities.push("38-cfr-21-40");
  if (is12YearExpired) authorities.push("38-usc-3103", "38-cfr-21-44");
  if (requiresEH) authorities.push("38-usc-3102", "38-cfr-21-51");
  if (requiresSEH) authorities.push("38-usc-3102", "38-cfr-21-52");
  if (isFeasibilityUncertain) authorities.push("38-usc-3106", "38-cfr-21-53", "38-cfr-21-57", "38-cfr-21-74");
  if (hasProposedDenial) authorities.push("38-cfr-21-50");

  // Document to generate
  let recommendedDocument = 'remarks';
  if (path === 'WRITTEN_DECISION_NEEDED') recommendedDocument = 'written_rationale';
  else if (path === 'FEASIBILITY_DISPUTE') recommendedDocument = 'ext_eval';
  else if (requiresSEH) recommendedDocument = 'seh_statement';

  // Review-Lane Warning
  let reviewLaneWarning;
  if (path === 'STATUTORY_BAR_ACTIVE') {
    reviewLaneWarning = "Review lanes are unavailable. You must satisfy statutory requirements before any appeals can be lodged."; // @cite 38-usc-5303
  } else if (!hasWrittenDecision) {
    reviewLaneWarning = "Higher-Level Review (HLR), Supplemental Claim, or Board Appeals cannot be filed without a finalized, written VA Decision Notice. If you only received verbal counselor feedback, you must request a formal written decision first. Do not file HLR yet."; // @cite 38-cfr-21-198
  } else {
    reviewLaneWarning = "Ensure you submit your appeal within 1 year of the date on the written Decision Notice. Choose Higher-Level Review (HLR) for legal/procedural errors where no new evidence is needed, or a Supplemental Claim if you have new and relevant evidence to submit.";
  }

  // Visual split indicator
  const visualSplit = {
    eligibleToApply: !isStatutoryDischargeBar && !isBelowRatingThreshold,
    entitledToServices: isEhEstablished || isSehEstablished || isIdesPathway
  };

  return {
    pathCode: path,
    pathTitle: title,
    pathLaw: law,
    requiresSEH,
    requiresEH,
    basicEligibilityScore,
    ehEvidenceScore,
    sehEvidenceScore,
    feasibilityEvidenceScore,
    denialChallengeScore,
    isStatutoryDischargeBar,
    isCharacterReviewNeeded,
    isBelowRatingThreshold,
    is12YearExpired,
    isEhEstablished,
    isSehEstablished,
    isFeasibilityUncertain,
    isJobUnsuitable,
    activeErrors,
    factsSupport,
    factsHurt,
    evidenceMissing,
    nextSteps,
    recommendedDocument,
    reviewLaneWarning,
    authorities,
    visualSplit,
    evidenceScore
  };
}

// Remarks Narrative Compiler (for Form 28-1900 Remarks)
export function compileRemarks(facts, templateBody, renderFn) {
  const activeBarriersText = Object.keys(facts.checkedBarriers || {})
    .filter(k => facts.checkedBarriers[k])
    .join(', ');

  const variables = {
    userName: facts.userName || '[VETERAN NAME]',
    claimNumber: facts.claimNumber || '[CLAIM NUMBER]',
    date: new Date().toLocaleDateString(),
    currentEmploymentStatus: facts.currentEmploymentStatus === 'employed' ? 'Employed' : 'Unemployed',
    programName: facts.programName || '[TARGET GOAL]',
    serviceConnectedConditions: `Rated service-connected conditions (${facts.rating}%)`,
    workLimitations: activeBarriersText || 'Physical and cognitive restrictions arising from service-connected conditions.',
    workHistoryProblems: facts.currentEmploymentStatus === 'unemployed' ? 'Unemployed or unable to maintain steady employment due to rated limitations.' : 'Experiencing difficulties maintaining steady work as detailed in current job suitability assessment.',
    whyCurrentEmploymentNotSuitable: facts.currentEmploymentStatus === 'employed' ? 'Aggravates disabilities or represents underemployment.' : 'Not applicable (currently unemployed).',
    requestedAction: 'I request a collaborative evaluation to formulate a rehabilitation plan and address my occupational barriers.'
  };

  return renderFn(templateBody, variables);
}
