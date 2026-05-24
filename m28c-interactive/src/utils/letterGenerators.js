export const generateJustificationLetter = ({
  dateStr,
  career,
  justReason,
  justCurrentGoal,
  justPhysicalImpact,
  justMedicalEvidence
}) => {
  const reasonText = 
    justReason === 'disability_worsened' 
      ? `my service-connected physical limitations have worsened, making my current training plan medically counter-indicated. The proposed goal of ${career.title} matches my physical tolerance levels.` 
      : justReason === 'market_demand'
      ? `shifts in the regional employment market make my current goal unsustainable, whereas the proposed goal of ${career.title} holds a strong employment outlook with ${career.outlook} growth.`
      : `my counselor has advised that my vocational aptitudes and serious employment handicap are better addressed in the proposed track of ${career.title}.`;

  return `Date: ${dateStr}
To: Vocational Rehabilitation Counselor (VRC)
VA Regional Office - VR&E Division

From: Veteran Applicant / Participant
Subject: Request for Change of Program of Rehabilitation & Vocational Goal (38 CFR § 21.94)

Dear Counselor,

I am writing to formally request a change in my program of rehabilitation and vocational goal under the authority of 38 CFR § 21.94 and M28C Part IV.B guidelines. Specifically, I request to change my designated vocational goal from "${justCurrentGoal}" to the proposed goal of "${career.title}" (O*NET-SOC: ${career.soc}, DOT: ${career.dot}, SIC: ${career.sic}).

Regulations under 38 CFR § 21.94 establish that a change in a veteran's rehabilitation program may be authorized when:
1. The current program is no longer suitable due to a change in physical or mental condition, or
2. The change is necessary to overcome the effects of an employment handicap and achieve suitable employment.

Justification for Request:
- Reason for Request: I am requesting this change because ${reasonText}
- Physical & Health Impact: ${justPhysicalImpact}
- Classification & Labor Market Alignment:
  * Proposed Vocational Goal: ${career.title}
  * O*NET-SOC Code: ${career.soc}
  * Dictionary of Occupational Titles (DOT) Code: ${career.dot} (SVP Level: ${career.svp}, Physical Demand: ${career.physicalDemand})
  * SEC Industrial Classification (SIC): ${career.sic} / NAICS: ${career.naics}
  * BLS Occupational Outlook: Projects median annual earnings of $${career.medianPay.toLocaleString()} with an outlook of ${career.outlook}.
  * Entry-Level Education: ${career.education}
- Professional Duties: ${career.duties}
- Medical Evidence: ${justMedicalEvidence ? "I have enclosed current VA medical records and treating physician assessments confirming that the proposed goal aligns with my physical capability limits and will not aggravate my service-connected conditions." : "I am prepared to provide medical documentation verifying that my current service-connected disabilities limit my capacity in the current goal but are fully compatible with the proposed goal."}

The proposed vocational goal of "${career.title}" represents a suitable, stable, and sustainable employment path that will allow me to overcome my serious employment handicap and achieve successful long-term rehabilitation.

I request that we schedule an appointment to review my Individualized Written Rehabilitation Plan (IWRP) and execute this modification at your earliest convenience.

Sincerely,

___________________________________
[Veteran Signature]
`;
};

export const generateSelfEmploymentLetter = ({
  dateStr,
  selfChecklist1,
  selfChecklist2,
  selfChecklist3,
  selfChecklist4,
  selfBizName,
  selfBizType,
  selfBizIndustry,
  selfBizConcept,
  selfFundingCategory
}) => {
  const checklistStatus = [
    selfChecklist1 ? "[X] Completed business feasibility review with a certified advisor" : "[ ] Pending business feasibility review",
    selfChecklist2 ? "[X] Completed and drafted formal Business Plan" : "[ ] Pending formal Business Plan draft",
    selfChecklist3 ? "[X] Submitted Business Plan for VRC / Regional Office panel review" : "[ ] Pending submission to VRC for Regional Office panel review",
    selfChecklist4 ? "[X] Coordinated with SBA/SCORE mentors for ongoing operational support" : "[ ] Pending coordination with SBA/SCORE mentors"
  ].join('\n');

  return `Date: ${dateStr}
To: Vocational Rehabilitation Counselor (VRC)
VA Regional Office - VR&E Division

From: Veteran Applicant / Participant
Subject: Formal Request for Self-Employment Track Services (38 CFR § 21.258 & § 21.257)

Dear Counselor,

I am writing to formally request my case be assigned to the Self-Employment Track (Track 3) and to request starter services and supplies as authorized under 38 CFR § 21.257 and § 21.258.

Details of Proposed Business Venture:
- Proposed Business Name: ${selfBizName || "[Not Specified]"}
- Business Structure: ${selfBizType || "[Not Specified]"}
- Industry Sector: ${selfBizIndustry || "[Not Specified]"}
- Concept & Operations: ${selfBizConcept || "[Not Specified]"}
- Requested Funding Category: Category ${selfFundingCategory || "II"} (Under 38 CFR § 21.258 rules)

Checklist Milestones and Readiness status:
${checklistStatus}

I have completed the preliminary requirements and believe that self-employment represents the most viable path to overcome my service-connected vocational limitations. I request a panel review of my business plan and feasibility study to establish my start-up funding entitlement.

Sincerely,

___________________________________
[Veteran Signature]
`;
};
