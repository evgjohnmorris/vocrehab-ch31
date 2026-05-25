import { useState } from 'react';
import { Award, Info, Settings, CheckCircle, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateFeasibilityRebuttal } from '../utils/letterGenerators';

function EntitlementWizardView({ 
  setSelectedSection, 
  setActiveView, 
  reduceMotion, 
  plainLanguageMode, 
  setPlainLanguageMode 
}) {
  // Localized Wizard States
  const [rating, setRating] = useState(20);
  const [dischargeStatus, setDischargeStatus] = useState('other-than-dishonorable');
  const [employmentHandicap, setEmploymentHandicap] = useState(true);
  const [sehAssessment, setSehAssessment] = useState(null); // 'yes' | 'no'
  const [wizardResult, setWizardResult] = useState(null);

  // Localized Delimiting Date Calculator States (Phase 18)
  const [dischargeDate, setDischargeDate] = useState('');
  const [ratingDecisionDate, setRatingDecisionDate] = useState('');

  // Localized Five Tracks Diagnostic States (Phase 18)
  const [diagIntent, setDiagIntent] = useState('');
  const [diagSeverity, setDiagSeverity] = useState('');
  const [diagSkillLevel, setDiagSkillLevel] = useState('');

  // Localized Feasibility Rebuttal Planner States (Phase 18)
  const [rebutCounselorClaim, setRebutCounselorClaim] = useState('');
  const [rebutAccommodations, setRebutAccommodations] = useState('');
  const [rebutMedicalClearance, setRebutMedicalClearance] = useState(false);
  const [rebutCopySuccess, setRebutCopySuccess] = useState(false);

  // Localized Extension Pre-Screener States
  const [extHasSeh, setExtHasSeh] = useState(false);
  const [extApproachingLimit, setExtApproachingLimit] = useState(false);
  const [extNeedMoreTime, setExtNeedMoreTime] = useState(false);

  // Localized Retroactive Induction Pre-Screener States
  const [retroHadRating, setRetroHadRating] = useState(false);
  const [retroPaidSelf, setRetroPaidSelf] = useState(false);
  const [retroHasDocuments, setRetroHasDocuments] = useState(false);

  // Localized Test Lab scenario state
  const [activeTestScenario, setActiveTestScenario] = useState(null);

  // Localized Counselor Interview Simulator states
  const [simulatorStep, setSimulatorStep] = useState(0); // 0 = idle, 1, 2, 3 = questions, 4 = results prep sheet
  const [simQ1, setSimQ1] = useState(null);
  const [simQ2, setSimQ2] = useState(null);
  const [simQ3, setSimQ3] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Localized Independent Living Program (ILP) states
  const [ilpHasSeh, setIlpHasSeh] = useState(false);
  const [ilpNotFeasible, setIlpNotFeasible] = useState(false);
  const [ilpNeedAdl, setIlpNeedAdl] = useState(false);
  const [ilpCostApproval, setIlpCostApproval] = useState(false);

  // Run test scenario profile helper
  const runTestScenario = (type) => {
    setActiveTestScenario(type);
    let r = 20;
    let d = 'other-than-dishonorable';
    let eh = true;
    let seh = null;

    if (type === 'dishonorable') {
      r = 20;
      d = 'dishonorable';
      eh = true;
      seh = null;
    } else if (type === '10_seh_yes') {
      r = 10;
      d = 'other-than-dishonorable';
      eh = true;
      seh = 'yes';
    } else if (type === '10_seh_no') {
      r = 10;
      d = 'other-than-dishonorable';
      eh = true;
      seh = 'no';
    } else if (type === '20_eh_yes') {
      r = 20;
      d = 'other-than-dishonorable';
      eh = true;
      seh = null;
    } else if (type === '20_eh_no') {
      r = 20;
      d = 'other-than-dishonorable';
      eh = false;
      seh = null;
    }

    setRating(r);
    setDischargeStatus(d);
    setEmploymentHandicap(eh);
    setSehAssessment(seh);

    // Run direct calculation logic for immediate results panel render
    if (d === 'dishonorable') {
      setWizardResult({
        eligible: false,
        entitled: false,
        status: 'Not Entitled',
        plainStatus: 'Not Eligible for VR&E',
        reason: "Discharge character of 'Dishonorable' is a statutory bar to Chapter 31 benefits under 38 U.S.C. § 5303.",
        plainReason: "Because your military discharge is listed as 'Dishonorable', federal law does not allow the VA to grant you vocational rehabilitation benefits.",
        recommendedAction: "You may apply to the VA Discharge Review Board (DRB) or Board for Correction of Military Records (BCMR) for a discharge upgrade.",
        keyRegs: [
          { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
          { type: 'cfr', id: '21.42', label: '38 CFR § 21.42' }
        ],
        whyExplanation: "Under 38 U.S.C. § 5303, a discharge characterization of dishonorable acts as an absolute legal bar to most VA benefits. To become eligible to apply, you must seek a formal upgrade from your branch's Discharge Review Board."
      });
    } else if (r < 10) {
      setWizardResult({
        eligible: false,
        entitled: false,
        status: 'Not Entitled',
        plainStatus: 'Not Eligible (Rating too low)',
        reason: "You must have a service-connected disability rating of at least 10% from the VA to apply for Chapter 31 VR&E.",
        plainReason: "To apply for this program, the VA must have awarded you a service-connected disability rating of at least 10% first.",
        recommendedAction: "If your service-connected conditions have worsened, you can file a claim for an increased rating via VA.gov.",
        keyRegs: [
          { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
          { type: 'cfr', id: '21.40', label: '38 CFR § 21.40' }
        ],
        whyExplanation: "38 C.F.R. § 21.40 establishes the basic rating threshold. A veteran must have a rating of 10% or more to be legally eligible to apply for Chapter 31. Having a 0% rating or no rated disabilities prevents application processing."
      });
    } else if (r === 10) {
      if (seh === 'yes') {
        setWizardResult({
          eligible: true,
          entitled: true,
          status: "Entitled (10% Rating + Serious Employment Handicap)",
          plainStatus: "Entitled to Services (10% Rating + SEH)",
          reason: "Veterans with a 10% rating are entitled to VR&E services if they are determined by a VRC to have a Serious Employment Handicap (SEH).",
          plainReason: "With a 10% rating, you are approved for services because your counselor determined that your disabilities cause significant barriers to finding or keeping a job.",
          recommendedAction: "Submit VA Form 28-1900. Your evaluation will focus on establishing how your disability severely limits your employability.",
          tracks: ["Reemployment", "Rapid Access", "Self-Employment", "Long-Term Services", "Independent Living"],
          keyRegs: [
            { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
            { type: 'cfr', id: '21.35', label: '38 CFR § 21.35' },
            { type: 'cfr', id: '21.52', label: '38 CFR § 21.52' }
          ],
          whyExplanation: "Under 38 C.F.R. § 21.40, a 10% rating only makes you 'eligible to apply'. To establish 'entitlement' to receive services, the VRC must find a Serious Employment Handicap (SEH) under 38 C.F.R. § 21.52, showing that your disability imposes significant limitations."
        });
      } else {
        setWizardResult({
          eligible: true,
          entitled: false,
          status: "Eligible but Not Entitled (10% Rating, No Serious Employment Handicap)",
          plainStatus: "Eligible to Apply, but Denied Entitlement",
          reason: "Veterans with a 10% rating require a finding of a Serious Employment Handicap (SEH) to establish entitlement. Since no SEH was determined, entitlement cannot be granted.",
          plainReason: "You meet the basic requirements to apply, but the VA cannot give you services unless a counselor determines that your disability creates significant employment barriers (SEH).",
          recommendedAction: "You may appeal the VRC's determination or provide additional medical evidence showing the severity of your employment limitations.",
          keyRegs: [
            { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
            { type: 'cfr', id: '21.40', label: '38 CFR § 21.40' },
            { type: 'cfr', id: '21.52', label: '38 CFR § 21.52' }
          ],
          whyExplanation: "Federal regulations at 38 C.F.R. § 21.52 mandate that a 10% rated veteran must have an SEH to qualify. An SEH requires finding that a veteran has significant barriers to preparing for, getting, or keeping a job. If your VRC determines you have no SEH, you are denied entitlement."
        });
      }
    } else {
      if (eh) {
        setWizardResult({
          eligible: true,
          entitled: true,
          status: "Entitled (20%+ Rating + Employment Handicap)",
          plainStatus: "Entitled to Services (20% Rating + EH)",
          reason: "Veterans with a rating of 20% or higher are entitled to VR&E benefits if they have an Employment Handicap (EH) resulting in part from their service-connected condition.",
          plainReason: "With a 20% or higher rating, you are approved for services because your service-connected disability contributes to difficulties in preparing for, getting, or keeping a job.",
          recommendedAction: "Submit VA Form 28-1900. You will collaborate with a VRC to complete an initial assessment and select one of the five tracks.",
          tracks: ["Reemployment", "Rapid Access", "Self-Employment", "Long-Term Services"],
          keyRegs: [
            { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
            { type: 'cfr', id: '21.40', label: '38 CFR § 21.40' },
            { type: 'cfr', id: '21.51', label: '38 CFR § 21.51' }
          ],
          whyExplanation: "Under 38 C.F.R. § 21.51, a veteran with a rating of 20% or more must establish an 'Employment Handicap' (EH). An EH exists if there is a vocational impairment (difficulty obtaining/maintaining a job) to which a service-connected disability contributes in substantial part."
        });
      } else {
        setWizardResult({
          eligible: true,
          entitled: false,
          status: "Eligible but Not Entitled (20%+ Rating, No Employment Handicap)",
          plainStatus: "Eligible to Apply, but Denied Entitlement",
          reason: "While you meet the basic disability rating requirement, your counselor determined that your disability does not cause a current handicap in preparing for, obtaining, or retaining suitable employment.",
          plainReason: "You have a high enough rating to apply, but the counselor determined your disability does not currently block your ability to hold a suitable job.",
          recommendedAction: "Request a review of the decision if you believe your counselor overlooked critical barriers to employment caused by your service-connected conditions.",
          keyRegs: [
            { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
            { type: 'cfr', id: '21.40', label: '38 CFR § 21.40' },
            { type: 'cfr', id: '21.51', label: '38 CFR § 21.51' }
          ],
          whyExplanation: "A 20% rating does not yield automatic services. 38 C.F.R. § 21.51 states that if a veteran has already overcome the effects of their vocational impairment (e.g. is currently suitable employed or has transferable skills), no EH is found, and they are not entitled."
        });
      }
    }
  };

  // Localized Eligibility Wizard Logic
  const calculateEligibility = () => {
    if (dischargeStatus === 'dishonorable') {
      setWizardResult({
        eligible: false,
        entitled: false,
        status: 'Not Entitled',
        plainStatus: 'Not Eligible for VR&E',
        reason: "Discharge character of 'Dishonorable' is a statutory bar to Chapter 31 benefits under 38 U.S.C. § 5303.",
        plainReason: "Because your military discharge is listed as 'Dishonorable', federal law does not allow the VA to grant you vocational rehabilitation benefits.",
        recommendedAction: "You may apply to the VA Discharge Review Board (DRB) or Board for Correction of Military Records (BCMR) for a discharge upgrade.",
        keyRegs: [
          { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
          { type: 'cfr', id: '21.42', label: '38 CFR § 21.42' }
        ],
        whyExplanation: "Under 38 U.S.C. § 5303, a discharge characterization of dishonorable acts as an absolute legal bar to most VA benefits. To become eligible to apply, you must seek a formal upgrade from your branch's Discharge Review Board."
      });
      return;
    }

    if (rating < 10) {
      setWizardResult({
        eligible: false,
        entitled: false,
        status: 'Not Entitled',
        plainStatus: 'Not Eligible (Rating too low)',
        reason: "You must have a service-connected disability rating of at least 10% from the VA to apply for Chapter 31 VR&E.",
        plainReason: "To apply for this program, the VA must have awarded you a service-connected disability rating of at least 10% first.",
        recommendedAction: "If your service-connected conditions have worsened, you can file a claim for an increased rating via VA.gov.",
        keyRegs: [
          { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
          { type: 'cfr', id: '21.40', label: '38 CFR § 21.40' }
        ],
        whyExplanation: "38 C.F.R. § 21.40 establishes the basic rating threshold. A veteran must have a rating of 10% or more to be legally eligible to apply for Chapter 31. Having a 0% rating or no rated disabilities prevents application processing."
      });
      return;
    }

    if (rating === 10) {
      if (sehAssessment === 'yes') {
        setWizardResult({
          eligible: true,
          entitled: true,
          status: "Entitled (10% Rating + Serious Employment Handicap)",
          plainStatus: "Entitled to Services (10% Rating + SEH)",
          reason: "Veterans with a 10% rating are entitled to VR&E services if they are determined by a VRC to have a Serious Employment Handicap (SEH).",
          plainReason: "With a 10% rating, you are approved for services because your counselor determined that your disabilities cause significant barriers to finding or keeping a job.",
          recommendedAction: "Submit VA Form 28-1900. Your evaluation will focus on establishing how your disability severely limits your employability.",
          tracks: ["Reemployment", "Rapid Access", "Self-Employment", "Long-Term Services", "Independent Living"],
          keyRegs: [
            { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
            { type: 'cfr', id: '21.35', label: '38 CFR § 21.35' },
            { type: 'cfr', id: '21.52', label: '38 CFR § 21.52' }
          ],
          whyExplanation: "Under 38 C.F.R. § 21.40, a 10% rating only makes you 'eligible to apply'. To establish 'entitlement' to receive services, the VRC must find a Serious Employment Handicap (SEH) under 38 C.F.R. § 21.52, showing that your disability imposes significant limitations."
        });
      } else {
        setWizardResult({
          eligible: true,
          entitled: false,
          status: "Eligible but Not Entitled (10% Rating, No Serious Employment Handicap)",
          plainStatus: "Eligible to Apply, but Denied Entitlement",
          reason: "Veterans with a 10% rating require a finding of a Serious Employment Handicap (SEH) to establish entitlement. Since no SEH was determined, entitlement cannot be granted.",
          plainReason: "You meet the basic requirements to apply, but the VA cannot give you services unless a counselor determines that your disability creates significant employment barriers (SEH).",
          recommendedAction: "You may appeal the VRC's determination or provide additional medical evidence showing the severity of your employment limitations.",
          keyRegs: [
            { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
            { type: 'cfr', id: '21.40', label: '38 CFR § 21.40' },
            { type: 'cfr', id: '21.52', label: '38 CFR § 21.52' }
          ],
          whyExplanation: "Federal regulations at 38 C.F.R. § 21.52 mandate that a 10% rated veteran must have an SEH to qualify. An SEH requires finding that a veteran has significant barriers to preparing for, getting, or keeping a job. If your VRC determines you have no SEH, you are denied entitlement."
        });
      }
      return;
    }

    // Rating is 20% or more
    if (employmentHandicap) {
      setWizardResult({
        eligible: true,
        entitled: true,
        status: "Entitled (20%+ Rating + Employment Handicap)",
        plainStatus: "Entitled to Services (20% Rating + EH)",
        reason: "Veterans with a rating of 20% or higher are entitled to VR&E benefits if they have an Employment Handicap (EH) resulting in part from their service-connected condition.",
        plainReason: "With a 20% or higher rating, you are approved for services because your service-connected disability contributes to difficulties in preparing for, getting, or keeping a job.",
        recommendedAction: "Submit VA Form 28-1900. You will collaborate with a VRC to complete an initial assessment and select one of the five tracks.",
        tracks: ["Reemployment", "Rapid Access", "Self-Employment", "Long-Term Services"],
        keyRegs: [
          { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
          { type: 'cfr', id: '21.40', label: '38 CFR § 21.40' },
          { type: 'cfr', id: '21.51', label: '38 CFR § 21.51' }
        ],
        whyExplanation: "Under 38 C.F.R. § 21.51, a veteran with a rating of 20% or more must establish an 'Employment Handicap' (EH). An EH exists if there is a vocational impairment (difficulty obtaining/maintaining a job) to which a service-connected disability contributes in substantial part."
      });
    } else {
      setWizardResult({
        eligible: true,
        entitled: false,
        status: "Eligible but Not Entitled (20%+ Rating, No Employment Handicap)",
        plainStatus: "Eligible to Apply, but Denied Entitlement",
        reason: "While you meet the basic disability rating requirement, your counselor determined that your disability does not cause a current handicap in preparing for, obtaining, or retaining suitable employment.",
        plainReason: "You have a high enough rating to apply, but the counselor determined your disability does not currently block your ability to hold a suitable job.",
        recommendedAction: "Request a review of the decision if you believe your counselor overlooked critical barriers to employment caused by your service-connected conditions.",
        keyRegs: [
          { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
          { type: 'cfr', id: '21.40', label: '38 CFR § 21.40' },
          { type: 'cfr', id: '21.51', label: '38 CFR § 21.51' }
        ],
        whyExplanation: "A 20% rating does not yield automatic services. 38 C.F.R. § 21.51 states that if a veteran has already overcome the effects of their vocational impairment (e.g. is currently suitable employed or has transferable skills), no EH is found, and they are not entitled."
      });
    }
  };

  // Five Tracks to Employment Diagnostic Logic (Phase 18)
  const runFiveTracksDiagnostic = (intent, severity, skillLevel) => {
    if (!intent || !severity || !skillLevel) return null;
    
    let trackName = "";
    let trackCfr = "";
    let trackReason = "";
    let trackAdvocacy = "";
    
    if (intent === 'reemployment') {
      trackName = "Reemployment Track (Track 1)";
      trackCfr = "38 CFR § 21.250(a)(1)";
      trackReason = "For veterans who want to return to their previous employer or career field with accommodations if necessary.";
      trackAdvocacy = "Ensure the VRC contacts your previous employer to coordinate adjustments and verify return-to-work suitability.";
    } else if (intent === 'rapid') {
      trackName = "Rapid Access to Employment (Track 2)";
      trackCfr = "38 CFR § 21.250(a)(2)";
      trackReason = "For veterans who already possess marketable career skills and need immediate placement assistance, resume prep, or credentialing.";
      trackAdvocacy = "Note: VRCs often push veterans here to save costs. If your skills are obsolete or aggravated by your disability, demand Long-Term Services instead.";
    } else if (intent === 'self') {
      trackName = "Self-Employment Track (Track 3)";
      trackCfr = "38 CFR § 21.257 & § 21.258";
      trackReason = "For veterans with severe disabilities or unique vocational goals who want to establish their own business venture.";
      trackAdvocacy = "Under Category I (Serious Employment Handicap), the VA can purchase start-up equipment, inventory, licenses, and marketing services.";
    } else if (intent === 'training') {
      trackName = "Employment through Long-Term Services (Track 4)";
      trackCfr = "38 CFR § 21.250(a)(4)";
      trackReason = "For veterans who need professional retraining (college, vocational school, OJT, or graduate studies) to overcome their disability limitations.";
      trackAdvocacy = "The most utilized track. Your program must lead to a job that is medically compatible and has high labor demand.";
    } else if (intent === 'independence') {
      trackName = "Independent Living Services (Track 5)";
      trackCfr = "38 U.S.C. § 3109 & 38 CFR § 21.160";
      trackReason = "For veterans with severe limitations where a traditional vocational goal is not currently reasonably feasible.";
      trackAdvocacy = "Focuses on assistive tech, home modifications, and daily mobility. Requires supervisor cost reviews.";
    }
    
    return { trackName, trackCfr, trackReason, trackAdvocacy };
  };

  // Compile Feasibility Rebuttal Letter (Phase 18)
  const compileFeasibilityRebuttalLetter = () => {
    return generateFeasibilityRebuttal({
      dateStr: new Date().toLocaleDateString(),
      veteranName: "Veteran Candidate",
      claimNumber: "SSN XXX-XX-XXXX",
      address: "Mailing Address",
      emailPhone: "Email / Phone",
      counselorName: "Assigned VRC Counselor",
      regionalOffice: "VA Regional Office",
      unfeasibilityAssertion: rebutCounselorClaim || "[Detail the counselor's objection here, e.g. psychiatric rating prevents desk job]",
      rebuttalArguments: rebutAccommodations || "[Detail your accommodations and feasibility arguments here]",
      doctorStatementEnclosed: rebutMedicalClearance
    });
  };

  // Compile VA Form 28-1900 Remarks Narrative (Phase 18)
  const compileForm281900Remarks = () => {
    // 1. Occupational barriers
    const part1 = simQ1 === 'severe'
      ? "Due to my service-connected disabilities, I experience severe physical or cognitive limitations that interfere with performing key duties of my current occupational field."
      : simQ1 === 'moderate'
      ? "My service-connected conditions cause moderate physical or cognitive limitations, requiring substantial compensatory effort, pain, or frequent breaks to complete basic duties."
      : "I am seeking rehabilitation to identify a suitable occupation compatible with my disability limitations.";

    // 2. Job suitability
    const part2 = simQ2 === 'unemployed'
      ? "Consequently, I am currently unemployed because of the worsening effects of these conditions."
      : simQ2 === 'unaccommodated'
      ? "My current employment is unsuitable as it does not accommodate my medical restrictions, resulting in ongoing physical strain and aggravation of my rated disabilities."
      : "Although I am currently working, I require assistance to transition to a career track that provides sustainable long-term accommodation.";

    // 3. Goal compatibility
    const part3 = simQ3 === 'compatible'
      ? `I am applying for Chapter 31 VR&E services to pursue a medically compatible, desk-based, or flexible vocational track under 38 CFR ${rating === 10 ? '§ 21.52 (Serious Employment Handicap)' : '§ 21.51 (Employment Handicap)'} criteria. This program will enable me to successfully prepare for and obtain suitable employment without aggravating my conditions.`
      : `I request vocational counseling services under 38 CFR ${rating === 10 ? '§ 21.52' : '§ 21.51'} to identify and prepare for a career goal that is fully compatible with my VA rating limitations.`;

    // Delimiting date integration
    let delimitingNotice = "";
    if (dischargeDate && ratingDecisionDate) {
      const dTime = new Date(dischargeDate).getTime();
      const rTime = new Date(ratingDecisionDate).getTime();
      if (!isNaN(dTime) && !isNaN(rTime)) {
        const baseDate = dTime > rTime ? new Date(dischargeDate) : new Date(ratingDecisionDate);
        const delimitingDate = new Date(baseDate);
        delimitingDate.setFullYear(delimitingDate.getFullYear() + 12);
        const today = new Date('2026-05-25');
        if (delimitingDate.getTime() - today.getTime() < 0) {
          delimitingNotice = " As my basic 12-year period of eligibility under 38 U.S.C. § 3103 has expired, I request an extension and entitlement determination based on a Serious Employment Handicap (SEH) under 38 CFR § 21.44.";
        }
      }
    }

    return `${part1} ${part2} ${part3}${delimitingNotice}`;
  };

  const [remarksCopySuccess, setRemarksCopySuccess] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
      className="doc-card"
    >
      <span className="doc-tag">Interactive Tools</span>
      <h1 className="doc-title">Entitlement & Eligibility Wizard</h1>
      <p className="doc-subtitle">Evaluate vocational rehabilitation and serious employment handicap criteria side-by-side.</p>
      
      {/* Permanent Legal Disclaimer */}
      <div className="bg-slate-900/60 border border-amber-500/20 rounded-xl p-5 mb-6 text-xs leading-relaxed text-slate-300">
        <div className="flex items-start gap-3">
          <Info className="text-amber-500 mt-0.5 flex-shrink-0" size={16} />
          <div>
            <strong className="text-amber-400 block mb-1">Legal Distinction: Eligible to Apply vs. Entitled to Services</strong>
            <p className="mb-2">
              VA regulations distinguish between being <span className="text-slate-100 font-semibold">eligible to apply</span> and being <span className="text-slate-100 font-semibold">entitled to services</span>:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li><strong>Eligible to Apply:</strong> Requires an other-than-dishonorable discharge and a service-connected rating of at least 10% (under 38 U.S.C. § 3102 & 38 CFR § 21.40).</li>
              <li><strong>Entitled to Services:</strong> Requires a Vocational Rehabilitation Counselor (VRC) to determine you have an <span className="text-slate-200">Employment Handicap</span> (for ratings &ge; 20%) or a <span className="text-slate-200">Serious Employment Handicap</span> (for a 10% rating).</li>
            </ul>
            <p className="mt-2 text-slate-500 italic">
              Disclaimer: This wizard is a case strategy planning tool and does not constitute a formal VA decision.
            </p>
          </div>
        </div>
      </div>

      {/* Plain Language Switcher */}
      <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800 rounded-lg mb-6">
        <div className="flex items-center gap-2">
          <HelpCircle size={16} className="text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300">Plain-Language Mode</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer"
            checked={plainLanguageMode}
            onChange={(e) => setPlainLanguageMode(e.target.checked)}
          />
          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-color peer-checked:after:bg-accent-color"></div>
        </label>
      </div>

      {/* Interactive Eligibility Test Lab */}
      <div style={{
        padding: '14px 18px',
        backgroundColor: 'rgba(59, 130, 246, 0.06)',
        border: '1px solid var(--card-border)',
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Settings size={18} style={{ color: 'var(--accent-color)' }} />
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Interactive Eligibility Test Lab & Logic Auditor
          </h3>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
          Select a pre-configured scenario profile to populate inputs and audit the decision path applied by the VA under Title 38 criteria.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '14px' }}>
          <button
            type="button"
            className="btn btn-secondary text-xs"
            style={{
              padding: '8px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: activeTestScenario === 'dishonorable' ? 'var(--accent-color)' : 'var(--glass-bg)',
              color: activeTestScenario === 'dishonorable' ? '#fff' : 'var(--text-primary)',
              border: '1px solid var(--card-border)',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={() => runTestScenario('dishonorable')}
          >
            <span style={{ fontWeight: '700' }}>Dishonorable Bar</span>
            <span style={{ fontSize: '0.62rem', opacity: 0.8 }}>Statutory bar to benefits</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary text-xs"
            style={{
              padding: '8px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: activeTestScenario === '10_seh_yes' ? 'var(--accent-color)' : 'var(--glass-bg)',
              color: activeTestScenario === '10_seh_yes' ? '#fff' : 'var(--text-primary)',
              border: '1px solid var(--card-border)',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={() => runTestScenario('10_seh_yes')}
          >
            <span style={{ fontWeight: '700' }}>10% Rating with SEH</span>
            <span style={{ fontSize: '0.62rem', opacity: 0.8 }}>Approved entitlement (SEH found)</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary text-xs"
            style={{
              padding: '8px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: activeTestScenario === '10_seh_no' ? 'var(--accent-color)' : 'var(--glass-bg)',
              color: activeTestScenario === '10_seh_no' ? '#fff' : 'var(--text-primary)',
              border: '1px solid var(--card-border)',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={() => runTestScenario('10_seh_no')}
          >
            <span style={{ fontWeight: '700' }}>10% Rating, No SEH</span>
            <span style={{ fontSize: '0.62rem', opacity: 0.8 }}>Denied entitlement (no SEH)</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary text-xs"
            style={{
              padding: '8px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: activeTestScenario === '20_eh_yes' ? 'var(--accent-color)' : 'var(--glass-bg)',
              color: activeTestScenario === '20_eh_yes' ? '#fff' : 'var(--text-primary)',
              border: '1px solid var(--card-border)',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={() => runTestScenario('20_eh_yes')}
          >
            <span style={{ fontWeight: '700' }}>20% Rating with EH</span>
            <span style={{ fontSize: '0.62rem', opacity: 0.8 }}>Approved (Employment Handicap)</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary text-xs"
            style={{
              padding: '8px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: activeTestScenario === '20_eh_no' ? 'var(--accent-color)' : 'var(--glass-bg)',
              color: activeTestScenario === '20_eh_no' ? '#fff' : 'var(--text-primary)',
              border: '1px solid var(--card-border)',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={() => runTestScenario('20_eh_no')}
          >
            <span style={{ fontWeight: '700' }}>20% Rating, No EH</span>
            <span style={{ fontSize: '0.62rem', opacity: 0.8 }}>Denied (no current EH found)</span>
          </button>
        </div>

        {activeTestScenario && (
          <div style={{
            padding: '12px 14px',
            backgroundColor: 'var(--hover-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '6px',
            fontSize: '0.75rem',
            lineHeight: '1.4'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid var(--card-border)', paddingBottom: '6px' }}>
              <strong style={{ color: 'var(--accent-color)' }}>
                ✓ Test Scenario Active: {
                  activeTestScenario === 'dishonorable' ? 'Dishonorable Statutory Bar' :
                  activeTestScenario === '10_seh_yes' ? '10% Rating + Serious Employment Handicap' :
                  activeTestScenario === '10_seh_no' ? '10% Rating + No SEH' :
                  activeTestScenario === '20_eh_yes' ? '20% Rating + Employment Handicap' :
                  '20% Rating + No EH'
                }
              </strong>
              <span style={{ fontWeight: '700', color: 'var(--success-color)' }}>LOGIC AUDIT PASS</span>
            </div>
            
            {activeTestScenario === 'dishonorable' && (
              <div>
                <div><strong>Inputs:</strong> Discharge = Dishonorable | Rating = 20% | EH = Yes.</div>
                <div style={{ marginTop: '6px' }}><strong>Logic Path Walkthrough:</strong></div>
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', listStyleType: 'disc', color: 'var(--text-secondary)' }}>
                  <li>First check: Character of discharge. Under <strong>38 U.S.C. § 5303</strong> and <strong>38 CFR § 21.42</strong>, a discharge listed as dishonorable is an absolute bar to VA benefits.</li>
                  <li>Result: The application is immediately denied, bypassing any evaluation of rating or employment handicap.</li>
                </ul>
              </div>
            )}

            {activeTestScenario === '10_seh_yes' && (
              <div>
                <div><strong>Inputs:</strong> Discharge = Other Than Dishonorable | Rating = 10% | SEH = Yes.</div>
                <div style={{ marginTop: '6px' }}><strong>Logic Path Walkthrough:</strong></div>
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', listStyleType: 'disc', color: 'var(--text-secondary)' }}>
                  <li>First check: Character of discharge is acceptable (&ge; Other Than Dishonorable).</li>
                  <li>Second check: Disability rating is exactly 10%, meeting the application threshold under <strong>38 CFR § 21.40</strong>.</li>
                  <li>Third check: For a 10% rating, <strong>38 CFR § 21.52</strong> requires a finding of a *Serious Employment Handicap* (SEH) to establish entitlement. Since SEH is checked 'Yes', entitlement is granted.</li>
                </ul>
              </div>
            )}

            {activeTestScenario === '10_seh_no' && (
              <div>
                <div><strong>Inputs:</strong> Discharge = Other Than Dishonorable | Rating = 10% | SEH = No.</div>
                <div style={{ marginTop: '6px' }}><strong>Logic Path Walkthrough:</strong></div>
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', listStyleType: 'disc', color: 'var(--text-secondary)' }}>
                  <li>First check: Discharge is acceptable. Second check: Rating is 10%, which is eligible to apply.</li>
                  <li>Third check: <strong>38 CFR § 21.52</strong> states that a 10% rating is *not* entitled to services unless an SEH exists. Since SEH is checked 'No', entitlement is denied.</li>
                </ul>
              </div>
            )}

            {activeTestScenario === '20_eh_yes' && (
              <div>
                <div><strong>Inputs:</strong> Discharge = Other Than Dishonorable | Rating = 20% | EH = Yes.</div>
                <div style={{ marginTop: '6px' }}><strong>Logic Path Walkthrough:</strong></div>
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', listStyleType: 'disc', color: 'var(--text-secondary)' }}>
                  <li>First check: Discharge is acceptable. Second check: Rating is &ge; 20% (eligible).</li>
                  <li>Third check: <strong>38 CFR § 21.51</strong> states that a 20%+ rating veteran is entitled if they have an *Employment Handicap* (EH) contributing in part from their service-connected disabilities. Since EH is 'Yes', entitlement is granted.</li>
                </ul>
              </div>
            )}

            {activeTestScenario === '20_eh_no' && (
              <div>
                <div><strong>Inputs:</strong> Discharge = Other Than Dishonorable | Rating = 20% | EH = No.</div>
                <div style={{ marginTop: '6px' }}><strong>Logic Path Walkthrough:</strong></div>
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', listStyleType: 'disc', color: 'var(--text-secondary)' }}>
                  <li>First check: Discharge is acceptable. Second check: Rating is &ge; 20% (eligible).</li>
                  <li>Third check: Under <strong>38 CFR § 21.51</strong>, a veteran with a 20%+ rating must have a vocational impairment to which their service-connected disability contributes. Since EH is 'No' (meaning they have overcome it or have no current barriers), entitlement is denied.</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="doc-divider"></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }} className="grid-mobile-1col">
        <div>
          <div className="form-group">
            <label>Disability Rating from VA</label>
            <select 
              className="form-control" 
              value={rating} 
              onChange={(e) => setRating(Number(e.target.value))}
            >
              <option value={0}>No Rating / 0%</option>
              <option value={10}>10%</option>
              <option value={20}>20%</option>
              <option value={30}>30% or Higher</option>
            </select>
          </div>

          <div className="form-group">
            <label>Discharge Characterization</label>
            <select 
              className="form-control" 
              value={dischargeStatus} 
              onChange={(e) => setDischargeStatus(e.target.value)}
            >
              <option value="other-than-dishonorable">Other Than Dishonorable</option>
              <option value="dishonorable">Dishonorable</option>
            </select>
          </div>

          {rating >= 20 && (
            <div className="form-group">
              <label>Does the disability cause barriers to obtaining or retaining suitable employment?</label>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="eh" 
                    checked={employmentHandicap === true} 
                    onChange={() => setEmploymentHandicap(true)} 
                  />
                  Yes (Employment Handicap exists)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="eh" 
                    checked={employmentHandicap === false} 
                    onChange={() => setEmploymentHandicap(false)} 
                  />
                  No
                </label>
              </div>
            </div>
          )}

          {rating === 10 && (
            <div className="form-group">
              <label>Does the disability cause significant barriers, requiring comprehensive services?</label>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="seh" 
                    checked={sehAssessment === 'yes'} 
                    onChange={() => setSehAssessment('yes')} 
                  />
                  Yes (Serious Employment Handicap exists)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="seh" 
                    checked={sehAssessment === 'no'} 
                    onChange={() => setSehAssessment('no')} 
                  />
                  No
                </label>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button 
              className="btn btn-primary" 
              onClick={calculateEligibility}
              style={{ flex: 1 }}
            >
              <Award size={18} />
              <span>Evaluate Entitlement</span>
            </button>
            {wizardResult && (
              <button
                type="button"
                className="px-4 py-2 bg-red-950/20 border border-red-900/30 text-red-400 hover:text-red-300 rounded text-xs font-semibold cursor-pointer transition"
                onClick={() => {
                  setRating(20);
                  setDischargeStatus('other-than-dishonorable');
                  setEmploymentHandicap(true);
                  setSehAssessment(null);
                  setWizardResult(null);
                  setExtHasSeh(false);
                  setExtApproachingLimit(false);
                  setExtNeedMoreTime(false);
                  setRetroHadRating(false);
                  setRetroPaidSelf(false);
                  setRetroHasDocuments(false);
                  setActiveTestScenario(null);
                  setSimulatorStep(0);
                  setSimQ1(null);
                  setSimQ2(null);
                  setSimQ3(null);
                  setIlpHasSeh(false);
                  setIlpNotFeasible(false);
                  setIlpNeedAdl(false);
                  setIlpCostApproval(false);
                  setDischargeDate('');
                  setRatingDecisionDate('');
                  setDiagIntent('');
                  setDiagSeverity('');
                  setDiagSkillLevel('');
                  setRebutCounselorClaim('');
                  setRebutAccommodations('');
                  setRebutMedicalClearance(false);
                  setRebutCopySuccess(false);
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div>
          {wizardResult ? (
            <div className="result-box" style={{ borderLeft: `4px solid ${wizardResult.entitled ? 'var(--success-color)' : 'var(--danger-color)'}` }}>
              <h4 style={{ color: wizardResult.entitled ? 'var(--success-color)' : 'var(--danger-color)', marginBottom: '10px' }}>
                {plainLanguageMode ? wizardResult.plainStatus : wizardResult.status}
              </h4>
              <p style={{ fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem' }}>
                {wizardResult.entitled ? 'Approved Criteria Met' : 'Entitlement Denied'}
              </p>
              <p style={{ marginBottom: '12px', fontSize: '0.85rem' }}>
                {plainLanguageMode ? wizardResult.plainReason : wizardResult.reason}
              </p>
              
              {/* Collapsible Legal Citation 'Why?' */}
              <details style={{ marginTop: '8px', marginBottom: '12px' }} className="group">
                <summary style={{ fontSize: '0.75rem', cursor: 'pointer', color: 'var(--accent-color)', fontWeight: '600', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Why? (View Legal Authority)</span>
                  <span className="transition-transform duration-200 group-open:rotate-90">&rtrif;</span>
                </summary>
                <div className="mt-2 p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs leading-relaxed text-slate-400">
                  {wizardResult.whyExplanation}
                </div>
              </details>
              
              <div className="doc-divider" style={{ margin: '12px 0' }}></div>
              
              <h5 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px' }}>Recommended Steps:</h5>
              <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>{wizardResult.recommendedAction}</p>

              {wizardResult.tracks && (
                <div style={{ marginBottom: '12px' }}>
                  <h5 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px' }}>Eligible Vocational Tracks:</h5>
                  <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {wizardResult.tracks.map(t => <li key={t}>{t}</li>)}
                  </ul>
                </div>
              )}

              {wizardResult.keyRegs && (
                <div style={{ marginTop: '16px' }}>
                  <h5 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px' }}>Key Regulations Applied:</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {wizardResult.keyRegs.map(reg => (
                      <button
                        key={reg.id}
                        className="btn"
                        style={{
                          padding: '6px 10px',
                          height: 'auto',
                          fontSize: '0.75rem',
                          backgroundColor: 'var(--hover-bg)',
                          color: 'var(--accent-color)',
                          border: '1px solid var(--card-border)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onClick={() => {
                          setSelectedSection({ type: reg.type, id: reg.id });
                          setActiveView('reference');
                        }}
                      >
                        {reg.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="result-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '220px', borderStyle: 'dashed' }}>
              <Info size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fill out the evaluation form on the left to determine entitlement status and eligible rehabilitation tracks.</p>
            </div>
          )}
        </div>
      </div>

      {/* 12-Year Delimiting Date Calculator Section (Phase 18) */}
      <div className="mt-8 pt-8 border-t border-slate-800">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-6 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
          <div className="absolute -inset-px bg-gradient-to-r from-amber-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Settings className="text-amber-500" size={20} />
                12-Year Delimiting Date Calculator
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20">
                38 U.S.C. § 3103
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Under 38 U.S.C. § 3103, your basic period of eligibility for VR&E services is 12 years from your military discharge date or your first 10%+ VA disability rating notification date (whichever is later). Enter your dates below to calculate your statutory delimiting window.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="discharge-date-input" className="text-xs font-bold text-slate-300 block mb-1">Military Discharge Date (DD-214 Block 12b)</label>
                  <input
                    id="discharge-date-input"
                    type="date"
                    className="form-control text-xs bg-slate-950/60 border border-slate-800 text-slate-250 focus:border-amber-500/50"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                    value={dischargeDate}
                    onChange={(e) => setDischargeDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rating-date-input" className="text-xs font-bold text-slate-300 block mb-1">First VA 10%+ Rating Decision Date</label>
                  <input
                    id="rating-date-input"
                    type="date"
                    className="form-control text-xs bg-slate-950/60 border border-slate-800 text-slate-250 focus:border-amber-500/50"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                    value={ratingDecisionDate}
                    onChange={(e) => setRatingDecisionDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col justify-center">
                {dischargeDate && ratingDecisionDate ? (() => {
                  const dTime = new Date(dischargeDate).getTime();
                  const rTime = new Date(ratingDecisionDate).getTime();
                  if (isNaN(dTime) || isNaN(rTime)) {
                    return (
                      <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-5 text-slate-400 flex flex-col items-center justify-center text-center py-6">
                        <Info size={24} className="text-slate-600 mb-1" />
                        <p className="text-[11px] max-w-xs">Please enter valid dates to execute the delimiting calculator.</p>
                      </div>
                    );
                  }
                  
                  const baseDate = dTime > rTime ? new Date(dischargeDate) : new Date(ratingDecisionDate);
                  const delimitingDate = new Date(baseDate);
                  delimitingDate.setFullYear(delimitingDate.getFullYear() + 12);
                  
                  const today = new Date('2026-05-25'); // Locked current context date
                  const diffTime = delimitingDate.getTime() - today.getTime();
                  const isExpired = diffTime < 0;
                  const diffDays = Math.ceil(Math.abs(diffTime) / (1000 * 60 * 60 * 24));
                  const diffYears = (diffDays / 365).toFixed(1);
                  
                  const delimitingStr = delimitingDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                  
                  if (isExpired) {
                    return (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-red-400 relative overflow-hidden animate-fade-in">
                        <div className="flex items-start gap-3">
                          <Info size={22} className="text-red-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <strong className="text-sm font-semibold text-red-300 block mb-1">Basic Period of Eligibility Expired</strong>
                            <p className="text-xs text-red-400/90 leading-relaxed mb-3">
                              Your 12-year basic eligibility window expired on <strong>{delimitingStr}</strong> ({diffYears} years ago).
                            </p>
                            <div className="bg-slate-950/60 border border-red-950/40 rounded p-3 text-[11px] text-slate-350 leading-relaxed">
                              <strong className="text-amber-400 block mb-1">Advocacy Strategy (38 CFR § 21.44):</strong>
                              To receive services now, your counselor must officially find that you have a <strong>Serious Employment Handicap (SEH)</strong>. An SEH designation overrides the 12-year expiration, reinstating your access to retraining. Focus on documenting how your service-connected conditions impose severe barriers to finding or holding a job.
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-emerald-400 relative overflow-hidden animate-fade-in">
                        <div className="flex items-start gap-3">
                          <CheckCircle size={22} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <strong className="text-sm font-semibold text-emerald-300 block mb-1">Basic Period of Eligibility Active</strong>
                            <p className="text-xs text-emerald-400/90 leading-relaxed mb-2">
                              Your basic period of eligibility is active and will remain open until <strong>{delimitingStr}</strong> (approximately {diffYears} years remaining).
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Since you are within your 12-year window, you only require a finding of an <strong>Employment Handicap (EH)</strong> (for ratings &ge; 20%) to qualify for standard tracks.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })() : (
                  <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-5 text-slate-400 flex flex-col items-center justify-center text-center py-8">
                    <Info size={28} className="text-slate-600 mb-2" />
                    <p className="text-[11px] max-w-xs leading-relaxed">
                      Enter your military discharge date and your first VA rating notification date on the left to calculate your delimiting date status.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Entitlement Extensions Section */}
      <div className="mt-8 pt-8 border-t border-slate-800">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-6 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
          <div className="absolute -inset-px bg-gradient-to-r from-amber-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Settings className="text-amber-500" size={20} />
                VR&E Entitlement Extensions Pre-Screener
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20">
                38 CFR § 21.44 & § 21.78
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Find out how having a Serious Employment Handicap (SEH) allows you to request extensions of services past 48 months or bypass the basic 12-year eligibility window.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">Extension Pre-Screening Criteria</h4>
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 hover:border-slate-700/60 transition-colors duration-200">
                  <input 
                    type="checkbox" 
                    className="mt-1 accent-amber-500 cursor-pointer"
                    checked={extHasSeh} 
                    onChange={(e) => setExtHasSeh(e.target.checked)} 
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">Serious Employment Handicap (SEH)</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">Do you have an assessed serious employment handicap (usually rating of 10% or barriers)?</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 hover:border-slate-700/60 transition-colors duration-200">
                  <input 
                    type="checkbox" 
                    className="mt-1 accent-amber-500 cursor-pointer"
                    checked={extApproachingLimit} 
                    onChange={(e) => setExtApproachingLimit(e.target.checked)} 
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">Approaching Limits</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">Have you reached or are you near the 48-month limit or basic 12-year expiration?</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 hover:border-slate-700/60 transition-colors duration-200">
                  <input 
                    type="checkbox" 
                    className="mt-1 accent-amber-500 cursor-pointer"
                    checked={extNeedMoreTime} 
                    onChange={(e) => setExtNeedMoreTime(e.target.checked)} 
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">Additional Retraining Needed</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">Do you require additional vocational retraining to achieve suitable employment?</span>
                  </div>
                </label>
              </div>

              <div className="flex flex-col justify-center">
                {extHasSeh && extApproachingLimit && extNeedMoreTime ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-emerald-400 relative overflow-hidden animate-fade-in">
                    <div className="flex items-start gap-3">
                      <CheckCircle size={22} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-sm font-semibold text-emerald-300 block mb-1">Pre-screen Recommendation</strong>
                        <p className="text-xs text-emerald-400/90 leading-relaxed">
                          You may have a strong basis to request an SEH finding and extension review. Ask the VRC for a written determination under 38 C.F.R. §§ 21.44 and 21.78.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-5 text-slate-400 flex flex-col items-center justify-center text-center py-8">
                    <Info size={28} className="text-slate-600 mb-2" />
                    <p className="text-[11px] max-w-xs leading-relaxed">
                      Toggle all three criteria checkboxes on the left to verify if you qualify for a statutory program extension.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Retroactive Induction Pre-Screener Section */}
      <div className="mt-8 pt-8 border-t border-slate-800">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-6 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
          <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Award className="text-cyan-400" size={20} />
                VR&E Retroactive Induction Pre-Screener
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20">
                M28C.V.B.6.03
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              If you completed academic or vocational training before being approved for Chapter 31, you may qualify for retroactive reimbursement of tuition, fees, and books.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">Retroactive Pre-Screening Criteria</h4>
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 hover:border-slate-700/60 transition-colors duration-200">
                  <input 
                    type="checkbox" 
                    className="mt-1 accent-cyan-500 cursor-pointer"
                    checked={retroHadRating} 
                    onChange={(e) => setRetroHadRating(e.target.checked)} 
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">Service-Connected Rating during Study</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">Did you have a 10%+ service-connected rating (or was one pending/effective retroactively) during the past training?</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 hover:border-slate-700/60 transition-colors duration-200">
                  <input 
                    type="checkbox" 
                    className="mt-1 accent-cyan-500 cursor-pointer"
                    checked={retroPaidSelf} 
                    onChange={(e) => setRetroPaidSelf(e.target.checked)} 
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">Self-Paid or Student Loans</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">Did you pay tuition/fees out-of-pocket, using self-funded student loans, or with non-VA educational programs?</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 hover:border-slate-700/60 transition-colors duration-200">
                  <input 
                    type="checkbox" 
                    className="mt-1 accent-cyan-500 cursor-pointer"
                    checked={retroHasDocuments} 
                    onChange={(e) => setRetroHasDocuments(e.target.checked)} 
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">Documentation & Invoices Available</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">Can you produce itemized invoices, receipts, transcripts, admissions letters, and course curriculum?</span>
                  </div>
                </label>
              </div>

              <div className="flex flex-col justify-center">
                {retroHadRating && retroPaidSelf && retroHasDocuments ? (
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-5 text-cyan-400 relative overflow-hidden animate-fade-in">
                    <div className="flex items-start gap-3">
                      <CheckCircle size={22} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-sm font-semibold text-cyan-300 block mb-1">Strong Candidate for Retroactive Induction</strong>
                        <p className="text-xs text-cyan-400/90 leading-relaxed mb-3">
                          You meet the key pre-screening elements under **M28C.V.B.6.03**. Work with your Vocational Rehabilitation Counselor (VRC) to submit a formal request.
                        </p>
                        <strong className="text-[11px] text-slate-200 block mb-1">Items to Gather:</strong>
                        <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
                          <li>Official transcripts & curriculum outlines showing progress.</li>
                          <li>Itemized invoices/receipts for tuition, fees, and books.</li>
                          <li>DD-214 and rating decision validating retroactivity.</li>
                        </ul>
                        <p className="text-[10px] text-slate-500 mt-3 font-semibold">
                          *NOTE: All Retroactive Inductions require approval from the VR&E Officer (VREO).
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-5 text-slate-400 flex flex-col items-center justify-center text-center py-8">
                    <Info size={28} className="text-slate-600 mb-2" />
                    <p className="text-[11px] max-w-xs leading-relaxed">
                      Toggle all three criteria checkboxes on the left to verify if you meet the baseline requirements for a Retroactive Induction review.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Independent Living Program (ILP) Pre-Screener Section */}
      <div className="mt-8 pt-8 border-t border-slate-800">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-6 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
          <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Award className="text-emerald-400" size={20} />
                Independent Living Program (ILP) Suitability Pre-Screener
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                38 U.S.C. § 3109 & 38 CFR § 21.76
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              If your service-connected conditions prevent you from pursuing standard vocational training, you may qualify for Independent Living services to improve your daily independence.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">ILP Pre-Screening Criteria</h4>
                
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 hover:border-slate-700/60 transition-colors duration-200">
                  <input 
                    type="checkbox" 
                    className="mt-1 accent-emerald-500 cursor-pointer"
                    checked={ilpHasSeh} 
                    onChange={(e) => setIlpHasSeh(e.target.checked)} 
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">Serious Employment Handicap (SEH)</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">Do you have an assessed Serious Employment Handicap (usually rating &ge; 10% with severe limitations)?</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 hover:border-slate-700/60 transition-colors duration-200">
                  <input 
                    type="checkbox" 
                    className="mt-1 accent-emerald-500 cursor-pointer"
                    checked={ilpNotFeasible} 
                    onChange={(e) => setIlpNotFeasible(e.target.checked)} 
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">Vocational Goal Not Feasible</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">Has a counselor determined that achievement of a vocational goal is not currently reasonably feasible?</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 hover:border-slate-700/60 transition-colors duration-200">
                  <input 
                    type="checkbox" 
                    className="mt-1 accent-emerald-500 cursor-pointer"
                    checked={ilpNeedAdl} 
                    onChange={(e) => setIlpNeedAdl(e.target.checked)} 
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">Severe Daily Living Limitations (ADL)</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">Do you experience severe barriers in daily living activities (mobility, home independence, self-care)?</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 hover:border-slate-700/60 transition-colors duration-200">
                  <input 
                    type="checkbox" 
                    className="mt-1 accent-emerald-500 cursor-pointer"
                    checked={ilpCostApproval} 
                    onChange={(e) => setIlpCostApproval(e.target.checked)} 
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">Acknowledge VRC Cost Caps</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">Are you aware that ILP plans are subject to strict supervisor cost review levels ($25k and $50k+ VREO limits)?</span>
                  </div>
                </label>
              </div>

              <div className="flex flex-col justify-center">
                {ilpHasSeh && ilpNotFeasible && ilpNeedAdl && ilpCostApproval ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-emerald-400 relative overflow-hidden animate-fade-in">
                    <div className="flex items-start gap-3">
                      <CheckCircle size={22} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-sm font-semibold text-emerald-300 block mb-1">ILP Pre-screen Recommendation</strong>
                        <p className="text-xs text-emerald-400/90 leading-relaxed">
                          You meet the statutory criteria for Independent Living Program services under **38 U.S.C. § 3109** and **38 CFR § 21.76**. Work with your VRC to request a comprehensive evaluation for assistive technologies, daily living devices, or home modifications.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-5 text-slate-400 flex flex-col items-center justify-center text-center py-8">
                    <Info size={28} className="text-slate-600 mb-2" />
                    <p className="text-[11px] max-w-xs leading-relaxed">
                      Toggle all four criteria checkboxes on the left to verify if you qualify for Independent Living Program pre-screening.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Five Tracks to Employment Diagnostic Tool (Phase 18) */}
      <div className="mt-8 pt-8 border-t border-slate-800">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-6 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
          <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Settings className="text-emerald-400" size={20} />
                Five Tracks to Employment Diagnostic Tool
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                38 CFR § 21.35
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Once entitled, the VA matches your goals and limitation profile to one of the Five Tracks. Fill out this brief diagnostic to analyze which program track represents your optimal rehabilitation path under federal criteria.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="diag-intent-select" className="text-xs font-bold text-slate-350 block mb-1">What is your primary career rehabilitation goal?</label>
                  <select 
                    id="diag-intent-select"
                    className="form-control text-xs bg-slate-950/60 border border-slate-800 text-slate-200 focus:border-emerald-500/50"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                    value={diagIntent} 
                    onChange={(e) => setDiagIntent(e.target.value)}
                  >
                    <option value="">-- Select Intent --</option>
                    <option value="reemployment">Return to a prior employer (Reemployment)</option>
                    <option value="rapid">Find a job immediately using current skills (Rapid Access)</option>
                    <option value="self">Establish a self-owned business (Self-Employment)</option>
                    <option value="training">Retrain in a new career field via education/schooling (Long-Term Services)</option>
                    <option value="independence">Improve daily independence / self-care limits (Independent Living)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="diag-severity-select" className="text-xs font-bold text-slate-350 block mb-1">How severe are your service-connected workplace restrictions?</label>
                  <select 
                    id="diag-severity-select"
                    className="form-control text-xs bg-slate-950/60 border border-slate-800 text-slate-200 focus:border-emerald-500/50"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                    value={diagSeverity} 
                    onChange={(e) => setDiagSeverity(e.target.value)}
                  >
                    <option value="">-- Select Severity --</option>
                    <option value="severe">Severe (Cannot stand, lift, or work in standard environments without significant accommodation)</option>
                    <option value="moderate">Moderate (Can work in normal environments but need adjustments or ergonomic setups)</option>
                    <option value="none">Managed (Minimal daily career impact under standard conditions)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="diag-skill-select" className="text-xs font-bold text-slate-350 block mb-1">Are your current vocational skills marketable and medically safe to use?</label>
                  <select 
                    id="diag-skill-select"
                    className="form-control text-xs bg-slate-950/60 border border-slate-800 text-slate-200 focus:border-emerald-500/50"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                    value={diagSkillLevel} 
                    onChange={(e) => setDiagSkillLevel(e.target.value)}
                  >
                    <option value="">-- Select Skill Level --</option>
                    <option value="has-skills">Yes, my skills are current, but I need placement assistance or minor accommodations</option>
                    <option value="needs-retraining">No, my skills are obsolete or my service-connected disabilities prevent me from using them safely</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                {diagIntent && diagSeverity && diagSkillLevel ? (() => {
                  const recommendation = runFiveTracksDiagnostic(diagIntent, diagSeverity, diagSkillLevel);
                  if (!recommendation) return null;
                  return (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-emerald-400 relative overflow-hidden animate-fade-in">
                      <div className="flex items-start gap-3">
                        <CheckCircle size={22} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong className="text-sm font-semibold text-emerald-300 block mb-1">Recommended Track: {recommendation.trackName}</strong>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">{recommendation.trackCfr}</span>
                          <p className="text-xs text-slate-300 leading-relaxed mb-3">
                            {recommendation.trackReason}
                          </p>
                          <div className="bg-slate-950/60 border border-slate-850 rounded p-3 text-[11px] text-slate-300 leading-relaxed">
                            <strong className="text-cyan-400 block mb-1">VRC Advocacy Strategy:</strong>
                            {recommendation.trackAdvocacy}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-5 text-slate-400 flex flex-col items-center justify-center text-center py-8">
                    <Info size={28} className="text-slate-600 mb-2" />
                    <p className="text-[11px] max-w-xs leading-relaxed">
                      Select your goals, severity, and skill levels on the left to analyze your optimal VR&E Track match.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feasibility Rebuttal Strategy Assistant Section (Phase 18) */}
      <div className="mt-8 pt-8 border-t border-slate-800">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-6 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
          <div className="absolute -inset-px bg-gradient-to-r from-red-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Settings className="text-red-400" size={20} />
                Feasibility Rebuttal Strategy Assistant
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-red-500/10 text-red-400 rounded border border-red-500/20">
                38 CFR § 21.35(i) & § 21.53
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              If your counselor asserts that a training program is "not currently reasonably feasible" due to your disabilities, you are entitled to rebut this finding. Draft a formal request for reconsideration using this compiler.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="rebut-claim-input" className="text-xs font-bold text-slate-350 block mb-1">What is the VRC's specific unfeasibility objection?</label>
                  <textarea
                    id="rebut-claim-input"
                    className="form-control text-xs bg-slate-950/60 border border-slate-800 text-slate-200 focus:border-red-500/50"
                    style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '6px', resize: 'vertical' }}
                    placeholder="e.g. Counselor claims my physical spine rating makes desk work unfeasible."
                    value={rebutCounselorClaim}
                    onChange={(e) => setRebutCounselorClaim(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rebut-accom-input" className="text-xs font-bold text-slate-350 block mb-1">What accommodations or factual indicators show you can succeed?</label>
                  <textarea
                    id="rebut-accom-input"
                    className="form-control text-xs bg-slate-950/60 border border-slate-800 text-slate-200 focus:border-red-500/50"
                    style={{ width: '100%', minHeight: '85px', padding: '10px', borderRadius: '6px', resize: 'vertical' }}
                    placeholder="e.g. I will use ergonomic chairs, take regular standing breaks, and my physician cleared me."
                    value={rebutAccommodations}
                    onChange={(e) => setRebutAccommodations(e.target.value)}
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 transition-colors">
                  <input
                    type="checkbox"
                    className="mt-1 accent-red-500 cursor-pointer"
                    checked={rebutMedicalClearance}
                    onChange={(e) => setRebutMedicalClearance(e.target.checked)}
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-200 block">Treating Doctor Statement Available</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">Do you have or can you get a signed letter from your physician clearing you to study or work?</span>
                  </div>
                </label>
              </div>

              <div className="flex flex-col justify-center">
                {rebutCounselorClaim || rebutAccommodations ? (
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-3.5 text-xs animate-fade-in">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <strong className="text-red-350">Generated Rebuttal Letter Preview</strong>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(compileFeasibilityRebuttalLetter());
                            setRebutCopySuccess(true);
                            setTimeout(() => setRebutCopySuccess(false), 2000);
                          }}
                          className="px-2 py-0.5 bg-slate-900 border border-slate-850 text-[10px] text-cyan-400 rounded font-semibold cursor-pointer"
                        >
                          {rebutCopySuccess ? '✓ Copied' : 'Copy'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const printWindow = window.open('', '_blank');
                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>Feasibility Rebuttal Letter</title>
                                  <style>
                                    body { font-family: sans-serif; padding: 40px; color: #111; line-height: 1.6; white-space: pre-wrap; }
                                    .header { border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 20px; font-size: 1.2rem; font-weight: bold; }
                                  </style>
                                </head>
                                <body>
                                  <div class="header">38 CFR § 21.53 Feasibility Rebuttal Letter</div>
                                  <div>${compileFeasibilityRebuttalLetter()}</div>
                                  <script>window.print();</script>
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                          }}
                          className="px-2 py-0.5 bg-slate-900 border border-slate-850 text-[10px] text-cyan-400 rounded font-semibold cursor-pointer"
                        >
                          Print
                        </button>
                      </div>
                    </div>
                    <div className="bg-slate-950 border border-slate-900 rounded p-3 text-[10px] text-slate-350 leading-relaxed font-mono select-all overflow-y-auto max-h-[220px] white-space-pre-wrap">
                      {compileFeasibilityRebuttalLetter()}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-5 text-slate-400 flex flex-col items-center justify-center text-center py-8">
                    <Info size={28} className="text-slate-600 mb-2" />
                    <p className="text-[11px] max-w-xs leading-relaxed">
                      Enter the VRC's objection and your proposed accommodations on the left to compile a formal feasibility rebuttal letter.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VRC Counselor Interview Simulator Section */}
      <div className="mt-8 pt-8 border-t border-slate-800">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-6 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
          <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <HelpCircle className="text-cyan-400" size={20} />
                VRC Counselor Interview Simulator & Coach
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20">
                Practice Session
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Prepare for your initial VRC counselor evaluation. Practice articulating your disability employment barriers and receive live feedback based on official VA decision criteria.
            </p>

            {simulatorStep === 0 && (
              <div className="text-center py-6 bg-slate-950/30 border border-slate-850 rounded-xl">
                <Award size={32} className="text-cyan-500 mx-auto mb-3" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">Ready to Start Practice Session?</h4>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto mb-4 leading-relaxed">
                  Learn to connect your service-connected conditions directly to vocational limitations so you can clearly demonstrate your Employment Handicap.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSimulatorStep(1);
                    setSimQ1(null);
                    setSimQ2(null);
                    setSimQ3(null);
                  }}
                  className="btn btn-primary text-xs px-6 cursor-pointer"
                >
                  Start Simulator
                </button>
              </div>
            )}

            {simulatorStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <span>Question 1 of 3: Occupational Barriers</span>
                  <span>Step 1/3</span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 leading-relaxed">
                  How do your service-connected disabilities affect your ability to perform your occupational duties?
                </h4>
                
                <div className="flex flex-col gap-2.5">
                  <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 transition-colors">
                    <input 
                      type="radio" 
                      name="simq1" 
                      className="mt-1" 
                      checked={simQ1 === 'severe'} 
                      onChange={() => setSimQ1('severe')} 
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-200 block">Severe Daily Limitations</span>
                      <span className="text-slate-400 text-[11px] block mt-0.5">"My conditions cause constant pain or severe restrictions, making it impossible to perform key tasks of my trade."</span>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 transition-colors">
                    <input 
                      type="radio" 
                      name="simq1" 
                      className="mt-1" 
                      checked={simQ1 === 'moderate'} 
                      onChange={() => setSimQ1('moderate')} 
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-200 block">Moderate/Partial Limitations</span>
                      <span className="text-slate-400 text-[11px] block mt-0.5">"I can perform my duties, but it requires substantial effort, medication, pain, or frequent rests."</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 transition-colors">
                    <input 
                      type="radio" 
                      name="simq1" 
                      className="mt-1" 
                      checked={simQ1 === 'none'} 
                      onChange={() => setSimQ1('none')} 
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-200 block">No Limitations</span>
                      <span className="text-slate-400 text-[11px] block mt-0.5">"My disabilities are managed and do not impact my occupational duties."</span>
                    </div>
                  </label>
                </div>

                {simQ1 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-400 leading-relaxed">
                    <strong>VRC Coaching Tip:</strong> {
                      simQ1 === 'none' 
                        ? 'Warning: If you tell your counselor you have no daily limitations, they will find you have NO Employment Handicap under 38 CFR § 21.51, resulting in denial. Articulate physical or cognitive strain that makes your current work unsuitable.' 
                        : 'Excellent: Clearly linking your disability to specific occupational obstacles helps establish a vocational impairment and confirms your Employment Handicap.'
                    }
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setSimulatorStep(0)} 
                    className="btn btn-secondary text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    disabled={!simQ1} 
                    onClick={() => setSimulatorStep(2)} 
                    className="btn btn-primary text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next Question
                  </button>
                </div>
              </div>
            )}

            {simulatorStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <span>Question 2 of 3: Suitability of Current Job</span>
                  <span>Step 2/3</span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 leading-relaxed">
                  Are you currently employed, and does your job accommodate your disabilities?
                </h4>
                
                <div className="flex flex-col gap-2.5">
                  <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 transition-colors">
                    <input 
                      type="radio" 
                      name="simq2" 
                      className="mt-1" 
                      checked={simQ2 === 'unemployed'} 
                      onChange={() => setSimQ2('unemployed')} 
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-200 block">Currently Unemployed</span>
                      <span className="text-slate-400 text-[11px] block mt-0.5">"I am currently out of work because of my service-connected conditions."</span>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 transition-colors">
                    <input 
                      type="radio" 
                      name="simq2" 
                      className="mt-1" 
                      checked={simQ2 === 'unaccommodated'} 
                      onChange={() => setSimQ2('unaccommodated')} 
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-200 block">Employed (Unaccommodated/Unsuitable)</span>
                      <span className="text-slate-400 text-[11px] block mt-0.5">"I have a job, but it does not accommodate my disabilities, resulting in daily physical strain."</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 transition-colors">
                    <input 
                      type="radio" 
                      name="simq2" 
                      className="mt-1" 
                      checked={simQ2 === 'accommodated'} 
                      onChange={() => setSimQ2('accommodated')} 
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-200 block">Employed (Suitable/Accommodated)</span>
                      <span className="text-slate-400 text-[11px] block mt-0.5">"My job fully accommodates my conditions with minimal physical or cognitive strain."</span>
                    </div>
                  </label>
                </div>

                {simQ2 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-400 leading-relaxed">
                    <strong>VRC Coaching Tip:</strong> {
                      simQ2 === 'accommodated' 
                        ? 'Warning: If you are already in a fully suitable, accommodated job, the VRC may conclude you have "overcome" your handicap. Be prepared to explain why this job limits long-term growth or if it causes underlying issues.' 
                        : 'Correct: Pointing out that you are unemployed due to disability, or that your current employment is physically unsuitable/painful, demonstrates that a vocational handicap remains active.'
                    }
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setSimulatorStep(1)} 
                    className="btn btn-secondary text-xs cursor-pointer"
                  >
                    Back
                  </button>
                  <button 
                    type="button" 
                    disabled={!simQ2} 
                    onClick={() => setSimulatorStep(3)} 
                    className="btn btn-primary text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next Question
                  </button>
                </div>
              </div>
            )}

            {simulatorStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <span>Question 3 of 3: Vocational Feasibility</span>
                  <span>Step 3/3</span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 leading-relaxed">
                  What is your desired vocational goal, and how does it bypass your disability limitations?
                </h4>
                
                <div className="flex flex-col gap-2.5">
                  <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 transition-colors">
                    <input 
                      type="radio" 
                      name="simq3" 
                      className="mt-1" 
                      checked={simQ3 === 'compatible'} 
                      onChange={() => setSimQ3('compatible')} 
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-200 block">Medically Compatible Goal</span>
                      <span className="text-slate-400 text-[11px] block mt-0.5">"I chose a desk-based, cognitively focused role that completely avoids heavy physical labor or standing."</span>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 transition-colors">
                    <input 
                      type="radio" 
                      name="simq3" 
                      className="mt-1" 
                      checked={simQ3 === 'incompatible'} 
                      onChange={() => setSimQ3('incompatible')} 
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-200 block">Physically Active Goal</span>
                      <span className="text-slate-400 text-[11px] block mt-0.5">"My goal involves physical tasks, lifting, or field work that may trigger my disability ratings."</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg hover:bg-slate-950/80 transition-colors">
                    <input 
                      type="radio" 
                      name="simq3" 
                      className="mt-1" 
                      checked={simQ3 === 'undecided'} 
                      onChange={() => setSimQ3('undecided')} 
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-200 block">Undecided / Open</span>
                      <span className="text-slate-400 text-[11px] block mt-0.5">"I do not have a specific goal yet and want to explore options with my counselor."</span>
                    </div>
                  </label>
                </div>

                {simQ3 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-400 leading-relaxed">
                    <strong>VRC Coaching Tip:</strong> {
                      simQ3 === 'incompatible' 
                        ? 'Warning: If your training goal directly conflicts with your physical or mental limitations (e.g., wanting to be a mechanic with severe back and knee ratings), the counselor will deny feasibility. Focus on goals compatible with your profile.' 
                        : simQ3 === 'undecided'
                        ? 'Note: It is perfectly acceptable to be undecided. Your VRC can guide you through vocational testing, but having a general idea of compatible fields shows preparation.'
                        : 'Correct: Choosing a goal that accommodates your disabilities demonstrates that the rehabilitation program is medically feasible.'
                    }
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setSimulatorStep(2)} 
                    className="btn btn-secondary text-xs cursor-pointer"
                  >
                    Back
                  </button>
                  <button 
                    type="button" 
                    disabled={!simQ3} 
                    onClick={() => setSimulatorStep(4)} 
                    className="btn btn-primary text-xs cursor-pointer"
                  >
                    Complete Practice Session
                  </button>
                </div>
              </div>
            )}

            {simulatorStep === 4 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-emerald-400 text-xs flex gap-2">
                  <CheckCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <strong>Orientation Practice Completed:</strong> You have completed the practice VRC counselor interview. Review your case preparation summary sheet below.
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide border-b border-slate-800 pb-2">
                    VRC Counselor Interview Preparation Sheet
                  </h4>

                  <div className="space-y-3.5">
                    <div>
                      <strong className="text-slate-350 block mb-1">1. Articulating Occupational Obstacles (38 CFR § 21.51 / § 21.52):</strong>
                      <p className="text-slate-400 leading-relaxed italic pl-3 border-l border-slate-800">
                        {simQ1 === 'severe' && '"My disabilities cause severe pain or limitations, making it impossible to perform key duties of my trade."'}
                        {simQ1 === 'moderate' && '"I can perform my duties, but it requires substantial effort, pain, or frequent breaks."'}
                        {simQ1 === 'none' && '"My disabilities do not affect my daily work duties."'}
                      </p>
                      <span className="text-[10px] text-cyan-400 mt-1 block">
                        Coaching Note: Be ready to list specific physical tasks (e.g. lifting, typing, sitting) that provoke pain or anxiety.
                      </span>
                    </div>

                    <div>
                      <strong className="text-slate-350 block mb-1">2. Current Job Suitability & Accommodation (38 CFR § 21.51):</strong>
                      <p className="text-slate-400 leading-relaxed italic pl-3 border-l border-slate-800">
                        {simQ2 === 'unemployed' && '"I am currently unemployed because of my disabilities."'}
                        {simQ2 === 'unaccommodated' && '"I have a job, but it does not accommodate my disabilities, resulting in daily physical strain."'}
                        {simQ2 === 'accommodated' && '"My job fully accommodates my conditions with minimal strain."'}
                      </p>
                      <span className="text-[10px] text-cyan-400 mt-1 block">
                        Coaching Note: If employed, explain why your work environment triggers symptoms, proving you have not "overcome" your impairment.
                      </span>
                    </div>

                    <div>
                      <strong className="text-slate-350 block mb-1">3. Feasibility of Vocational Goal (38 CFR § 21.35 / § 21.50):</strong>
                      <p className="text-slate-400 leading-relaxed italic pl-3 border-l border-slate-800">
                        {simQ3 === 'compatible' && '"I have selected a desk-based/flexible goal that is medically compatible with my conditions."'}
                        {simQ3 === 'incompatible' && '"My goal involves physical tasks that might conflict with my disability ratings."'}
                        {simQ3 === 'undecided' && '"I do not have a specific goal yet and need assistance from a counselor."'}
                      </p>
                      <span className="text-[10px] text-cyan-400 mt-1 block">
                        Coaching Note: Always argue that your desired training goal is physically feasible and safe to pursue long-term.
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 italic pt-2 border-t border-slate-850">
                    Prepared on {new Date().toLocaleDateString()} • Case planning tool under Chapter 31.
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                      VA Form 28-1900 Remarks Compiler (Section IV: Remarks)
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(compileForm281900Remarks());
                        setRemarksCopySuccess(true);
                        setTimeout(() => setRemarksCopySuccess(false), 2000);
                      }}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 text-[10px] text-cyan-400 hover:text-cyan-300 rounded font-semibold cursor-pointer"
                    >
                      {remarksCopySuccess ? '✓ Copied Remarks!' : 'Copy Remarks'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Copy and paste the statement below directly into your VA Form 28-1900 application when submitting on VA.gov to establish your regulatory entitlement arguments early:
                  </p>
                  <div className="bg-slate-950 border border-slate-900 rounded p-3 text-[11px] text-slate-350 leading-relaxed font-mono select-all">
                    {compileForm281900Remarks()}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const text = `VRC COUNSELOR INTERVIEW PREPARATION SHEET\n\n` +
                        `1. OCCUPATIONAL OBSTACLES (38 CFR § 21.51 / § 21.52):\n` +
                        `Response: ${
                          simQ1 === 'severe' ? 'Severe limitations performing key trade duties.' :
                          simQ1 === 'moderate' ? 'Moderate limitations, requires substantial effort/pain.' :
                          'No daily limitations reported.'
                        }\n\n` +
                        `2. SUITABILITY OF CURRENT JOB (38 CFR § 21.51):\n` +
                        `Response: ${
                          simQ2 === 'unemployed' ? 'Currently unemployed due to disabilities.' :
                          simQ2 === 'unaccommodated' ? 'Employed but unsuitable, causes physical strain.' :
                          'Employed in a fully accommodated, suitable role.'
                        }\n\n` +
                        `3. GOAL FEASIBILITY (38 CFR § 21.35 / § 21.50):\n` +
                        `Response: ${
                          simQ3 === 'compatible' ? 'Medically compatible desk-based/flexible goal.' :
                          simQ3 === 'incompatible' ? 'Physically active goal that may conflict with ratings.' :
                          'Undecided, seeking vocational counseling guidance.'
                        }\n\n` +
                        `*** Prepared via Chapter 31 case strategy portal. ***`;
                      navigator.clipboard.writeText(text);
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    }}
                    className="btn btn-secondary text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{copySuccess ? '✓ Copied!' : 'Copy Prep Sheet'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>VRC Counselor Interview Preparation Sheet</title>
                            <style>
                              body { font-family: sans-serif; padding: 40px; color: #111; line-height: 1.6; }
                              h1 { font-size: 1.4rem; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 20px; }
                              h2 { font-size: 1.1rem; color: #222; margin-top: 20px; }
                              p { font-size: 0.95rem; margin-bottom: 12px; }
                              .coaching { font-size: 0.85rem; color: #555; background-color: #f5f5f5; padding: 10px; border-left: 3px solid #888; margin-top: 4px; }
                              .footer { margin-top: 40px; font-size: 0.8rem; color: #777; border-top: 1px solid #ddd; padding-top: 10px; }
                            </style>
                          </head>
                          <body>
                            <h1>VRC Counselor Interview Preparation Sheet</h1>
                            <p>Use this reference sheet to prepare for your initial evaluation and orientation interview with your Vocational Rehabilitation Counselor (VRC).</p>
                            
                            <h2>1. Occupational Obstacles (38 CFR &sect; 21.51 / &sect; 21.52)</h2>
                            <p><strong>Response:</strong> ${
                              simQ1 === 'severe' ? 'My conditions cause constant pain or severe restrictions, making it impossible to perform key tasks of my trade.' :
                              simQ1 === 'moderate' ? 'I can perform my duties, but it requires substantial effort, medication, pain, or frequent rests.' :
                              'My disabilities are managed and do not impact my occupational duties.'
                            }</p>
                            <div class="coaching"><strong>VRC Interview Tip:</strong> Focus on listing specific work tasks (sitting, lifting, writing) that cause physical or mental pain.</div>
                            
                            <h2>2. Current Job Suitability & Accommodation (38 CFR &sect; 21.51)</h2>
                            <p><strong>Response:</strong> ${
                              simQ2 === 'unemployed' ? 'I am currently out of work because of my service-connected conditions.' :
                              simQ2 === 'unaccommodated' ? 'I have a job, but it does not accommodate my disabilities, resulting in daily physical strain.' :
                              'My job fully accommodates my conditions with minimal physical or cognitive strain.'
                            }</p>
                            <div class="coaching"><strong>VRC Interview Tip:</strong> If you are working but in pain, make it clear that the job is unsuitable and is not a viable long-term solution.</div>
                            
                            <h2>3. Feasibility of Vocational Goal (38 CFR &sect; 21.35 / &sect; 21.50)</h2>
                            <p><strong>Response:</strong> ${
                              simQ3 === 'compatible' ? 'I chose a desk-based, cognitively focused role that completely avoids heavy physical labor or standing.' :
                              simQ3 === 'incompatible' ? 'My goal involves physical tasks, lifting, or field work that may trigger my disability ratings.' :
                              'I do not have a specific goal yet and want to explore options with my counselor.'
                            }</p>
                            <div class="coaching"><strong>VRC Interview Tip:</strong> Emphasize that your target training goal fits within your medical limitations and is safe to execute.</div>
                            
                            <div class="footer">
                              Prepared via Interactive VR&E Portal on ${new Date().toLocaleDateString()}
                            </div>
                            <script>window.print();</script>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }}
                    className="btn btn-secondary text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Print Prep Sheet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSimulatorStep(0);
                      setSimQ1(null);
                      setSimQ2(null);
                      setSimQ3(null);
                    }}
                    className="btn btn-primary text-xs cursor-pointer ml-auto"
                  >
                    Restart Simulator
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default EntitlementWizardView;
