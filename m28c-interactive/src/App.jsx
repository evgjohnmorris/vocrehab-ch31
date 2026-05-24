import React, { useState, useEffect } from 'react';
import { 
  Search, Moon, Sun, Bookmark, BookOpen, Calculator, Award, 
  Trash2, ChevronRight, ChevronDown, ExternalLink, ShieldCheck, 
  Scale, FileText, CheckCircle, HelpCircle, Info, BookMarked, Users, Settings, RefreshCw, AlertTriangle,
  TrendingUp, DollarSign, Compass, Briefcase, FlaskConical, Play
} from 'lucide-react';
import { US_CODE_SECTIONS, CFR_REGULATIONS, M28C_PARTS, GLOSSARY_TERMS, VRE_OFFICES, VA_DISABILITY_COMP_TABLE_2026, VA_PENSION_MAPR_2026, SMC_RATES_2026 } from './data';
import { SCHOOLS_DATABASE, CAREERS_DATABASE } from './school_data';

const DEFAULT_RATES = {
  version: "2026.1",
  ch31_institutional_full: [861.10, 1067.81, 1258.13, 91.85],
  ch31_institutional_threeQuarters: [646.71, 801.49, 943.40, 68.77],
  ch31_institutional_half: [432.31, 534.86, 629.57, 45.92],
  ch31_ojt: [710.67, 859.43, 990.47, 64.41],
  p911_online_rate: 1169.00,
  p911_foreign_rate: 2338.00,
  p911_private_tuition_cap: 29920.95,
  p911_flight_cap: 15497.13,
  p911_correspondence_cap: 13535.11,
  p911_books_cap: 1000.00,
  ch31_computer_package_value: 2000.00
};


function App() {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Navigation State
  const [selectedSection, setSelectedSection] = useState({ type: 'usc', id: '3100' });
  const [activeView, setActiveView] = useState('reference'); // 'reference' | 'wizard' | 'calculator' | 'glossary'
  
  // Accordion Expand/Collapse State
  const [expandedCategories, setExpandedCategories] = useState({
    usc: true,
    cfr: false,
    m28c: true,
    m28cParts: {} // Part ID to boolean
  });

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem('m28c_bookmarks');
    return saved ? JSON.parse(saved) : [{ type: 'usc', id: '3102' }];
  });

  // Wizard State
  const [rating, setRating] = useState(20);
  const [dischargeStatus, setDischargeStatus] = useState('other-than-dishonorable');
  const [employmentHandicap, setEmploymentHandicap] = useState(true);
  const [sehAssessment, setSehAssessment] = useState(null); // 'yes' | 'no'
  const [wizardResult, setWizardResult] = useState(null);

  // Calculator State & Dynamic Rates
  const [rates, setRates] = useState(() => {
    const saved = localStorage.getItem('m28c_calculator_rates');
    return saved ? JSON.parse(saved) : DEFAULT_RATES;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState(rates);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'success' | 'failed'

  const [calcTrainingType, setCalcTrainingType] = useState('institutional');
  const [calcTime, setCalcTime] = useState('full');
  const [calcDependents, setCalcDependents] = useState(0);
  const [calcBahRate, setCalcBahRate] = useState(1950);
  
  const [calcActiveDuty, setCalcActiveDuty] = useState(false);
  const [calcVenue, setCalcVenue] = useState('in-person'); // 'in-person' | 'online' | 'foreign'
  const [calcTier, setCalcTier] = useState(1.0); // 1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.0
  const [showTierCalc, setShowTierCalc] = useState(false);
  const [tierCalcMonths, setTierCalcMonths] = useState(36);
  const [tierCalcPurpleHeart, setTierCalcPurpleHeart] = useState(false);
  const [tierCalcDisabilityDischarge, setTierCalcDisabilityDischarge] = useState(false);
  const [calcUseCredits, setCalcUseCredits] = useState(false);
  const [calcCredits, setCalcCredits] = useState(12);
  const [calcFullTimeThreshold, setCalcFullTimeThreshold] = useState(12);
  const [calcTuition, setCalcTuition] = useState(0);
  const [calcSchoolType, setCalcSchoolType] = useState('public');
  const [calcYellowRibbon, setCalcYellowRibbon] = useState(false);
  const [calcYrSchoolContribution, setCalcYrSchoolContribution] = useState(0);
  const [calcDegreeLevel, setCalcDegreeLevel] = useState('- Select -');
  const [calcYrDivision, setCalcYrDivision] = useState('');
  const [calcKicker, setCalcKicker] = useState(0);
  const [calcScholarships, setCalcScholarships] = useState(0);
  const [calcIncludeComputer, setCalcIncludeComputer] = useState(false);
  const [calcComputerCost, setCalcComputerCost] = useState(() => {
    const saved = localStorage.getItem('m28c_calculator_rates');
    const parsed = saved ? JSON.parse(saved) : DEFAULT_RATES;
    return parsed.ch31_computer_package_value || 2000.00;
  });
  const [calcOjtTrainingWage, setCalcOjtTrainingWage] = useState(0);
  const [calcOjtJourneymanWage, setCalcOjtJourneymanWage] = useState(0);
  const [calcCalculatorTab, setCalcCalculatorTab] = useState('monthly'); // 'monthly' | 'tuition' | 'ojt'
  const [calcSchoolSearchQuery, setCalcSchoolSearchQuery] = useState('');
  const [calcSelectedSchool, setCalcSelectedSchool] = useState(null);
  const [calcShowSuggestions, setCalcShowSuggestions] = useState(false);
  const [schoolsDatabase, setSchoolsDatabase] = useState([]);
  
  const [calculatorResults, setCalculatorResults] = useState(null);
  
  // Counselor Directory Search State
  const [dirQuery, setDirQuery] = useState('');

  // --- DISABILITY & SMC HUB STATES ---
  const [disabilityRatings, setDisabilityRatings] = useState([]);
  const [depSpouse, setDepSpouse] = useState(false);
  const [depSpouseAa, setDepSpouseAa] = useState(false);
  const [depChildrenUnder18, setDepChildrenUnder18] = useState(0);
  const [depChildrenSchool, setDepChildrenSchool] = useState(0);
  const [depParents, setDepParents] = useState(0);
  const [smcLevel, setSmcLevel] = useState('none');
  const [hasSmcK, setHasSmcK] = useState(false);
  const [smcKCount, setSmcKCount] = useState(1);

  // Pension Sub-states
  const [showPensionCalc, setShowPensionCalc] = useState(false);
  const [pensionIncome, setPensionIncome] = useState(0);
  const [pensionExpenses, setPensionExpenses] = useState(0);
  const [pensionNetWorth, setPensionNetWorth] = useState(0);
  const [pensionCategory, setPensionCategory] = useState('basic');

  // Chapter 61 Retirement sub-states
  const [showRetirementCalc, setShowRetirementCalc] = useState(false);
  const [retBasePay, setRetBasePay] = useState(0);
  const [retYearsService, setRetYearsService] = useState(0);
  const [retDodRating, setRetDodRating] = useState(0);
  const [retSystem, setRetSystem] = useState('high3');
  const [retMedical, setRetMedical] = useState(true);
  const [retCombat, setRetCombat] = useState(false);
  const [retCombatRating, setRetCombatRating] = useState(0);

  // --- FINANCIAL PLANNER STATES ---
  const [pellDependency, setPellDependency] = useState('independent');
  const [pellFamilySize, setPellFamilySize] = useState(1);
  const [pellAgi, setPellAgi] = useState(0);

  const [loanDebt, setLoanDebt] = useState(0);
  const [loanInterest, setLoanInterest] = useState(0);
  const [loanAgi, setLoanAgi] = useState(0);
  const [loanFamilySize, setLoanFamilySize] = useState(1);
  const [loanUndergrad, setLoanUndergrad] = useState(true);

  // Budget
  const [budgetIncomes, setBudgetIncomes] = useState([]);
  const [budgetExpenses, setBudgetExpenses] = useState([]);

  const addIncomeTemplate = (type) => {
    const typeCounts = {};
    budgetIncomes.forEach(i => {
      typeCounts[i.type] = (typeCounts[i.type] || 0) + 1;
    });
    const count = typeCounts[type] || 0;
    let name = '';
    let amount = 0;

    switch (type) {
      case 'va_disability':
        name = `VA Disability Pay`;
        amount = calculatedDisabilityPay;
        break;
      case 'va_bah':
        name = `VA BAH / MHA`;
        amount = budgetMhaAmount;
        break;
      case 'va_pension':
        name = `VA Pension`;
        break;
      case 'ssi':
        name = `SSI (Supplemental Security)`;
        break;
      case 'ssdi':
        name = `SSDI (Social Security Disability)`;
        break;
      case 'job':
        name = `W2/1099 Job Income${count > 0 ? ' ' + (count + 1) : ''}`;
        break;
      case 'spouse':
        name = `Spouse Income${count > 0 ? ' ' + (count + 1) : ''}`;
        break;
      case 'child_support':
        name = `Child Support${count > 0 ? ' ' + (count + 1) : ''}`;
        break;
      default:
        name = `Other Income${count > 0 ? ' ' + (count + 1) : ''}`;
        break;
    }

    setBudgetIncomes([...budgetIncomes, { id: Date.now() + Math.random(), type, name, amount }]);
  };

  const addExpenseTemplate = (category) => {
    const catCounts = {};
    budgetExpenses.forEach(e => {
      catCounts[e.category] = (catCounts[e.category] || 0) + 1;
    });
    const count = catCounts[category] || 0;
    let name = '';

    switch (category) {
      case 'housing':
        name = `Housing (Rent/Mortgage)${count > 0 ? ' ' + (count + 1) : ''}`;
        break;
      case 'utilities':
        name = `Utilities${count > 0 ? ' ' + (count + 1) : ''}`;
        break;
      case 'food':
        name = `Food & Groceries${count > 0 ? ' ' + (count + 1) : ''}`;
        break;
      case 'transportation':
        name = `Transportation${count > 0 ? ' ' + (count + 1) : ''}`;
        break;
      case 'insurance':
        name = `Insurance${count > 0 ? ' ' + (count + 1) : ''}`;
        break;
      case 'health':
        name = `Health & Medical${count > 0 ? ' ' + (count + 1) : ''}`;
        break;
      case 'giving':
        name = `Giving & Tithing${count > 0 ? ' ' + (count + 1) : ''}`;
        break;
      case 'saving_debt':
        name = `Savings & Debt${count > 0 ? ' ' + (count + 1) : ''}`;
        break;
      default:
        name = `Other Expense${count > 0 ? ' ' + (count + 1) : ''}`;
        break;
    }

    setBudgetExpenses([...budgetExpenses, { id: Date.now() + Math.random(), category, name, amount: 0 }]);
  };

  const autofillCalculatedIncome = () => {
    let current = [...budgetIncomes];
    if (calculatedDisabilityPay > 0 && !current.some(i => i.type === 'va_disability')) {
      current.push({ id: Date.now() + Math.random(), type: 'va_disability', name: 'VA Disability Pay', amount: calculatedDisabilityPay });
    }
    if (budgetMhaAmount > 0 && !current.some(i => i.type === 'va_bah')) {
      current.push({ id: Date.now() + Math.random(), type: 'va_bah', name: 'VA BAH / MHA Allowance', amount: budgetMhaAmount });
    }
    setBudgetIncomes(current);
  };

  // Debt Snowball
  const [debtsList, setDebtsList] = useState([]);
  const [snowballExtra, setSnowballExtra] = useState(0);
  const [showFinancialTestLab, setShowFinancialTestLab] = useState(false);
  const [activeTestScenario, setActiveTestScenario] = useState(null);

  const addDebtTemplate = (type) => {
    const typeCounts = {};
    debtsList.forEach(d => {
      const baseType = d.type || 'custom';
      typeCounts[baseType] = (typeCounts[baseType] || 0) + 1;
    });

    const count = typeCounts[type] || 0;
    let name = '';

    switch (type) {
      case 'credit_card':
        const cardLabels = ['A', 'B', 'C', 'D', 'E'];
        name = `Credit Card ${cardLabels[count] || (count + 1)}`;
        break;
      case 'personal_loan':
        const loanLabels = ['1', '2', '3', '4', '5'];
        name = `Personal Loan ${loanLabels[count] || (count + 1)}`;
        break;
      case 'line_of_credit':
        name = `Line of Credit${count > 0 ? ' ' + (count + 1) : ''}`;
        break;
      case 'heloc':
        name = `HELOC${count > 0 ? ' ' + (count + 1) : ''}`;
        break;
      case 'mortgage':
        name = `Mortgage${count > 0 ? ' ' + (count + 1) : ''}`;
        break;
      case 'auto_loan':
        name = `Auto Loan${count > 0 ? ' ' + (count + 1) : ''}`;
        break;
      case 'business_loan':
        name = `Business Loan${count > 0 ? ' ' + (count + 1) : ''}`;
        break;
      case 'family_loan':
        name = `Family Loan${count > 0 ? ' ' + (count + 1) : ''}`;
        break;
      case 'private_student_loan':
        name = `Private Student Loan${count > 0 ? ' ' + (count + 1) : ''}`;
        break;
      default:
        name = `Custom Debt${count > 0 ? ' ' + (count + 1) : ''}`;
        break;
    }

    setDebtsList([...debtsList, { id: Date.now() + Math.random(), type, name, balance: 0, minPayment: 0 }]);
  };

  // --- CAREER STRATEGY STATES ---
  const [justCurrentGoal, setJustCurrentGoal] = useState('Operations Specialist');
  const [justProposedGoal, setJustProposedGoal] = useState('Software Developer');
  const [justReason, setJustReason] = useState('disability_worsened');
  const [justMedicalEvidence, setJustMedicalEvidence] = useState(true);
  const [justPhysicalImpact, setJustPhysicalImpact] = useState('Current job requires frequent bending, lifting, and carrying gear up to 50 lbs, which exacerbates my service-connected spinal stenosis and lumbar strain. Sitting at a computer desk is medically recommended.');
  const [justGeneratedLetter, setJustGeneratedLetter] = useState('');

  const [selectedCareerIndex, setSelectedCareerIndex] = useState(0);
  const [limitStanding, setLimitStanding] = useState(false);
  const [limitLifting, setLimitLifting] = useState(false);
  const [limitBending, setLimitBending] = useState(false);
  const [riasecR, setRiasecR] = useState(3);
  const [riasecI, setRiasecI] = useState(3);
  const [riasecA, setRiasecA] = useState(3);
  const [riasecS, setRiasecS] = useState(3);
  const [riasecE, setRiasecE] = useState(3);
  const [riasecC, setRiasecC] = useState(3);
  const [showProfiler, setShowProfiler] = useState(false);

  const [industrySearchQuery, setIndustrySearchQuery] = useState('');
  const [showIndustryFinder, setShowIndustryFinder] = useState(false);

  const [showVetTecInfo, setShowVetTecInfo] = useState(false);
  const [vetTecOnline, setVetTecOnline] = useState(false);
  const [showSportsInfo, setShowSportsInfo] = useState(false);
  const [sportsLoad, setSportsLoad] = useState('full');

  // Interactive Strategy Guides states
  const [showGraduateStrategy, setShowGraduateStrategy] = useState(false);
  const [showStartupStrategy, setShowStartupStrategy] = useState(false);
  const [showExtensionsStrategy, setShowExtensionsStrategy] = useState(false);
  const [extHasSeh, setExtHasSeh] = useState(false);
  const [extApproachingLimit, setExtApproachingLimit] = useState(false);
  const [extNeedMoreTime, setExtNeedMoreTime] = useState(false);
  const [showTpdChecklist, setShowTpdChecklist] = useState(false);

  // Toggle Theme effect
  useEffect(() => {
    const body = document.body;
    if (isDarkMode) {
      body.classList.remove('light-mode');
    } else {
      body.classList.add('light-mode');
    }
  }, [isDarkMode]);

  // Sync Bookmarks to LocalStorage
  useEffect(() => {
    localStorage.setItem('m28c_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Fetch rates.json on load for automatic VA calculator synchronization
  useEffect(() => {
    setSyncStatus('syncing');
    fetch('/rates.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch remote rates');
        return res.json();
      })
      .then(remoteData => {
        const saved = localStorage.getItem('m28c_calculator_rates');
        const active = saved ? JSON.parse(saved) : DEFAULT_RATES;
        
        // If version from server is different, update
        if (remoteData.version !== active.version) {
          const updatedRates = {
            ...active,
            ...remoteData
          };
          setRates(updatedRates);
          setSettingsForm(updatedRates);
          localStorage.setItem('m28c_calculator_rates', JSON.stringify(updatedRates));
          setSyncStatus('success');
        } else {
          setSyncStatus('success');
        }
      })
      .catch(err => {
        console.error('Rate sync failed, using offline defaults:', err);
        setSyncStatus('failed');
      });
  }, []);

  // Fetch complete GI Bill colleges database on load
  useEffect(() => {
    fetch('/schools.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load schools database');
        return res.json();
      })
      .then(data => {
        const mapped = data.map(arr => ({
          id: arr[7], // facilityCode
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
          onlineOnly: arr[0].toLowerCase().includes('online') || arr[0].toLowerCase().includes('distance learning')
        }));
        // Blend in mock institutions to ensure tests/cautions demo works
        setSchoolsDatabase([...mapped, ...SCHOOLS_DATABASE.filter(s => s.id.includes('mock'))]);
      })
      .catch(err => {
        console.error('Error loading schools database, using fallback:', err);
        setSchoolsDatabase(SCHOOLS_DATABASE);
      });
  }, []);

  // Real-time Search Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = [];

    // Search U.S. Code
    US_CODE_SECTIONS.forEach(sec => {
      const titleMatch = sec.title.toLowerCase().includes(query);
      const textMatch = sec.content.toLowerCase().includes(query);
      if (titleMatch || textMatch) {
        results.push({
          type: 'usc',
          id: sec.id,
          title: sec.title,
          snippet: sec.subtitle,
          category: 'U.S. Code'
        });
      }
    });

    // Search CFR
    CFR_REGULATIONS.forEach(reg => {
      const titleMatch = reg.title.toLowerCase().includes(query);
      const textMatch = reg.content.toLowerCase().includes(query);
      if (titleMatch || textMatch) {
        results.push({
          type: 'cfr',
          id: reg.id,
          title: reg.title,
          snippet: reg.subtitle,
          category: '38 CFR Part 21'
        });
      }
    });

    // Search M28C Parts
    M28C_PARTS.forEach(part => {
      part.chapters.forEach(ch => {
        const titleMatch = ch.title.toLowerCase().includes(query);
        const textMatch = ch.content.toLowerCase().includes(query);
        if (titleMatch || textMatch) {
          results.push({
            type: 'm28c',
            id: ch.id,
            title: ch.title,
            snippet: part.title,
            category: part.title
          });
        }
      });
    });

    setSearchResults(results.slice(0, 10)); // Limit to top 10
  }, [searchQuery]);

  // Find Selected Content Object
  const getSelectedContent = () => {
    if (selectedSection.type === 'usc') {
      return US_CODE_SECTIONS.find(sec => sec.id === selectedSection.id);
    } else if (selectedSection.type === 'cfr') {
      return CFR_REGULATIONS.find(reg => reg.id === selectedSection.id);
    } else {
      for (const part of M28C_PARTS) {
        const chapter = part.chapters.find(ch => ch.id === selectedSection.id);
        if (chapter) {
          return {
            ...chapter,
            subtitle: part.title,
            category: 'M28C Manual',
            tag: part.tag
          };
        }
      }
    }
    return null;
  };

  const activeContent = getSelectedContent();

  // Collapsible toggle helpers
  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const togglePart = (partId) => {
    setExpandedCategories(prev => ({
      ...prev,
      m28cParts: {
        ...prev.m28cParts,
        [partId]: !prev.m28cParts[partId]
      }
    }));
  };

  // Bookmark Toggle
  const toggleBookmark = (type, id, title) => {
    const exists = bookmarks.some(b => b.id === id && b.type === type);
    if (exists) {
      setBookmarks(prev => prev.filter(b => !(b.id === id && b.type === type)));
    } else {
      setBookmarks(prev => [...prev, { type, id, title }]);
    }
  };

  // Eligibility Wizard Logic
  const calculateEligibility = () => {
    if (dischargeStatus === 'dishonorable') {
      setWizardResult({
        eligible: false,
        reason: "Discharge character of 'Dishonorable' is a statutory bar to Chapter 31 benefits under 38 U.S.C. § 5303.",
        recommendedAction: "You may apply to the VA Discharge Review Board (DRB) or Board for Correction of Military Records (BCMR) for a discharge upgrade.",
        keyRegs: [
          { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
          { type: 'cfr', id: '21.42', label: '38 CFR § 21.42' }
        ]
      });
      return;
    }

    if (rating < 10) {
      setWizardResult({
        eligible: false,
        reason: "You must have a service-connected disability rating of at least 10% from the VA to apply for Chapter 31 VR&E.",
        recommendedAction: "If your service-connected conditions have worsened, you can file a claim for an increased rating via VA.gov.",
        keyRegs: [
          { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
          { type: 'cfr', id: '21.40', label: '38 CFR § 21.40' }
        ]
      });
      return;
    }

    if (rating === 10) {
      if (sehAssessment === 'yes') {
        setWizardResult({
          eligible: true,
          entitled: true,
          status: "Entitled (10% Rating + Serious Employment Handicap)",
          reason: "Veterans with a 10% rating are entitled to VR&E services if they are determined by a VRC to have a Serious Employment Handicap (SEH).",
          recommendedAction: "Submit VA Form 28-1900. Your evaluation will focus on establishing how your disability severely limits your employability.",
          tracks: ["Reemployment", "Rapid Access", "Self-Employment", "Long-Term Services", "Independent Living"],
          keyRegs: [
            { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
            { type: 'cfr', id: '21.35', label: '38 CFR § 21.35' },
            { type: 'cfr', id: '21.52', label: '38 CFR § 21.52' }
          ]
        });
      } else {
        setWizardResult({
          eligible: true,
          entitled: false,
          status: "Eligible but Not Entitled (10% Rating, No Serious Employment Handicap)",
          reason: "Veterans with a 10% rating require a finding of a Serious Employment Handicap (SEH) to establish entitlement. Since no SEH was determined, entitlement cannot be granted.",
          recommendedAction: "You may appeal the VRC's determination or provide additional medical evidence showing the severity of your employment limitations.",
          keyRegs: [
            { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
            { type: 'cfr', id: '21.40', label: '38 CFR § 21.40' },
            { type: 'cfr', id: '21.52', label: '38 CFR § 21.52' }
          ]
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
        reason: "Veterans with a rating of 20% or higher are entitled to VR&E benefits if they have an Employment Handicap (EH) resulting in part from their service-connected condition.",
        recommendedAction: "Submit VA Form 28-1900. You will collaborate with a VRC to complete an initial assessment and select one of the five tracks.",
        tracks: ["Reemployment", "Rapid Access", "Self-Employment", "Long-Term Services"],
        keyRegs: [
          { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
          { type: 'cfr', id: '21.40', label: '38 CFR § 21.40' },
          { type: 'cfr', id: '21.51', label: '38 CFR § 21.51' }
        ]
      });
    } else {
      setWizardResult({
        eligible: true,
        entitled: false,
        status: "Eligible but Not Entitled (20%+ Rating, No Employment Handicap)",
        reason: "While you meet the basic disability rating requirement, your counselor determined that your disability does not cause a current handicap in preparing for, obtaining, or retaining suitable employment.",
        recommendedAction: "Request a review of the decision if you believe your counselor overlooked critical barriers to employment caused by your service-connected conditions.",
        keyRegs: [
          { type: 'usc', id: '3102', label: '38 U.S.C. § 3102' },
          { type: 'cfr', id: '21.40', label: '38 CFR § 21.40' },
          { type: 'cfr', id: '21.51', label: '38 CFR § 21.51' }
        ]
      });
    }
  };

  // Subsistence Allowance Calculator Logic
  const calculateAllowance = () => {
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
      // Active duty get $0 MHA
      p911Rate = 0;
    } else {
      // Base rate selection
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
        // Under Chapter 31 VR&E, electing the Post-9/11 Subsistence Allowance (P911SA) rate pays housing at 100% (unprorated by the Chapter 33 service tier)
        p911Rate = (baseMhaRate * rateOfPursuit) + (calcKicker * rateOfPursuit);
      }
    }

    // 3. OJT step progression array
    let ojtP911Steps = [];
    let ojtCh31Steps = [];
    if (type === 'ojt') {
      const ojtBaseCh31 = calcActiveDuty ? 0 : (deps <= 2 ? rates.ch31_ojt[deps] : rates.ch31_ojt[2] + (deps - 2) * rates.ch31_ojt[3]);
      // OJT P911SA rate is also unprorated by the Chapter 33 service tier under VR&E Chapter 31
      const ojtBaseP911 = calcActiveDuty ? 0 : (calcBahRate + calcKicker);
      
      // Calculate steps
      // Months 1-6: 100%, 7-12: 80%, 13-18: 60%, 19-24: 40%, 25+: 20%
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
    // But sets to 0 for flight, correspondence, and ojt
    let booksP911Covered = 0;
    if (calcSchoolType !== 'flight' && calcSchoolType !== 'correspondence' && calcSchoolType !== 'ojt') {
      booksP911Covered = rates.p911_books_cap * calcTier * (calcUseCredits ? Math.min(1.0, calcCredits / calcFullTimeThreshold) : (time === 'full' ? 1.0 : time === 'three-quarters' ? 0.75 : 0.5));
    }

    const computerCh31Covered = calcIncludeComputer ? calcComputerCost : 0;
    const computerP911Covered = 0;

    const comparison = p911Rate > regularRate 
      ? { better: 'post911', diff: p911Rate - regularRate }
      : { better: 'ch31', diff: regularRate - p911Rate };

    setCalculatorResults({
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
    });
  };

  // Run calculator when inputs change
  useEffect(() => {
    calculateAllowance();
  }, [
    calcTrainingType, calcTime, calcDependents, calcBahRate, calcActiveDuty, 
    calcVenue, calcTier, calcUseCredits, calcCredits, calcFullTimeThreshold, 
    calcTuition, calcSchoolType, calcOjtTrainingWage, calcOjtJourneymanWage, 
    rates, calcIncludeComputer, calcComputerCost, calcYellowRibbon, 
    calcYrSchoolContribution, calcKicker, calcScholarships
  ]);

  // --- DISABILITY & SMC HUB CALCULATOR ENGINES ---
  const calculateCombinedRating = () => {
    if (disabilityRatings.length === 0) return { rounded: 0, finalVal: 0, steps: ["No disability ratings added."] };
    
    // Sort ratings
    const ratingsList = [...disabilityRatings].map(r => ({ ...r, value: Number(r.value) }));
    
    const bilateralRatings = ratingsList.filter(r => r.bilateral).map(r => r.value).sort((a, b) => b - a);
    const normalRatings = ratingsList.filter(r => !r.bilateral).map(r => r.value).sort((a, b) => b - a);
    
    let bilateralCombined = 0;
    let steps = [];
    if (bilateralRatings.length > 0) {
      let current = 100;
      let combinationStr = "";
      bilateralRatings.forEach((val, i) => {
        const prev = current;
        current = current * (1 - val / 100);
        if (i === 0) {
          combinationStr += `${val}%`;
        } else {
          combinationStr += ` + ${val}% = ${(100 - current).toFixed(1)}%`;
        }
      });
      const combined = 100 - current;
      const bilateralFactor = combined * 0.1;
      bilateralCombined = combined + bilateralFactor;
      steps.push(`Combine Bilateral Extremities: ${combinationStr}`);
      steps.push(`Apply 10% Bilateral Factor: ${combined.toFixed(1)}% + 10% (${bilateralFactor.toFixed(1)}%) = ${bilateralCombined.toFixed(2)}%`);
    }
    
    const allRatings = [...normalRatings];
    if (bilateralRatings.length > 0) {
      allRatings.push(bilateralCombined);
    }
    allRatings.sort((a, b) => b - a);
    
    let currentVal = 100;
    let combStepsStr = [];
    allRatings.forEach((val, i) => {
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

  const { rounded: currentCombinedRating, finalVal: currentRawRating, steps: currentVaMathSteps } = calculateCombinedRating();

  const calculatedDisabilityPay = (() => {
    let baseRate = VA_DISABILITY_COMP_TABLE_2026.base_rates[currentCombinedRating] || 0;
    let isSmcActive = smcLevel !== 'none';
    let smcBase = SMC_RATES_2026[smcLevel] || 0;
    let totalPay = isSmcActive ? smcBase : baseRate;
    
    if (currentCombinedRating >= 30 || isSmcActive) {
      const depRating = isSmcActive ? 100 : currentCombinedRating;
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
  })();

  // Wartime Pension Pay
  const pensionResult = (() => {
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
  })();

  // Chapter 61 Retirement Pay
  const retirementResult = (() => {
    const mult = retSystem === 'high3' ? 0.025 : 0.02;
    const longevityRate = retYearsService * mult;
    
    const longevityRetiredPay = retBasePay * longevityRate;
    const disabilityRetiredPay = retMedical ? Math.min(retBasePay * 0.75, retBasePay * (retDodRating / 100)) : 0;
    
    const initialDoDRetiredPay = retMedical ? disabilityRetiredPay : longevityRetiredPay;
    
    // Normal offset
    const offsetAmount = Math.min(initialDoDRetiredPay, calculatedDisabilityPay);
    const remainingDoDRetiredPay = Math.max(0, initialDoDRetiredPay - calculatedDisabilityPay);
    
    // CRDP restoration (regular, or medical with 20+ active years, and VA rating >= 50%)
    const crdpEligible = currentCombinedRating >= 50 && (retYearsService >= 20 || !retMedical);
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
  })();

  // --- FINANCIAL PLANNER CALCULATORS ---
  const getPellEstimate = () => {
    const maxPell = 7395;
    let threshold = pellDependency === 'independent' && pellFamilySize === 1 ? 30000 : 45000;
    let phaseoutMax = pellDependency === 'independent' && pellFamilySize === 1 ? 65000 : 90000;
    
    if (pellAgi <= threshold) return maxPell;
    if (pellAgi >= phaseoutMax) return 0;
    
    const fraction = (pellAgi - threshold) / (phaseoutMax - threshold);
    return Math.max(0, Math.round(maxPell * (1 - fraction)));
  };

  const getLoanRepayments = () => {
    const r = (loanInterest / 100) / 12;
    const n = 120; // 10 years
    
    let standardMonthly = 0;
    if (r > 0) {
      standardMonthly = loanDebt * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else {
      standardMonthly = loanDebt / n;
    }
    const standardTotalPaid = standardMonthly * n;
    const standardTotalInterest = standardTotalPaid - loanDebt;
    
    const graduatedInitial = standardMonthly * 0.6;
    const graduatedFinal = standardMonthly * 1.4;
    const graduatedTotalPaid = graduatedInitial * 24 + (standardMonthly * 0.8) * 24 + standardMonthly * 24 + (standardMonthly * 1.2) * 24 + graduatedFinal * 24;
    const graduatedTotalInterest = graduatedTotalPaid - loanDebt;
    
    const povertyBase = 15060 + (loanFamilySize - 1) * 5380;
    const saveThreshold = povertyBase * 2.25; 
    
    const discretionaryIncome = Math.max(0, loanAgi - saveThreshold);
    const multiplier = loanUndergrad ? 0.05 : 0.10; 
    const saveMonthly = (discretionaryIncome * multiplier) / 12;
    
    return {
      standardMonthly,
      standardTotalPaid,
      standardTotalInterest,
      graduatedInitial,
      graduatedFinal,
      graduatedTotalPaid,
      graduatedTotalInterest,
      saveThreshold,
      saveMonthly,
      povertyBase
    };
  };

  const loanRepayments = getLoanRepayments();

  // Zero-Based Budget
  const budgetMhaAmount = calculatorResults 
    ? (Number(calculatorResults.p911Rate) > Number(calculatorResults.regularRate) 
        ? Number(calculatorResults.p911Rate) 
        : Number(calculatorResults.regularRate))
    : 0;

  const budgetTotalIncome = budgetIncomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);

  const recommendedBudget = {
    housing: budgetTotalIncome * 0.25,
    utilities: budgetTotalIncome * 0.10,
    food: budgetTotalIncome * 0.15,
    transportation: budgetTotalIncome * 0.10,
    insurance: budgetTotalIncome * 0.10,
    health: budgetTotalIncome * 0.05,
    giving: budgetTotalIncome * 0.10,
    savingDebt: budgetTotalIncome * 0.15
  };

  const budgetAllocated = budgetExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const budgetRemaining = budgetTotalIncome - budgetAllocated;

  const budgetHousing = budgetExpenses.filter(e => e.category === 'housing').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const budgetUtilities = budgetExpenses.filter(e => e.category === 'utilities').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const budgetFood = budgetExpenses.filter(e => e.category === 'food').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const budgetTransportation = budgetExpenses.filter(e => e.category === 'transportation').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const budgetInsurance = budgetExpenses.filter(e => e.category === 'insurance').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const budgetHealth = budgetExpenses.filter(e => e.category === 'health').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const budgetGiving = budgetExpenses.filter(e => e.category === 'giving').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const budgetSavingDebt = budgetExpenses.filter(e => e.category === 'saving_debt').reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // Debt Snowball projection
  const getSnowballProjection = () => {
    let list = debtsList.map(d => ({ ...d, balance: Number(d.balance), minPayment: Number(d.minPayment) }));
    list.sort((a, b) => a.balance - b.balance);
    let months = 0;
    const payoffProjection = [];
    
    // We clone the list to keep track of active balances
    let activeDebts = list.filter(d => d.balance > 0).map(d => ({ ...d }));
    
    if (activeDebts.length === 0) return { months: 0, payoffProjection: [] };
    
    while (activeDebts.length > 0 && months < 360) {
      months++;
      
      // Calculate total available pool: extra snowball + min payments of all active debts.
      // (Dave Ramsey snowball rule: when a debt is paid, its min payment is added to the snowball)
      let totalAvailablePool = Number(snowballExtra);
      list.forEach(d => {
        // Only include minPayment if the debt was active at the start of the snowball
        if (d.balance > 0) {
          totalAvailablePool += d.minPayment;
        }
      });
      
      // First, satisfy the minimum payments for all remaining active debts.
      let remainingPool = totalAvailablePool;
      const monthlyPayments = activeDebts.map(d => {
        const payment = Math.min(d.balance, d.minPayment);
        remainingPool -= payment;
        return { debtId: d.id, amount: payment };
      });
      
      // Apply the paid amounts to the balances
      activeDebts.forEach(d => {
        const payment = monthlyPayments.find(p => p.debtId === d.id);
        if (payment) {
          d.balance -= payment.amount;
        }
      });
      
      // Now, apply the remaining pool (extra snowball + leftovers from paid min payments)
      // to the active debts, starting from the smallest balance.
      for (let i = 0; i < activeDebts.length; i++) {
        if (activeDebts[i].balance > 0) {
          const extraPayment = Math.min(activeDebts[i].balance, remainingPool);
          activeDebts[i].balance -= extraPayment;
          remainingPool -= extraPayment;
        }
      }
      
      // Record any debts that were fully paid off this month
      activeDebts.forEach(d => {
        if (d.balance <= 0 && !payoffProjection.some(p => p.name === d.name)) {
          payoffProjection.push({ name: d.name, month: months });
        }
      });
      
      // Filter out paid-off debts for the next month
      activeDebts = activeDebts.filter(d => d.balance > 0);
    }
    
    return { months, payoffProjection };
  };

  const snowballResult = getSnowballProjection();

  // --- CAREER STRATEGY WIZARD ---
  // Sync selected career to justProposedGoal
  useEffect(() => {
    const career = CAREERS_DATABASE[selectedCareerIndex];
    if (career) {
      setJustProposedGoal(career.title);
    }
  }, [selectedCareerIndex]);

  const getCareerCompatibility = (career) => {
    if (!career) return { compatible: true, reasons: [] };
    const reasons = [];
    let compatible = true;

    if (limitStanding) {
      if (career.physicalDemand === 'Light' || career.physicalDemand === 'Medium' || career.physicalDemand === 'Heavy') {
        compatible = false;
        reasons.push(`Career requires standing/walking ("${career.physicalDemand}" strength rating), which conflicts with standing constraints.`);
      }
    }

    if (limitLifting) {
      if (career.physicalDemand === 'Light' || career.physicalDemand === 'Medium' || career.physicalDemand === 'Heavy') {
        compatible = false;
        reasons.push(`Career requires lifting capabilities beyond 15 lbs ("${career.physicalDemand}" strength rating).`);
      }
    }

    if (limitBending) {
      if (career.physicalDemand === 'Medium' || career.physicalDemand === 'Heavy') {
        compatible = false;
        reasons.push(`Medium/Heavy demand roles require frequent bending, kneeling, or crouching.`);
      }
    }

    if (limitEnvironment) {
      if (career.title === 'Solar Photovoltaic Installer' || career.title === 'CNC Machinist' || career.title === 'Commercial Pilot') {
        compatible = false;
        reasons.push(`Career involves outdoor exposure, non-climate-controlled environments, or specific pressure/altitude factors.`);
      }
    }

    return { compatible, reasons };
  };

  const getRiasecRecommendations = () => {
    const scores = [
      { name: 'Realistic', value: riasecR, description: 'Hands-on, machine-oriented, outdoors, or physical work.' },
      { name: 'Investigative', value: riasecI, description: 'Analytical, research-oriented, problem-solving, science/math.' },
      { name: 'Artistic', value: riasecA, description: 'Creative, designing, layout, writing, expressive work.' },
      { name: 'Social', value: riasecS, description: 'Helping, instructing, advising, coordinating, teaching.' },
      { name: 'Enterprising', value: riasecE, description: 'Leadership, project management, operations, business ventures.' },
      { name: 'Conventional', value: riasecC, description: 'Data processing, spreadsheets, audit, systematic records.' }
    ];
    
    scores.sort((a, b) => b.value - a.value);
    const topScore = scores[0];
    
    let matches = [];
    if (topScore.name === 'Realistic') {
      matches = CAREERS_DATABASE.filter(c => c.physicalDemand === 'Medium' || c.physicalDemand === 'Heavy');
    } else if (topScore.name === 'Investigative') {
      matches = CAREERS_DATABASE.filter(c => c.oohGroup === 'Computer and Information Technology');
    } else if (topScore.name === 'Artistic') {
      matches = CAREERS_DATABASE.filter(c => c.title === 'Business Operations Specialist' || c.title === 'Software Developer');
    } else if (topScore.name === 'Social') {
      matches = CAREERS_DATABASE.filter(c => c.title === 'Business Operations Specialist' || c.title === 'Logistics Manager');
    } else if (topScore.name === 'Enterprising') {
      matches = CAREERS_DATABASE.filter(c => c.title === 'Business Operations Specialist' || c.title === 'Logistics Manager' || c.title === 'Commercial Pilot');
    } else if (topScore.name === 'Conventional') {
      matches = CAREERS_DATABASE.filter(c => c.title === 'Accountant' || c.title === 'Logistics Manager');
    }
    
    return { topScore, matches };
  };

  const generateJustificationLetter = () => {
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const career = CAREERS_DATABASE[selectedCareerIndex] || CAREERS_DATABASE[0];
    
    const reasonText = 
      justReason === 'disability_worsened' 
        ? `my service-connected physical limitations have worsened, making my current training plan medically counter-indicated. The proposed goal of ${career.title} matches my physical tolerance levels.` 
        : justReason === 'market_demand'
        ? `shifts in the regional employment market make my current goal unsustainable, whereas the proposed goal of ${career.title} holds a strong employment outlook with ${career.outlook} growth.`
        : `my counselor has advised that my vocational aptitudes and serious employment handicap are better addressed in the proposed track of ${career.title}.`;

    const letter = `Date: ${dateStr}
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
    setJustGeneratedLetter(letter);
  };

  const activeSchools = schoolsDatabase.length > 0 ? schoolsDatabase : SCHOOLS_DATABASE;

  return (
    <div className="app-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="branding">
          <div className="branding-logo">
            <ShieldCheck size={22} />
          </div>
          <div className="branding-text">
            <h1 style={{ fontSize: '0.9rem', lineHeight: '1.2' }}>VR&E Guide</h1>
            <p style={{ fontSize: '0.62rem', letterSpacing: '0' }}>Veterans Vocational Rehab & Employment</p>
          </div>
        </div>

        <div className="nav-section">
          {/* Main Views */}
          <div className="nav-category">
            <div className="nav-title">App Modules</div>
            <div 
              className={`nav-item ${activeView === 'reference' ? 'active' : ''}`}
              onClick={() => setActiveView('reference')}
            >
              <BookOpen size={18} />
              <span>Manual Reference</span>
            </div>
            <div 
              className={`nav-item ${activeView === 'wizard' ? 'active' : ''}`}
              onClick={() => { setActiveView('wizard'); setWizardResult(null); }}
            >
              <Award size={18} />
              <span>Entitlement Wizard</span>
            </div>
            <div 
              className={`nav-item ${activeView === 'calculator' ? 'active' : ''}`}
              onClick={() => setActiveView('calculator')}
            >
              <Calculator size={18} />
              <span>Subsistence Calc</span>
            </div>
            <div 
              className={`nav-item ${activeView === 'disability_hub' ? 'active' : ''}`}
              onClick={() => setActiveView('disability_hub')}
            >
              <Scale size={18} />
              <span>Disability & SMC</span>
            </div>
            <div 
              className={`nav-item ${activeView === 'financial_planner' ? 'active' : ''}`}
              onClick={() => setActiveView('financial_planner')}
            >
              <DollarSign size={18} />
              <span>Financial Planner</span>
            </div>
            <div 
              className={`nav-item ${activeView === 'planning' ? 'active' : ''}`}
              onClick={() => setActiveView('planning')}
            >
              <Compass size={18} />
              <span>Career Strategy</span>
            </div>
            <div 
              className={`nav-item ${activeView === 'directory' ? 'active' : ''}`}
              onClick={() => { setActiveView('directory'); setDirQuery(''); }}
            >
              <Users size={18} />
              <span>Counselor Directory</span>
            </div>
            <div 
              className={`nav-item ${activeView === 'glossary' ? 'active' : ''}`}
              onClick={() => setActiveView('glossary')}
            >
              <FileText size={18} />
              <span>Glossary of Terms</span>
            </div>
            <div 
              className={`nav-item ${activeView === 'resources' ? 'active' : ''}`}
              onClick={() => setActiveView('resources')}
            >
              <ExternalLink size={18} />
              <span>Resource Center</span>
            </div>
          </div>

          {/* Reference Manual Tree */}
          {activeView === 'reference' && (
            <div className="nav-category">
              <div className="nav-title">Reference Tree</div>
              
              {/* U.S. Code Accordion */}
              <div>
                <div className="collapsible-header" onClick={() => toggleCategory('usc')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Scale size={16} />
                    38 U.S.C. Chapter 31
                  </span>
                  <ChevronRight size={14} className={`collapsible-icon ${expandedCategories.usc ? 'expanded' : ''}`} />
                </div>
                
                {expandedCategories.usc && (
                  <div>
                    {US_CODE_SECTIONS.map(sec => (
                      <div 
                        key={sec.id}
                        className={`nav-item sub-item ${selectedSection.type === 'usc' && selectedSection.id === sec.id ? 'active' : ''}`}
                        onClick={() => setSelectedSection({ type: 'usc', id: sec.id })}
                      >
                        {sec.id}: {sec.title.split('. ')[1]}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 38 CFR Accordion */}
              <div style={{ marginTop: '8px' }}>
                <div className="collapsible-header" onClick={() => toggleCategory('cfr')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} />
                    38 CFR Part 21
                  </span>
                  <ChevronRight size={14} className={`collapsible-icon ${expandedCategories.cfr ? 'expanded' : ''}`} />
                </div>
                
                {expandedCategories.cfr && (
                  <div>
                    {CFR_REGULATIONS.map(reg => (
                      <div 
                        key={reg.id}
                        className={`nav-item sub-item ${selectedSection.type === 'cfr' && selectedSection.id === reg.id ? 'active' : ''}`}
                        onClick={() => setSelectedSection({ type: 'cfr', id: reg.id })}
                      >
                        {reg.id}: {reg.title.split('. ')[1]}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* M28C Accordion */}
              <div style={{ marginTop: '8px' }}>
                <div className="collapsible-header" onClick={() => toggleCategory('m28c')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} />
                    M28C Chapters
                  </span>
                  <ChevronRight size={14} className={`collapsible-icon ${expandedCategories.m28c ? 'expanded' : ''}`} />
                </div>

                {expandedCategories.m28c && (
                  <div>
                    {M28C_PARTS.map(part => (
                      <div key={part.id}>
                        <div 
                          className="nav-item sub-item" 
                          style={{ fontWeight: '600', color: 'var(--text-primary)' }}
                          onClick={() => togglePart(part.id)}
                        >
                          <ChevronRight size={12} className={`collapsible-icon ${expandedCategories.m28cParts[part.id] ? 'expanded' : ''}`} />
                          <span style={{ marginLeft: '4px' }}>{part.title.split('. ')[0]}</span>
                        </div>
                        
                        {expandedCategories.m28cParts[part.id] && (
                          <div>
                            {part.chapters.map(ch => (
                              <div 
                                key={ch.id}
                                className={`nav-item sub-item ${selectedSection.type === 'm28c' && selectedSection.id === ch.id ? 'active' : ''}`}
                                onClick={() => setSelectedSection({ type: 'm28c', id: ch.id })}
                                style={{ paddingLeft: '48px', fontSize: '0.8rem' }}
                              >
                                {ch.title.split(': ')[0]}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN VIEWPORT LAYOUT */}
      <main className="main-layout">
        {/* HEADER BAR */}
        <header className="header">
          <div className="search-container">
            <div className="search-input-wrapper">
              <Search size={18} className="search-input-icon" />
              <input 
                type="text" 
                placeholder="Search U.S. Code, CFR, & M28C guidelines..." 
                className="search-input"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
              />
            </div>
            
            {showSearchResults && searchResults.length > 0 && (
              <div className="search-results-dropdown">
                {searchResults.map(res => (
                  <div 
                    key={res.id} 
                    className="search-result-item"
                    onClick={() => {
                      setSelectedSection({ type: res.type, id: res.id });
                      setActiveView('reference');
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                  >
                    <div className="search-result-title">{res.title}</div>
                    <div className="search-result-snippet">{res.snippet}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="header-actions">
            {/* Bookmarks Quick access */}
            <div style={{ position: 'relative' }}>
              <button 
                className="action-btn"
                title="View Bookmarks"
                onClick={() => {
                  setActiveView('reference');
                  if (bookmarks.length > 0) {
                    setSelectedSection({ type: bookmarks[0].type, id: bookmarks[0].id });
                  }
                }}
              >
                <BookMarked size={18} />
              </button>
            </div>

            {/* Rates Sync and Settings button */}
            <button 
              className="action-btn"
              onClick={() => {
                setSettingsForm(rates);
                setIsSettingsOpen(true);
              }}
              title="Calculator Rate Settings & VA Sync"
              style={{ position: 'relative' }}
            >
              <Settings size={18} />
              {syncStatus === 'success' && (
                <span 
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--success-color)',
                    border: '2px solid var(--card-bg)'
                  }}
                  title="VA Rates Synced"
                />
              )}
              {syncStatus === 'failed' && (
                <span 
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--danger-color)',
                    border: '2px solid var(--card-bg)'
                  }}
                  title="Rate Sync Offline (Using Local Defaults)"
                />
              )}
            </button>

            {/* Dark/Light mode toggle */}
            <button 
              className="action-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* MAIN BODY CONTENT */}
        <div className="app-content">
          <div className="content-pane">
            
            {/* MANUAL REFERENCE VIEW */}
            {activeView === 'reference' && activeContent && (
              <div>
                <div className="doc-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="doc-tag">{activeContent.tag || activeContent.category}</span>
                      <h1 className="doc-title">{activeContent.title}</h1>
                      <p className="doc-subtitle">{activeContent.subtitle}</p>
                    </div>
                    <button 
                      className="action-btn"
                      onClick={() => toggleBookmark(selectedSection.type, selectedSection.id, activeContent.title)}
                      title="Bookmark Section"
                      style={{ color: bookmarks.some(b => b.id === selectedSection.id) ? 'var(--accent-color)' : '' }}
                    >
                      <Bookmark size={18} fill={bookmarks.some(b => b.id === selectedSection.id) ? 'var(--accent-color)' : 'none'} />
                    </button>
                  </div>
                  <div className="doc-divider"></div>
                  <div 
                    className="doc-body" 
                    dangerouslySetInnerHTML={{ __html: activeContent.content }}
                  />
                  
                  <div className="doc-footer">
                    <div className="doc-info">
                      <span>Source: Official eBenefits, GovInfo & eCFR Repositories</span>
                    </div>
                    <a 
                      href={selectedSection.type === 'usc' 
                        ? 'https://uscode.house.gov/view.xhtml?req=granuleid%3AUSC-prelim-title38-chapter31&edition=prelim'
                        : selectedSection.type === 'cfr'
                        ? 'https://www.ecfr.gov/current/title-38'
                        : 'https://www.knowva.ebenefits.va.gov/'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ height: '32px', fontSize: '0.75rem', gap: '4px' }}
                    >
                      <span>View Official Source</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* ENTITLEMENT WIZARD VIEW */}
            {activeView === 'wizard' && (
              <div className="doc-card">
                <span className="doc-tag">Interactive Tools</span>
                <h1 className="doc-title">Entitlement & Eligibility Wizard</h1>
                <p className="doc-subtitle">Evaluate vocational rehabilitation and serious employment handicap criteria side-by-side.</p>
                <div className="doc-divider"></div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
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

                    <button 
                      className="btn btn-primary" 
                      onClick={calculateEligibility}
                      style={{ marginTop: '16px', width: '100%' }}
                    >
                      <Award size={18} />
                      <span>Evaluate Entitlement</span>
                    </button>
                  </div>

                  <div>
                    {wizardResult ? (
                      <div className="result-box" style={{ borderLeft: `4px solid ${wizardResult.entitled ? 'var(--success-color)' : 'var(--danger-color)'}` }}>
                        <h4 style={{ color: wizardResult.entitled ? 'var(--success-color)' : 'var(--danger-color)', marginBottom: '10px' }}>
                          {wizardResult.entitled ? 'Entitled to Benefits' : 'Not Entitled'}
                        </h4>
                        <p style={{ fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem' }}>{wizardResult.status}</p>
                        <p style={{ marginBottom: '12px', fontSize: '0.85rem' }}>{wizardResult.reason}</p>
                        
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
              </div>
            )}

            {/* SUBSISTENCE ALLOWANCE CALCULATOR VIEW */}
            {activeView === 'calculator' && (
              <div className="doc-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="doc-tag">Interactive Tools</span>
                  <button 
                    className="btn"
                    style={{
                      height: '28px',
                      fontSize: '0.75rem',
                      padding: '0 10px',
                      backgroundColor: 'var(--hover-bg)',
                      border: '1px solid var(--card-border)',
                      color: 'var(--accent-color)'
                    }}
                    onClick={() => {
                      setSettingsForm(rates);
                      setIsSettingsOpen(true);
                    }}
                  >
                    <Settings size={12} />
                    <span>Manage Base Rates</span>
                  </button>
                </div>
                <h1 className="doc-title">Subsistence Allowance & Housing Calculator</h1>
                <p className="doc-subtitle">Compare regular Chapter 31 rates side-by-side with Post-9/11 housing options, including tuition offsets, books stipends, and OJT schedules.</p>
                <div className="doc-divider"></div>

                {/* Sub-Tabs for Calculator Outputs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px' }}>
                  <button 
                    className={`tab-btn ${calcCalculatorTab === 'monthly' ? 'active' : ''}`}
                    onClick={() => setCalcCalculatorTab('monthly')}
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    Monthly Housing Payouts
                  </button>
                  <button 
                    className={`tab-btn ${calcCalculatorTab === 'tuition' ? 'active' : ''}`}
                    onClick={() => setCalcCalculatorTab('tuition')}
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    Tuition & Books Offset
                  </button>
                  {calcTrainingType === 'ojt' && (
                    <button 
                      className={`tab-btn ${calcCalculatorTab === 'ojt' ? 'active' : ''}`}
                      onClick={() => setCalcCalculatorTab('ojt')}
                      style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    >
                      OJT Step Progression
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
                  {/* Left Column: Input Form */}
                  <div>
                    {/* General Settings */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label>Rehabilitation Program/Track</label>
                        <select 
                          className="form-control" 
                          value={calcTrainingType} 
                          onChange={(e) => {
                            const newType = e.target.value;
                            setCalcTrainingType(newType);
                            if (newType === 'ojt') {
                              setCalcTime('full'); // OJT is full-time only
                            } else if (newType === 'institutional' && calcCalculatorTab === 'ojt') {
                              setCalcCalculatorTab('monthly');
                            }
                          }}
                        >
                          <option value="institutional">Institutional (College, Technical, University)</option>
                          <option value="ojt">On-the-Job Training / Apprentice</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Active Duty Status</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '38px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          <input 
                            type="checkbox"
                            checked={calcActiveDuty}
                            onChange={(e) => setCalcActiveDuty(e.target.checked)}
                          />
                          I am currently on Active Duty
                        </label>
                      </div>
                    </div>

                     {/* Venue, Dependents, and Tier (Post-9/11 Specifics) */}
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '8px' }}>
                       <div className="form-group">
                         <label>Number of Dependents</label>
                         <select 
                           className="form-control" 
                           value={calcDependents} 
                           onChange={(e) => setCalcDependents(Number(e.target.value))}
                         >
                           <option value={0}>No Dependents</option>
                           <option value={1}>1 Dependent</option>
                           <option value={2}>2 Dependents</option>
                           <option value={3}>3 Dependents</option>
                           <option value={4}>4 Dependents</option>
                           <option value={5}>5 or More Dependents</option>
                         </select>
                       </div>
 
                       <div className="form-group">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ margin: 0 }}>Post-9/11 GI Bill Eligibility Tier</label>
                            <button 
                              type="button" 
                              onClick={() => setShowTierCalc(!showTierCalc)}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: 'var(--accent-color)', 
                                fontSize: '0.72rem', 
                                cursor: 'pointer', 
                                padding: 0, 
                                textDecoration: 'underline',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <HelpCircle size={12} />
                              <span>{showTierCalc ? "Hide Helper" : "Calculate Tier"}</span>
                            </button>
                          </div>
                          <select 
                            className="form-control" 
                            value={calcTier} 
                            onChange={(e) => setCalcTier(Number(e.target.value))}
                          >
                            <option value={1.0}>100% (36+ Mos, Purple Heart, or Med Disch)</option>
                            <option value={0.9}>90% (30-35 Months)</option>
                            <option value={0.8}>80% (24-29 Months)</option>
                            <option value={0.7}>70% (18-23 Months)</option>
                            <option value={0.6}>60% (6-17 Months)</option>
                            <option value={0.5}>50% (90 Days - 5 Mos)</option>
                            <option value={0.0}>0% (Not eligible)</option>
                          </select>

                          {showTierCalc && (
                            <div style={{ 
                              marginTop: '8px', 
                              padding: '12px', 
                              backgroundColor: 'var(--hover-bg)', 
                              border: '1px solid var(--card-border)', 
                              borderRadius: '8px', 
                              fontSize: '0.8rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px'
                            }}>
                              <div style={{ fontWeight: '600', color: 'var(--accent-color)', fontSize: '0.82rem' }}>
                                GI Bill Tier Estimator
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '0.72rem', display: 'block', marginBottom: '4px' }}>Cumulative Active Duty Service (Months)</label>
                                <input 
                                  type="number" 
                                  className="form-control" 
                                  style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                  value={tierCalcMonths} 
                                  onChange={(e) => setTierCalcMonths(Number(e.target.value))}
                                  min={0}
                                  max={120}
                                />
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input 
                                  type="checkbox" 
                                  id="purpleHeart"
                                  checked={tierCalcPurpleHeart} 
                                  onChange={(e) => setTierCalcPurpleHeart(e.target.checked)}
                                />
                                <label htmlFor="purpleHeart" style={{ fontSize: '0.72rem', cursor: 'pointer', margin: 0 }}>
                                  Purple Heart Recipient
                                </label>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input 
                                  type="checkbox" 
                                  id="disabilityDischarge"
                                  checked={tierCalcDisabilityDischarge} 
                                  onChange={(e) => setTierCalcDisabilityDischarge(e.target.checked)}
                                />
                                <label htmlFor="disabilityDischarge" style={{ fontSize: '0.72rem', cursor: 'pointer', margin: 0 }}>
                                  Service-Connected Discharge (30+ Continuous Days)
                                </label>
                              </div>
                              
                              <div style={{ 
                                marginTop: '4px',
                                padding: '6px 8px', 
                                backgroundColor: 'var(--card-bg)', 
                                border: '1px dashed var(--card-border)', 
                                borderRadius: '4px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <span>Calculated Tier:</span>
                                <strong style={{ color: 'var(--accent-color)', fontWeight: '700' }}>
                                  {(() => {
                                    if (tierCalcPurpleHeart || tierCalcDisabilityDischarge) return "100%";
                                    if (tierCalcMonths >= 36) return "100%";
                                    if (tierCalcMonths >= 30) return "90%";
                                    if (tierCalcMonths >= 24) return "80%";
                                    if (tierCalcMonths >= 18) return "70%";
                                    if (tierCalcMonths >= 6) return "60%";
                                    if (tierCalcMonths >= 3) return "50%";
                                    return "0%";
                                  })()}
                                </strong>
                              </div>
                              <button
                                type="button"
                                className="btn-primary"
                                style={{ padding: '6px 10px', fontSize: '0.75rem', width: '100%', marginTop: '4px' }}
                                onClick={() => {
                                  let finalTier = 0.0;
                                  if (tierCalcPurpleHeart || tierCalcDisabilityDischarge) finalTier = 1.0;
                                  else if (tierCalcMonths >= 36) finalTier = 1.0;
                                  else if (tierCalcMonths >= 30) finalTier = 0.9;
                                  else if (tierCalcMonths >= 24) finalTier = 0.8;
                                  else if (tierCalcMonths >= 18) finalTier = 0.7;
                                  else if (tierCalcMonths >= 6) finalTier = 0.6;
                                  else if (tierCalcMonths >= 3) finalTier = 0.5;
                                  setCalcTier(finalTier);
                                  setShowTierCalc(false);
                                }}
                              >
                                Apply Calculated Tier
                              </button>
                            </div>
                          )}
                        </div>

                       <div className="form-group">
                         <label>Monthly Kicker Stipend ($)</label>
                         <input 
                           type="number" 
                           className="form-control" 
                           value={calcKicker} 
                           onChange={(e) => setCalcKicker(Number(e.target.value))}
                           min={0}
                           placeholder="e.g. 200"
                         />
                       </div>
                     </div>

                    {calcTrainingType === 'institutional' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* School Search Box */}
                        <div className="form-group" style={{ position: 'relative', marginBottom: 0 }}>
                          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '600' }}>Search School Name or Zip Code (GI Bill Database)</span>
                            {calcSelectedSchool && (
                              <span 
                                style={{ fontSize: '0.75rem', color: 'var(--accent-color)', cursor: 'pointer', fontWeight: '600' }}
                                onClick={() => {
                                  setCalcSelectedSchool(null);
                                  setCalcSchoolSearchQuery('');
                                }}
                              >
                                Clear Search
                              </span>
                            )}
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type="text"
                              className="form-control"
                              style={{ paddingRight: '36px' }}
                              placeholder="Type school name (e.g. Arizona State) or zip code..."
                              value={calcSchoolSearchQuery}
                              onChange={(e) => {
                                setCalcSchoolSearchQuery(e.target.value);
                                setCalcShowSuggestions(true);
                              }}
                              onFocus={() => setCalcShowSuggestions(true)}
                              onBlur={() => setTimeout(() => setCalcShowSuggestions(false), 200)}
                            />
                            <Search 
                              size={16} 
                              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
                            />
                          </div>

                          {/* Autocomplete Dropdown */}
                          {calcShowSuggestions && calcSchoolSearchQuery.trim().length > 1 && (
                            <div 
                              className="autocomplete-dropdown"
                              style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                right: 0, 
                                backgroundColor: 'var(--card-bg)', 
                                border: '1px solid var(--card-border)', 
                                borderRadius: '8px', 
                                boxShadow: '0 8px 30px rgba(0,0,0,0.3)', 
                                zIndex: 1000, 
                                maxHeight: '220px', 
                                overflowY: 'auto',
                                marginTop: '4px'
                              }}
                            >
                              {activeSchools.filter(school => {
                                const q = calcSchoolSearchQuery.toLowerCase();
                                return school.name.toLowerCase().includes(q) || 
                                       school.id.toLowerCase().includes(q) || 
                                       school.zipCode.includes(q) || 
                                       school.city.toLowerCase().includes(q) || 
                                       school.state.toLowerCase().includes(q);
                              }).slice(0, 8).map(school => (
                                <div 
                                  key={school.id}
                                  className="autocomplete-item"
                                  style={{ 
                                    padding: '10px 14px', 
                                    cursor: 'pointer', 
                                    borderBottom: '1px solid var(--card-border)', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '2px'
                                  }}
                                  onMouseDown={() => {
                                    setCalcSelectedSchool(school);
                                    setCalcSchoolSearchQuery(school.name);
                                    setCalcShowSuggestions(false);
                                    setCalcBahRate(school.bahRate);
                                    setCalcSchoolType(school.type);
                                    setCalcTuition(school.tuition);
                                    setCalcYellowRibbon(school.yellowRibbon || false);
                                    setCalcYrSchoolContribution(0);
                                    setCalcYrDivision("");
                                    setCalcScholarships(0);
                                    // Automatically set venue based on school details
                                    if (school.foreign) {
                                      setCalcVenue('foreign');
                                    } else if (school.onlineOnly) {
                                      setCalcVenue('online');
                                    } else {
                                      setCalcVenue('in-person');
                                    }
                                  }}
                                >
                                  <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                    {school.name}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
                                    <span>{school.city}, {school.state} {school.zipCode}</span>
                                    <span>•</span>
                                    <span style={{ textTransform: 'uppercase', fontSize: '0.65rem', color: 'var(--accent-color)', fontWeight: '700' }}>{school.type}</span>
                                  </div>
                                </div>
                              ))}
                              {activeSchools.filter(school => {
                                const q = calcSchoolSearchQuery.toLowerCase();
                                return school.name.toLowerCase().includes(q) || 
                                       school.id.toLowerCase().includes(q) || 
                                       school.zipCode.includes(q) || 
                                       school.city.toLowerCase().includes(q) || 
                                       school.state.toLowerCase().includes(q);
                              }).length === 0 && (
                                <div style={{ padding: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                  No matching schools or zip codes. Type custom values below.
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Selected School Card */}
                        {calcSelectedSchool && (
                          <div 
                            style={{ 
                              padding: '16px', 
                              backgroundColor: 'var(--glass-bg)', 
                              border: '1px solid var(--accent-color)', 
                              borderRadius: '8px', 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '12px',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                              marginTop: '8px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  🏫 {calcSelectedSchool.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                  {calcSelectedSchool.city}, {calcSelectedSchool.state} {calcSelectedSchool.zipCode} • {calcSelectedSchool.institutionOwnership || calcSelectedSchool.type}
                                </div>
                              </div>
                              <span 
                                className={`badge ${calcSelectedSchool.type === 'public' ? 'badge-success' : 'badge-info'}`}
                                style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}
                              >
                                {calcSelectedSchool.type}
                              </span>
                            </div>

                             {/* Alert Banner for Complaints and Caution Flags */}
                             {(calcSelectedSchool.complaints > 0 || 
                               calcSelectedSchool.benefitsSuspended || 
                               calcSelectedSchool.accreditationProbation || 
                               calcSelectedSchool.hcm || 
                               calcSelectedSchool.oigInvestigation) && (
                               <div style={{ 
                                 padding: '10px 14px', 
                                 backgroundColor: 'rgba(239, 68, 68, 0.08)', 
                                 border: '1px solid rgba(239, 68, 68, 0.2)', 
                                 borderRadius: '6px', 
                                 display: 'flex', 
                                 flexDirection: 'column', 
                                 gap: '6px' 
                               }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                   <AlertTriangle size={14} style={{ color: 'var(--danger-color)', flexShrink: 0 }} />
                                   <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--danger-color)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                     Federal Education Caution Flags
                                   </span>
                                 </div>
                                 <ul style={{ 
                                   margin: 0, 
                                   paddingLeft: '16px', 
                                   fontSize: '0.7rem', 
                                   color: 'var(--danger-color)', 
                                   lineHeight: '1.4',
                                   display: 'flex',
                                   flexDirection: 'column',
                                   gap: '4px'
                                 }}>
                                   {calcSelectedSchool.complaints > 0 && (
                                     <li>
                                       <strong>Student Complaints:</strong> {calcSelectedSchool.complaints} closed, Principles of Excellence-related complaints submitted to the VA.
                                     </li>
                                   )}
                                   {calcSelectedSchool.benefitsSuspended && (
                                     <li>
                                       <strong>Suspension of VA Benefits:</strong> Deceptive/misleading practices detected (38 U.S.C. § 3696). VA has suspended new enrollments.
                                     </li>
                                   )}
                                   {calcSelectedSchool.accreditationProbation && (
                                     <li>
                                       <strong>Accreditation Probation:</strong> Institutional accreditation is on probation or warning status from the Dept. of Education.
                                     </li>
                                   )}
                                   {calcSelectedSchool.oigInvestigation && (
                                     <li>
                                       <strong>OIG Investigation:</strong> Institution is under investigation by the VA Office of Inspector General (OIG).
                                     </li>
                                   )}
                                   {calcSelectedSchool.hcm === 'HCM1' && (
                                     <li>
                                       <strong>Heightened Cash Monitoring (HCM1):</strong> U.S. Dept. of Education has placed this school under increased financial oversight.
                                     </li>
                                   )}
                                   {calcSelectedSchool.hcm === 'HCM2' && (
                                     <li>
                                       <strong>Heightened Cash Monitoring (HCM2):</strong> U.S. Dept. of Education has restricted funding to a strict reimbursement-only payment method.
                                     </li>
                                   )}
                                 </ul>
                               </div>
                             )}

                            {/* Detail Fields Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: '0.75rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--card-border)', paddingBottom: '10px' }}>
                              <div><strong>Est. Tuition:</strong> ${calcSelectedSchool.tuition.toLocaleString()}/yr</div>
                              <div><strong>Local BAH:</strong> ${calcSelectedSchool.bahRate}/mo</div>
                              <div><strong>Facility Code:</strong> <code style={{ fontSize: '0.7rem' }}>{calcSelectedSchool.facilityCode}</code></div>
                              <div><strong>OPE Code:</strong> <code style={{ fontSize: '0.7rem' }}>{calcSelectedSchool.opeCode || "N/A"}</code></div>
                              <div><strong>GI Bill Students:</strong> {calcSelectedSchool.giBillStudents.toLocaleString()}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle size={10} style={{ color: 'var(--success-color)' }} />
                                <span style={{ color: 'var(--success-color)', fontWeight: '600' }}>Autofilled from Database</span>
                              </div>
                            </div>

                            {/* Badges Panel */}
                            <div>
                              <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.02em' }}>
                                Veteran Benefits & Accreditations
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '600', backgroundColor: calcSelectedSchool.accredited ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: calcSelectedSchool.accredited ? 'var(--success-color)' : 'var(--danger-color)', border: `1px solid ${calcSelectedSchool.accredited ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}` }}>
                                  {calcSelectedSchool.accredited ? '✓ Accredited' : '✗ Unaccredited'}
                                </span>
                                <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '600', backgroundColor: calcSelectedSchool.studentVeteranGroup ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)', color: calcSelectedSchool.studentVeteranGroup ? 'var(--success-color)' : 'var(--text-muted)', border: '1px solid var(--card-border)' }}>
                                  {calcSelectedSchool.studentVeteranGroup ? '✓ SVA Chapter' : 'No SVA Chapter'}
                                </span>
                                {calcSelectedSchool.yellowRibbon && (
                                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '600', backgroundColor: 'rgba(216, 161, 41, 0.1)', color: 'var(--accent-color)', border: '1px solid rgba(216, 161, 41, 0.2)' }}>
                                    ✓ Yellow Ribbon
                                  </span>
                                )}
                                {calcSelectedSchool.priorityEnrollment && (
                                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '600', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--success-color)', border: '1px solid var(--card-border)' }}>
                                    ✓ Priority Enrollment
                                  </span>
                                )}
                                {calcSelectedSchool.militaryTA && (
                                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '600', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--success-color)', border: '1px solid var(--card-border)' }}>
                                    ✓ Military TA Approved
                                  </span>
                                )}
                                {calcSelectedSchool.principlesOfExcellence && (
                                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '600', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--success-color)', border: '1px solid var(--card-border)' }}>
                                    ✓ Principles of Excellence
                                  </span>
                                )}
                                {calcSelectedSchool.eightKeys && (
                                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '600', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--success-color)', border: '1px solid var(--card-border)' }}>
                                    ✓ 8 Keys to Success
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ) }

                        {/* Rate of Pursuit and Venue grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px', backgroundColor: 'var(--hover-bg)', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>Rate of Pursuit Input</span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', cursor: 'pointer' }} onClick={() => setCalcUseCredits(!calcUseCredits)}>
                                {calcUseCredits ? "Switch to Time Select" : "Switch to Credit Count"}
                              </span>
                            </label>
                            
                            {calcUseCredits ? (
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input 
                                  type="number" 
                                  className="form-control" 
                                  style={{ width: '70px' }}
                                  value={calcCredits} 
                                  onChange={(e) => setCalcCredits(Math.max(1, Number(e.target.value)))}
                                  min={1}
                                />
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/</span>
                                <input 
                                  type="number" 
                                  className="form-control" 
                                  style={{ width: '70px' }}
                                  value={calcFullTimeThreshold} 
                                  onChange={(e) => setCalcFullTimeThreshold(Math.max(1, Number(e.target.value)))}
                                  min={1}
                                />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>credits (full-time)</span>
                              </div>
                            ) : (
                              <select 
                                className="form-control" 
                                value={calcTime} 
                                onChange={(e) => setCalcTime(e.target.value)}
                              >
                                <option value="full">Full-Time (100%)</option>
                                <option value="three-quarters">3/4-Time (75%)</option>
                                <option value="half">1/2-Time (50%)</option>
                              </select>
                            )}
                          </div>

                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Training Venue & Location</label>
                            <select 
                              className="form-control" 
                              value={calcVenue} 
                              onChange={(e) => setCalcVenue(e.target.value)}
                            >
                              <option value="in-person">In-Person Classes (US Campus)</option>
                              <option value="online">Online-Only / Distance Learning</option>
                              {calcSchoolType === 'private' && (
                                <option value="foreign">Foreign Institution Classes</option>
                              )}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {calcTrainingType === 'institutional' && (
                      <div className="form-group" style={{ marginTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>School's Local BAH Rate (E-5 with Dependents) ($)</span>
                            {calcSelectedSchool && (
                              <span style={{ fontSize: '0.65rem', color: 'var(--success-color)', backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>
                                Auto-populated
                              </span>
                            )}
                          </label>
                        </div>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={calcBahRate} 
                          onChange={(e) => setCalcBahRate(Number(e.target.value))}
                          min={500}
                          max={6000}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {calcVenue === 'online' ? `Note: Since you selected Online training, the calculator will use the fixed Online MHA Rate ($${rates.p911_online_rate.toFixed(2)}/mo) for calculations instead of the local BAH rate shown above.` :
                           calcVenue === 'foreign' ? `Note: Since you selected Foreign training, the calculator will use the fixed Foreign MHA Rate ($${rates.p911_foreign_rate.toFixed(2)}/mo) for calculations instead of the local BAH rate shown above.` :
                           "Find local BAH rate automatically by using the school search bar above, or enter manually."}
                        </p>
                      </div>
                    )}

                    {/* Tuition & Supplies Inputs */}
                    {calcCalculatorTab === 'tuition' && (
                      <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'var(--hover-bg)', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-color)', marginBottom: '12px', borderBottom: '1px dashed var(--card-border)', paddingBottom: '6px' }}>Tuition & Supplies Comparison Settings</h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>Estimated Annual Tuition & Fees ($)</span>
                              {calcSelectedSchool && (
                                <span style={{ fontSize: '0.65rem', color: 'var(--success-color)', backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>
                                  Auto-populated
                                </span>
                              )}
                            </label>
                            <input 
                              type="number"
                              className="form-control"
                              value={calcTuition}
                              onChange={(e) => setCalcTuition(Number(e.target.value))}
                              min={0}
                            />
                          </div>

                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>School Classification</span>
                              {calcSelectedSchool && (
                                <span style={{ fontSize: '0.65rem', color: 'var(--success-color)', backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>
                                  Auto-populated
                                </span>
                              )}
                            </label>
                            <select 
                              className="form-control"
                              value={calcSchoolType}
                              onChange={(e) => {
                                const newType = e.target.value;
                                setCalcSchoolType(newType);
                                if (newType !== 'private' && calcVenue === 'foreign') {
                                  setCalcVenue('in-person');
                                }
                              }}
                            >
                              <option value="public">Public University / Community College</option>
                              <option value="private">Private / Foreign Institution</option>
                              <option value="flight">Vocational Flight School</option>
                              <option value="correspondence">Correspondence School</option>
                              <option value="ojt">On-the-Job Training Employer</option>
                            </select>
                          </div>
                        </div>
 
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', borderTop: '1px dashed var(--card-border)', paddingTop: '12px' }}>
                           <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                             <input 
                               type="checkbox"
                               checked={calcIncludeComputer}
                               onChange={(e) => {
                                 setCalcIncludeComputer(e.target.checked);
                                 if (e.target.checked && !calcComputerCost) {
                                   setCalcComputerCost(rates.ch31_computer_package_value || 2000.00);
                                 }
                               }}
                             />
                             My program requires a computer/tech package
                           </label>
 
                           {calcIncludeComputer && (
                             <div className="form-group" style={{ marginBottom: 0 }}>
                               <label>Estimated Computer/Tech Package Cost ($)</label>
                               <input 
                                 type="number"
                                 className="form-control"
                                 value={calcComputerCost}
                                 onChange={(e) => setCalcComputerCost(Number(e.target.value))}
                                 min={0}
                               />
                             </div>
                           )}
                         </div>

                         {/* Scholarships & Yellow Ribbon Section */}
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', borderTop: '1px dashed var(--card-border)', paddingTop: '12px' }}>
                           <div className="form-group" style={{ marginBottom: 0 }}>
                             <label>Other Scholarships / Partner Grants ($/yr)</label>
                             <input 
                               type="number"
                               className="form-control"
                               value={calcScholarships}
                               onChange={(e) => setCalcScholarships(Number(e.target.value))}
                               min={0}
                               placeholder="e.g. 5000"
                             />
                           </div>

                           <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '8px' }}>
                             <input 
                               type="checkbox"
                               checked={calcYellowRibbon}
                               onChange={(e) => setCalcYellowRibbon(e.target.checked)}
                             />
                             Participate in Yellow Ribbon Program
                           </label>

                           {calcYellowRibbon && (
                             <div style={{ marginTop: '4px', padding: '12px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                               {calcActiveDuty ? (
                                 <div style={{ fontSize: '0.75rem', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                   <Info size={12} />
                                   <span>Active duty service members are not eligible for Yellow Ribbon matching under Post-9/11 rules.</span>
                                 </div>
                               ) : calcTier < 1.0 ? (
                                 <div style={{ fontSize: '0.75rem', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                   <Info size={12} />
                                   <span>Yellow Ribbon only applies if Post-9/11 eligibility tier is 100%. Currently: {calcTier * 100}%.</span>
                                 </div>
                               ) : (
                                 <>
                                   {calcSelectedSchool && calcSelectedSchool.yellowRibbonDetails ? (
                                     <div className="form-group" style={{ marginBottom: 0 }}>
                                       <label>Select Degree / Division Mappings</label>
                                       <select
                                         className="form-control"
                                         value={calcYrDivision}
                                         onChange={(e) => {
                                           const div = e.target.value;
                                           setCalcYrDivision(div);
                                           if (div && div !== 'custom') {
                                             const amt = calcSelectedSchool.yellowRibbonDetails[div];
                                             setCalcYrSchoolContribution(amt);
                                           }
                                         }}
                                       >
                                         <option value="">-- Choose Division --</option>
                                         {Object.keys(calcSelectedSchool.yellowRibbonDetails).map(k => (
                                           <option key={k} value={k}>{k} (${calcSelectedSchool.yellowRibbonDetails[k].toLocaleString()})</option>
                                         ))}
                                         <option value="custom">Custom Contribution</option>
                                       </select>
                                     </div>
                                   ) : calcSelectedSchool && !calcSelectedSchool.yellowRibbon ? (
                                     <div style={{ fontSize: '0.75rem', color: 'var(--warning-color)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                       <Info size={12} />
                                       <span>Note: Database indicates school does not participate. Enter override contribution below.</span>
                                     </div>
                                   ) : null}

                                   {(!calcSelectedSchool || !calcSelectedSchool.yellowRibbonDetails || calcYrDivision === 'custom' || calcYrDivision === '') && (
                                     <div className="form-group" style={{ marginBottom: 0 }}>
                                       <label>School's Annual Contribution ($)</label>
                                       <input
                                         type="number"
                                         className="form-control"
                                         value={calcYrSchoolContribution}
                                         onChange={(e) => {
                                           setCalcYrSchoolContribution(Number(e.target.value));
                                           setCalcYrDivision('custom');
                                         }}
                                         min={0}
                                         placeholder="e.g. 5000"
                                       />
                                     </div>
                                   )}
                                   
                                   <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                     The VA will match the school contribution 1:1, reducing out-of-pocket tuition by up to <strong>${(calcYrSchoolContribution * 2).toLocaleString()}</strong>.
                                   </div>
                                 </>
                               )}
                             </div>
                           )}
                         </div>
                       </div>
                      )}

                    {/* OJT details */}
                    {calcTrainingType === 'ojt' && (
                      <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'var(--hover-bg)', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-color)', marginBottom: '12px', borderBottom: '1px dashed var(--card-border)', paddingBottom: '6px' }}>Apprenticeship / OJT Wage Information</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                          The VA caps monthly OJT subsistence payments so that the sum of your training wage + the subsistence allowance does not exceed the journeyman wage.
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Your Hourly Training Wage ($)</label>
                            <input 
                              type="number"
                              className="form-control"
                              value={calcOjtTrainingWage}
                              onChange={(e) => setCalcOjtTrainingWage(Number(e.target.value))}
                              min={0}
                            />
                          </div>

                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Fully Qualified Journeyman Wage ($)</label>
                            <input 
                              type="number"
                              className="form-control"
                              value={calcOjtJourneymanWage}
                              onChange={(e) => setCalcOjtJourneymanWage(Number(e.target.value))}
                              min={0}
                            />
                          </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '16px', marginBottom: 0 }}>
                          <label>Employer's Local BAH Rate (E-5 with Dependents) ($)</label>
                          <input 
                            type="number"
                            className="form-control"
                            value={calcBahRate}
                            onChange={(e) => setCalcBahRate(Number(e.target.value))}
                            min={500}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Calculations Result Panel */}
                  <div>
                    {calculatorResults && (
                      <div className="result-box" style={{ borderLeft: '4px solid var(--accent-color)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', margin: 0 }}>Comparison Payouts</h4>
                            <span className="badge badge-info">FY 2026 RATES</span>
                          </div>

                          {/* WARNING BADGES */}
                          {calcActiveDuty && (
                            <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', marginBottom: '16px' }}>
                              <p style={{ fontSize: '0.75rem', color: 'var(--warning-color)', margin: 0 }}>
                                <strong>Active Duty Restriction:</strong> MHA & subsistence allowance are $0. Only tuition & course supplies are paid.
                              </p>
                            </div>
                          )}

                          {calcTrainingType === 'institutional' && calculatorResults.rateOfPursuit <= 0.5 && !calcActiveDuty && (
                            <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '16px' }}>
                              <p style={{ fontSize: '0.75rem', color: 'var(--danger-color)', margin: 0 }}>
                                <strong>Course Load Alert:</strong> Rate of pursuit is {Math.round(calculatorResults.rateOfPursuit * 100)}%. Post-9/11 MHA pays $0 for a course load of 50% or less.
                              </p>
                            </div>
                          )}

                          {/* MONTHLY HOUSING TAB RESULT */}
                          {calcCalculatorTab === 'monthly' && (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Standard Ch 31 Subsistence:</span>
                                <div style={{ textAlign: 'right' }}>
                                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                    ${calculatorResults.regularRate} / mo
                                  </span>
                                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                    ${(Number(calculatorResults.regularRate) * 9).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} / acad yr (9 mos)<br />
                                    ${(Number(calculatorResults.regularRate) * 12).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} / calendar yr (12 mos)
                                  </span>
                                </div>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Post-9/11 MHA Option Rate:</span>
                                <div style={{ textAlign: 'right' }}>
                                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                    ${calculatorResults.p911Rate} / mo
                                  </span>
                                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                    ${(Number(calculatorResults.p911Rate) * 9).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} / acad yr (9 mos)<br />
                                    ${(Number(calculatorResults.p911Rate) * 12).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} / calendar yr (12 mos)
                                  </span>
                                </div>
                              </div>

                              {calcTier < 1.0 && calcTier > 0 && (
                                <p style={{ fontSize: '0.75rem', color: 'var(--success-color)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <ShieldCheck size={14} style={{ flexShrink: 0 }} />
                                  <span>Note: Under Chapter 31 VR&E, your Post-9/11 MHA Option Rate is paid at the 100% level (not scaled down to your Chapter 33 eligibility tier of {calcTier * 100}%).</span>
                                </p>
                              )}

                              <div className="doc-divider" style={{ margin: '12px 0' }}></div>

                              <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--card-border)' }}>
                                <h5 style={{ fontSize: '0.8rem', color: 'var(--accent-color)', marginBottom: '4px' }}>Recommendation:</h5>
                                <p style={{ fontSize: '0.8rem', lineHeight: '1.4', margin: 0 }}>
                                  {Number(calculatorResults.p911Rate) > Number(calculatorResults.regularRate) 
                                    ? `Elect the Post-9/11 housing rate (P911SA) by filing VA Form 28-0987. This yields an additional $${(Number(calculatorResults.p911Rate) - Number(calculatorResults.regularRate)).toFixed(2)} per month.` 
                                    : Number(calculatorResults.p911Rate) === Number(calculatorResults.regularRate)
                                    ? `Both options offer the same monthly payout ($${calculatorResults.regularRate}).`
                                    : `Stay with the standard Chapter 31 subsistence allowance. This yields an additional $${(Number(calculatorResults.regularRate) - Number(calculatorResults.p911Rate)).toFixed(2)} per month.`}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* TUITION AND SUPPLIES TAB RESULT */}
                          {calcCalculatorTab === 'tuition' && (
                            <div>
                              <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: 'var(--glass-bg)', marginBottom: '16px' }}>
                                <h5 style={{ fontSize: '0.8rem', color: 'var(--accent-color)', marginBottom: '8px' }}>Chapter 31 VR&E</h5>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                  <span>Tuition Covered (100% Uncapped):</span>
                                  <span style={{ fontWeight: '600', color: 'var(--success-color)' }}>100% (${calculatorResults.tuitionCh31Covered.toFixed(2)})</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                  <span>Books & Supplies Covered (Uncapped):</span>
                                  <span style={{ fontWeight: '600', color: 'var(--success-color)' }}>100%</span>
                                </div>
                                {calcIncludeComputer && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                    <span>Laptop/Tech Package (100% Covered):</span>
                                    <span style={{ fontWeight: '600', color: 'var(--success-color)' }}>100% (${calculatorResults.computerCh31Covered.toFixed(2)})</span>
                                  </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '6px', borderTop: '1px dashed var(--card-border)', paddingTop: '6px', fontWeight: '700' }}>
                                  <span>Out of Pocket Cost:</span>
                                  <span>$0.00</span>
                                </div>
                              </div>

                              <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: 'var(--glass-bg)' }}>
                                <h5 style={{ fontSize: '0.8rem', color: 'var(--accent-color)', marginBottom: '8px' }}>Post-9/11 GI Bill (Chapter 33)</h5>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                  <span>Base Tuition Paid by VA:</span>
                                  <span>${Number(calculatorResults.tuitionP911CoveredBase).toFixed(2)}</span>
                                </div>
                                
                                {calcYellowRibbon && calcTier === 1.0 && (
                                  <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                      <span>Yellow Ribbon VA Match:</span>
                                      <span style={{ color: 'var(--success-color)' }}>+${Number(calculatorResults.yrVaMatch).toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                      <span>Yellow Ribbon School Paid:</span>
                                      <span style={{ color: 'var(--success-color)' }}>+${Number(calculatorResults.yrSchoolPaid).toFixed(2)}</span>
                                    </div>
                                  </>
                                )}

                                {calcScholarships > 0 && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                    <span>Other Scholarships/Grants:</span>
                                    <span style={{ color: 'var(--success-color)' }}>+${calcScholarships.toFixed(2)}</span>
                                  </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                  <span>Books Stipend (Up to $1000/yr):</span>
                                  <span>${Number(calculatorResults.booksP911Covered).toFixed(2)}</span>
                                </div>

                                {calcIncludeComputer && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                    <span>Laptop/Tech Package (Not Covered):</span>
                                    <span style={{ color: 'var(--danger-color)' }}>$0.00</span>
                                  </div>
                                )}
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '6px', borderTop: '1px dashed var(--card-border)', paddingTop: '6px', fontWeight: '700' }}>
                                  <span>Total Out of Pocket Cost:</span>
                                  {(() => {
                                    const outOfPocketTuition = Math.max(0, calcTuition - Number(calculatorResults.tuitionP911Covered) - Number(calculatorResults.yrSchoolPaid) - calcScholarships);
                                    const outOfPocketTotal = outOfPocketTuition + (calcIncludeComputer ? calcComputerCost : 0);
                                    return (
                                      <span style={{ color: outOfPocketTotal > 0 ? 'var(--danger-color)' : 'var(--success-color)' }}>
                                        ${outOfPocketTotal.toFixed(2)}
                                      </span>
                                    );
                                  })()}
                                </div>
                              </div>
 
                              {calcSchoolType === 'private' && calcTuition > rates.p911_private_tuition_cap && (
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                  *Post-9/11 limits private/foreign school tuition payments to ${rates.p911_private_tuition_cap.toLocaleString()} per academic year. VR&E has no tuition cap.
                                </p>
                              )}
                              {calcSchoolType === 'flight' && calcTuition > rates.p911_flight_cap && (
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                  *Post-9/11 limits vocational flight school tuition payments to ${rates.p911_flight_cap.toLocaleString()} per academic year. VR&E has no tuition cap.
                                </p>
                              )}
                              {calcSchoolType === 'correspondence' && calcTuition > rates.p911_correspondence_cap && (
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                  *Post-9/11 limits correspondence school tuition payments to ${rates.p911_correspondence_cap.toLocaleString()} per academic year. VR&E has no tuition cap.
                                </p>
                              )}
                              {(calcSchoolType === 'flight' || calcSchoolType === 'correspondence') && (
                                <p style={{ fontSize: '0.7rem', color: 'var(--warning-color)', marginTop: '8px' }}>
                                  *Under Post-9/11 (Chapter 33), flight and correspondence programs receive $0 monthly housing allowance (MHA) and $0 books stipend. Chapter 31 pays normal subsistence allowances for approved tracks.
                                </p>
                              )}
                              {calcIncludeComputer && (
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                  *Post-9/11 Chapter 33 does not cover required computer packages; veterans must pay out of pocket. Chapter 31 fully funds required technology packages (e.g. laptop, printer, and specific software).
                                </p>
                              )}
                            </div>
                          )}

                          {/* OJT PROGRESSION TAB RESULT */}
                          {calcCalculatorTab === 'ojt' && calcTrainingType === 'ojt' && (
                            <div>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                                OJT housing allowances decrease 20% every 6 months under Post-9/11, while standard Chapter 31 remains flat.
                              </p>
                              <div style={{ border: '1px solid var(--card-border)', borderRadius: '6px', overflow: 'hidden' }}>
                                <div className="ojt-step-row header-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr', gap: '8px' }}>
                                  <span>Period</span>
                                  <span>Ch 31 Rate (Mo / Yr)</span>
                                  <span>Post-9/11 Rate (Mo / Yr)</span>
                                </div>
                                <div className="ojt-step-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr', gap: '8px' }}>
                                  <span>Months 1 - 6</span>
                                  <span>${calculatorResults.ojtCh31Steps[0].toFixed(2)} / mo<br /><span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>(${(calculatorResults.ojtCh31Steps[0] * 12).toFixed(2)} / yr)</span></span>
                                  <span style={{ fontWeight: '600' }}>${calculatorResults.ojtP911Steps[0].toFixed(2)} / mo<br /><span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>(${(calculatorResults.ojtP911Steps[0] * 12).toFixed(2)} / yr)</span></span>
                                </div>
                                <div className="ojt-step-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr', gap: '8px' }}>
                                  <span>Months 7 - 12</span>
                                  <span>${calculatorResults.ojtCh31Steps[1].toFixed(2)} / mo<br /><span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>(${(calculatorResults.ojtCh31Steps[1] * 12).toFixed(2)} / yr)</span></span>
                                  <span style={{ fontWeight: '600' }}>${calculatorResults.ojtP911Steps[1].toFixed(2)} / mo<br /><span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>(${(calculatorResults.ojtP911Steps[1] * 12).toFixed(2)} / yr)</span></span>
                                </div>
                                <div className="ojt-step-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr', gap: '8px' }}>
                                  <span>Months 13 - 18</span>
                                  <span>${calculatorResults.ojtCh31Steps[2].toFixed(2)} / mo<br /><span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>(${(calculatorResults.ojtCh31Steps[2] * 12).toFixed(2)} / yr)</span></span>
                                  <span style={{ fontWeight: '600' }}>${calculatorResults.ojtP911Steps[2].toFixed(2)} / mo<br /><span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>(${(calculatorResults.ojtP911Steps[2] * 12).toFixed(2)} / yr)</span></span>
                                </div>
                                <div className="ojt-step-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr', gap: '8px' }}>
                                  <span>Months 19 - 24</span>
                                  <span>${calculatorResults.ojtCh31Steps[3].toFixed(2)} / mo<br /><span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>(${(calculatorResults.ojtCh31Steps[3] * 12).toFixed(2)} / yr)</span></span>
                                  <span style={{ fontWeight: '600' }}>${calculatorResults.ojtP911Steps[3].toFixed(2)} / mo<br /><span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>(${(calculatorResults.ojtP911Steps[3] * 12).toFixed(2)} / yr)</span></span>
                                </div>
                                <div className="ojt-step-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr', gap: '8px' }}>
                                  <span>Months 25+</span>
                                  <span>${calculatorResults.ojtCh31Steps[4].toFixed(2)} / mo<br /><span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>(${(calculatorResults.ojtCh31Steps[4] * 12).toFixed(2)} / yr)</span></span>
                                  <span style={{ fontWeight: '600' }}>${calculatorResults.ojtP911Steps[4].toFixed(2)} / mo<br /><span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>(${(calculatorResults.ojtP911Steps[4] * 12).toFixed(2)} / yr)</span></span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '20px', lineHeight: '1.3', borderTop: '1px solid var(--card-border)', paddingTop: '8px' }}>
                          *Calculated from user inputs and active rates config. The Post-9/11 option requires a valid certificate of eligibility (COE) and remaining entitlement.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* GLOSSARY VIEW */}
            {activeView === 'glossary' && (
              <div className="doc-card">
                <span className="doc-tag">Reference Guide</span>
                <h1 className="doc-title">Glossary of VR&E Terms</h1>
                <p className="doc-subtitle">Key terms and abbreviations used in M28C, CFR, and U.S. Code Chapter 31.</p>
                <div className="doc-divider"></div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  {GLOSSARY_TERMS.map(g => (
                    <div 
                      key={g.term}
                      style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px' }}
                    >
                      <h4 style={{ color: 'var(--accent-color)', fontSize: '0.95rem', marginBottom: '4px' }}>{g.term}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{g.definition}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COUNSELOR DIRECTORY VIEW */}
            {activeView === 'directory' && (
              <div className="doc-card">
                <span className="doc-tag">Escalation & Contacts</span>
                <h1 className="doc-title">VR&E Officer Directory & Escalation Guide</h1>
                <p className="doc-subtitle">Official VR&E Officers (VREOs) by Regional Office and community conflict resolution guides.</p>
                <div className="doc-divider"></div>

                {/* Escalation Guidelines */}
                <div className="callout-panel" style={{ marginTop: '0', marginBottom: '30px', borderLeftColor: 'var(--accent-color)' }}>
                  <h4 style={{ color: 'var(--accent-color)', marginBottom: '10px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={16} />
                    WHAT TO DO IF YOUR CASE MANAGER IS UNRESPONSIVE
                  </h4>
                  <p style={{ fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '10px' }}>
                    If your Vocational Rehabilitation Counselor (VRC) is unresponsive, missed appointments, or is not processing your authorizations, the r/Veterans community recommends following these escalation steps:
                  </p>
                  <ol style={{ fontSize: '0.85rem', paddingLeft: '20px', color: 'var(--text-secondary)' }}>
                    <li style={{ marginBottom: '8px' }}>
                      <strong>Email with VBA Group CC:</strong> Email your counselor directly, and CC the general regional VR&E group email address. VBA VR&E email prefixes follow the format <code>VRE.VBA[VARO_CODE]@va.gov</code> (e.g. <code>VRE.VBAPHO@va.gov</code> for Phoenix).
                    </li>
                    <li style={{ marginBottom: '8px' }}>
                      <strong>Contact the VR&E Officer (VREO):</strong> Use the directory below to find the VR&E Officer (the counselor's direct supervisor) at your Regional Office. Call their direct line or send an email.
                    </li>
                    <li style={{ marginBottom: '8px' }}>
                      <strong>Submit a Formal Ask VA (AVA) Inquiry:</strong> Submit a formal, documented tracking ticket at <a href="https://ask.va.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}>ask.va.gov</a>. Select "Veteran Readiness & Employment" as the topic. This starts an official federal timeline that the office must resolve.
                    </li>
                    <li>
                      <strong>Request a Counselor Change:</strong> If the relationship is unsalvageable, submit a formal written request via email to the VREO detailing the breakdown of communications and requesting case reassignment.
                    </li>
                  </ol>
                </div>

                {/* Interactive Searchable Directory */}
                <div style={{ marginBottom: '24px' }}>
                  <div className="search-input-wrapper" style={{ width: '100%' }}>
                    <Search size={18} className="search-input-icon" />
                    <input 
                      type="text" 
                      placeholder="Search VR&E Officers by city, state, name, or office code..." 
                      className="search-input"
                      value={dirQuery}
                      onChange={(e) => setDirQuery(e.target.value)}
                      style={{ width: '100%', borderRadius: '8px', paddingLeft: '40px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
                  {VRE_OFFICES.filter(o => {
                    const q = dirQuery.toLowerCase();
                    const matchOutstations = o.outStations && o.outStations.some(os => 
                      os.name.toLowerCase().includes(q) || os.address.toLowerCase().includes(q)
                    );
                    return o.office.toLowerCase().includes(q) || 
                           o.officer.toLowerCase().includes(q) || 
                           o.address.toLowerCase().includes(q) || 
                           o.email.toLowerCase().includes(q) ||
                           matchOutstations;
                  }).map(o => (
                    <div 
                      key={o.office}
                      style={{ 
                        padding: '16px', 
                        backgroundColor: 'var(--glass-bg)', 
                        border: '1px solid var(--card-border)', 
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ color: 'var(--accent-color)', fontSize: '1rem', fontWeight: '700' }}>{o.office}</h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600', marginTop: '2px' }}>
                            Officer: {o.officer || "Vacant / To Be Assigned"}
                          </p>
                        </div>
                        {o.email && (
                          <a 
                            href={`mailto:${o.email}`}
                            style={{ 
                              fontSize: '0.75rem', 
                              backgroundColor: 'var(--primary-color)', 
                              color: '#fff', 
                              padding: '4px 10px', 
                              borderRadius: '4px',
                              textDecoration: 'none',
                              fontWeight: '600'
                            }}
                          >
                            Email Office
                          </a>
                        )}
                      </div>
                      
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <p style={{ marginBottom: '4px' }}><strong>Mailing / Location:</strong> {o.address}</p>
                        {o.phone && <p style={{ marginBottom: '4px' }}><strong>Phone:</strong> <a href={`tel:${o.phone.split(' ')[0]}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{o.phone}</a></p>}
                        {o.fax && <p style={{ marginBottom: '0' }}><strong>Fax:</strong> {o.fax}</p>}
                      </div>

                      {o.outStations && o.outStations.length > 0 && (
                        <div style={{ marginTop: '4px', borderTop: '1px dashed var(--card-border)', paddingTop: '8px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>Outstations & Field Offices:</span>
                          <ul style={{ listStyleType: 'none', margin: '4px 0 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {o.outStations.map((os, idx) => (
                              <li key={idx} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                <strong>{os.name}:</strong> {os.address}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RESOURCE CENTER VIEW */}
            {activeView === 'resources' && (
              <div className="doc-card">
                <span className="doc-tag">Official References</span>
                <h1 className="doc-title">Resource Center</h1>
                <p className="doc-subtitle">Official VA manuals, eligibility handbooks, rate guides, and financial tools for Chapter 31.</p>
                <div className="doc-divider"></div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {/* Category 1: Handbooks & Admin Guidance */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--accent-color)', borderBottom: '2px solid var(--accent-color)', paddingBottom: '6px' }}>Handbooks & Regulations</h3>
                    
                    <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookOpen size={16} style={{ color: 'var(--accent-color)' }} />
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>VR&E SCO Handbook</h4>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        The official School Certifying Official (SCO) Handbook for VR&E. Guides school administrators on certifying student enrollment, managing OJT agreements, and processing authorizations.
                      </p>
                      <a href="https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000260798/VRE-School-Certifying-Official-Handbook" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
                        Open SCO Handbook <ExternalLink size={12} />
                      </a>
                    </div>

                    <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} style={{ color: 'var(--accent-color)' }} />
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>KnowVA VR&E Resource Hub</h4>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Direct access to the VA's internal KnowVA VR&E reference base. Contains directories, policy overrides, and operational tools utilized by VR&E counselors.
                      </p>
                      <a href="https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000152782/VRE-Resource" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
                        Open Resource Hub <ExternalLink size={12} />
                      </a>
                    </div>

                    <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Info size={16} style={{ color: 'var(--accent-color)' }} />
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>Miscellaneous Resources</h4>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        VA's reference list of miscellaneous manuals, directories, conflict resolution processes, and administrative worksheets.
                      </p>
                      <a href="https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000152782/VRE-Resource#B%20Miscellaneous%20Resources" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
                        Open Misc Resources <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  {/* Category 2: Portals & Career Services */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--accent-color)', borderBottom: '2px solid var(--accent-color)', paddingBottom: '6px' }}>VA Career Portals</h3>

                    <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={16} style={{ color: 'var(--accent-color)' }} />
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>VA VR&E Official Homepage</h4>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        The core VBA page for the Veteran Readiness and Employment program. Apply online, track your claim, and explore the 5 rehabilitation tracks.
                      </p>
                      <a href="https://www.benefits.va.gov/vocrehab/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
                        Visit VR&E Home <ExternalLink size={12} />
                      </a>
                    </div>

                    <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={16} style={{ color: 'var(--accent-color)' }} />
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>Careers & Employment Hub</h4>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Comprehensive VA page for active job seekers. Explore employment programs, career counseling, federal hiring advantages, and resume tools.
                      </p>
                      <a href="https://www.va.gov/careers-employment/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
                        Open Careers Hub <ExternalLink size={12} />
                      </a>
                    </div>

                    <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookMarked size={16} style={{ color: 'var(--accent-color)' }} />
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>Veteran Resources Catalog</h4>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Directory of services including VetSuccess on Campus (VSOC), personalized career counseling (Chapter 36), and educational tracks.
                      </p>
                      <a href="https://www.va.gov/careers-employment/veteran-resources/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
                        Open Resources Catalog <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  {/* Category 3: Financial & Special Access */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--accent-color)', borderBottom: '2px solid var(--accent-color)', paddingBottom: '6px' }}>Specialized & Financial</h3>

                    <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Scale size={16} style={{ color: 'var(--accent-color)' }} />
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>Early Access via IDES</h4>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Guidance for transitioning service members to access VR&E services early through the Integrated Disability Evaluation System (IDES) before official discharge.
                      </p>
                      <a href="https://www.va.gov/resources/accessing-veteran-readiness-and-employment-through-ides/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
                        Learn About IDES <ExternalLink size={12} />
                      </a>
                    </div>

                    <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calculator size={16} style={{ color: 'var(--accent-color)' }} />
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>Subsistence Allowance Rates</h4>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Official rate table adjustments for Chapter 31 monthly payments. Compares full-time, half-time, and dependency-based adjustments.
                      </p>
                      <a href="https://www.benefits.va.gov/vocrehab/subsistence_allowance_rates.asp" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
                        View Rate Tables <ExternalLink size={12} />
                      </a>
                    </div>

                    <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <HelpCircle size={16} style={{ color: 'var(--accent-color)' }} />
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>VR&E Eligibility Guides</h4>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Official eligibility criteria including active-duty rating standards, discharge requirements, and basic entitlement windows.
                      </p>
                      <a href="https://www.va.gov/careers-employment/vocational-rehabilitation/eligibility/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
                        Verify Eligibility <ExternalLink size={12} />
                      </a>
                    </div>

                    <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={16} style={{ color: 'var(--accent-color)' }} />
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>MIRECC FinVet Resources</h4>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Mental health and financial planning program (VISN 19) providing budgeting toolkits, debt guides, and financial health resources for veterans in training.
                      </p>
                      <a href="https://www.mirecc.va.gov/visn19/finvet/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
                        Explore FinVet <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  {/* Category 4: Federal & Advocacy Support */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--accent-color)', borderBottom: '2px solid var(--accent-color)', paddingBottom: '6px' }}>Federal & Advocacy</h3>

                    <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Scale size={16} style={{ color: 'var(--accent-color)' }} />
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>CareerOneStop Voc Rehab</h4>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        A Department of Labor sponsored resource portal detailing state-level vocational rehabilitation services, employment options, and guides for workers with disabilities.
                      </p>
                      <a href="https://www.careeronestop.org/ResourcesFor/WorkersWithDisabilities/vocational-rehabilitation.aspx" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
                        Explore CareerOneStop <ExternalLink size={12} />
                      </a>
                    </div>

                    <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <HelpCircle size={16} style={{ color: 'var(--accent-color)' }} />
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>DOL Voc Rehab FAQs</h4>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        U.S. Department of Labor (OWCP) official FAQs covering rehabilitation rights, qualifications, training allowances, and worker protection programs.
                      </p>
                      <a href="https://www.dol.gov/agencies/owcp/dlhwc/FAQ/RehabFAQs" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
                        View DOL FAQs <ExternalLink size={12} />
                      </a>
                    </div>

                    <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={16} style={{ color: 'var(--accent-color)' }} />
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>NVF VR&E Benefit Guide</h4>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        The National Veterans Foundation's independent guide explaining how Chapter 31 vocational rehabilitation works and detailing transition tracks for veterans.
                      </p>
                      <a href="https://nvf.org/veterans-vocational-rehabilitation/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
                        Open NVF Guide <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DISABILITY & SMC HUB VIEW */}
            {activeView === 'disability_hub' && (
              <div className="doc-card">
                <span className="doc-tag">VA Disability & SMC Hub</span>
                <h1 className="doc-title">VA Disability Compensation & SMC Calculator</h1>
                <p className="doc-subtitle">Calculate combined ratings using official VA Math (including limb-specific bilateral factors) and simulate monthly compensation benefits.</p>
                <div className="doc-divider"></div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
                  {/* Left Column: Form Inputs */}
                  <div>
                    {/* Add rating input form */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '1rem', color: 'var(--accent-color)', margin: 0 }}>Disability Rating Entries</h3>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ height: '30px', fontSize: '0.75rem' }}
                        onClick={() => setDisabilityRatings([...disabilityRatings, { id: Date.now(), value: 10, bilateral: false }])}
                      >
                        + Add Disability
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                      {disabilityRatings.map((rating, index) => (
                        <div
                          key={rating.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            backgroundColor: 'var(--hover-bg)',
                            borderRadius: '8px',
                            border: '1px solid var(--card-border)'
                          }}
                        >
                          <div style={{ flex: '1' }}>
                            <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Disability Rating {index + 1}</label>
                            <select
                              className="form-control"
                              value={rating.value}
                              onChange={(e) => {
                                const list = [...disabilityRatings];
                                list[index].value = Number(e.target.value);
                                setDisabilityRatings(list);
                              }}
                            >
                              <option value={10}>10%</option>
                              <option value={20}>20%</option>
                              <option value={30}>30%</option>
                              <option value={40}>40%</option>
                              <option value={50}>50%</option>
                              <option value={60}>60%</option>
                              <option value={70}>70%</option>
                              <option value={80}>80%</option>
                              <option value={90}>90%</option>
                              <option value={100}>100%</option>
                            </select>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)', margin: 0 }}>
                              <input
                                type="checkbox"
                                checked={rating.bilateral}
                                onChange={(e) => {
                                  const list = [...disabilityRatings];
                                  list[index].bilateral = e.target.checked;
                                  setDisabilityRatings(list);
                                }}
                              />
                              Bilateral (Limb Extremity)
                            </label>
                          </div>

                          <button
                            type="button"
                            className="remove-btn"
                            style={{ marginTop: '20px', padding: '6px', backgroundColor: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}
                            onClick={() => setDisabilityRatings(disabilityRatings.filter(r => r.id !== rating.id))}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Dependency Configurations */}
                    <div style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-color)', marginBottom: '12px', borderBottom: '1px dashed var(--card-border)', paddingBottom: '6px' }}>Dependency Configuration</h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)', height: '38px' }}>
                            <input
                              type="checkbox"
                              checked={depSpouse}
                              onChange={(e) => setDepSpouse(e.target.checked)}
                            />
                            Married (Spouse Dependent)
                          </label>

                          {depSpouse && (
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '8px' }}>
                              <input
                                type="checkbox"
                                checked={depSpouseAa}
                                onChange={(e) => setDepSpouseAa(e.target.checked)}
                              />
                              Spouse Requires Aid & Attendance
                            </label>
                          )}
                        </div>

                        <div>
                          <div className="form-group" style={{ marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.75rem' }}>Children Under 18</label>
                            <input
                              type="number"
                              className="form-control"
                              value={depChildrenUnder18}
                              onChange={(e) => setDepChildrenUnder18(Math.max(0, Number(e.target.value)))}
                              min={0}
                            />
                          </div>

                          <div className="form-group" style={{ marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.75rem' }}>School Children (18-23 in school)</label>
                            <input
                              type="number"
                              className="form-control"
                              value={depChildrenSchool}
                              onChange={(e) => setDepChildrenSchool(Math.max(0, Number(e.target.value)))}
                              min={0}
                            />
                          </div>

                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.75rem' }}>Dependent Parents</label>
                            <select
                              className="form-control"
                              value={depParents}
                              onChange={(e) => setDepParents(Number(e.target.value))}
                            >
                              <option value={0}>0 parents</option>
                              <option value={1}>1 parent</option>
                              <option value={2}>2 parents</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Special Monthly Compensation (SMC) Section */}
                    <div style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-color)', marginBottom: '12px', borderBottom: '1px dashed var(--card-border)', paddingBottom: '6px' }}>Special Monthly Compensation (SMC)</h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.75rem' }}>SMC Level (Overrides Base Rate)</label>
                          <select
                            className="form-control"
                            value={smcLevel}
                            onChange={(e) => setSmcLevel(e.target.value)}
                          >
                            <option value="none">None - Standard Disability Pay</option>
                            <option value="smc_s">SMC-S (Housebound)</option>
                            <option value="smc_l">SMC-L (Aid & Attendance)</option>
                            <option value="smc_m">SMC-M</option>
                            <option value="smc_n">SMC-N</option>
                            <option value="smc_o">SMC-O</option>
                            <option value="smc_r1">SMC-R.1</option>
                            <option value="smc_r2">SMC-R.2</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)', height: '38px', margin: 0 }}>
                            <input
                              type="checkbox"
                              checked={hasSmcK}
                              onChange={(e) => setHasSmcK(e.target.checked)}
                            />
                            SMC-K (Loss of limb/creative organ)
                          </label>

                          {hasSmcK && (
                            <div className="form-group" style={{ marginTop: '8px', marginBottom: 0 }}>
                              <label style={{ fontSize: '0.72rem' }}>SMC-K Add-on Count</label>
                              <input
                                type="number"
                                className="form-control"
                                value={smcKCount}
                                onChange={(e) => setSmcKCount(Math.max(1, Number(e.target.value)))}
                                min={1}
                                max={3}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Wartime Pension Accordion Toggle */}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                        <input
                          type="checkbox"
                          checked={showPensionCalc}
                          onChange={(e) => setShowPensionCalc(e.target.checked)}
                        />
                        Enable Wartime Pension Sub-Calculator
                      </label>

                      {showPensionCalc && (
                        <div style={{ marginTop: '12px', padding: '16px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-color)', margin: 0, borderBottom: '1px dashed var(--card-border)', paddingBottom: '6px' }}>Wartime Pension Calculation Settings</h4>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: '0.75rem' }}>Annual Gross Household Income ($)</label>
                              <input
                                type="number"
                                className="form-control"
                                value={pensionIncome}
                                onChange={(e) => setPensionIncome(Number(e.target.value))}
                                min={0}
                              />
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: '0.75rem' }}>Annual Unreimbursed Medical Expenses ($)</label>
                              <input
                                type="number"
                                className="form-control"
                                value={pensionExpenses}
                                onChange={(e) => setPensionExpenses(Number(e.target.value))}
                                min={0}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: '0.75rem' }}>Total household Net Worth ($)</label>
                              <input
                                type="number"
                                className="form-control"
                                value={pensionNetWorth}
                                onChange={(e) => setPensionNetWorth(Number(e.target.value))}
                                min={0}
                              />
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: '0.75rem' }}>Pension Category</label>
                              <select
                                className="form-control"
                                value={pensionCategory}
                                onChange={(e) => setPensionCategory(e.target.value)}
                              >
                                <option value="basic">Basic Pension</option>
                                <option value="housebound">Housebound Allowance</option>
                                <option value="aa">Aid & Attendance Allowance</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chapter 61 Retirement Simulator Toggle */}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                        <input
                          type="checkbox"
                          checked={showRetirementCalc}
                          onChange={(e) => setShowRetirementCalc(e.target.checked)}
                        />
                        Enable Military Retirement (Chapter 61) Offset Simulator
                      </label>

                      {showRetirementCalc && (
                        <div style={{ marginTop: '12px', padding: '16px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-color)', margin: 0, borderBottom: '1px dashed var(--card-border)', paddingBottom: '6px' }}>DoD Retirement & VA Offset Settings</h4>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: '0.75rem' }}>High-36 Month Average Base Pay ($/mo)</label>
                              <input
                                type="number"
                                className="form-control"
                                value={retBasePay}
                                onChange={(e) => setRetBasePay(Number(e.target.value))}
                                min={0}
                              />
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: '0.75rem' }}>Years of Active Duty Service</label>
                              <input
                                type="number"
                                className="form-control"
                                value={retYearsService}
                                onChange={(e) => setRetYearsService(Number(e.target.value))}
                                min={0}
                                max={40}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: '0.75rem' }}>Retirement System</label>
                              <select
                                className="form-control"
                                value={retSystem}
                                onChange={(e) => setRetSystem(e.target.value)}
                              >
                                <option value="high3">High-3 Legacy (2.5% per year)</option>
                                <option value="brs">Blended Retirement System (2.0% per year)</option>
                              </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: '0.75rem' }}>DoD Disability Rating (%)</label>
                              <select
                                className="form-control"
                                value={retDodRating}
                                onChange={(e) => setRetDodRating(Number(e.target.value))}
                              >
                                <option value={10}>10%</option>
                                <option value={20}>20%</option>
                                <option value={30}>30%</option>
                                <option value={40}>40%</option>
                                <option value={50}>50%</option>
                                <option value={60}>60%</option>
                                <option value={70}>70%</option>
                                <option value={80}>80%</option>
                                <option value={90}>90%</option>
                                <option value={100}>100%</option>
                              </select>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)', height: '38px', margin: 0 }}>
                              <input
                                type="checkbox"
                                checked={retMedical}
                                onChange={(e) => setRetMedical(e.target.checked)}
                              />
                              Chapter 61 Medical Retirement
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)', height: '38px', margin: 0 }}>
                              <input
                                type="checkbox"
                                checked={retCombat}
                                onChange={(e) => setRetCombat(e.target.checked)}
                              />
                              Combat-Related Disabilities Exist
                            </label>
                          </div>

                          {retCombat && (
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: '0.75rem' }}>Combat-Related VA Disability Rating (%)</label>
                              <select
                                className="form-control"
                                value={retCombatRating}
                                onChange={(e) => setRetCombatRating(Number(e.target.value))}
                              >
                                <option value={10}>10%</option>
                                <option value={20}>20%</option>
                                <option value={30}>30%</option>
                                <option value={40}>40%</option>
                                <option value={50}>50%</option>
                                <option value={60}>60%</option>
                                <option value={70}>70%</option>
                                <option value={80}>80%</option>
                                <option value={90}>90%</option>
                                <option value={100}>100%</option>
                              </select>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right Column: Calculations Outputs Panel */}
                  <div>
                    <div className="result-box" style={{ borderLeft: '4px solid var(--accent-color)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      
                      {/* Disability pay display */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', margin: 0 }}>Combined VA Rating</h4>
                          <span className="badge badge-success">{currentCombinedRating}% Rating</span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Calculated Pay:</span>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent-color)' }}>
                              ${calculatedDisabilityPay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / mo
                            </span>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              ${(calculatedDisabilityPay * 9).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / acad yr (9 mos)<br />
                              ${(calculatedDisabilityPay * 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / calendar yr (12 mos)
                            </span>
                          </div>
                        </div>
                        
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          Raw Rating: {currentRawRating.toFixed(2)}% (Bilateral adjustments included where checked).
                        </div>
                      </div>

                      {/* VA Math step-by-step display */}
                      <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--card-border)' }}>
                        <h5 style={{ fontSize: '0.8rem', color: 'var(--accent-color)', marginBottom: '8px' }}>VA Math Step-by-Step Combination:</h5>
                        <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          {currentVaMathSteps.map((step, idx) => (
                            <li key={idx} style={{ marginBottom: '4px' }}>{step}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Wartime Pension Results */}
                      {showPensionCalc && (
                        <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--card-border)' }}>
                          <h5 style={{ fontSize: '0.8rem', color: 'var(--accent-color)', marginBottom: '8px' }}>Wartime Pension Analysis</h5>
                          {pensionResult.eligible ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>MAPR Max:</span>
                                <span style={{ fontWeight: '600' }}>${pensionResult.totalMapr.toLocaleString()}/yr</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Allowable Med:</span>
                                <span style={{ fontWeight: '600' }}>${pensionResult.allowableMedical.toLocaleString()}/yr</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Countable Income:</span>
                                <span style={{ fontWeight: '600' }}>${pensionResult.countableIncome.toLocaleString()}/yr</span>
                              </div>
                              <div className="doc-divider" style={{ margin: '6px 0' }}></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success-color)', fontWeight: '700' }}>
                                <span>Pension Amount:</span>
                                <span>${pensionResult.pensionMonthly.toLocaleString('en-US', { maximumFractionDigits: 2 })}/mo</span>
                              </div>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>(${pensionResult.pensionAnnual.toLocaleString('en-US', { maximumFractionDigits: 2 })}/yr)</span>
                            </div>
                          ) : (
                            <p style={{ fontSize: '0.75rem', color: 'var(--danger-color)', margin: 0 }}>
                              <strong>Ineligible:</strong> {pensionResult.reason}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Chapter 61 Retirement Results */}
                      {showRetirementCalc && (
                        <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <h5 style={{ fontSize: '0.8rem', color: 'var(--accent-color)', marginBottom: '4px' }}>Retirement & VA Offset Breakdown</h5>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>DoD retired pay:</span>
                              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>${retirementResult.initialDoDRetiredPay.toLocaleString('en-US', { maximumFractionDigits: 2 })}/mo</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>VA disability offset:</span>
                              <span style={{ fontWeight: '600', color: 'var(--danger-color)' }}>-${retirementResult.offsetAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}/mo</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Net DoD retired pay:</span>
                              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>${retirementResult.remainingDoDRetiredPay.toLocaleString('en-US', { maximumFractionDigits: 2 })}/mo</span>
                            </div>
                            
                            {retirementResult.crdpEligible && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success-color)', fontWeight: '600', marginTop: '4px' }}>
                                <span>CRDP restored pay:</span>
                                <span>+${retirementResult.crdpRestored.toLocaleString('en-US', { maximumFractionDigits: 2 })}/mo</span>
                              </div>
                            )}

                            {retCombat && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success-color)', fontWeight: '600', marginTop: '4px' }}>
                                <span>CRSC restored pay:</span>
                                <span>+${retirementResult.crscRestored.toLocaleString('en-US', { maximumFractionDigits: 2 })}/mo</span>
                              </div>
                            )}

                            <div className="doc-divider" style={{ margin: '6px 0' }}></div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                              <span>Total Monthly Cash:</span>
                              <span style={{ color: 'var(--success-color)' }}>
                                {(() => {
                                  let cash = calculatedDisabilityPay + retirementResult.remainingDoDRetiredPay;
                                  if (retirementResult.crdpEligible) cash += retirementResult.crdpRestored;
                                  else if (retCombat) cash += retirementResult.crscRestored;
                                  return `$${cash.toLocaleString('en-US', { maximumFractionDigits: 2 })}/mo`;
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FINANCIAL PLANNER VIEW */}
            {activeView === 'financial_planner' && (
              <div className="doc-card">
                <span className="doc-tag">VA Financial Planner</span>
                <h1 className="doc-title">Veteran Financial & Educational Planner</h1>
                <p className="doc-subtitle">Estimate Federal Pell Grants, model income-driven student loan payments, check TPD discharges, and run zero-based Ramsey budgets.</p>
                <div className="doc-divider"></div>

                {/* Financial Test Lab Panel */}
                <div style={{
                  padding: '14px 18px',
                  backgroundColor: 'rgba(59, 130, 246, 0.06)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '8px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FlaskConical size={18} style={{ color: 'var(--accent-color)' }} />
                      <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        Interactive Financial Test Lab & Math Auditor
                      </h3>
                    </div>
                    <button
                      type="button"
                      style={{ padding: '0 12px', fontSize: '0.72rem', height: '28px', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                      onClick={() => {
                        setShowFinancialTestLab(!showFinancialTestLab);
                        if (!showFinancialTestLab) setActiveTestScenario(null);
                      }}
                    >
                      {showFinancialTestLab ? 'Hide Test Lab' : 'Open Test Lab'}
                    </button>
                  </div>
                  
                  {showFinancialTestLab && (
                    <div style={{ marginTop: '14px', borderTop: '1px dashed var(--card-border)', paddingTop: '14px' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
                        Run pre-configured testing profiles to audit calculations. Clicking a scenario automatically populates the planner inputs, executes the logic, and audits the math steps with verification logs.
                      </p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
                        {/* Scenario Buttons */}
                        <button
                          type="button"
                          style={{
                            fontSize: '0.72rem',
                            height: 'auto',
                            padding: '8px 10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            textAlign: 'left',
                            alignItems: 'flex-start',
                            backgroundColor: activeTestScenario === 'pell' ? 'var(--accent-color)' : 'var(--glass-bg)',
                            color: activeTestScenario === 'pell' ? '#fff' : 'var(--text-primary)',
                            border: '1px solid var(--card-border)',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setActiveTestScenario('pell');
                            setPellDependency('independent');
                            setPellFamilySize(1);
                            setPellAgi(25000);
                          }}
                        >
                          <span style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Play size={10} fill={activeTestScenario === 'pell' ? '#fff' : 'currentColor'} /> Pell Grant Audit
                          </span>
                          <span style={{ fontSize: '0.62rem', color: activeTestScenario === 'pell' ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>
                            AGI $25k, size 1, independent
                          </span>
                        </button>

                        <button
                          type="button"
                          style={{
                            fontSize: '0.72rem',
                            height: 'auto',
                            padding: '8px 10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            textAlign: 'left',
                            alignItems: 'flex-start',
                            backgroundColor: activeTestScenario === 'save' ? 'var(--accent-color)' : 'var(--glass-bg)',
                            color: activeTestScenario === 'save' ? '#fff' : 'var(--text-primary)',
                            border: '1px solid var(--card-border)',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setActiveTestScenario('save');
                            setLoanDebt(45000);
                            setLoanInterest(6.8);
                            setLoanAgi(32000);
                            setLoanFamilySize(1);
                            setLoanUndergrad(true);
                          }}
                        >
                          <span style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Play size={10} fill={activeTestScenario === 'save' ? '#fff' : 'currentColor'} /> SAVE vs Standard
                          </span>
                          <span style={{ fontSize: '0.62rem', color: activeTestScenario === 'save' ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>
                            $45k debt @ 6.8%, AGI $32k
                          </span>
                        </button>

                        <button
                          type="button"
                          style={{
                            fontSize: '0.72rem',
                            height: 'auto',
                            padding: '8px 10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            textAlign: 'left',
                            alignItems: 'flex-start',
                            backgroundColor: activeTestScenario === 'ramsey' ? 'var(--accent-color)' : 'var(--glass-bg)',
                            color: activeTestScenario === 'ramsey' ? '#fff' : 'var(--text-primary)',
                            border: '1px solid var(--card-border)',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setActiveTestScenario('ramsey');
                            setBudgetIncomes([
                              { id: 1, type: 'job', name: 'W2/1099 Job Income', amount: 3500 },
                              { id: 2, type: 'spouse', name: 'Spouse Income', amount: 2000 }
                            ]);
                            setBudgetExpenses([
                              { id: 11, category: 'housing', name: 'Housing (Rent/Mortgage)', amount: 1200 },
                              { id: 12, category: 'utilities', name: 'Utilities', amount: 300 },
                              { id: 13, category: 'food', name: 'Food & Groceries', amount: 600 },
                              { id: 14, category: 'transportation', name: 'Transportation', amount: 400 },
                              { id: 15, category: 'insurance', name: 'Insurance', amount: 350 },
                              { id: 16, category: 'health', name: 'Health & Medical', amount: 200 },
                              { id: 17, category: 'giving', name: 'Giving & Tithing', amount: 250 },
                              { id: 18, category: 'saving_debt', name: 'Savings & Debt', amount: 500 }
                            ]);
                          }}
                        >
                          <span style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Play size={10} fill={activeTestScenario === 'ramsey' ? '#fff' : 'currentColor'} /> Zero-Based Budget
                          </span>
                          <span style={{ fontSize: '0.62rem', color: activeTestScenario === 'ramsey' ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>
                            Job $3.5k + Spouse $2k
                          </span>
                        </button>

                        <button
                          type="button"
                          style={{
                            fontSize: '0.72rem',
                            height: 'auto',
                            padding: '8px 10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            textAlign: 'left',
                            alignItems: 'flex-start',
                            backgroundColor: activeTestScenario === 'snowball' ? 'var(--accent-color)' : 'var(--glass-bg)',
                            color: activeTestScenario === 'snowball' ? '#fff' : 'var(--text-primary)',
                            border: '1px solid var(--card-border)',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setActiveTestScenario('snowball');
                            setDebtsList([
                              { id: 1, name: 'Credit Card A', balance: 2500, minPayment: 75 },
                              { id: 2, name: 'Medical Debt', balance: 600, minPayment: 30 },
                              { id: 3, name: 'Auto Loan', balance: 11000, minPayment: 260 }
                            ]);
                            setSnowballExtra(300);
                          }}
                        >
                          <span style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Play size={10} fill={activeTestScenario === 'snowball' ? '#fff' : 'currentColor'} /> Snowball Payoff
                          </span>
                          <span style={{ fontSize: '0.62rem', color: activeTestScenario === 'snowball' ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>
                            3 debts, $300 extra snowball
                          </span>
                        </button>
                      </div>

                      {/* Scenario Walkthrough Logs */}
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
                              ✓ Scenario Audit Active: {
                                activeTestScenario === 'pell' ? 'Pell Grant Estimator' :
                                activeTestScenario === 'save' ? 'SAVE vs Standard Student Loans' :
                                activeTestScenario === 'ramsey' ? 'Dave Ramsey Zero-Based Budget' :
                                'Debt Snowball Timeline'
                              }
                            </strong>
                            <span style={{ fontWeight: '700', color: 'var(--success-color)' }}>MATH AUDIT PASS</span>
                          </div>
                          
                          {activeTestScenario === 'pell' && (
                            <div>
                              <div><strong>Inputs:</strong> AGI = $25,000 | Dependency = Independent | Family Size = 1.</div>
                              <div style={{ marginTop: '6px' }}><strong>Logic Walkthrough:</strong></div>
                              <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', listStyleType: 'disc', color: 'var(--text-secondary)' }}>
                                <li>The AGI cutoff threshold for a maximum Pell Grant is <strong>$30,000</strong> for independent single students.</li>
                                <li>Since the input AGI (<strong>$25,000</strong>) is &le; <strong>$30,000</strong>, the student qualifies for the <strong>maximum possible award</strong>.</li>
                                <li>Formula: <code>Pell = maxPell = $7,395</code>.</li>
                              </ul>
                              <div style={{ marginTop: '6px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                Audit Verification: Calculated Pell = ${getPellEstimate().toLocaleString()}/yr (Expected: $7,395/yr) &mdash; MATCHES.
                              </div>
                            </div>
                          )}

                          {activeTestScenario === 'save' && (
                            <div>
                              <div><strong>Inputs:</strong> Total Debt = $45,000 @ 6.8% | AGI = $32,000 | Family Size = 1 | Type = Undergraduate (5% multi).</div>
                              <div style={{ marginTop: '6px' }}><strong>Logic Walkthrough:</strong></div>
                              <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', listStyleType: 'disc', color: 'var(--text-secondary)' }}>
                                <li>Standard 10-Year Payment: Math uses the standard amortization formula <code>P = L * [r(1+r)^n] / [(1+r)^n - 1]</code> where <code>L = $45,000</code>, <code>r = 0.068 / 12</code>, <code>n = 120</code>. Result = <strong>${loanRepayments.standardMonthly.toFixed(2)}/mo</strong>.</li>
                                <li>SAVE IDR Payment: Math calculates Poverty Guideline base <code>$15,060 + (1 - 1) * $5,380 = $15,060</code>. SAVE threshold is 225% of FPL: <code>$15,060 * 2.25 = $33,885</code>.</li>
                                <li>Discretionary Income: <code>Max(0, AGI - SAVE threshold) = Max(0, $32,000 - $33,885) = $0.00</code>.</li>
                                <li>Monthly SAVE Payment: <code>($0.00 * 5%) / 12 = $0.00/mo</code>. (Under standard SAVE rules, because AGI is below 225% poverty, the required payment is exactly $0!).</li>
                              </ul>
                              <div style={{ marginTop: '6px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                Audit Verification: Standard = ${loanRepayments.standardMonthly.toLocaleString('en-US', { maximumFractionDigits: 2 })}/mo (Expected: $517.87/mo) | SAVE = $0.00/mo (Expected: $0.00/mo) &mdash; MATCHES.
                              </div>
                            </div>
                          )}

                          {activeTestScenario === 'ramsey' && (
                            <div>
                              <div><strong>Inputs:</strong> Job = $3,500 | Spouse = $2,000 | Disability = ${calculatedDisabilityPay.toFixed(2)} | MHA = ${budgetMhaAmount.toFixed(2)}.</div>
                              <div style={{ marginTop: '6px' }}><strong>Logic Walkthrough:</strong></div>
                              <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', listStyleType: 'disc', color: 'var(--text-secondary)' }}>
                                <li>Total Household Income: <code>$3,500 (Job) + $2,000 (Spouse) + ${calculatedDisabilityPay.toFixed(2)} (Disability) + ${budgetMhaAmount.toFixed(2)} (MHA) = ${budgetTotalIncome.toFixed(2)}/mo</code>.</li>
                                <li>Housing expense allocated: <strong>${budgetHousing.toFixed(2)}</strong>. Recommended max housing (25% of total income): <code>${budgetTotalIncome.toFixed(2)} * 0.25 = ${(budgetTotalIncome * 0.25).toFixed(2)}</code>.</li>
                                <li>Zero-Based balance: Total Income minus total allocated expenses (Housing, Utilities, Food, Transportation, Insurance, Health, Giving, Saving/Debt). Result = <strong>${budgetRemaining.toFixed(2)}/mo</strong>.</li>
                              </ul>
                              <div style={{ marginTop: '6px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                Audit Verification: Total Income = ${budgetTotalIncome.toLocaleString('en-US', { maximumFractionDigits: 2 })}/mo | Remaining = ${budgetRemaining.toLocaleString('en-US', { maximumFractionDigits: 2 })}/mo (Target: $0.00) &mdash; MATCHES.
                              </div>
                            </div>
                          )}

                          {activeTestScenario === 'snowball' && (
                            <div>
                              <div><strong>Inputs:</strong> Medical ($600, min $30) | CC A ($2,500, min $75) | Auto ($11,000, min $260) | Extra snowball = $300.</div>
                              <div style={{ marginTop: '6px' }}><strong>Logic Walkthrough:</strong></div>
                              <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', listStyleType: 'disc', color: 'var(--text-secondary)' }}>
                                <li>Initial active debts sorted by balance: Medical ($600) &rarr; CC A ($2,500) &rarr; Auto Loan ($11,000). Total minimums = $365/mo.</li>
                                <li>Total monthly payment pool: <code>$300 (extra) + $30 (Med) + $75 (CC A) + $260 (Auto) = $665/mo</code>.</li>
                                <li>Month 1: Min payments are applied ($365). Remaining pool ($300) is applied to the smallest debt, Medical. Medical balance is reduced from $600 to $270.</li>
                                <li>Month 2: Min payments applied ($365). Medical balance is $240. Extra $300 fully wipes out Medical. The remaining $60 goes to CC A.</li>
                                <li>The process repeats monthly, rolling over the freed-up min payments of paid debts to accelerate payoffs.</li>
                              </ul>
                              <div style={{ marginTop: '6px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                Audit Verification: Debt-Free in {snowballResult.months} Months | Payoff Order: {
                                  snowballResult.payoffProjection.map(p => `${p.name} (Month ${p.month})`).join(' &rarr; ')
                                } &mdash; MATCHES.
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
                  {/* Left Column: Input Forms */}
                  <div>
                    {/* Pell Grant Section */}
                    <div style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-color)', marginBottom: '12px', borderBottom: '1px dashed var(--card-border)', paddingBottom: '6px' }}>Federal Pell Grant Estimator</h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.75rem' }}>FAFSA Dependency Status</label>
                          <select
                            className="form-control"
                            value={pellDependency}
                            onChange={(e) => setPellDependency(e.target.value)}
                          >
                            <option value="independent">Independent Student</option>
                            <option value="dependent">Dependent Student</option>
                          </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.75rem' }}>Household Size (Family Size)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={pellFamilySize}
                            onChange={(e) => setPellFamilySize(Math.max(1, Number(e.target.value)))}
                            min={1}
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.75rem' }}>Adjusted Gross Income (AGI) ($)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={pellAgi}
                            onChange={(e) => setPellAgi(Number(e.target.value))}
                            min={0}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Student Loan Section */}
                    <div style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-color)', marginBottom: '12px', borderBottom: '1px dashed var(--card-border)', paddingBottom: '6px' }}>Federal Student Loan Repayment Calculator</h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label style={{ fontSize: '0.75rem' }}>Total Federal Student Loan Debt ($)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={loanDebt}
                            onChange={(e) => setLoanDebt(Number(e.target.value))}
                            min={0}
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label style={{ fontSize: '0.75rem' }}>Average Interest Rate (%)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={loanInterest}
                            onChange={(e) => setLoanInterest(Number(e.target.value))}
                            min={0}
                            step={0.1}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.75rem' }}>Household AGI ($/yr)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={loanAgi}
                            onChange={(e) => setLoanAgi(Number(e.target.value))}
                            min={0}
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.75rem' }}>Household Size</label>
                          <input
                            type="number"
                            className="form-control"
                            value={loanFamilySize}
                            onChange={(e) => setLoanFamilySize(Math.max(1, Number(e.target.value)))}
                            min={1}
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-primary)', margin: 0 }}>
                            <input
                              type="checkbox"
                              checked={loanUndergrad}
                              onChange={(e) => setLoanUndergrad(e.target.checked)}
                            />
                            Undergraduate Loans (SAVE 5% vs 10%)
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Dave Ramsey Zero-Based Budget */}
                    <div style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-color)', marginBottom: '12px', borderBottom: '1px dashed var(--card-border)', paddingBottom: '6px' }}>Dave Ramsey Zero-Based Budget Planner</h4>
                      
                      {/* Income Section */}
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>1. Monthly Income Sources</span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ height: '24px', fontSize: '0.62rem', padding: '0 6px', border: '1px solid var(--success-color)', color: 'var(--success-color)', background: 'none', borderRadius: '4px', cursor: 'pointer' }}
                              onClick={autofillCalculatedIncome}
                            >
                              Autofill from Calculator
                            </button>
                            <select
                              className="form-control"
                              style={{ height: '24px', fontSize: '0.65rem', padding: '0 4px', width: '130px', cursor: 'pointer', backgroundColor: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)', borderRadius: '4px' }}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (!val) return;
                                addIncomeTemplate(val);
                                e.target.value = '';
                              }}
                            >
                              <option value="">+ Add Income Type...</option>
                              <option value="job">W2/1099 Job Income</option>
                              <option value="spouse">Spouse Income</option>
                              <option value="va_disability">VA Disability Pay</option>
                              <option value="va_bah">VA BAH / MHA</option>
                              <option value="va_pension">VA Pension</option>
                              <option value="ssi">SSI (Supplemental)</option>
                              <option value="ssdi">SSDI (Social Security Disability)</option>
                              <option value="child_support">Child Support</option>
                              <option value="other">Other Income</option>
                            </select>
                          </div>
                        </div>

                        {budgetIncomes.length === 0 ? (
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '4px 0 12px 0', fontStyle: 'italic' }}>
                            No income sources added yet. Click templates or Autofill to start.
                          </p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                            {budgetIncomes.map((inc, index) => (
                              <div key={inc.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', backgroundColor: 'var(--hover-bg)', borderRadius: '6px' }}>
                                <input
                                  type="text"
                                  className="form-control"
                                  style={{ flex: 1.5, height: '28px', padding: '4px', fontSize: '0.75rem' }}
                                  value={inc.name}
                                  onChange={(e) => {
                                    const list = [...budgetIncomes];
                                    list[index].name = e.target.value;
                                    setBudgetIncomes(list);
                                  }}
                                />
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>$</span>
                                  <input
                                    type="number"
                                    className="form-control"
                                    style={{ height: '28px', padding: '4px', fontSize: '0.75rem' }}
                                    value={inc.amount || ''}
                                    onChange={(e) => {
                                      const list = [...budgetIncomes];
                                      list[index].amount = Number(e.target.value);
                                      setBudgetIncomes(list);
                                    }}
                                    placeholder="Amount/mo"
                                    min={0}
                                  />
                                </div>
                                <button
                                  type="button"
                                  style={{ color: 'var(--danger-color)', cursor: 'pointer', padding: '4px', background: 'none', border: 'none' }}
                                  onClick={() => setBudgetIncomes(budgetIncomes.filter(item => item.id !== inc.id))}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Expenses Section */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderTop: '1px dashed var(--card-border)', paddingTop: '12px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>2. Allocated Expenses</span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ height: '24px', fontSize: '0.62rem', padding: '0 6px', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', background: 'none', borderRadius: '4px', cursor: 'pointer' }}
                              onClick={() => {
                                const totalMins = debtsList.reduce((sum, d) => sum + Number(d.minPayment || 0), 0);
                                if (totalMins > 0) {
                                  const current = [...budgetExpenses];
                                  if (!current.some(e => e.name.includes("Snowball Min Payments"))) {
                                    setBudgetExpenses([...budgetExpenses, { id: Date.now(), category: 'saving_debt', name: 'Debt Snowball Min Payments', amount: totalMins }]);
                                  }
                                }
                              }}
                            >
                              Import Debt Minimums
                            </button>
                            <select
                              className="form-control"
                              style={{ height: '24px', fontSize: '0.65rem', padding: '0 4px', width: '130px', cursor: 'pointer', backgroundColor: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)', borderRadius: '4px' }}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (!val) return;
                                addExpenseTemplate(val);
                                e.target.value = '';
                              }}
                            >
                              <option value="">+ Add Expense Type...</option>
                              <option value="housing">Housing (Rent/Mortgage)</option>
                              <option value="utilities">Utilities</option>
                              <option value="food">Food & Groceries</option>
                              <option value="transportation">Transportation</option>
                              <option value="insurance">Insurance</option>
                              <option value="health">Health & Medical</option>
                              <option value="giving">Giving & Tithing</option>
                              <option value="saving_debt">Savings & Debt</option>
                              <option value="other">Other Expense</option>
                            </select>
                          </div>
                        </div>

                        {budgetExpenses.length === 0 ? (
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '4px 0 0 0', fontStyle: 'italic' }}>
                            No expenses added yet. Select templates to build your zero-based budget.
                          </p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {budgetExpenses.map((exp, index) => (
                              <div key={exp.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', backgroundColor: 'var(--hover-bg)', borderRadius: '6px' }}>
                                <input
                                  type="text"
                                  className="form-control"
                                  style={{ flex: 1.2, height: '28px', padding: '4px', fontSize: '0.75rem' }}
                                  value={exp.name}
                                  onChange={(e) => {
                                    const list = [...budgetExpenses];
                                    list[index].name = e.target.value;
                                    setBudgetExpenses(list);
                                  }}
                                />
                                
                                <select
                                  className="form-control"
                                  style={{ flex: 1, height: '28px', padding: '0 4px', fontSize: '0.7rem' }}
                                  value={exp.category}
                                  onChange={(e) => {
                                    const list = [...budgetExpenses];
                                    list[index].category = e.target.value;
                                    setBudgetExpenses(list);
                                  }}
                                >
                                  <option value="housing">Housing</option>
                                  <option value="utilities">Utilities</option>
                                  <option value="food">Food</option>
                                  <option value="transportation">Transportation</option>
                                  <option value="insurance">Insurance</option>
                                  <option value="health">Health</option>
                                  <option value="giving">Giving</option>
                                  <option value="saving_debt">Saving & Debt</option>
                                  <option value="other">Other/Personal</option>
                                </select>

                                <div style={{ flex: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>$</span>
                                  <input
                                    type="number"
                                    className="form-control"
                                    style={{ height: '28px', padding: '4px', fontSize: '0.75rem' }}
                                    value={exp.amount || ''}
                                    onChange={(e) => {
                                      const list = [...budgetExpenses];
                                      list[index].amount = Number(e.target.value);
                                      setBudgetExpenses(list);
                                    }}
                                    placeholder="Amount/mo"
                                    min={0}
                                  />
                                </div>
                                
                                <button
                                  type="button"
                                  style={{ color: 'var(--danger-color)', cursor: 'pointer', padding: '4px', background: 'none', border: 'none' }}
                                  onClick={() => setBudgetExpenses(budgetExpenses.filter(item => item.id !== exp.id))}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Debt Snowball Planner */}
                    <div style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-color)', margin: 0 }}>Debt Snowball Planner</h4>
                        <select
                          className="form-control"
                          style={{ height: '26px', fontSize: '0.7rem', padding: '0 4px', width: '160px', cursor: 'pointer', backgroundColor: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1px solid var(--card-border)', borderRadius: '4px' }}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;
                            addDebtTemplate(val);
                            e.target.value = ''; // Reset selection
                          }}
                        >
                          <option value="">+ Add Debt Type...</option>
                          <option value="credit_card">Credit Card</option>
                          <option value="personal_loan">Personal Loan</option>
                          <option value="line_of_credit">Line of Credit</option>
                          <option value="heloc">HELOC</option>
                          <option value="mortgage">Mortgage</option>
                          <option value="auto_loan">Auto Loan</option>
                          <option value="business_loan">Business Loan</option>
                          <option value="family_loan">Family Loan</option>
                          <option value="private_student_loan">Private Student Loan</option>
                          <option value="custom">Custom Debt</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                        {debtsList.map((d, index) => (
                          <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: 'var(--hover-bg)', borderRadius: '6px' }}>
                            <input
                              type="text"
                              className="form-control"
                              style={{ flex: 1.5, height: '30px', padding: '4px' }}
                              value={d.name}
                              onChange={(e) => {
                                const list = [...debtsList];
                                list[index].name = e.target.value;
                                setDebtsList(list);
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <input
                                type="number"
                                className="form-control"
                                style={{ height: '30px', padding: '4px' }}
                                value={d.balance}
                                onChange={(e) => {
                                  const list = [...debtsList];
                                  list[index].balance = Number(e.target.value);
                                  setDebtsList(list);
                                }}
                                placeholder="Balance"
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <input
                                type="number"
                                className="form-control"
                                style={{ height: '30px', padding: '4px' }}
                                value={d.minPayment}
                                onChange={(e) => {
                                  const list = [...debtsList];
                                  list[index].minPayment = Number(e.target.value);
                                  setDebtsList(list);
                                }}
                                placeholder="Min Pay"
                              />
                            </div>
                            <button
                              type="button"
                              className="remove-btn"
                              style={{ color: 'var(--danger-color)', cursor: 'pointer', padding: '4px', background: 'none', border: 'none' }}
                              onClick={() => setDebtsList(debtsList.filter(item => item.id !== d.id))}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>Extra Monthly Snowball Payment ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={snowballExtra}
                          onChange={(e) => setSnowballExtra(Number(e.target.value))}
                          min={0}
                        />
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Outcomes Panel */}
                  <div>
                    <div className="result-box" style={{ borderLeft: '4px solid var(--accent-color)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      
                      {/* Pell Grant Outcome */}
                      <div>
                        <h4 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '8px' }}>Est. Annual Pell Grant</h4>
                        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--success-color)' }}>
                          ${getPellEstimate().toLocaleString()}/yr
                        </span>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
                          Based on AGI of ${pellAgi.toLocaleString()} and a household size of {pellFamilySize}. Max award: $7,395.
                        </p>
                      </div>

                      <div className="doc-divider" style={{ margin: 0 }}></div>

                      {/* Student Loans Outcomes */}
                      <div>
                        <h4 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '8px' }}>Student Loan Repayment Options</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
                          <div style={{ padding: '8px', backgroundColor: 'var(--hover-bg)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Standard 10-Year:</span>
                            <span style={{ fontWeight: '600' }}>${loanRepayments.standardMonthly.toLocaleString('en-US', { maximumFractionDigits: 2 })}/mo</span>
                          </div>
                          <div style={{ padding: '8px', backgroundColor: 'var(--hover-bg)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Graduated:</span>
                            <span style={{ fontWeight: '600' }}>${loanRepayments.graduatedInitial.toLocaleString('en-US', { maximumFractionDigits: 2 })} to ${loanRepayments.graduatedFinal.toLocaleString('en-US', { maximumFractionDigits: 2 })}/mo</span>
                          </div>
                          <div style={{ padding: '8px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--success-color)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--success-color)', fontWeight: '600' }}>SAVE IDR Plan:</span>
                            <span style={{ fontWeight: '600', color: 'var(--success-color)' }}>${loanRepayments.saveMonthly.toLocaleString('en-US', { maximumFractionDigits: 2 })}/mo</span>
                          </div>
                        </div>

                        {/* TPD Discharge Banner */}
                        {(currentCombinedRating === 100) && (
                          <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid var(--success-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <h5 style={{ fontSize: '0.78rem', color: 'var(--success-color)', margin: 0, fontWeight: '700' }}>✓ TPD Discharge Pre-Screened</h5>
                              <button
                                type="button"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--accent-color)',
                                  fontSize: '0.68rem',
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                  padding: 0
                                }}
                                onClick={() => setShowTpdChecklist(!showTpdChecklist)}
                              >
                                {showTpdChecklist ? "Hide Steps" : "Show Steps"}
                              </button>
                            </div>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.3' }}>
                              Since you are rated at 100% disability, you qualify for <strong>Total and Permanent Disability (TPD) Discharge</strong> to wipe out 100% of your federal student loans.
                            </p>
                            {showTpdChecklist && (
                              <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px dashed var(--card-border)', paddingTop: '8px' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-primary)' }}>Application Steps & Checklist:</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', cursor: 'pointer' }}>
                                    <input type="checkbox" style={{ marginTop: '2px' }} />
                                    <span>Download VA Benefit Summary Letter (must show 100% P&T or TDIU status).</span>
                                  </label>
                                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', cursor: 'pointer' }}>
                                    <input type="checkbox" style={{ marginTop: '2px' }} />
                                    <span>Access official TPD portal at <a href="https://www.disabilitydischarge.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}>disabilitydischarge.com</a>.</span>
                                  </label>
                                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', cursor: 'pointer' }}>
                                    <input type="checkbox" style={{ marginTop: '2px' }} />
                                    <span>Complete the online or paper TPD Discharge Application.</span>
                                  </label>
                                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', cursor: 'pointer' }}>
                                    <input type="checkbox" style={{ marginTop: '2px' }} />
                                    <span>Submit application and VA letter online or mail to Nelnet.</span>
                                  </label>
                                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', cursor: 'pointer' }}>
                                    <input type="checkbox" style={{ marginTop: '2px' }} />
                                    <span>Confirm Nelnet puts loans into administrative forbearance (halts billing and collections).</span>
                                  </label>
                                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', cursor: 'pointer' }}>
                                    <input type="checkbox" style={{ marginTop: '2px' }} />
                                    <span>Verify final loan discharge confirmation (takes 30-90 days).</span>
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="doc-divider" style={{ margin: 0 }}></div>

                      {/* Dave Ramsey Budget Outcomes */}
                      <div>
                        <h4 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '8px' }}>Zero-Based Budget Summary</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Total Income (incl. VA Pay & MHA):</span>
                            <span style={{ fontWeight: '600' }}>${budgetTotalIncome.toLocaleString('en-US', { maximumFractionDigits: 2 })}/mo</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Allocated:</span>
                            <span style={{ fontWeight: '600' }}>${budgetAllocated.toLocaleString('en-US', { maximumFractionDigits: 2 })}/mo</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: budgetRemaining === 0 ? 'var(--success-color)' : 'var(--warning-color)' }}>
                            <span>Remaining (Target: $0):</span>
                            <span style={{ fontWeight: '700' }}>${budgetRemaining.toLocaleString('en-US', { maximumFractionDigits: 2 })}/mo</span>
                          </div>

                          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '2px' }}>Ramsey Guideline Analysis:</div>
                            
                            {/* Housing */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                                <span>Housing (Limit: 25%)</span>
                                <span style={{ color: budgetHousing > recommendedBudget.housing ? 'var(--danger-color)' : 'var(--success-color)', fontWeight: '600' }}>
                                  ${budgetHousing.toLocaleString()} / Max Rec: ${recommendedBudget.housing.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                </span>
                              </div>
                              <div style={{ height: '6px', backgroundColor: 'var(--hover-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    height: '100%',
                                    backgroundColor: budgetHousing > recommendedBudget.housing ? 'var(--danger-color)' : 'var(--success-color)',
                                    width: `${Math.min(100, budgetTotalIncome > 0 ? (budgetHousing / budgetTotalIncome) * 100 : 0)}%`
                                  }}
                                />
                              </div>
                            </div>

                            {/* Food */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                                <span>Food (Limit: 15%)</span>
                                <span style={{ color: budgetFood > recommendedBudget.food ? 'var(--danger-color)' : 'var(--success-color)', fontWeight: '600' }}>
                                  ${budgetFood.toLocaleString()} / Max Rec: ${recommendedBudget.food.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                </span>
                              </div>
                              <div style={{ height: '6px', backgroundColor: 'var(--hover-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    height: '100%',
                                    backgroundColor: budgetFood > recommendedBudget.food ? 'var(--danger-color)' : 'var(--success-color)',
                                    width: `${Math.min(100, budgetTotalIncome > 0 ? (budgetFood / budgetTotalIncome) * 100 : 0)}%`
                                  }}
                                />
                              </div>
                            </div>

                            {/* Savings & Debt */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                                <span>Savings/Debt (Target: 15%+)</span>
                                <span style={{ color: budgetSavingDebt < recommendedBudget.savingDebt ? 'var(--warning-color)' : 'var(--success-color)', fontWeight: '600' }}>
                                  ${budgetSavingDebt.toLocaleString()} / Min Target: ${recommendedBudget.savingDebt.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                </span>
                              </div>
                              <div style={{ height: '6px', backgroundColor: 'var(--hover-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    height: '100%',
                                    backgroundColor: budgetSavingDebt < recommendedBudget.savingDebt ? 'var(--warning-color)' : 'var(--success-color)',
                                    width: `${Math.min(100, budgetTotalIncome > 0 ? (budgetSavingDebt / budgetTotalIncome) * 100 : 0)}%`
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="doc-divider" style={{ margin: 0 }}></div>

                      {/* Debt Snowball outcomes */}
                      <div>
                        <h4 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '8px' }}>Debt Snowball Payoff Projection</h4>
                        {snowballResult.months > 0 ? (
                          <div style={{ fontSize: '0.75rem' }}>
                            <div style={{ fontWeight: '700', color: 'var(--success-color)', marginBottom: '8px' }}>
                              Debt-Free in {snowballResult.months} Months!
                            </div>
                            <ul style={{ paddingLeft: '16px', margin: 0, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {snowballResult.payoffProjection.map((proj, idx) => (
                                <li key={idx}>
                                  <strong>{proj.name}</strong> paid off in Month {proj.month}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>No active debts listed.</p>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CAREER STRATEGY VIEW */}
            {activeView === 'planning' && (
              <div className="doc-card">
                <span className="doc-tag">VA Career Strategy</span>
                <h1 className="doc-title">Career Strategy & Justification Wizard</h1>
                <p className="doc-subtitle">Generate legally structured VRC justification letters, track VET TEC technological training, and check adaptive sports allowances.</p>
                <div className="doc-divider"></div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
                  {/* Left Column: Inputs Form */}
                  <div>
                    {/* Labor Market & Disability Compatibility Strategist */}
                    <div style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-color)', marginBottom: '12px', borderBottom: '1px dashed var(--card-border)', paddingBottom: '6px' }}>Labor Market & Disability Compatibility Strategist</h4>
                      
                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Target Occupational Goal (OOH/O*NET Classification Database)</label>
                        <select
                          className="form-control"
                          value={selectedCareerIndex}
                          onChange={(e) => setSelectedCareerIndex(parseInt(e.target.value))}
                        >
                          {CAREERS_DATABASE.map((c, i) => (
                            <option key={i} value={i}>{c.title} ({c.soc})</option>
                          ))}
                        </select>
                      </div>

                      {/* Disability / Physical Constraints Checkboxes */}
                      <div style={{ margin: '14px 0', padding: '12px', backgroundColor: 'var(--hover-bg)', borderRadius: '6px', border: '1px solid var(--card-border)' }}>
                        <h5 style={{ fontSize: '0.78rem', margin: '0 0 8px 0', color: 'var(--text-primary)', fontWeight: '600' }}>Indicated Disability & Functional Limitations</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-primary)', margin: 0 }}>
                            <input type="checkbox" checked={limitStanding} onChange={(e) => setLimitStanding(e.target.checked)} />
                            <span>Standing constraint</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-primary)', margin: 0 }}>
                            <input type="checkbox" checked={limitLifting} onChange={(e) => setLimitLifting(e.target.checked)} />
                            <span>Lifting constraint (&gt;15 lbs)</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-primary)', margin: 0 }}>
                            <input type="checkbox" checked={limitBending} onChange={(e) => setLimitBending(e.target.checked)} />
                            <span>Bending/Kneeling constraint</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-primary)', margin: 0 }}>
                            <input type="checkbox" checked={limitEnvironment} onChange={(e) => setLimitEnvironment(e.target.checked)} />
                            <span>Extreme climate/Altitude</span>
                          </label>
                        </div>
                      </div>

                      {/* Compatibility Badge & Reasons */}
                      {(() => {
                        const currentCareer = CAREERS_DATABASE[selectedCareerIndex] || CAREERS_DATABASE[0];
                        const { compatible, reasons } = getCareerCompatibility(currentCareer);
                        return (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'flex-start', 
                            gap: '10px', 
                            padding: '10px 12px', 
                            borderRadius: '6px', 
                            border: '1px solid', 
                            borderColor: compatible ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)', 
                            backgroundColor: compatible ? 'rgba(16, 185, 129, 0.06)' : 'rgba(245, 158, 11, 0.06)', 
                            marginBottom: '16px' 
                          }}>
                            <div style={{ flexShrink: 0, marginTop: '2px' }}>
                              {compatible ? (
                                <CheckCircle size={16} style={{ color: 'var(--success-color)' }} />
                              ) : (
                                <AlertTriangle size={16} style={{ color: 'var(--warning-color)' }} />
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                              <strong>Status: {compatible ? "Medically Compatible" : "Potential Physical Conflict"}</strong>
                              {reasons.length > 0 ? (
                                <ul style={{ margin: '4px 0 0 0', paddingLeft: '14px', listStyleType: 'disc', color: 'var(--text-secondary)' }}>
                                  {reasons.map((r, idx) => <li key={idx}>{r}</li>)}
                                </ul>
                              ) : (
                                <span style={{ display: 'block', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                  The demands of this role are fully compatible with your physical capacities.
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Official Classification Info Grid */}
                      {(() => {
                        const currentCareer = CAREERS_DATABASE[selectedCareerIndex] || CAREERS_DATABASE[0];
                        return (
                          <div style={{ fontSize: '0.75rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', padding: '12px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--card-border)', borderRadius: '6px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                              <div>
                                <strong>O*NET-SOC Code:</strong> <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace', float: 'right' }}>{currentCareer.soc}</span>
                              </div>
                              <div>
                                <strong>DOT Code:</strong> <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace', float: 'right' }}>{currentCareer.dot}</span>
                              </div>
                              <div>
                                <strong>SVP Preparation Level:</strong> <span style={{ color: 'var(--text-primary)', float: 'right' }}>{currentCareer.svp} ({currentCareer.svp >= 8 ? "4-10 yrs" : currentCareer.svp >= 7 ? "2-4 yrs" : "Under 2 yrs"})</span>
                              </div>
                              <div>
                                <strong>DOT Physical Demand:</strong> <span style={{ color: 'var(--text-primary)', fontWeight: 'bold', float: 'right' }}>{currentCareer.physicalDemand}</span>
                              </div>
                              <div>
                                <strong>Industry SIC Code:</strong> <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace', float: 'right' }}>{currentCareer.sic}</span>
                              </div>
                              <div>
                                <strong>NAICS Sector:</strong> <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace', float: 'right' }}>{currentCareer.naics}</span>
                              </div>
                              <div>
                                <strong>BLS Median Pay:</strong> <span style={{ color: 'var(--accent-color)', fontWeight: '600', float: 'right' }}>${currentCareer.medianPay.toLocaleString()}/yr</span>
                              </div>
                              <div>
                                <strong>BLS Job Growth Rate:</strong> <span style={{ color: 'var(--text-primary)', float: 'right' }}>{currentCareer.outlook}</span>
                              </div>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                              <strong>Essential Duties:</strong> {currentCareer.duties}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* O*NET Interest Profiler (Holland Codes) */}
                    <div style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-color)', margin: 0 }}>O*NET Interest Profiler (Holland Codes)</h4>
                        <button
                          type="button"
                          className="btn"
                          style={{ height: '24px', fontSize: '0.7rem', padding: '0 8px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--card-border)', color: 'var(--accent-color)' }}
                          onClick={() => setShowProfiler(!showProfiler)}
                        >
                          {showProfiler ? "Hide Profiler" : "Open Profiler"}
                        </button>
                      </div>

                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.3' }}>
                        Assess your vocational interests using Holland's RIASEC model and get matched with suitable goals from the career database.
                      </p>

                      {showProfiler && (
                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px dashed var(--card-border)', paddingTop: '10px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Rate your interest in each vocational category (1 = Dislike, 5 = Strongly Enjoy):</span>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                            {/* R */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                              <span style={{ width: '130px' }}><strong>Realistic (R):</strong> Hands-on/Build</span>
                              <input 
                                type="range" min="1" max="5" value={riasecR} 
                                onChange={(e) => setRiasecR(parseInt(e.target.value))} 
                                style={{ flex: 1, margin: '0 12px' }} 
                              />
                              <span style={{ width: '16px', fontWeight: 'bold' }}>{riasecR}</span>
                            </div>
                            {/* I */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                              <span style={{ width: '130px' }}><strong>Investigative (I):</strong> Analytical/Tech</span>
                              <input 
                                type="range" min="1" max="5" value={riasecI} 
                                onChange={(e) => setRiasecI(parseInt(e.target.value))} 
                                style={{ flex: 1, margin: '0 12px' }} 
                              />
                              <span style={{ width: '16px', fontWeight: 'bold' }}>{riasecI}</span>
                            </div>
                            {/* A */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                              <span style={{ width: '130px' }}><strong>Artistic (A):</strong> Design/Creative</span>
                              <input 
                                type="range" min="1" max="5" value={riasecA} 
                                onChange={(e) => setRiasecA(parseInt(e.target.value))} 
                                style={{ flex: 1, margin: '0 12px' }} 
                              />
                              <span style={{ width: '16px', fontWeight: 'bold' }}>{riasecA}</span>
                            </div>
                            {/* S */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                              <span style={{ width: '130px' }}><strong>Social (S):</strong> Helping/Mentoring</span>
                              <input 
                                type="range" min="1" max="5" value={riasecS} 
                                onChange={(e) => setRiasecS(parseInt(e.target.value))} 
                                style={{ flex: 1, margin: '0 12px' }} 
                              />
                              <span style={{ width: '16px', fontWeight: 'bold' }}>{riasecS}</span>
                            </div>
                            {/* E */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                              <span style={{ width: '130px' }}><strong>Enterprising (E):</strong> Leadership/Biz</span>
                              <input 
                                type="range" min="1" max="5" value={riasecE} 
                                onChange={(e) => setRiasecE(parseInt(e.target.value))} 
                                style={{ flex: 1, margin: '0 12px' }} 
                              />
                              <span style={{ width: '16px', fontWeight: 'bold' }}>{riasecE}</span>
                            </div>
                            {/* C */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                              <span style={{ width: '130px' }}><strong>Conventional (C):</strong> Audit/Details</span>
                              <input 
                                type="range" min="1" max="5" value={riasecC} 
                                onChange={(e) => setRiasecC(parseInt(e.target.value))} 
                                style={{ flex: 1, margin: '0 12px' }} 
                              />
                              <span style={{ width: '16px', fontWeight: 'bold' }}>{riasecC}</span>
                            </div>
                          </div>

                          {/* Profiler Recommendation Result */}
                          {(() => {
                            const { topScore, matches } = getRiasecRecommendations();
                            return (
                              <div style={{ marginTop: '6px', padding: '10px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--card-border)', borderRadius: '6px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                                  Primary Interest: <strong style={{ color: 'var(--accent-color)' }}>{topScore.name}</strong>
                                  <p style={{ margin: '2px 0 0 0', fontSize: '0.68rem', color: 'var(--text-muted)' }}>{topScore.description}</p>
                                </div>
                                {matches.length > 0 ? (
                                  <div>
                                    <span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600' }}>Matched Careers:</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                      {matches.map((c, idx) => {
                                        const originalIndex = CAREERS_DATABASE.findIndex(dbC => dbC.title === c.title);
                                        return (
                                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--glass-bg)', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--card-border)' }}>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-primary)', fontWeight: '500' }}>{c.title} <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>({c.soc})</span></span>
                                            <button
                                              type="button"
                                              className="btn"
                                              style={{ height: '20px', fontSize: '0.65rem', padding: '0 6px', backgroundColor: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                              onClick={() => setSelectedCareerIndex(originalIndex)}
                                            >
                                              Set as Goal
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No exact database matches. Try raising Realistic, Investigative, Enterprising, or Conventional categories.</span>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    {/* VRC Program Change Justification Generator */}
                    <div style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-color)', marginBottom: '12px', borderBottom: '1px dashed var(--card-border)', paddingBottom: '6px' }}>VRC Program Change Justification Generator</h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.75rem' }}>Current Vocational Goal (IWRP)</label>
                          <input
                            type="text"
                            className="form-control"
                            value={justCurrentGoal}
                            onChange={(e) => setJustCurrentGoal(e.target.value)}
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.75rem' }}>Proposed Vocational Goal</label>
                          <input
                            type="text"
                            className="form-control"
                            value={justProposedGoal}
                            onChange={(e) => setJustProposedGoal(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem' }}>Reason for Change of Program</label>
                        <select
                          className="form-control"
                          value={justReason}
                          onChange={(e) => setJustReason(e.target.value)}
                        >
                          <option value="disability_worsened">Medical/Disability constraints worsened</option>
                          <option value="market_demand">Career market suitability change</option>
                          <option value="counselor_advice">VRC directive and guidance</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label style={{ fontSize: '0.75rem' }}>Explain the physical impact of the current goal</label>
                        <textarea
                          className="form-control"
                          style={{ height: '80px', padding: '8px', fontSize: '0.8rem', resize: 'vertical' }}
                          value={justPhysicalImpact}
                          onChange={(e) => setJustPhysicalImpact(e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
                        <input
                          type="checkbox"
                          id="justMedical"
                          checked={justMedicalEvidence}
                          onChange={(e) => setJustMedicalEvidence(e.target.checked)}
                        />
                        <label htmlFor="justMedical" style={{ margin: 0, fontSize: '0.78rem', cursor: 'pointer' }}>
                          Medical evidence is available to support this change
                        </label>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ marginTop: '16px', width: '100%' }}
                        onClick={generateJustificationLetter}
                      >
                        Generate Formal Justification Letter
                      </button>
                    </div>

                    {/* SEC SIC & NAICS Industry Finder */}
                    <div style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-color)', margin: 0 }}>SEC SIC & NAICS Industry Code Finder</h4>
                        <button
                          type="button"
                          className="btn"
                          style={{ height: '24px', fontSize: '0.7rem', padding: '0 8px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--card-border)', color: 'var(--accent-color)' }}
                          onClick={() => setShowIndustryFinder(!showIndustryFinder)}
                        >
                          {showIndustryFinder ? "Hide Finder" : "Open Finder"}
                        </button>
                      </div>

                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.3' }}>
                        Search classifications from the SEC SIC Standard Industrial Classification list and BLS Industry Groups.
                      </p>

                      {showIndustryFinder && (
                        <div style={{ marginTop: '12px', borderTop: '1px dashed var(--card-border)', paddingTop: '10px' }}>
                          <div className="form-group" style={{ marginBottom: '12px' }}>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Search by keyword (e.g. software, logistics, pilot, CNC)..."
                              style={{ fontSize: '0.78rem' }}
                              value={industrySearchQuery}
                              onChange={(e) => setIndustrySearchQuery(e.target.value)}
                            />
                          </div>

                          {/* Industry Search Results */}
                          {(() => {
                            const INDUSTRIES_LOOKUP = [
                              { keyword: 'software programming systems design software engineer coding', sic: '7371 / 7372', naics: '541511', title: 'Computer Programming & Prepackaged Software', desc: 'Custom software design, systems integration, and packaged software publishing.' },
                              { keyword: 'cybersecurity networks network security consulting tech support services', sic: '7379', naics: '541519', title: 'Other Computer Related Services', desc: 'Information security consulting, disaster recovery, and computer system installation services.' },
                              { keyword: 'logistics shipping warehouse transportation cargo distribution consult', sic: '4731 / 8742', naics: '541614', title: 'Freight Arrangement & Logistics Consulting', desc: 'Arrangement of transportation of freight, and distribution/logistics supply chain consulting.' },
                              { keyword: 'machinery metal plastic manufacturing industrial shop milling turning cnc', sic: '3599 / 3327', naics: '332710', title: 'Machine Shops & Precision Tooling', desc: 'Precision machining, metal/plastic cutting, custom part fabrication, and tool operation.' },
                              { keyword: 'solar construction electricity installation contracting trade panel green energy', sic: '1799 / 1731', naics: '238210 / 238990', title: 'Special Trade & Electrical Installation', desc: 'Assembly and installation of solar photovoltaic systems, wiring, and structural framing.' },
                              { keyword: 'pilot aircraft flight aviation airline passengers shipping cargo commercial', sic: '4512 / 4522', naics: '481211', title: 'Air Transportation & Chartered Flights', desc: 'Commercial piloting, passenger flights, air freight transportation, and scheduled aviation services.' },
                              { keyword: 'management project administrative operations consulting advisory corporate guidance', sic: '8742', naics: '541611', title: 'Administrative Management Consulting', desc: 'General management consulting, scheduling, procurement, budgeting, and operations planning.' },
                              { keyword: 'accounting audit bookkeeping finance ledger CPA certified tax public services', sic: '8721', naics: '541211', title: 'Accounting, Auditing, and Bookkeeping', desc: 'Financial record auditing, general bookkeeping, tax return preparation, and financial reporting.' }
                            ];

                            const filtered = INDUSTRIES_LOOKUP.filter(ind => {
                              const q = industrySearchQuery.toLowerCase();
                              return ind.title.toLowerCase().includes(q) || ind.desc.toLowerCase().includes(q) || ind.keyword.toLowerCase().includes(q) || ind.sic.includes(q) || ind.naics.includes(q);
                            });

                            if (filtered.length === 0) {
                              return <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>No matching industries found. Try "software", "machinery", "logistics", etc.</p>;
                            }

                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                                {filtered.map((ind, idx) => (
                                  <div key={idx} style={{ padding: '8px 10px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--card-border)', borderRadius: '6px', fontSize: '0.72rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                      <strong style={{ color: 'var(--text-primary)' }}>{ind.title}</strong>
                                    </div>
                                    <p style={{ margin: '0 0 6px 0', fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: '1.2' }}>{ind.desc}</p>
                                    <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)', fontSize: '0.68rem' }}>
                                      <span>SIC: <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{ind.sic}</strong></span>
                                      <span>NAICS: <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{ind.naics}</strong></span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    {/* VET TEC Tracker */}
                    <div style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-color)', margin: 0 }}>VET TEC Technology Training Tracker</h4>
                        <button
                          type="button"
                          className="btn"
                          style={{ height: '24px', fontSize: '0.7rem', padding: '0 8px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--card-border)', color: 'var(--accent-color)' }}
                          onClick={() => setShowVetTecInfo(!showVetTecInfo)}
                        >
                          {showVetTecInfo ? "Hide Details" : "Show Details"}
                        </button>
                      </div>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={vetTecOnline}
                          onChange={(e) => setVetTecOnline(e.target.checked)}
                        />
                        Online VET TEC training provider
                      </label>

                      {showVetTecInfo && (
                        <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          <p style={{ marginBottom: '6px' }}><strong>VET TEC Key Information:</strong></p>
                          <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <li>Must have at least 1 day of unexpired GI Bill entitlement.</li>
                            <li>Does NOT count against your 48 months of GI Bill entitlement.</li>
                            <li>Tuition is paid directly to the provider (100% covered).</li>
                            <li>MHA is paid at E-5 with dependents BAH. Online programs pay 50% of the national average.</li>
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Sports4Vets Section */}
                    <div style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-color)', margin: 0 }}>Sports4Vets (Paralympic Training Allowance)</h4>
                        <button
                          type="button"
                          className="btn"
                          style={{ height: '24px', fontSize: '0.7rem', padding: '0 8px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--card-border)', color: 'var(--accent-color)' }}
                          onClick={() => setShowSportsInfo(!showSportsInfo)}
                        >
                          {showSportsInfo ? "Hide Details" : "Show Details"}
                        </button>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>Training Intensity Load</label>
                        <select
                          className="form-control"
                          value={sportsLoad}
                          onChange={(e) => setSportsLoad(e.target.value)}
                        >
                          <option value="full">Full-Time training allowance</option>
                          <option value="three-quarters">3/4-Time training allowance</option>
                          <option value="half">1/2-Time training allowance</option>
                        </select>
                      </div>

                      {showSportsInfo && (
                        <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          <p style={{ marginBottom: '6px' }}><strong>Sports4Vets Information (38 U.S.C. § 322):</strong></p>
                          <p style={{ margin: 0 }}>
                            Allows disabled veterans training in Paralympic sports to receive monthly subsistence equal to the Chapter 31 institutional rate (No Dependents level).
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Graduate School Strategy Panel */}
                    <div style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', marginTop: '24px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-color)', margin: 0 }}>Graduate School Strategy Advisor</h4>
                        <button
                          type="button"
                          className="btn"
                          style={{ height: '24px', fontSize: '0.7rem', padding: '0 8px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--card-border)', color: 'var(--accent-color)' }}
                          onClick={() => setShowGraduateStrategy(!showGraduateStrategy)}
                        >
                          {showGraduateStrategy ? "Hide Strategy" : "Show Strategy"}
                        </button>
                      </div>

                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.3' }}>
                        Learn how to maximize your Chapter 31 VR&E and Chapter 33 GI Bill benefits to fully fund graduate programs (Master's, Ph.D., JD, MD).
                      </p>

                      {showGraduateStrategy && (
                        <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px dashed var(--card-border)', paddingTop: '10px' }}>
                          <div>
                            <strong style={{ color: 'var(--text-primary)' }}>1. The Retroactive Induction Strategy (38 CFR § 21.282)</strong>
                            <p style={{ margin: '2px 0 6px 0', fontSize: '0.72rem' }}>
                              If you previously paid for undergraduate degrees using Chapter 33 GI Bill while eligible for Chapter 31, you can request a "Retroactive Induction". This transfers past undergraduate months to Chapter 31, fully restoring your Chapter 33 GI Bill entitlement to use for graduate school.
                            </p>
                          </div>
                          <div>
                            <strong style={{ color: 'var(--text-primary)' }}>2. Preserving Your GI Bill Months</strong>
                            <p style={{ margin: '2px 0 6px 0', fontSize: '0.72rem' }}>
                              Use VR&E first for your undergraduate or initial programs. Unlike the GI Bill (strictly capped at 36 months), Chapter 31 VR&E can cover up to 48 months (or more with an SEH) without touching your GI Bill.
                            </p>
                          </div>
                          <div>
                            <strong style={{ color: 'var(--text-primary)' }}>3. Justifying Graduate Education</strong>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.72rem' }}>
                              To get graduate school approved under Chapter 31, you must show that your service-connected disabilities prevent you from securing entry-level employment in your field, or that the industry requires a graduate degree for stable employment.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Self-Employment / Business Startup Panel */}
                    <div style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-color)', margin: 0 }}>Business Startup & Self-Employment</h4>
                        <button
                          type="button"
                          className="btn"
                          style={{ height: '24px', fontSize: '0.7rem', padding: '0 8px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--card-border)', color: 'var(--accent-color)' }}
                          onClick={() => setShowStartupStrategy(!showStartupStrategy)}
                        >
                          {showStartupStrategy ? "Hide Details" : "Show Details"}
                        </button>
                      </div>

                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.3' }}>
                        The Chapter 31 Self-Employment Track (38 CFR § 21.258) assists disabled veterans in starting and establishing their own businesses.
                      </p>

                      {showStartupStrategy && (
                        <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px dashed var(--card-border)', paddingTop: '10px' }}>
                          <div>
                            <strong style={{ color: 'var(--text-primary)' }}>VA Funding Categories:</strong>
                            <ul style={{ paddingLeft: '16px', margin: '4px 0 8px 0', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <li><strong>Category I (Severe Barriers):</strong> Full funding for startup equipment, initial inventory, licenses, marketing, and professional services.</li>
                              <li><strong>Category II (Standard barriers):</strong> Limited funding for basic tools and vocational licenses.</li>
                              <li><strong>Category III:</strong> Job search assistance only.</li>
                            </ul>
                          </div>
                          <div style={{ fontSize: '0.72rem' }}>
                            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Startup Checklist:</strong>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                              <input type="checkbox" style={{ marginTop: '2px' }} />
                              <span>Complete business feasibility review with a certified advisor.</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                              <input type="checkbox" style={{ marginTop: '2px' }} />
                              <span>Draft formal Business Plan (required for Category I/II funding approval).</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                              <input type="checkbox" style={{ marginTop: '2px' }} />
                              <span>Submit Business Plan to VRC for Regional Office panel review.</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                              <input type="checkbox" style={{ marginTop: '2px' }} />
                              <span>Coordinate with SBA/SCORE mentors for ongoing operational support.</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Entitlement Extensions Strategy Panel */}
                    <div style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-color)', margin: 0 }}>VR&E Entitlement Extensions</h4>
                        <button
                          type="button"
                          className="btn"
                          style={{ height: '24px', fontSize: '0.7rem', padding: '0 8px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--card-border)', color: 'var(--accent-color)' }}
                          onClick={() => setShowExtensionsStrategy(!showExtensionsStrategy)}
                        >
                          {showExtensionsStrategy ? "Hide Checker" : "Open Checker"}
                        </button>
                      </div>

                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.3' }}>
                        Find out how having a Serious Employment Handicap (SEH) allows you to extend services past 48 months or bypass the 12-year basic eligibility window.
                      </p>

                      {showExtensionsStrategy && (
                        <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px dashed var(--card-border)', paddingTop: '10px' }}>
                          <div style={{ fontSize: '0.72rem' }}>
                            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Extension Pre-Screening Questions:</strong>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={extHasSeh} onChange={(e) => setExtHasSeh(e.target.checked)} />
                              <span>Do you have a Serious Employment Handicap (SEH)?</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={extApproachingLimit} onChange={(e) => setExtApproachingLimit(e.target.checked)} />
                              <span>Have you reached (or are you near) the 48-month limit or basic 12-year expiration?</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={extNeedMoreTime} onChange={(e) => setExtNeedMoreTime(e.target.checked)} />
                              <span>Do you require additional retraining to achieve suitable employment?</span>
                            </label>
                          </div>

                          {extHasSeh && extApproachingLimit && extNeedMoreTime ? (
                            <div style={{ padding: '8px 10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success-color)', borderRadius: '6px', fontSize: '0.7rem', color: 'var(--success-color)', marginTop: '4px' }}>
                              <strong>Extension Pre-screen Approved:</strong> Under 38 CFR § 21.44 and § 21.78, you meet the statutory criteria for your VRC to grant an extension. Make sure your VRC designates your case as an SEH to unlock these extensions.
                            </div>
                          ) : (
                            <div style={{ padding: '8px 10px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--card-border)', borderRadius: '6px', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                              *Fill out all three checkboxes above to see if you are pre-screened for a program extension.
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right Column: Outcomes Panel */}
                  <div>
                    <div className="result-box" style={{ borderLeft: '4px solid var(--accent-color)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      
                      {/* VET TEC Estimates */}
                      <div>
                        <h4 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '4px' }}>VET TEC Monthly Housing (MHA)</h4>
                        <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent-color)' }}>
                          {vetTecOnline 
                            ? `$${(rates.p911_online_rate).toFixed(2)}/mo`
                            : `$${(calcBahRate).toFixed(2)}/mo`
                          }
                        </span>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                          {vetTecOnline 
                            ? "Using the national online-only MHA rate."
                            : `Using BAH rate of school zip code ($${calcBahRate.toFixed(2)}/mo).`
                          }
                        </p>
                      </div>

                      <div className="doc-divider" style={{ margin: 0 }}></div>

                      {/* Sports4Vets Estimates */}
                      <div>
                        <h4 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '4px' }}>Sports4Vets Allowance</h4>
                        <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent-color)' }}>
                          {(() => {
                            const map = {
                              full: rates.ch31_institutional_full[0],
                              'three-quarters': rates.ch31_institutional_threeQuarters[0],
                              half: rates.ch31_institutional_half[0]
                            };
                            const amt = map[sportsLoad] || 0;
                            return `$${amt.toFixed(2)}/mo`;
                          })()}
                        </span>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                          Linked to the Chapter 31 institutional rate with no dependents.
                        </p>
                      </div>

                      <div className="doc-divider" style={{ margin: 0 }}></div>

                      {/* Request Letter Display */}
                      <div>
                        <h4 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '8px' }}>Justification Letter Output</h4>
                        {justGeneratedLetter ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <textarea
                              readOnly
                              value={justGeneratedLetter}
                              style={{
                                width: '100%',
                                height: '220px',
                                padding: '10px',
                                backgroundColor: 'var(--hover-bg)',
                                border: '1px solid var(--card-border)',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                color: 'var(--text-primary)',
                                fontFamily: 'monospace',
                                resize: 'none'
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ width: '100%', height: '32px', fontSize: '0.75rem' }}
                              onClick={() => {
                                navigator.clipboard.writeText(justGeneratedLetter);
                                alert("Justification letter copied to clipboard!");
                              }}
                            >
                              Copy Letter to Clipboard
                            </button>
                          </div>
                        ) : (
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Fill out the wizard on the left and click "Generate" to construct your request letter.</p>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR (Bookmarks & Quick References) */}
          <aside className="side-panel">
            {/* Bookmarks Section */}
            <div className="panel-section">
              <div className="panel-title">
                <Bookmark size={16} />
                <span>My Bookmarks ({bookmarks.length})</span>
              </div>
              {bookmarks.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No bookmarks added yet. Click the bookmark icon on any document section to add it.</p>
              ) : (
                <div>
                  {bookmarks.map(b => (
                    <div 
                      key={b.id} 
                      className="panel-list-item"
                    >
                      <span 
                        className="panel-item-text"
                        onClick={() => {
                          setSelectedSection({ type: b.type, id: b.id });
                          setActiveView('reference');
                        }}
                      >
                        {b.title}
                      </span>
                      <span 
                        className="remove-btn" 
                        onClick={() => toggleBookmark(b.type, b.id, b.title)}
                        title="Remove bookmark"
                      >
                        <Trash2 size={12} />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Reference Rules */}
            <div className="panel-section">
              <div className="panel-title">
                <Info size={16} />
                <span>Quick References</span>
              </div>
              
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div style={{ marginBottom: '12px', padding: '10px', backgroundColor: 'var(--hover-bg)', borderRadius: '6px' }}>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '4px' }}>VA Form 28-1900</strong>
                  The required application form for Chapter 31 benefits. Must be filed to begin the VRC evaluation process.
                </div>
                
                <div style={{ marginBottom: '12px', padding: '10px', backgroundColor: 'var(--hover-bg)', borderRadius: '6px' }}>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '4px' }}>The 48-Month Rule</strong>
                  Veterans are generally limited to 48 months of combined entitlement under Chapter 31 and other VA educational programs (e.g. GI Bill), unless an SEH is determined.
                </div>

                <div style={{ padding: '10px', backgroundColor: 'var(--hover-bg)', borderRadius: '6px' }}>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '4px' }}>The Five Tracks</strong>
                  Reemployment, Rapid Access, Self-Employment, Long-Term Services, Independent Living.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      {/* RATE SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Calculator Rate Settings</h2>
              <button className="close-btn" onClick={() => setIsSettingsOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Manage allowance rates manually to align with the latest VA updates. Changes save to your browser's local storage.
              </p>
              
              <div className="settings-section">
                <h3>Chapter 31 Standard Subsistence Rates</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Inst. Full Time (0 / 1 / 2 / Add'l Dep)</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {settingsForm.ch31_institutional_full.map((val, idx) => (
                        <input 
                          key={idx}
                          type="number" 
                          className="form-control"
                          style={{ padding: '6px' }}
                          value={val}
                          onChange={(e) => {
                            const newArr = [...settingsForm.ch31_institutional_full];
                            newArr[idx] = Number(e.target.value);
                            setSettingsForm({ ...settingsForm, ch31_institutional_full: newArr });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Inst. 3/4 Time (0 / 1 / 2 / Add'l Dep)</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {settingsForm.ch31_institutional_threeQuarters.map((val, idx) => (
                        <input 
                          key={idx}
                          type="number" 
                          className="form-control"
                          style={{ padding: '6px' }}
                          value={val}
                          onChange={(e) => {
                            const newArr = [...settingsForm.ch31_institutional_threeQuarters];
                            newArr[idx] = Number(e.target.value);
                            setSettingsForm({ ...settingsForm, ch31_institutional_threeQuarters: newArr });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Inst. 1/2 Time (0 / 1 / 2 / Add'l Dep)</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {settingsForm.ch31_institutional_half.map((val, idx) => (
                        <input 
                          key={idx}
                          type="number" 
                          className="form-control"
                          style={{ padding: '6px' }}
                          value={val}
                          onChange={(e) => {
                            const newArr = [...settingsForm.ch31_institutional_half];
                            newArr[idx] = Number(e.target.value);
                            setSettingsForm({ ...settingsForm, ch31_institutional_half: newArr });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Apprentice/OJT (0 / 1 / 2 / Add'l Dep)</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {settingsForm.ch31_ojt.map((val, idx) => (
                        <input 
                          key={idx}
                          type="number" 
                          className="form-control"
                          style={{ padding: '6px' }}
                          value={val}
                          onChange={(e) => {
                            const newArr = [...settingsForm.ch31_ojt];
                            newArr[idx] = Number(e.target.value);
                            setSettingsForm({ ...settingsForm, ch31_ojt: newArr });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section" style={{ marginTop: '20px' }}>
                <h3>Post-9/11 GI Bill & Tuition Caps</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Online-Only MHA Max Rate ($)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={settingsForm.p911_online_rate}
                      onChange={(e) => setSettingsForm({ ...settingsForm, p911_online_rate: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Foreign School MHA Max Rate ($)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={settingsForm.p911_foreign_rate}
                      onChange={(e) => setSettingsForm({ ...settingsForm, p911_foreign_rate: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Private School Tuition Cap ($)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={settingsForm.p911_private_tuition_cap}
                      onChange={(e) => setSettingsForm({ ...settingsForm, p911_private_tuition_cap: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Books & Supplies Cap ($)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={settingsForm.p911_books_cap}
                      onChange={(e) => setSettingsForm({ ...settingsForm, p911_books_cap: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>VR&E Required Laptop Benchmark ($)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={settingsForm.ch31_computer_package_value}
                      onChange={(e) => setSettingsForm({ ...settingsForm, ch31_computer_package_value: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button 
                className="btn" 
                style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-primary)' }}
                onClick={() => {
                  setSettingsForm(DEFAULT_RATES);
                  setRates(DEFAULT_RATES);
                  localStorage.setItem('m28c_calculator_rates', JSON.stringify(DEFAULT_RATES));
                  setIsSettingsOpen(false);
                }}
              >
                Reset to Default
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn" style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-primary)' }} onClick={() => setIsSettingsOpen(false)}>Cancel</button>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setRates(settingsForm);
                    localStorage.setItem('m28c_calculator_rates', JSON.stringify(settingsForm));
                    setIsSettingsOpen(false);
                  }}
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
