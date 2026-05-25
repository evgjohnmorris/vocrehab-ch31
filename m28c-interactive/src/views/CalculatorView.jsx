import { useState, useEffect } from 'react';
import { 
  Search, Info, Settings, HelpCircle, ShieldCheck, 
  AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, 
  Printer, Clipboard, FileText, CheckSquare, Save
} from 'lucide-react';
import { SCHOOLS_DATABASE } from '../data/school_data';
import { calculateAllowance } from '../utils/ch31Calculations';

function CalculatorView({ 
  rates, 
  selectedRateYear, 
  setSelectedRateYear, 
  openSettings, 
  onMhaChange,
  reduceMotion
}) {
  const activeRates = rates[selectedRateYear] || rates.ay2025_2026 || rates;

  // Stepper State
  const [currentStep, setCurrentStep] = useState(1);
  const [calculatorMode, setCalculatorMode] = useState('advanced'); // 'simple' | 'advanced'

  // Localized Calculator States
  const [calcTrainingType, setCalcTrainingType] = useState('institutional');
  const [calcTime, setCalcTime] = useState('full');
  const [calcDependents, setCalcDependents] = useState(0);
  const [calcBahRate, setCalcBahRate] = useState(1950);
  const [calcActiveDuty, setCalcActiveDuty] = useState(false);
  const [calcVenue, setCalcVenue] = useState('in-person'); // 'in-person' | 'online' | 'foreign'
  const [calcTier, setCalcTier] = useState(1.0); // 1.0, 0.9, 0.8...
  const [calcUseCredits, setCalcUseCredits] = useState(false);
  const [calcCredits, setCalcCredits] = useState(12);
  const [calcFullTimeThreshold, setCalcFullTimeThreshold] = useState(12);
  const [calcTuition, setCalcTuition] = useState(0);
  const [calcSchoolType, setCalcSchoolType] = useState('public');
  const [calcYellowRibbon, setCalcYellowRibbon] = useState(false);
  const [calcYrSchoolContribution, setCalcYrSchoolContribution] = useState(0);
  const [calcYrDivision, setCalcYrDivision] = useState('');
  const [calcKicker, setCalcKicker] = useState(0);
  const [calcScholarships, setCalcScholarships] = useState(0);
  const [calcIncludeComputer, setCalcIncludeComputer] = useState(false);
  const [calcComputerCost, setCalcComputerCost] = useState(activeRates.ch31_computer_package_value || 2000.00);
  const [calcOjtTrainingWage, setCalcOjtTrainingWage] = useState(0);
  const [calcOjtJourneymanWage, setCalcOjtJourneymanWage] = useState(0);
  const [calcSchoolSearchQuery, setCalcSchoolSearchQuery] = useState('');
  const [calcSelectedSchool, setCalcSelectedSchool] = useState(null);
  const [calcShowSuggestions, setCalcShowSuggestions] = useState(false);
  const [schoolsDatabase, setSchoolsDatabase] = useState([]);
  
  // Custom Stepper States
  const [selectedSubsistenceType, setSelectedSubsistenceType] = useState('p911'); // 'p911' | 'ch31'
  const [copySuccess, setCopySuccess] = useState(false);
  const [estimateSaved, setEstimateSaved] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  // Fetch complete colleges database
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}schools.json`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load schools database');
        return res.json();
      })
      .then(data => {
        const mapped = data.map(arr => ({
          id: arr[7],
          name: arr[0],
          city: arr[1],
          state: arr[2],
          zipCode: arr[3],
          type: arr[4] === 'foreign' ? 'private' : arr[4],
          bahRate: arr[5],
          tuition: arr[6],
          facilityCode: arr[7],
          opeCode: arr[8],
          giBillStudents: arr[9],
          accredited: arr[10] === 1,
          studentVeteranGroup: arr[11] === 1,
          yellowRibbon: arr[12] === 1,
          priorityEnrollment: arr[13] === 1,
          militaryTA: arr[14] === 1,
          principlesOfExcellence: arr[15] === 1,
          eightKeys: arr[16] === 1,
          complaints: arr[17],
          cautionFlag: arr[18],
          hcm: arr[19],
          accreditationProbation: arr[20] === 1,
          oigInvestigation: arr[21] === 1,
          benefitsSuspended: arr[22] === 1,
          institutionOwnership: arr[4] === 'public' ? 'Public' : (arr[4] === 'private' ? 'Private nonprofit' : (arr[4] === 'foreign' ? 'Foreign Institution' : 'Proprietary')),
          foreign: arr[4] === 'foreign',
          onlineOnly: arr[0].toLowerCase().includes('online') || arr[0].toLowerCase().includes('distance learning'),
          yellowRibbonDetails: arr[23] || null
        }));
        setSchoolsDatabase([...mapped, ...SCHOOLS_DATABASE.filter(s => s.id.includes('mock'))]);
      })
      .catch(err => {
        console.error('Error loading schools database, using fallback:', err);
        setSchoolsDatabase(SCHOOLS_DATABASE);
      });
  }, []);

  const activeSchools = schoolsDatabase.length > 0 ? schoolsDatabase : SCHOOLS_DATABASE;

  // Run calculation
  const calculatorResults = calculateAllowance({
    rates: activeRates,
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
  });

  const budgetMhaAmount = calculatorResults 
    ? (Number(calculatorResults.p911Rate) > Number(calculatorResults.regularRate) 
        ? Number(calculatorResults.p911Rate) 
        : Number(calculatorResults.regularRate))
    : 0;

  useEffect(() => {
    onMhaChange(budgetMhaAmount);
  }, [budgetMhaAmount, onMhaChange]);

  const [prevRateYear, setPrevRateYear] = useState(selectedRateYear);
  if (selectedRateYear !== prevRateYear) {
    setPrevRateYear(selectedRateYear);
    setCalcComputerCost(activeRates.ch31_computer_package_value || 2000.00);
  }

  // Stepper helper
  const nextStep = () => {
    if (currentStep < 7) setCurrentStep(prev => prev + 1);
  };
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  // Compile summary details
  const getResultsSummaryText = () => {
    if (!calculatorResults) return 'No results calculated.';
    const bestRateName = calculatorResults.recommendation === 'Post-9/11 Subsistence Allowance (P911SA)' ? 'Post-9/11 Rate' : 'Standard Chapter 31 Rate';
    return `CH. 31 VR&E SUBSISTENCE ESTIMATE SUMMARY
Academic Year: ${activeRates.label}
Selected Program Track: ${calcTrainingType.toUpperCase()}
Housing Subsistence Election: ${selectedSubsistenceType === 'p911' ? 'Post-9/11 GI Bill rate' : 'Standard Chapter 31 rate'}
Calculated Monthly Payout: $${(selectedSubsistenceType === 'p911' ? calculatorResults.p911Rate : calculatorResults.regularRate).toLocaleString()}
Best Option Recommended: ${bestRateName} (Difference: $${Math.abs(Number(calculatorResults.p911Rate) - Number(calculatorResults.regularRate)).toFixed(2)}/mo)
Tuition Payments Covered: $${calculatorResults.tuitionPayable.toLocaleString()} / year
Books & Supplies Value Provided: $${calculatorResults.suppliesValue.toLocaleString()} / year
Computer Technology Package Value: $${calcIncludeComputer ? `$${calcComputerCost.toLocaleString()}` : '$0.00'}

*** Confirmed via published rates as of May 25, 2026. Estimates are subject to VRC counselor audit. ***`;
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(getResultsSummaryText());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handlePrintSummary = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>VR&E Subsistence Estimate Summary</title>
          <style>
            body { font-family: Courier, monospace; padding: 40px; white-space: pre-wrap; line-height: 1.5; color: #000; }
            h1 { font-family: sans-serif; font-size: 1.2rem; border-bottom: 2px solid #ddd; padding-bottom: 8px; }
          </style>
        </head>
        <body>
          <h1>VR&E Payment Estimate</h1>
          <div>${getResultsSummaryText()}</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSaveEstimate = () => {
    const storage = sessionStorage; // Session only
    storage.setItem('m28c_saved_calculator_estimate', JSON.stringify({
      rateYear: selectedRateYear,
      trainingType: calcTrainingType,
      monthlyPayout: selectedSubsistenceType === 'p911' ? calculatorResults.p911Rate : calculatorResults.regularRate,
      tuition: calculatorResults.tuitionPayable,
      supplies: calculatorResults.suppliesValue
    }));
    setEstimateSaved(true);
    setTimeout(() => setEstimateSaved(false), 2000);
  };

  return (
    <div className="doc-card text-slate-100 select-text">
      {/* Top Banner and Mode Switcher */}
      <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
        <div>
          <span className="doc-tag bg-blue-500/10 text-blue-400 border border-blue-500/20">Guided Payment Stepper</span>
          <h1 className="text-2xl font-bold text-slate-100 mt-1">Subsistence Allowance Calculator</h1>
        </div>
        <div className="flex gap-2">
          {/* Simple / Advanced Mode Toggles */}
          <div className="flex bg-slate-950/60 p-1 border border-slate-800 rounded-lg">
            <button
              onClick={() => setCalculatorMode('simple')}
              className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                calculatorMode === 'simple' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Simple Mode
            </button>
            <button
              onClick={() => setCalculatorMode('advanced')}
              className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                calculatorMode === 'advanced' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Advanced Mode
            </button>
          </div>

          <button 
            className="btn btn-sm btn-secondary flex items-center gap-1.5 h-8 text-xs cursor-pointer"
            onClick={openSettings}
          >
            <Settings size={12} />
            <span>Base Rates</span>
          </button>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="relative mb-6">
        <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
          <span>Step {currentStep} of 7: {
            currentStep === 1 ? 'Program Type' :
            currentStep === 2 ? 'Subsistence Type' :
            currentStep === 3 ? 'Training Location' :
            currentStep === 4 ? 'Dependents & Attendance' :
            currentStep === 5 ? 'Tuition & Supplies' :
            currentStep === 6 ? 'Calculation Results' : 'Actions & Exports'
          }</span>
          <span>{Math.round((currentStep / 7) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-slate-950 border border-slate-850 h-2.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${(currentStep / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* Academic Year select warning strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 p-3 border border-slate-800 rounded-xl mb-6 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Rates Year:</span>
          <select
            value={selectedRateYear}
            onChange={(e) => setSelectedRateYear(e.target.value)}
            className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-xs text-slate-100 font-semibold cursor-pointer"
            aria-label="Select active rates year"
          >
            <option value="ay2025_2026">AY 25–26 / FY 26</option>
            <option value="ay2026_2027">AY 26–27 / FY 26</option>
          </select>
        </div>
        <div className="text-[10px] italic">
          Last verified: {rates.lastVerified || '2026-05-25'} • Rates are estimates.
        </div>
      </div>

      <div className="doc-divider mb-6"></div>

      {/* STEP CONTENT SWITCHER */}
      <div className="min-h-[280px]">
        {/* STEP 1: PROGRAM TYPE */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Step 1: What type of program are you attending?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Chapter 31 VR&E calculates subsistence payouts differently depending on whether you are enrolled in standard college coursework or an Apprenticeship/On-the-Job training track.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => setCalcTrainingType('institutional')}
                className={`border rounded-xl p-5 cursor-pointer transition select-none flex flex-col justify-between h-32 ${
                  calcTrainingType === 'institutional' ? 'bg-indigo-500/5 border-indigo-500' : 'bg-slate-950/20 border-slate-850 hover:border-slate-750'
                }`}
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-200">Institutional Training</span>
                  <p className="text-[10px] text-slate-450 leading-relaxed">Attending colleges, trade schools, business academies, or accredited universities.</p>
                </div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mt-2">Select Institutional</span>
              </div>

              <div 
                onClick={() => setCalcTrainingType('ojt')}
                className={`border rounded-xl p-5 cursor-pointer transition select-none flex flex-col justify-between h-32 ${
                  calcTrainingType === 'ojt' ? 'bg-indigo-500/5 border-indigo-500' : 'bg-slate-950/20 border-slate-850 hover:border-slate-750'
                }`}
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-200">Apprenticeship & On-the-Job Training</span>
                  <p className="text-[10px] text-slate-450 leading-relaxed">Learning a trade directly on the job with structured wage progressions.</p>
                </div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mt-2">Select OJT Track</span>
              </div>
            </div>

            <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl mt-4">
              <label className="flex items-center gap-3 cursor-pointer select-none text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={calcActiveDuty}
                  onChange={(e) => setCalcActiveDuty(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                />
                <span>I am currently on Active Duty status</span>
              </label>
              <p className="text-[10px] text-slate-450 leading-relaxed mt-1.5 pl-7">
                Active duty members do not receive regular subsistence allowance payouts, but are eligible for tuition reimbursement and supply packages.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: SUBSISTENCE RATE TYPE */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Step 2: Compare Subsistence Options</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If you have remaining Post-9/11 GI Bill eligibility, you can elect to receive the Post-9/11 subsistence allowance (P911SA) rate, which is tied to E-5 BAH. Otherwise, you will receive the standard Chapter 31 rate.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => setSelectedSubsistenceType('p911')}
                className={`border rounded-xl p-5 cursor-pointer transition select-none flex flex-col justify-between h-36 ${
                  selectedSubsistenceType === 'p911' ? 'bg-indigo-500/5 border-indigo-500' : 'bg-slate-950/20 border-slate-850 hover:border-slate-750'
                }`}
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-200">Post-9/11 GI Bill Housing Rate (P911SA)</span>
                  <p className="text-[10px] text-slate-455 leading-relaxed">Tied to E-5 BAH rates based on the school's zip code. Typically yields a much higher payout.</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded font-bold uppercase w-fit mt-2">
                  Recommended (If Eligible)
                </div>
              </div>

              <div 
                onClick={() => setSelectedSubsistenceType('ch31')}
                className={`border rounded-xl p-5 cursor-pointer transition select-none flex flex-col justify-between h-36 ${
                  selectedSubsistenceType === 'ch31' ? 'bg-indigo-500/5 border-indigo-500' : 'bg-slate-950/20 border-slate-850 hover:border-slate-750'
                }`}
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-200">Standard Chapter 31 Rate</span>
                  <p className="text-[10px] text-slate-455 leading-relaxed">Fixed statutory rates adjusted annually based on the number of dependents. Safe default with no GI Bill usage requirement.</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-2">Select Standard Ch 31</span>
              </div>
            </div>

            {selectedSubsistenceType === 'p911' && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-400 flex gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <strong>Election Letter Required:</strong> To receive the Post-9/11 rate, you must submit a written election form alongside proof of remaining GI Bill entitlement (Certificate of Eligibility) to your VRC counselor before courses commence.
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: SCHOOL / TRAINING LOCATION */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Step 3: Where is your school or training located?</h3>
            
            {calcTrainingType === 'institutional' ? (
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Search College or Technical School</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="Type school name or zip code (e.g. Arizona State)..."
                      value={calcSchoolSearchQuery}
                      onChange={(e) => {
                        setCalcSchoolSearchQuery(e.target.value);
                        setCalcShowSuggestions(true);
                      }}
                      onFocus={() => setCalcShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setCalcShowSuggestions(false), 200)}
                    />
                    <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>

                  {calcShowSuggestions && calcSchoolSearchQuery.trim().length > 1 && (
                    <div className="autocomplete-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', zIndex: 1000, maxHeight: '200px', overflowY: 'auto', marginTop: '4px' }}>
                      {activeSchools.filter(school => {
                        const q = calcSchoolSearchQuery.toLowerCase();
                        return school.name.toLowerCase().includes(q) || school.zipCode.includes(q) || school.state.toLowerCase().includes(q);
                      }).slice(0, 6).map(school => (
                        <div 
                          key={school.id}
                          className="autocomplete-item"
                          style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--card-border)' }}
                          onMouseDown={() => {
                            setCalcSelectedSchool(school);
                            setCalcSchoolSearchQuery(school.name);
                            setCalcShowSuggestions(false);
                            setCalcBahRate(school.bahRate);
                            setCalcSchoolType(school.type);
                            setCalcTuition(school.tuition);
                            setCalcYellowRibbon(school.yellowRibbon || false);
                            if (school.foreign) setCalcVenue('foreign');
                            else if (school.onlineOnly) setCalcVenue('online');
                            else setCalcVenue('in-person');
                          }}
                        >
                          <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{school.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{school.city}, {school.state} {school.zipCode}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected School Stats & Federal Caution Flags */}
                {calcSelectedSchool ? (
                  <div className="bg-slate-950/40 p-4 border border-indigo-500/25 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">🏫 {calcSelectedSchool.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{calcSelectedSchool.city}, {calcSelectedSchool.state} • ZIP: {calcSelectedSchool.zipCode}</p>
                      </div>
                      <span className="text-[9px] bg-slate-900 border border-slate-800 text-indigo-400 px-2 py-0.5 rounded font-bold uppercase">
                        {calcSelectedSchool.type}
                      </span>
                    </div>

                    {/* caution flags list */}
                    {(calcSelectedSchool.complaints > 0 || calcSelectedSchool.benefitsSuspended || calcSelectedSchool.oigInvestigation) && (
                      <div className="bg-red-950/20 border border-red-900/30 p-3 rounded-lg space-y-1.5">
                        <span className="text-[10px] font-bold text-red-400 flex items-center gap-1 uppercase">
                          <AlertTriangle size={12} />
                          <span>VA Caution Flags Active</span>
                        </span>
                        <ul className="text-[10px] text-red-300 list-disc pl-4 space-y-0.5">
                          {calcSelectedSchool.complaints > 0 && <li>Student Complaints: {calcSelectedSchool.complaints} submitted to VA.</li>}
                          {calcSelectedSchool.benefitsSuspended && <li>VA has suspended new enrollments due to deceptive practice audits.</li>}
                          {calcSelectedSchool.oigInvestigation && <li>School is under investigation by the VA Inspector General.</li>}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-350 border-t border-slate-850 pt-2.5">
                      <div>Local E-5 BAH Rate: <strong className="text-slate-200">${calcSelectedSchool.bahRate}/mo</strong></div>
                      <div>Accreditation: <strong className={calcSelectedSchool.accredited ? 'text-emerald-400' : 'text-red-400'}>{calcSelectedSchool.accredited ? 'Accredited' : 'Unaccredited'}</strong></div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="block text-xs text-slate-450 mb-1">Local ZIP Code BAH Rate ($)</label>
                      <input 
                        type="number"
                        className="form-control"
                        value={calcBahRate}
                        onChange={(e) => setCalcBahRate(Number(e.target.value))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="block text-xs text-slate-450 mb-1">Training Venue</label>
                      <select 
                        value={calcVenue}
                        onChange={(e) => setCalcVenue(e.target.value)}
                        className="form-control"
                        aria-label="Training venue select"
                      >
                        <option value="in-person">In-Person Classes</option>
                        <option value="online">Online-Only (Distance Learning)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // OJT WAGES INSTEAD
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/20 p-5 border border-slate-850 rounded-xl">
                <div className="form-group">
                  <label className="block text-xs text-slate-450 mb-1">OJT Training Wage ($ / month)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={calcOjtTrainingWage}
                    onChange={(e) => setCalcOjtTrainingWage(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="block text-xs text-slate-450 mb-1">Journeyman Job Wage ($ / month)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={calcOjtJourneymanWage}
                    onChange={(e) => setCalcOjtJourneymanWage(Number(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: DEPENDENTS & ATTENDANCE RATE */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Step 4: Dependents & Rate of Pursuit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your standard Chapter 31 allowance changes dynamically based on how many dependents you claim. Your attendance rate determines the final payout percentage.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="block text-xs text-slate-450 mb-1">Number of Dependents</label>
                <select
                  value={calcDependents}
                  onChange={(e) => setCalcDependents(Number(e.target.value))}
                  className="form-control"
                  aria-label="Dependents count select"
                >
                  <option value={0}>No Dependents</option>
                  <option value={1}>1 Dependent</option>
                  <option value={2}>2 Dependents</option>
                  <option value={3}>3 or More Dependents</option>
                </select>
              </div>

              <div className="form-group">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs text-slate-455">Attendance Rate</label>
                  <span 
                    onClick={() => setCalcUseCredits(!calcUseCredits)}
                    className="text-[10px] text-indigo-400 cursor-pointer underline"
                  >
                    {calcUseCredits ? 'Use standard selection' : 'Enter specific credits'}
                  </span>
                </div>
                
                {calcUseCredits ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={calcCredits}
                      onChange={(e) => setCalcCredits(Math.max(1, Number(e.target.value)))}
                      className="form-control"
                      style={{ width: '80px' }}
                      min={1}
                    />
                    <span className="text-xs text-slate-450">/</span>
                    <input
                      type="number"
                      value={calcFullTimeThreshold}
                      onChange={(e) => setCalcFullTimeThreshold(Math.max(1, Number(e.target.value)))}
                      className="form-control"
                      style={{ width: '80px' }}
                      min={1}
                    />
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">credits (full-time)</span>
                  </div>
                ) : (
                  <select
                    value={calcTime}
                    onChange={(e) => setCalcTime(e.target.value)}
                    className="form-control"
                    aria-label="Attendance rate select"
                  >
                    <option value="full">Full-Time (100%)</option>
                    <option value="three-quarters">3/4-Time (75%)</option>
                    <option value="half">1/2-Time (50%)</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: TUITION, BOOKS & TECHNOLOGY */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-fadeIn">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Step 5: Tuition, Books & supplies</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter program tuition cost and supply details. Standard Mode handles basic options, while Advanced Mode lets you configure Yellow Ribbon waivers, kickers, and OJT wage schedules.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="block text-xs text-slate-450 mb-1">Annual Tuition & Fees ($)</label>
                <input
                  type="number"
                  value={calcTuition}
                  onChange={(e) => setCalcTuition(Number(e.target.value))}
                  className="form-control"
                  placeholder="e.g. 15000"
                />
              </div>

              <div className="form-group">
                <label className="block text-xs text-slate-450 mb-1">Monthly GI Bill Kicker Stipend ($)</label>
                <input
                  type="number"
                  value={calcKicker}
                  onChange={(e) => setCalcKicker(Number(e.target.value))}
                  className="form-control"
                  placeholder="e.g. 200"
                />
              </div>
            </div>

            {/* Supplies and tech checklist */}
            <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl space-y-3">
              <label className="flex items-center gap-3 cursor-pointer select-none text-xs text-slate-250">
                <input
                  type="checkbox"
                  checked={calcIncludeComputer}
                  onChange={(e) => setCalcIncludeComputer(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                />
                <span>Include VR&E Laptop/Technology Package Request</span>
              </label>

              {calcIncludeComputer && (
                <div className="form-group animate-slideDown pl-7">
                  <label className="block text-[10px] font-bold text-slate-450 mb-1">Estimated Computer/Tech Cost ($)</label>
                  <input
                    type="number"
                    value={calcComputerCost}
                    onChange={(e) => setCalcComputerCost(Number(e.target.value))}
                    className="form-control max-w-xs"
                  />
                  <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                    Typical benchmark cost for basic academic tech package: <strong>${activeRates.ch31_computer_package_value || 2000}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Advanced features: Yellow Ribbon */}
            {calculatorMode === 'advanced' && calcSchoolType === 'private' && (
              <div className="bg-slate-900/30 p-4 border border-slate-800 rounded-xl space-y-3 animate-fadeIn">
                <label className="flex items-center gap-3 cursor-pointer select-none text-xs text-slate-250">
                  <input
                    type="checkbox"
                    checked={calcYellowRibbon}
                    onChange={(e) => setCalcYellowRibbon(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                  />
                  <span>Utilize School Yellow Ribbon Contribution</span>
                </label>

                {calcYellowRibbon && (
                  <div className="form-group pl-7">
                    <label className="block text-[10px] font-bold text-slate-450 mb-1">School Yellow Ribbon Contribution ($)</label>
                    <input
                      type="number"
                      value={calcYrSchoolContribution}
                      onChange={(e) => setCalcYrSchoolContribution(Number(e.target.value))}
                      className="form-control max-w-xs"
                      placeholder="e.g. 5000"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 6: CALCULATION RESULTS */}
        {currentStep === 6 && (
          <div className="space-y-5 animate-fadeIn">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Step 6: Payout & Housing Results</h3>
            
            {calculatorResults ? (
              <div className="space-y-4">
                {/* Comparative box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-5 border rounded-xl space-y-2 bg-slate-950/20 ${
                    selectedSubsistenceType === 'p911' ? 'border-indigo-500/30' : 'border-slate-850'
                  }`}>
                    <span className="text-[10px] font-bold text-slate-450 uppercase block">Post-9/11 GI Bill rate (P911SA)</span>
                    <div className="text-2xl font-black text-slate-200">
                      ${Number(calculatorResults.p911Rate).toLocaleString()}<span className="text-xs text-slate-400 font-normal"> / mo</span>
                    </div>
                    <span className="text-[10px] text-slate-450 leading-relaxed block">
                      Based on E-5 BAH for ZIP code <strong>{calcSelectedSchool ? calcSelectedSchool.zipCode : 'Local'}</strong>
                    </span>
                  </div>

                  <div className={`p-5 border rounded-xl space-y-2 bg-slate-950/20 ${
                    selectedSubsistenceType === 'ch31' ? 'border-indigo-500/30' : 'border-slate-850'
                  }`}>
                    <span className="text-[10px] font-bold text-slate-450 uppercase block">Standard Chapter 31 Rate</span>
                    <div className="text-2xl font-black text-slate-200">
                      ${Number(calculatorResults.regularRate).toLocaleString()}<span className="text-xs text-slate-400 font-normal"> / mo</span>
                    </div>
                    <span className="text-[10px] text-slate-455 leading-relaxed block">
                      Fixed rate based on <strong>{calcDependents} dependents</strong> and Full-Time status.
                    </span>
                  </div>
                </div>

                {/* Recommendation alert */}
                <div className="flex gap-2 items-start bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-xl text-xs text-emerald-400">
                  <CheckCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <strong>Option Recommendation:</strong> {
                      Number(calculatorResults.p911Rate) > Number(calculatorResults.regularRate) 
                        ? `The Post-9/11 rate yields $${Math.abs(Number(calculatorResults.p911Rate) - Number(calculatorResults.regularRate)).toFixed(2)}/mo MORE than the standard rate.`
                        : `The standard Chapter 31 rate yields $${Math.abs(Number(calculatorResults.p911Rate) - Number(calculatorResults.regularRate)).toFixed(2)}/mo MORE than the Post-9/11 rate.`
                    } Ensure your election choice matches the highest payout rate.
                  </div>
                </div>

                {/* Additional offsets */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Tuition & Supplies Offsets (100% Covered under Ch 31)</span>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Tuition Payable to School:</span>
                    <span className="font-semibold text-slate-200">${calculatorResults.tuitionPayable.toLocaleString()} / year</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Books & Supplies Allocation:</span>
                    <span className="font-semibold text-slate-200">${calculatorResults.suppliesValue.toLocaleString()} / year</span>
                  </div>
                  {calcIncludeComputer && (
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Tech Package Benchmark:</span>
                      <span className="font-semibold text-slate-200">${calcComputerCost.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Confidence notice */}
                <div className="border-l-2 border-indigo-500/40 bg-slate-950/10 p-3 rounded-r text-[10px] text-slate-450 leading-relaxed">
                  <strong>Estimate verification:</strong> This calculation is based on published rate figures last verified on May 25, 2026. The final payment plan must be confirmed with your VRC and verified against tungsten authorizations.
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500 font-semibold">Error processing calculations. Check input parameters.</div>
            )}
          </div>
        )}

        {/* STEP 7: ACTIONS & EXPORTS */}
        {currentStep === 7 && (
          <div className="space-y-5 animate-fadeIn">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Step 7: Actions & Data Exports</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export your calculation results, generate payment-monitoring checklists for your school certifying official, or save your settings locally in session.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={handleCopySummary}
                className="flex items-center gap-3 bg-slate-950/30 hover:bg-slate-950/60 border border-slate-800 hover:border-slate-700 p-4 rounded-xl text-left cursor-pointer transition select-none text-xs font-semibold"
              >
                {copySuccess ? <Check size={18} className="text-emerald-400 shrink-0" /> : <Clipboard size={18} className="text-indigo-400 shrink-0" />}
                <div>
                  <span className="text-slate-200 block">Copy Estimate Summary</span>
                  <span className="text-[10px] text-slate-450 block font-normal mt-0.5">{copySuccess ? 'Copied to clipboard' : 'Copy formatted text for emails'}</span>
                </div>
              </button>

              <button 
                onClick={handlePrintSummary}
                className="flex items-center gap-3 bg-slate-950/30 hover:bg-slate-950/60 border border-slate-800 hover:border-slate-700 p-4 rounded-xl text-left cursor-pointer transition select-none text-xs font-semibold"
              >
                <Printer size={18} className="text-blue-400 shrink-0" />
                <div>
                  <span className="text-slate-200 block">Print Estimate Summary</span>
                  <span className="text-[10px] text-slate-455 block font-normal mt-0.5">Generate a clean physical printout</span>
                </div>
              </button>

              <button 
                onClick={handleSaveEstimate}
                className="flex items-center gap-3 bg-slate-950/30 hover:bg-slate-950/60 border border-slate-800 hover:border-slate-700 p-4 rounded-xl text-left cursor-pointer transition select-none text-xs font-semibold"
              >
                {estimateSaved ? <Check size={18} className="text-emerald-400 shrink-0" /> : <Save size={18} className="text-amber-400 shrink-0" />}
                <div>
                  <span className="text-slate-200 block">Save Estimate (Session Storage)</span>
                  <span className="text-[10px] text-slate-455 block font-normal mt-0.5">{estimateSaved ? 'Saved in session' : 'Persist parameters in current tab'}</span>
                </div>
              </button>

              <button 
                onClick={() => setShowChecklistModal(true)}
                className="flex items-center gap-3 bg-slate-950/30 hover:bg-slate-950/60 border border-slate-800 hover:border-slate-700 p-4 rounded-xl text-left cursor-pointer transition select-none text-xs font-semibold"
              >
                <CheckSquare size={18} className="text-emerald-400 shrink-0" />
                <div>
                  <span className="text-slate-200 block">School Payment Checklist</span>
                  <span className="text-[10px] text-slate-455 block font-normal mt-0.5">Build payment timelines & contact sheets</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="doc-divider mt-6 mb-4"></div>

      {/* STEPPER BUTTONS */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="btn btn-secondary flex items-center gap-1.5 h-9 text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        {currentStep < 7 ? (
          <button
            onClick={nextStep}
            className="btn btn-primary flex items-center gap-1.5 h-9 text-xs cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        ) : (
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            All steps complete
          </div>
        )}
      </div>

      {/* SCHOOL COMPLIANCE CHECKLIST MODAL */}
      {showChecklistModal && (
        <div className="modal-overlay" onClick={() => setShowChecklistModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>School Term payment Checklist</h2>
              <button className="close-btn" onClick={() => setShowChecklistModal(false)}>&times;</button>
            </div>
            <div className="modal-body space-y-4 text-xs leading-relaxed">
              <p className="text-slate-400">
                Follow this checklist to guarantee your tuition, books, and monthly housing payments process on time.
              </p>

              <div className="space-y-3 text-slate-200">
                <div className="flex gap-3 items-start">
                  <input type="checkbox" className="mt-1" id="chk_auth" />
                  <label htmlFor="chk_auth" className="cursor-pointer">
                    <strong>Submit VAF 28-1905 / Tungsten Authorization:</strong> Contact your counselor at least 30 days prior to class start to ensure they submit the digital authorization to the school.
                  </label>
                </div>
                <div className="flex gap-3 items-start">
                  <input type="checkbox" className="mt-1" id="chk_cert" />
                  <label htmlFor="chk_cert" className="cursor-pointer">
                    <strong>Coordinate with School Certifying Official (SCO):</strong> Ensure your SCO certifies your enrollment hours in the VA system to release monthly payments.
                  </label>
                </div>
                <div className="flex gap-3 items-start">
                  <input type="checkbox" className="mt-1" id="chk_invoice" />
                  <label htmlFor="chk_invoice" className="cursor-pointer">
                    <strong>Submit Invoices:</strong> Private private caps or additional fees must be coordinated via Yellow Ribbon offsets or payment waivers.
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer flex justify-end">
              <button className="btn btn-primary" onClick={() => setShowChecklistModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalculatorView;
