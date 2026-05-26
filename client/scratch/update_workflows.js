import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

const WORKFLOWS_DIR = path.join(PROJECT_ROOT, 'src/data/workflows');

const updates = {
  "case-closed.json": {
    "evidenceChecklist": [
      { "id": "warning_notice", "text": "Copy of 30-day warning / intent to discontinue notice (or confirmation none was sent)", "weight": 35 },
      { "id": "cooperation_emails", "text": "Sent emails, portal messages, or logs showing active attempts to contact VRC", "weight": 35 },
      { "id": "medical_excuse", "text": "Physician statement or evidence of medical emergency explaining missed appointments", "weight": 30 }
    ],
    "evidenceScoring": {
      "thresholds": { "strong": 70, "borderline": 35 },
      "maxScore": 100
    },
    "bestNextActionRules": [
      { "criteria": "No written 30-day intent notice received", "action": "File administrative review requesting immediate VREO reversal of discontinuance under 38 C.F.R. § 21.197.", "reference": "38-cfr-21-197" },
      { "criteria": "Veteran rated 50% or more disabling", "action": "Request verification that the VR&E Officer (VREO) personally approved the discontinuance under 38 C.F.R. § 21.198(b)(7).", "reference": "38-cfr-21-198" }
    ],
    "vaErrorTriggers": [
      "no_prior_notice",
      "lack_of_vreo_review_50",
      "no_formal_decision_notice"
    ],
    "reviewLaneQuestions": [
      { "id": "notice_received", "question": "Did you receive a written 30-day notice of intent to discontinue your program?", "options": ["Yes", "No"] },
      { "id": "rating_50_plus", "question": "Is your combined service-connected disability rating 50% or higher?", "options": ["Yes", "No"] },
      { "id": "form_20_0998_received", "question": "Did you receive a formal written decision (VA Form 20-0998)?", "options": ["Yes", "No"] }
    ],
    "outputPacket": [
      "discontinuance-rebuttal",
      "evidence-checklist"
    ]
  },
  "counselor-delay.json": {
    "evidenceChecklist": [
      { "id": "email_stamps", "text": "Sent emails/messages with timestamps proving attempts to reach VRC", "weight": 40 },
      { "id": "contact_timeline", "text": "Documented contact log timeline detailing method, date, and lack of reply", "weight": 40 },
      { "id": "school_delay_impact", "text": "Letter from school confirming registration or payment is at risk due to lack of auth", "weight": 20 }
    ],
    "evidenceScoring": {
      "thresholds": { "strong": 80, "borderline": 40 },
      "maxScore": 100
    },
    "bestNextActionRules": [
      { "criteria": "Unresponsive for more than 14 days", "action": "Submit a supervisory escalation letter to the VR&E Officer (VREO) demanding case manager intervention.", "reference": "M28C.IV.C.1" }
    ],
    "vaErrorTriggers": [
      "delay_exceeds_14_days",
      "failure_to_assist_inquiry"
    ],
    "reviewLaneQuestions": [
      { "id": "days_unresponsive", "question": "How many days have elapsed since your last response or contact attempt?", "options": ["Under 14 days", "14-29 days", "30+ days"] },
      { "id": "written_record", "question": "Do you have email read receipts or written logs of your attempts?", "options": ["Yes", "No"] }
    ],
    "outputPacket": [
      "counselor-escalation"
    ]
  },
  "eligibility-entitlement.json": {
    "evidenceChecklist": [
      { "id": "rating_decision", "text": "VA Rating Decision copy establishing 10% or higher combined rating", "weight": 35 },
      { "id": "dd214_copy", "text": "DD-214 copy showing discharge character (other than dishonorable)", "weight": 25 },
      { "id": "employment_barriers_log", "text": "Detailed history/log of employment barriers or aggravation of conditions", "weight": 40 }
    ],
    "evidenceScoring": {
      "thresholds": { "strong": 65, "borderline": 35 },
      "maxScore": 100
    },
    "bestNextActionRules": [
      { "criteria": "Rated 10% with employment handicap finding", "action": "Demand VRC complete Serious Employment Handicap (SEH) evaluation before rendering a decision.", "reference": "38-cfr-21-52" }
    ],
    "vaErrorTriggers": [
      "rating_eligibility_mixup",
      "automatic_entitlement_assumption",
      "employment_defeats_eh"
    ],
    "reviewLaneQuestions": [
      { "id": "disability_rating", "question": "What is your combined service-connected disability rating?", "options": ["0%", "10%", "20% or higher"] },
      { "id": "discharge_character", "question": "What is your character of discharge on DD-214?", "options": ["Honorable / General", "OTH", "BCD / Dishonorable"] }
    ],
    "outputPacket": [
      "employment-handicap-statement",
      "seh-statement"
    ]
  },
  "feasibility-denial.json": {
    "evidenceChecklist": [
      { "id": "medical_clearance", "text": "Physician letter stating training/work is possible with accommodations", "weight": 35 },
      { "id": "functional_capacity", "text": "Records of recent volunteer work, courses completed, or active hobbies", "weight": 35 },
      { "id": "assessment_report", "text": "Copy of the VRC vocational assessment detailing unfeasibility reasons", "weight": 30 }
    ],
    "evidenceScoring": {
      "thresholds": { "strong": 70, "borderline": 35 },
      "maxScore": 100
    },
    "bestNextActionRules": [
      { "criteria": "VRC asserts unfeasibility without extended evaluation", "action": "Formally request a 12-month Extended Evaluation under 38 C.F.R. § 21.74 to test capacity.", "reference": "38-cfr-21-74" }
    ],
    "vaErrorTriggers": [
      "checklist_only_decision",
      "doubt_resolved_against_veteran"
    ],
    "reviewLaneQuestions": [
      { "id": "extended_eval_offered", "question": "Did the counselor offer an Extended Evaluation to test feasibility before closing?", "options": ["Yes", "No"] },
      { "id": "medical_support", "question": "Do you have a treating doctor who supports your ability to participate in this training?", "options": ["Yes", "No"] }
    ],
    "outputPacket": [
      "feasibility-rebuttal",
      "extended-evaluation-request"
    ]
  },
  "ipe-change.json": {
    "evidenceChecklist": [
      { "id": "medical_aggravation", "text": "Doctor statement verifying current plan goal is medically unsuitable", "weight": 35 },
      { "id": "market_demand", "text": "Labor market data showing target field has demand and offers suitable employment", "weight": 35 },
      { "id": "academic_standing", "text": "Transcripts showing good academic standing in prerequisite/related courses", "weight": 30 }
    ],
    "evidenceScoring": {
      "thresholds": { "strong": 70, "borderline": 35 },
      "maxScore": 100
    },
    "bestNextActionRules": [
      { "criteria": "Plan goal is medically unsuitable", "action": "Submit IPE Amendment Request citing medical necessity under 38 C.F.R. § 21.94.", "reference": "38-cfr-21-94" }
    ],
    "vaErrorTriggers": [
      "arbitrary_goal_denial",
      "failure_to_reevaluate_plan"
    ],
    "reviewLaneQuestions": [
      { "id": "current_goal_suitability", "question": "Does your current approved vocational goal aggravate your disability?", "options": ["Yes", "No"] },
      { "id": "academic_prereqs", "question": "Have you completed prerequisites or introductory classes for the new goal?", "options": ["Yes", "No"] }
    ],
    "outputPacket": [
      "ipe-change-letter"
    ]
  },
  "seh-extension.json": {
    "evidenceChecklist": [
      { "id": "seh_documented", "text": "Initial evaluation document finding a Serious Employment Handicap (SEH)", "weight": 30 },
      { "id": "iwrp_signed", "text": "Copy of signed IWRP or course rehabilitation plan", "weight": 20 },
      { "id": "incomplete_credits", "text": "Transcripts showing outstanding credits to complete approved goal", "weight": 25 },
      { "id": "lmi_viability", "text": "Labor market listings showing target goal is the only suitable placement", "weight": 25 }
    ],
    "evidenceScoring": {
      "thresholds": { "strong": 75, "borderline": 50 },
      "maxScore": 100
    },
    "bestNextActionRules": [
      { "criteria": "48-month cap reached with active SEH finding", "action": "Request program extension citing Serious Employment Handicap under 38 U.S.C. § 3105(c).", "reference": "38-usc-3105" }
    ],
    "vaErrorTriggers": [
      "hard_cap_assertion",
      "delegation_denial"
    ],
    "reviewLaneQuestions": [
      { "id": "has_seh_finding", "question": "Has the VA officially documented that you have a Serious Employment Handicap?", "options": ["Yes", "No", "Unsure"] },
      { "id": "months_used", "question": "Have you used 48 months or more of VA education benefits?", "options": ["Yes", "No"] }
    ],
    "outputPacket": [
      "seh-extension-letter",
      "seh-determination-request"
    ]
  },
  "supplies-denial.json": {
    "evidenceChecklist": [
      { "id": "syllabus_req", "text": "Syllabus explicitly requiring a personal computer or specialized tools", "weight": 25 },
      { "id": "school_letter", "text": "School policy letter stating laptop/tech is required for all students", "weight": 25 },
      { "id": "necessity_statement", "text": "Personal statement explaining technology need due to disability or disadvantages", "weight": 30 },
      { "id": "adaptive_backing", "text": "OT report or doctor recommendation for adaptive hardware/software", "weight": 20 }
    ],
    "evidenceScoring": {
      "thresholds": { "strong": 75, "borderline": 50 },
      "maxScore": 100
    },
    "bestNextActionRules": [
      { "criteria": "Syllabus or policy requires computer", "action": "Submit supplies request under 38 C.F.R. § 21.212 showing necessity.", "reference": "38-cfr-21-212" }
    ],
    "vaErrorTriggers": [
      "flat_cap_claim",
      "no_written_necessity_analysis",
      "ch33_conflation"
    ],
    "reviewLaneQuestions": [
      { "id": "has_syllabus_req", "question": "Does your course syllabus explicitly state a computer or laptop is required?", "options": ["Yes", "No"] },
      { "id": "budget_cap_cited", "question": "Did the counselor cite an office budget cap (e.g., $500 or $1,000) for supplies?", "options": ["Yes", "No"] }
    ],
    "outputPacket": [
      "supplies-request"
    ]
  },
  "tuition-unpaid.json": {
    "evidenceChecklist": [
      { "id": "term_schedule", "text": "Current class schedule showing enrollment dates", "weight": 30 },
      { "id": "unpaid_statement", "text": "School account statement showing tuition invoice and billing deadlines", "weight": 30 },
      { "id": "sco_delay_confirm", "text": "Email or statement from School Certifying Official confirming lack of auth", "weight": 40 }
    ],
    "evidenceScoring": {
      "thresholds": { "strong": 70, "borderline": 30 },
      "maxScore": 100
    },
    "bestNextActionRules": [
      { "criteria": "Tuition unpaid 14 days after term start", "action": "Submit urgent tuition escalation notice citing 38 C.F.R. § 21.262 to force Tungsten authorization.", "reference": "38-cfr-21-262" }
    ],
    "vaErrorTriggers": [
      "authorization_delay",
      "school_threatens_disenrollment"
    ],
    "reviewLaneQuestions": [
      { "id": "term_started", "question": "Has the school term already started?", "options": ["Yes", "No"] },
      { "id": "sco_notified", "question": "Have you confirmed with the School Certifying Official that your enrollment is certified?", "options": ["Yes", "No"] }
    ],
    "outputPacket": [
      "tuition-delay-escalation"
    ]
  }
};

Object.entries(updates).forEach(([file, fields]) => {
  const filePath = path.join(WORKFLOWS_DIR, file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const merged = { ...data, ...fields };
    fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf8');
    console.log(`Updated ${file} successfully.`);
  } else {
    console.error(`File not found: ${filePath}`);
  }
});
