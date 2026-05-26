import { useState, useMemo } from 'react';
import { 
  Users, Calculator, ExternalLink, Info, ShieldCheck, HeartHandshake, BookOpen
} from 'lucide-react';

// eslint-disable-next-line no-unused-vars
function FamilyCaregiversView({ reduceMotion }) {
  // Tabs: 'education' | 'spouse' | 'caregiver' | 'tricare'
  const [activeTab, setActiveTab] = useState('education');

  // --- STATE FOR EDUCATION CALCULATORS ---
  const [eduProgram, setEduProgram] = useState('ch35'); // 'ch35' | 'fry'
  const [enrollmentStatus, setEnrollmentStatus] = useState('full'); // 'full' | 'three-quarter' | 'half' | 'less-half'
  const [monthsUsed, setMonthsUsed] = useState('36');
  const [fryMha, setFryMha] = useState('1800');
  const [fryTuition, setFryTuition] = useState('15000');
  const [fryYears, setFryYears] = useState('4');

  // --- STATE FOR MYCAA SPOUSE CHECKER ---
  const [sponsorRank, setSponsorRank] = useState('E-4');
  const [sponsorStatus, setSponsorStatus] = useState('active'); // 'active' | 'reserve-active' | 'separated'
  const [targetDegree, setTargetDegree] = useState('associate'); // 'associate' | 'license' | 'bachelors'

  // --- STATE FOR CAREGIVER (PCAFC) CHECKER ---
  const [vetRating70, setVetRating70] = useState('yes');
  const [vetSeriousInjury, setVetSeriousInjury] = useState('yes');
  const [needAdlHelp, setNeedAdlHelp] = useState('yes');
  const [caregiverTier, setCaregiverTier] = useState('tier1'); // 'tier1' | 'tier2'

  // --- COMPUTE LOGICS ---

  // Chapter 35 DEA Calculator
  // @cite 38 U.S.C. 3532
  const deaCalculation = useMemo(() => {
    // 2025-2026 Academic Year Monthly Rates
    const rates = {
      'full': 1488.00,
      'three-quarter': 1174.00,
      'half': 858.00,
      'less-half': 372.00 // standard estimate for tuition cap
    };
    
    const monthlyRate = rates[enrollmentStatus] || 1488.00;
    const months = Math.min(36, Math.max(0, parseFloat(monthsUsed) || 0)); // @cite 38 U.S.C. 3511
    const totalPayout = monthlyRate * months;

    return {
      monthlyRate,
      months,
      totalPayout
    };
  }, [enrollmentStatus, monthsUsed]);

  // Fry Scholarship Calculator
  // @cite 38 U.S.C. 3311(b)(9)
  const fryCalculation = useMemo(() => {
    const monthlyHousing = parseFloat(fryMha) || 0;
    const yearlyTuition = parseFloat(fryTuition) || 0;
    const years = parseFloat(fryYears) || 0;
    const booksStipend = 1000; // max $1,000/year under Post-9/11 standard

    const annualHousing = monthlyHousing * 9; // 9 months of school per year
    const annualTotal = annualHousing + yearlyTuition + booksStipend;
    const totalBenefit = annualTotal * years;

    return {
      annualHousing,
      annualTotal,
      totalBenefit
    };
  }, [fryMha, fryTuition, fryYears]);

  // MyCAA Spouse Finder analysis
  const myCaaAnalysis = useMemo(() => {
    const eligibleRanks = ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'W-1', 'W-2', 'O-1', 'O-2', 'O-3'];
    const isRankEligible = eligibleRanks.includes(sponsorRank);
    const isActiveEligible = sponsorStatus === 'active' || sponsorStatus === 'reserve-active';
    const isDegreeEligible = targetDegree === 'associate' || targetDegree === 'license' || targetDegree === 'certificate';

    let eligible = true;
    let reasons = [];

    if (!isRankEligible) {
      eligible = false;
      reasons.push(`Sponsor rank ${sponsorRank} exceeds the eligible paygrades (E-1 to E-6, W-1 to W-2, O-1 to O-3).`);
    }
    if (!isActiveEligible) {
      eligible = false;
      // @allow-modal
      reasons.push('Sponsor must be on active duty or an activated Guard/Reserve member under Title 10.');
    }
    if (!isDegreeEligible) {
      eligible = false;
      reasons.push("MyCAA is restricted to Associate degrees, certificates, and professional credentials. It does not fund Bachelor's or Graduate coursework.");
    }

    return {
      eligible,
      reasons,
      maxFunding: eligible ? 4000 : 0,
      annualCap: eligible ? 2000 : 0
    };
  }, [sponsorRank, sponsorStatus, targetDegree]);

  // PCAFC Caregiver Support analysis
  // @cite 38 U.S.C. 1720G
  const caregiverAnalysis = useMemo(() => {
    let eligible = true;
    let issues = [];

    if (vetRating70 !== 'yes') {
      eligible = false;
      // @allow-modal
      issues.push('Veteran must have an individual or combined service-connected disability rating of 70% or higher.');
    }
    if (vetSeriousInjury !== 'yes') {
      eligible = false;
      // @allow-modal
      issues.push('The disability must be a serious injury incurred or aggravated in the line of duty.');
    }
    if (needAdlHelp !== 'yes') {
      eligible = false;
      // @allow-modal
      issues.push('Veteran must require in-person personal care services for Activities of Daily Living (ADLs) or supervision.');
    }

    return {
      eligible,
      issues
    };
  }, [vetRating70, vetSeriousInjury, needAdlHelp]);

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="doc-card text-slate-100 pb-6 mb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shadow-md">
              <Users size={24} />
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">Family & Caregiver Resources</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculate educational benefits, career grants, caregiver stipends, and healthcare directories for dependents, spouses, and survivors.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-indigo-300 self-start md:self-auto max-w-sm">
            <Info size={16} className="shrink-0" />
            <span className="text-[10px] leading-snug">
              <strong>Dependent Benefits:</strong> Chapter 35 DEA and the Fry Scholarship provide critical living and educational stipends to eligible family members.
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="tabs-header border-b border-slate-850 gap-2 mb-0 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setActiveTab('education')}
          className={`tab-btn pb-3 text-xs md:text-sm transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'education' 
              ? 'active border-b-2 border-indigo-500 text-slate-100 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator size={14} className="text-indigo-500" />
          <span>Dependent Education (DEA & Fry)</span>
        </button>
        <button
          onClick={() => setActiveTab('spouse')}
          className={`tab-btn pb-3 text-xs md:text-sm transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'spouse' 
              ? 'active border-b-2 border-indigo-500 text-slate-100 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck size={14} className="text-indigo-500" />
          <span>Spouse Career Grant (MyCAA)</span>
        </button>
        <button
          onClick={() => setActiveTab('caregiver')}
          className={`tab-btn pb-3 text-xs md:text-sm transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'caregiver' 
              ? 'active border-b-2 border-indigo-500 text-slate-100 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HeartHandshake size={14} className="text-indigo-500" />
          <span>VA Caregiver Program (PCAFC)</span>
        </button>
        <button
          onClick={() => setActiveTab('tricare')}
          className={`tab-btn pb-3 text-xs md:text-sm transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'tricare' 
              ? 'active border-b-2 border-indigo-500 text-slate-100 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen size={14} className="text-indigo-500" />
          <span>TRICARE Healthcare Plans</span>
        </button>
      </div>

      {/* TAB 1: Dependent Education */}
      {activeTab === 'education' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel: Info Directory */}
          <div className="lg:col-span-6 bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Educational Benefit Overviews</h3>
            
            <div className="space-y-4">
              <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl space-y-2">
                <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                  <span className="font-bold text-slate-250 text-xs">Chapter 35 DEA (Dependents' Educational Assistance)</span>
                  <span className="text-[8px] font-mono text-slate-500">38 U.S.C. Chapter 35</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Provides a monthly stipend directly to eligible dependents (children aged 18-26 or spouses) of Veterans who are permanently and totally disabled due to a service-connected condition, or who died on active duty.
                </p>
                <div className="text-[9px] text-amber-450/90 font-medium">
                  Note: Eligible recipients get up to 36 months of benefits. Spouses generally have 10-20 years to use it, while children must use it between ages 18 and 26.
                </div>
              </div>

              <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl space-y-2">
                <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                  <span className="font-bold text-slate-250 text-xs">John Fry Scholarship</span>
                  <span className="text-[8px] font-mono text-slate-500">38 U.S.C. 3311(b)(9)</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Provides Post-9/11 GI Bill level benefits to children and surviving spouses of service members who died in the line of duty on or after September 11, 2001. Covers full in-state tuition at public schools, monthly housing allowance (MHA), and a book stipend.
                </p>
                <div className="text-[9px] text-rose-450/90 font-medium">
                  Important: Recipients must choose between Chapter 35 DEA and the Fry Scholarship. Stacking or receiving both for the same period is legally prohibited.
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Calculators */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Benefit Estimate Calculator</h3>
                <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-850">
                  <button 
                    onClick={() => setEduProgram('ch35')}
                    className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition ${eduProgram === 'ch35' ? 'bg-indigo-600 text-slate-100' : 'text-slate-400'}`}
                  >
                    Ch 35 DEA
                  </button>
                  <button 
                    onClick={() => setEduProgram('fry')}
                    className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition ${eduProgram === 'fry' ? 'bg-indigo-600 text-slate-100' : 'text-slate-400'}`}
                  >
                    Fry Scholarship
                  </button>
                </div>
              </div>

              {eduProgram === 'ch35' ? (
                // CH35 Inputs
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Enrollment Rate</label>
                      <select 
                        value={enrollmentStatus} 
                        onChange={(e) => setEnrollmentStatus(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="full">Full-Time ($1,488.00/mo)</option>
                        <option value="three-quarter">3/4-Time ($1,174.00/mo)</option>
                        <option value="half">1/2-Time ($858.00/mo)</option>
                        <option value="less-half">Less than 1/2-Time (Tuition cap)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Months of Entitlement to Use</label>
                      <input 
                        type="number" 
                        max="36"
                        min="1"
                        value={monthsUsed} 
                        onChange={(e) => setMonthsUsed(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl text-[10px] space-y-2">
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-400">Monthly Payout Rate:</span>
                      <span className="font-mono text-slate-200 font-bold">${deaCalculation.monthlyRate.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-400">Months Simulated:</span>
                      <span className="font-mono text-slate-200">{deaCalculation.months} months</span>
                    </div>
                    <div className="flex justify-between text-indigo-400 font-bold pt-1">
                      <span>Total Projected Stipend:</span>
                      <span className="font-mono text-xs">${deaCalculation.totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-[8px] text-slate-500 text-right font-mono mt-1">
                      // @cite 38 U.S.C. 3532 rate schedules
                    </div>
                  </div>
                </div>
              ) : (
                // Fry Inputs
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Est. MHA Rate/Mo</label>
                      <input 
                        type="number" 
                        value={fryMha} 
                        onChange={(e) => setFryMha(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Annual Tuition Cost</label>
                      <input 
                        type="number" 
                        value={fryTuition} 
                        onChange={(e) => setFryTuition(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Years of Study</label>
                      <select 
                        value={fryYears} 
                        onChange={(e) => setFryYears(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="1">1 Year</option>
                        <option value="2">2 Years (Associate)</option>
                        <option value="3">3 Years</option>
                        <option value="4">4 Years (Bachelor's)</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl text-[10px] space-y-2">
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-400">Annual Housing Allowance (9 mo):</span>
                      <span className="font-mono text-slate-200 font-bold">${fryCalculation.annualHousing.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-400">Annual Books/Supplies Cap:</span>
                      <span className="font-mono text-slate-200">$1,000.00</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-400">Annual Tuition/Fees Cover:</span>
                      <span className="font-mono text-slate-200 font-bold">${(parseFloat(fryTuition) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-indigo-400 font-bold pt-1">
                      <span>Total Projected Benefit Value:</span>
                      <span className="font-mono text-xs">${fryCalculation.totalBenefit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-[8px] text-slate-500 text-right font-mono mt-1">
                      // @cite 38 U.S.C. 3313 rate structures
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MyCAA Spouse Grant */}
      {activeTab === 'spouse' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Program Guidelines */}
          <div className="lg:col-span-6 bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">MyCAA Spouse Funding Overview</h3>
            <div className="space-y-4 text-[10px] leading-relaxed text-slate-400">
              <p>
                The <strong>My Career Advancement Account (MyCAA)</strong> Scholarship is a workforce development program sponsored by the Department of Defense. It provides up to <strong>$4,000</strong> in tuition assistance for eligible military spouses.
              </p>
              <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl space-y-2">
                <span className="font-bold text-slate-250 block">Eligible Credentials Include:</span>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Professional licenses (nursing, real estate, teaching certifications, etc.)</li>
                  <li>State certifications</li>
                  <li>Associate degrees (excluding general studies)</li>
                  <li>Certificates from accredited colleges or schools</li>
                </ul>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                // @cite DoD MyCAA Directive 1322.25/SECO regulations
              </p>
            </div>
          </div>

          {/* Right Panel: Checker Form */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">MyCAA Eligibility Check</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Sponsor Pay Grade</label>
                  <select 
                    value={sponsorRank} 
                    onChange={(e) => setSponsorRank(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="E-3">E-1 to E-3</option>
                    <option value="E-4">E-4</option>
                    <option value="E-5">E-5</option>
                    <option value="E-6">E-6</option>
                    <option value="E-7">E-7 (Ineligible)</option>
                    <option value="W-1">W-1</option>
                    <option value="W-2">W-2</option>
                    <option value="W-3">W-3 (Ineligible)</option>
                    <option value="O-1">O-1</option>
                    <option value="O-2">O-2</option>
                    <option value="O-3">O-3</option>
                    <option value="O-4">O-4 (Ineligible)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Sponsor Duty Status</label>
                  <select 
                    value={sponsorStatus} 
                    onChange={(e) => setSponsorStatus(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="active">Active Duty</option>
                    <option value="reserve-active">Activated Guard/Reserve (Title 10)</option>
                    <option value="separated">Separated / Veteran</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Course/Degree Goal</label>
                  <select 
                    value={targetDegree} 
                    onChange={(e) => setTargetDegree(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="associate">Associate Degree</option>
                    <option value="license">License / Certificate</option>
                    <option value="bachelors">Bachelor's Degree</option>
                  </select>
                </div>
              </div>

              {/* Checker Analysis */}
              <div className={`p-4 rounded-xl border text-[10px] space-y-2.5 ${
                myCaaAnalysis.eligible 
                  ? 'bg-emerald-950/10 border-emerald-900/30 text-emerald-350'
                  : 'bg-rose-950/10 border-rose-900/30 text-rose-350'
              }`}>
                <div className="flex justify-between items-center font-bold border-b border-slate-900 pb-1.5">
                  <span className="uppercase text-[9px] tracking-wider font-bold">MyCAA Eligibility Analysis</span>
                  <span className="font-mono uppercase font-bold">{myCaaAnalysis.eligible ? 'Eligible' : 'Ineligible'}</span>
                </div>

                {myCaaAnalysis.eligible ? (
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-350">✓ Sponsor rank and course goals match all SECO requirements.</p>
                    <div className="text-[9.5px] text-slate-400 font-mono mt-1 space-y-1">
                      <div>• Maximum Lifetime Grant: ${myCaaAnalysis.maxFunding}</div>
                      <div>• Annual Fiscal Cap: ${myCaaAnalysis.annualCap}</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-350">Ineligibility Alerts:</p>
                    <ul className="list-disc pl-3.5 space-y-1 text-slate-350">
                      {myCaaAnalysis.reasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Caregiver Program */}
      {activeTab === 'caregiver' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: PCAFC Program details */}
          <div className="lg:col-span-6 bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Program of Comprehensive Assistance for Family Caregivers (PCAFC)</h3>
            <div className="space-y-3 text-[10px] leading-relaxed text-slate-400">
              <p>
                The <strong>PCAFC</strong> is a VA program designed to support family caregivers of Veterans who have sustained a serious injury or illness in the line of military duty. 
              </p>
              <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl space-y-1.5">
                <span className="font-bold text-slate-200 block text-xs">Included Program Benefits:</span>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Monthly caregiver stipend payment (based on geographic location of residency)</li>
                  <li>Access to CHAMPVA health insurance coverage</li>
                  <li>Mental health counseling and respite care (minimum 30 days per year)</li>
                  <li>Financial assistance for travel to medical appointments</li>
                </ul>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                // @cite 38 U.S.C. 1720G / VA Caregiver Directives
              </p>
            </div>
          </div>

          {/* Right Panel: Checker Checklist */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">PCAFC Eligibility Checker</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Veteran Disability Rating ≥ 70%?</label>
                  <select 
                    value={vetRating70} 
                    onChange={(e) => setVetRating70(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="yes">Yes (Individual or combined 70%+ rating)</option>
                    <option value="no">No (Under 70% rating)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Serious Injury In Line of Duty?</label>
                  <select 
                    value={vetSeriousInjury} 
                    onChange={(e) => setVetSeriousInjury(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Requires Assistance with Activities of Daily Living (ADLs)?</label>
                  <select 
                    value={needAdlHelp} 
                    onChange={(e) => setNeedAdlHelp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="yes">Yes (ADLs like bathing, dressing, eating, or supervision for safety)</option>
                    <option value="no">No (Can independently perform ADLs without safety risk)</option>
                  </select>
                </div>
              </div>

              {/* Checker Analysis */}
              <div className={`p-4 rounded-xl border text-[10px] space-y-2.5 ${
                caregiverAnalysis.eligible 
                  ? 'bg-emerald-950/10 border-emerald-900/30 text-emerald-350'
                  : 'bg-rose-950/10 border-rose-900/30 text-rose-350'
              }`}>
                <div className="flex justify-between items-center font-bold border-b border-slate-900 pb-1.5">
                  <span className="uppercase text-[9px] tracking-wider font-bold">PCAFC Program Status</span>
                  <span className="font-mono uppercase font-bold">{caregiverAnalysis.eligible ? 'Approved Profile' : 'Ineligible Profile'}</span>
                </div>

                {caregiverAnalysis.eligible ? (
                  <div className="space-y-1.5">
                    <p className="font-semibold text-slate-350">✓ Core medical criteria matched. Caregiver stipend is calculated using GS-4, Step 1 local federal pay schedules.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 bg-slate-950/50 p-3 rounded-lg border border-slate-900">
                      <div>
                        <label className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">Assigned Care Tier</label>
                        <select 
                          value={caregiverTier} 
                          onChange={(e) => setCaregiverTier(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded p-1 text-[9px] text-slate-200 focus:outline-none w-full"
                        >
                          <option value="tier1">Tier 1 (Partial assistance required)</option>
                          <option value="tier2">Tier 2 (Full assistance, 40+ hours/week)</option>
                        </select>
                      </div>
                      <div className="flex flex-col justify-end">
                        <span className="text-[8px] font-bold text-slate-500 uppercase">Estimated Monthly Stipend</span>
                        <span className="font-mono text-slate-200 font-bold text-xs">
                          {caregiverTier === 'tier1' ? '~$1,200 - $1,800/mo' : '~$2,200 - $3,200/mo'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-350">Stipend Blocking Conditions Found:</p>
                    <ul className="list-disc pl-3.5 space-y-1 text-slate-350">
                      {caregiverAnalysis.issues.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TRICARE plans */}
      {activeTab === 'tricare' && (
        <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-850 pb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">TRICARE Healthcare Plans Directory</h3>
            <span className="text-[10px] text-slate-500">Compare features and eligibility criteria for standard TRICARE military healthcare programs.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center border-b border-slate-900 pb-1">
                  <span className="font-bold text-slate-200 text-xs">TRICARE Prime</span>
                  <span className="text-[8px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Managed Care</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  A managed care option similar to an HMO. Primary care manager (PCM) coordinates all referrals. Available to active duty families, retirees, and transitional members.
                </p>
                <div className="text-[9px] text-slate-500">
                  <strong>Cost Profile:</strong> $0 enrollment fees for active duty families. Co-pays apply to retirees.
                </div>
              </div>
              <a href="https://www.tricare.mil/prime" target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-2.5 self-end">
                <span>Prime details</span>
                <ExternalLink size={9} />
              </a>
            </div>

            <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center border-b border-slate-900 pb-1">
                  <span className="font-bold text-slate-200 text-xs">TRICARE Select</span>
                  <span className="text-[8px] font-semibold text-sky-500 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">PPO Network</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  A self-managed PPO network plan. Families do not need referrals for specialty care and can see any TRICARE-authorized provider (out-of-pocket costs are higher).
                </p>
                <div className="text-[9px] text-slate-500">
                  <strong>Cost Profile:</strong> Annual deductibles and copay percentages apply based on sponsor's enlistment date.
                </div>
              </div>
              <a href="https://www.tricare.mil/select" target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-2.5 self-end">
                <span>Select details</span>
                <ExternalLink size={9} />
              </a>
            </div>

            <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center border-b border-slate-900 pb-1">
                  <span className="font-bold text-slate-200 text-xs">TRICARE Reserve Select (TRS)</span>
                  <span className="text-[8px] font-semibold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Premium-Based</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  A premium-based PPO healthcare plan available to qualified Selected Reserve (drill status) members and families. Mirror-image benefits of TRICARE Select.
                </p>
                <div className="text-[9px] text-slate-500">
                  <strong>Cost Profile:</strong> Requires monthly premium payments (e.g. ~$50/mo individual, ~$250/mo family in 2026).
                </div>
              </div>
              <a href="https://www.tricare.mil/trs" target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-2.5 self-end">
                <span>TRS details</span>
                <ExternalLink size={9} />
              </a>
            </div>

            <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center border-b border-slate-900 pb-1">
                  <span className="font-bold text-slate-200 text-xs">TRICARE For Life (TFL)</span>
                  <span className="text-[8px] font-semibold text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">Medicare Wrap</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Medicare-wraparound coverage for TRICARE-eligible beneficiaries who have Medicare Part A and B. Covers remaining out-of-pocket costs at Medicare-participating providers.
                </p>
                <div className="text-[9px] text-slate-500">
                  <strong>Cost Profile:</strong> No enrollment fees, but Medicare Part B premiums must be maintained.
                </div>
              </div>
              <a href="https://www.tricare.mil/tfl" target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-2.5 self-end">
                <span>TFL details</span>
                <ExternalLink size={9} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FamilyCaregiversView;
