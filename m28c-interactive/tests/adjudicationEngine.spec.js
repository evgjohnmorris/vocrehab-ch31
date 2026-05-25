import { test, expect } from '@playwright/test';
import { analyzeEntitlement, getDelimitingDateStatus } from '../src/utils/adjudicationEngine.js';

test.describe('adjudicationEngine Unit Tests', () => {
  test('getDelimitingDateStatus calculations', () => {
    // Delimiting date is 12 years after the later of discharge date or rating decision date
    const status = getDelimitingDateStatus('2010-05-15', '2012-08-20', '2026-05-25');
    expect(status.isExpired).toBe(true);
    expect(status.delimitingStr).toContain('2024'); // 2012 + 12 = 2024
    
    const activeStatus = getDelimitingDateStatus('2020-05-15', '2022-08-20', '2026-05-25');
    expect(activeStatus.isExpired).toBe(false);
    expect(activeStatus.delimitingStr).toContain('2034'); // 2022 + 12 = 2034
  });

  test('20% Rating with Active EH', () => {
    const result = analyzeEntitlement({
      rating: 20,
      dischargeStatus: 'honorable',
      isActiveDuty: false,
      scContributionPresent: true,
      currentEmploymentStatus: 'unemployed',
      checkedBarriers: { lifting: true, sitting_standing: true },
      checkedEvidence: { rating_decision: true, dd214: true }
    });
    
    expect(result.pathCode).toBe('LIKELY_20_EH_SUPPORT');
    expect(result.pathTitle).toContain('VRC determination still required');
    expect(result.pathLaw).toBe('38 U.S.C. § 3102; 38 C.F.R. § 21.51');
    expect(result.requiresEH).toBe(true);
    expect(result.requiresSEH).toBe(false);
    expect(result.visualSplit.eligibleToApply).toBe(true);
    expect(result.visualSplit.entitledToServices).toBe(true);
  });

  test('10% Rating with Active SEH', () => {
    const result = analyzeEntitlement({
      rating: 10,
      dischargeStatus: 'honorable',
      isActiveDuty: false,
      scContributionPresent: true,
      currentEmploymentStatus: 'unemployed',
      checkedBarriers: { ptsd_crowds: true },
      manualSehIndicators: { repeated_failed_work: true },
      checkedEvidence: { rating_decision: true, dd214: true }
    });
    
    expect(result.pathCode).toBe('LIKELY_10_SEH_SUPPORT');
    expect(result.requiresSEH).toBe(true);
    expect(result.visualSplit.eligibleToApply).toBe(true);
    expect(result.visualSplit.entitledToServices).toBe(true);
  });

  test('Statutory Discharge Bar - Dishonorable', () => {
    const result = analyzeEntitlement({
      rating: 30,
      dischargeStatus: 'dishonorable',
      isActiveDuty: false
    });
    
    expect(result.pathCode).toBe('STATUTORY_BAR_ACTIVE');
    expect(result.isStatutoryDischargeBar).toBe(true);
    expect(result.visualSplit.eligibleToApply).toBe(false);
    expect(result.visualSplit.entitledToServices).toBe(false);
  });

  test('Character of Discharge Review Needed - OTH', () => {
    const result = analyzeEntitlement({
      rating: 30,
      dischargeStatus: 'oth',
      isActiveDuty: false
    });
    
    expect(result.pathCode).toBe('CHARACTER_REVIEW_PATH');
    expect(result.isCharacterReviewNeeded).toBe(true);
    expect(result.requiresSEH).toBe(true); // OTH automatically forces SEH requirement
  });

  test('Unsuitable Current Employment', () => {
    const result = analyzeEntitlement({
      rating: 30,
      dischargeStatus: 'honorable',
      isActiveDuty: false,
      scContributionPresent: true,
      currentEmploymentStatus: 'employed',
      jobSuitability: { aggravates_disability: true },
      checkedBarriers: { lifting: true }
    });
    
    expect(result.isJobUnsuitable).toBe(true);
    expect(result.isEhEstablished).toBe(true);
  });

  test('Suitable Current Employment (Defeats EH)', () => {
    const result = analyzeEntitlement({
      rating: 30,
      dischargeStatus: 'honorable',
      isActiveDuty: false,
      scContributionPresent: true,
      currentEmploymentStatus: 'employed',
      jobSuitability: { aggravates_disability: false }, // Suitable
      checkedBarriers: { lifting: true }
    });
    
    expect(result.isJobUnsuitable).toBe(false);
    expect(result.isEhEstablished).toBe(false);
  });
});
