import { useState } from 'react';
import { AlertTriangle, ChevronRight, FileEdit, BookOpen, HelpCircle } from 'lucide-react';

const ERROR_ITEMS = [
  {
    id: 'seh_denial',
    title: 'Unreasonable Denial of Serious Employment Handicap (SEH)',
    plainTitle: 'Counselor Refuses to Grant "Serious Handicap" Status',
    citation: '38 CFR § 21.52, 38 CFR § 21.44, M28C.IV.A.2, M28C.IV.B.1',
    explanation: 'The counselor denies an SEH designation despite clear evidence of significant barriers to employment and a service-connected rating of 10% or more, or fails to apply the lower threshold required for veterans with an SEH.',
    plainExplanation: 'If you have a 10% or greater disability rating, your counselor might wrongly deny you "Serious Employment Handicap" (SEH) status. Getting SEH unlocks longer training terms, more funding, and specialized tracks.',
    advocacySteps: [
      'Submit written evidence of your employment barriers, including medical restrictions, job rejection letters, and performance evaluations.',
      'Cite 38 CFR § 21.44 which defines the criteria for establishing a Serious Employment Handicap.',
      'Request a formal written decision under 38 U.S.C. § 5104 detailing the evidence considered.',
      'Submit an SEH/Extension Request letter to your counselor.'
    ],
    letterType: 'seh_extension'
  },
  {
    id: 'feasibility_denial',
    title: 'Denial of Feasibility Without Exhaustive Assessment',
    plainTitle: 'Counselor Claims Your Disability Makes Training "Unfeasible"',
    citation: '38 CFR § 21.53, M28C.IV.B.3',
    explanation: 'The counselor asserts that achieving a vocational goal is not "reasonably feasible" due to the severity of your disability, but fails to conduct a comprehensive vocational evaluation or coordinate with medical professionals as required under 38 CFR § 21.53.',
    plainExplanation: 'Your counselor cannot simply declare you "too disabled to work" without doing a deep, professional evaluation of your skills and health, including consulting doctors. You have the right to fight this finding.',
    advocacySteps: [
      'Obtain a statement from your treating doctor or therapist confirming you are medically cleared to participate in the proposed training goal.',
      'Remind the counselor that under 38 CFR § 21.53, they must resolve all reasonable doubt in your favor.',
      'Provide evidence of recent successful activities, such as online courses, volunteer work, or hobby projects.',
      'Generate and submit a Feasibility Rebuttal letter.'
    ],
    letterType: 'feasibility_rebuttal'
  },
  {
    id: 'exhaust_gi_bill',
    title: 'Requirement to Exhaust Chapter 33 Post-9/11 GI Bill',
    plainTitle: 'Counselor Tells You to Use Up Your GI Bill First',
    citation: '38 U.S.C. § 3102, 38 CFR § 21.40, M28C.IV.A.2',
    explanation: 'Counselors sometimes assert that veterans must use their GI Bill (Chapter 33) benefits before utilizing VR&E (Chapter 31) services. This is a direct violation of regulatory precedence: VR&E is an entitlement program designed for vocational rehabilitation and should be used first to preserve GI Bill education benefits.',
    plainExplanation: 'Counselors may tell you to use up your Post-9/11 GI Bill first. This is wrong. You should use VR&E first to rehabilitate, saving your GI Bill for other education later. Using VR&E does not take away your GI Bill months.',
    advocacySteps: [
      'State clearly in writing that Chapter 31 VR&E is a rehabilitation benefit, not an education benefit, and that you wish to utilize it now.',
      'Reference M28C Part IV.A.2 guidelines which explicitly prohibit counselors from forcing veterans to exhaust GI Bill benefits before applying for VR&E.',
      'Request an escalation to the VR&E Officer if the counselor refuses to schedule an initial evaluation.',
      'Use the Counselor Escalation letter to notify supervisory staff.'
    ],
    letterType: 'escalation'
  },
  {
    id: 'blanket_supplies_denial',
    title: 'Blanket Denial of Computer/Laptop Package or Specialized Tools',
    plainTitle: 'Counselor Denies Computer or Supplies Without Checking Needs',
    citation: '38 CFR § 21.210, 38 CFR § 21.212, M28C.V.A.3',
    explanation: 'The counselor applies a blanket rule denying a laptop package, high-performance computer, or specialized software, stating that "VR&E does not buy computers" or asserting an arbitrary spending limit. Under 38 CFR § 21.212, supplies must be provided based on the specific academic or vocational requirements of your program.',
    plainExplanation: 'If your school course requires a computer or specific tools, VA should authorize them unless the counselor provides a lawful, individualized reason for denial under 38 C.F.R. §§ 21.210–21.212. A counselor cannot apply blanket rules like "we do not buy laptops" or set arbitrary budget limits.',
    advocacySteps: [
      'Secure a copy of your school\'s computer hardware/software requirements or department syllabus.',
      'Get a letter from your professor or advisor stating that a computer with specific technical specs is necessary for the coursework.',
      'Cite 38 CFR § 21.212, highlighting that the VA should supply tools required of all students in the program to avoid placing you at a distinct disadvantage.',
      'Submit a formal Computer/Supplies Request letter with syllabus attachments.'
    ],
    letterType: 'computer_request'
  },
  {
    id: 'arbitrary_cap_degree',
    title: 'Arbitrary Cap on Education Level (e.g. Refusing Graduate Degrees)',
    plainTitle: 'Counselor Refuses to Approve a Master\'s or Doctorate Degree',
    citation: '38 CFR § 21.52, 38 CFR § 21.72, M28C.IV.B.3',
    explanation: 'The counselor tells you that VR&E only pays for Bachelor\'s degrees or trade schools, and refuses to approve a graduate degree (Master\'s, J.D., M.D., Ph.D.) required for entry into your chosen vocational field. Under 38 CFR § 21.72, the education level approved is determined by what is needed to overcome your employment handicap.',
    plainExplanation: 'If your selected career goal (such as a counselor, lawyer, or therapist) requires a graduate degree for entry-level licensing and employment, the VA should approve graduate-level training. The counselor cannot arbitrarily cap services at a Bachelor\'s degree if that degree is insufficient for you to become employable.',
    advocacySteps: [
      'Provide local job postings showing that a graduate degree is the standard entry-level requirement for the target occupation.',
      'Provide state licensing board regulations stating a graduate degree is mandatory for licensure.',
      'Cite 38 CFR § 21.72 regarding the suitability and depth of rehabilitation plans.',
      'Generate an IPE Amendment Request specifying the graduate education path.'
    ],
    letterType: 'ipe_amendment'
  },
  {
    id: 'unilateral_iwrp_change',
    title: 'Unilateral Modification of IWRP/IPE Vocational Goal',
    plainTitle: 'Counselor Changes Your Career Goal Without Your Agreement',
    citation: '38 CFR § 21.94, 38 CFR § 21.96, M28C.IV.C.4',
    explanation: 'The counselor unilaterally changes your vocational goal, extends your plan, or terminates services without your consent or without following the formal dispute and amendment procedures under 38 CFR § 21.94.',
    plainExplanation: 'Your rehabilitation plan is a contract between you and the VA. The counselor cannot change your career goal, shorten your timeline, or stop your program without your agreement or a formal process.',
    advocacySteps: [
      'Do not sign any modified IWRP (VA Form 28-8872) that you do not agree with.',
      'State in writing that you do not consent to a unilateral change and request a joint planning meeting.',
      'Cite 38 CFR § 21.94, which requires mutual agreement or specific administrative reasons for changing a program.',
      'Submit an IPE Amendment Request asserting your desired goal and reasoning.'
    ],
    letterType: 'ipe_amendment'
  },
  {
    id: 'il_blanket_denial',
    title: 'Blanket Denial or Arbitrary Caps on Independent Living (IL) Services',
    plainTitle: 'Counselor Rejects Independent Living Support Out of Hand',
    citation: '38 U.S.C. § 3120, 38 CFR § 21.160, M28C.IV.C.1, M28C.IV.C.6',
    explanation: 'The counselor denies access to the Independent Living (IL) track by claiming the program is "full", that there is a waiting list, or that IL is only for the "most severely disabled" who are bedridden. Under 38 U.S.C. § 3120, any veteran for whom a vocational goal is currently not feasible is entitled to an evaluation for IL services.',
    plainExplanation: 'Independent Living (IL) services help you live more independently at home. Counselors cannot reject you by saying "the program is full" or that it is only for bedridden veterans. If working is not possible for you right now, you have a right to an IL evaluation.',
    advocacySteps: [
      'Submit written proof of your limitations in activities of daily living (e.g. hygiene, mobility, home access).',
      'Cite 38 U.S.C. § 3120 which mandates the evaluation and delivery of IL services for eligible veterans.',
      'Request an official occupational therapy or independent living assessment.',
      'Submit an Independent Living Justification letter outlining your needs.'
    ],
    letterType: 'il_justification'
  },
  {
    id: 'entitlement_extension_denial',
    title: 'Refusal to Extend Entitlement Beyond 48 Months',
    plainTitle: 'Counselor Rejects Training Because it Exceeds 48 Months',
    citation: '38 U.S.C. § 3105, 38 CFR § 21.78, M28C.IV.A.2',
    explanation: 'The counselor refuses to approve a training plan because it requires more than 48 months of entitlement. However, under 38 CFR § 21.78, veterans with a Serious Employment Handicap (SEH) are eligible for extensions beyond 48 months if additional services are necessary to achieve rehabilitation.',
    plainExplanation: 'If you have a Serious Employment Handicap (SEH), the VA can extend your training time past the standard 48-month limit. A counselor cannot refuse a program just because it takes longer than 48 months to complete.',
    advocacySteps: [
      'Demonstrate that your service-connected disabilities prevent you from pursuing a shorter, condensed training program.',
      'Request a formal finding of Serious Employment Handicap (SEH) if one has not already been established.',
      'Cite 38 CFR § 21.78 regarding extensions of entitlement.',
      'Submit an SEH/Extension Request letter requesting additional months of service.'
    ],
    letterType: 'seh_extension'
  }
];

function VaErrorSpotterView({ setActiveView, plainLanguageMode, setPlainLanguageMode }) {
  const [checkedItems, setCheckedItems] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  const toggleCheck = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleGenerateLetter = (letterType) => {
    const isPrivacy = sessionStorage.getItem('m28c_privacy_mode') !== 'false';
    const storage = isPrivacy ? sessionStorage : localStorage;
    storage.setItem('m28c_preselected_letter', letterType);
    setActiveView('document_generator');
  };

  return (
    <div className="doc-card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="doc-tag bg-amber-500/20 text-amber-400 border border-amber-500/30">Advocacy & Appeals</span>
          <h2 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3 mt-1">
            <AlertTriangle className="text-amber-500" size={28} />
            VA Error Spotter Checklist
          </h2>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">
            Counselors routinely make administrative mistakes when evaluating Chapter 31 VR&E claims. Use this interactive tool to spot legal errors in your case, view supporting citations, and generate advocacy response letters.
          </p>
        </div>

        {/* Plain Language Toggle */}
        <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 p-2 rounded-lg">
          <HelpCircle size={16} className="text-slate-400" />
          <span className="text-xs text-slate-300 font-medium">Plain English:</span>
          <button
            onClick={() => setPlainLanguageMode(!plainLanguageMode)}
            className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${plainLanguageMode ? 'bg-emerald-500' : 'bg-slate-700'}`}
            role="switch"
            aria-checked={plainLanguageMode}
            aria-label="Toggle Plain English Mode"
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${plainLanguageMode ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40 backdrop-blur-md">
        <div className="p-4 bg-slate-900/40 border-b border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Identified Case Errors ({Object.values(checkedItems).filter(Boolean).length} Selected)</span>
        </div>

        <div className="divide-y divide-slate-800">
          {ERROR_ITEMS.map((item) => {
            const isChecked = !!checkedItems[item.id];
            const isExpanded = expandedId === item.id;
            
            return (
              <div 
                key={item.id}
                className={`transition-colors duration-200 ${isChecked ? 'bg-amber-500/[0.02]' : ''} ${isExpanded ? 'bg-slate-900/10' : ''}`}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between p-4 gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input 
                      type="checkbox"
                      id={`chk-${item.id}`}
                      checked={isChecked}
                      onChange={() => toggleCheck(item.id)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900 focus:ring-2"
                      tabIndex={0}
                    />
                    <label 
                      htmlFor={`chk-${item.id}`}
                      className={`font-semibold cursor-pointer select-none text-sm md:text-base truncate ${isChecked ? 'text-amber-400' : 'text-slate-200'}`}
                    >
                      {plainLanguageMode ? item.plainTitle : item.title}
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-expanded={isExpanded}
                      aria-controls={`panel-${item.id}`}
                      aria-label="Toggle Details"
                    >
                      <ChevronRight 
                        size={18} 
                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                      />
                    </button>
                  </div>
                </div>

                {/* Details Accordion Panel */}
                {isExpanded && (
                  <div 
                    id={`panel-${item.id}`}
                    className="px-11 pb-5 text-sm transition-all duration-300"
                  >
                    <div className="border-l-2 border-amber-500/50 pl-4 mt-1 space-y-4">
                      {/* Description */}
                      <div>
                        <span className="text-xs font-semibold text-slate-400 block mb-1">Issue Overview:</span>
                        <p className="text-slate-300 leading-relaxed">
                          {plainLanguageMode ? item.plainExplanation : item.explanation}
                        </p>
                      </div>

                      {/* Legal Authority */}
                      <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/80 p-2 rounded-lg w-fit">
                        <BookOpen size={16} className="text-amber-400" />
                        <span className="text-xs font-semibold text-slate-400">Legal Authority:</span>
                        <code className="text-xs text-amber-400 font-mono font-semibold">{item.citation}</code>
                      </div>

                      {/* Advocacy Checklist */}
                      <div>
                        <span className="text-xs font-semibold text-slate-400 block mb-1.5">Advocacy Steps to Contest:</span>
                        <ul className="list-disc list-inside space-y-1.5 text-slate-300">
                          {item.advocacySteps.map((step, i) => (
                            <li key={i} className="leading-relaxed">{step}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        <button
                          onClick={() => handleGenerateLetter(item.letterType)}
                          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-4 h-10 rounded-lg shadow-lg hover:shadow-amber-500/10 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                        >
                          <FileEdit size={16} />
                          <span>Generate Response Letter</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 bg-slate-900/30 border border-slate-800/80 rounded-xl p-4 flex gap-3 items-start">
        <HelpCircle size={20} className="text-slate-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-slate-200">How to use this checklist</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Check the boxes next to the errors you suspect in your VR&E case. Expand each item to view the relevant Code of Federal Regulations (CFR) or M28C guidelines. Press the <strong className="text-amber-400">Generate Response Letter</strong> button to load a pre-formatted letter template filled with the correct legal authorities, ready to copy, edit, and print for your counselor.
          </p>
        </div>
      </div>
    </div>
  );
}

export default VaErrorSpotterView;
