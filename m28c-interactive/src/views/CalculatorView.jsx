import React, { useState, useEffect } from 'react';
import { Search, Info, Settings, HelpCircle, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';
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
  // Resolve active rates target year
  const activeRates = rates[selectedRateYear] || rates.ay2026 || rates;

  // Localized Calculator States
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
  const [calcYrDivision, setCalcYrDivision] = useState('');
  const [calcKicker, setCalcKicker] = useState(0);
  const [calcScholarships, setCalcScholarships] = useState(0);
  const [calcIncludeComputer, setCalcIncludeComputer] = useState(false);
  const [calcComputerCost, setCalcComputerCost] = useState(activeRates.ch31_computer_package_value || 2000.00);
  const [calcOjtTrainingWage, setCalcOjtTrainingWage] = useState(0);
  const [calcOjtJourneymanWage, setCalcOjtJourneymanWage] = useState(0);
  const [calcCalculatorTab, setCalcCalculatorTab] = useState('monthly'); // 'monthly' | 'tuition' | 'ojt'
  const [calcSchoolSearchQuery, setCalcSchoolSearchQuery] = useState('');
  const [calcSelectedSchool, setCalcSelectedSchool] = useState(null);
  const [calcShowSuggestions, setCalcShowSuggestions] = useState(false);
  const [schoolsDatabase, setSchoolsDatabase] = useState([]);

  // Fetch complete GI Bill colleges database on load locally
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}schools.json`)
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
          onlineOnly: arr[0].toLowerCase().includes('online') || arr[0].toLowerCase().includes('distance learning'),
          yellowRibbonDetails: arr[23] || null
        }));
        // Blend in mock institutions to ensure tests/cautions demo works
        setSchoolsDatabase([...mapped, ...SCHOOLS_DATABASE.filter(s => s.id.includes('mock'))]);
      })
      .catch(err => {
        console.error('Error loading schools database, using fallback:', err);
        setSchoolsDatabase(SCHOOLS_DATABASE);
      });
  }, []);

  const activeSchools = schoolsDatabase.length > 0 ? schoolsDatabase : SCHOOLS_DATABASE;

  // Run allowance calculation on the fly
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

  // Calculate MHA and propagate to parent for budget autofill
  const budgetMhaAmount = calculatorResults 
    ? (Number(calculatorResults.p911Rate) > Number(calculatorResults.regularRate) 
        ? Number(calculatorResults.p911Rate) 
        : Number(calculatorResults.regularRate))
    : 0;

  useEffect(() => {
    onMhaChange(budgetMhaAmount);
  }, [budgetMhaAmount, onMhaChange]);

  // Reset default computer package cost when rate year updates
  useEffect(() => {
    setCalcComputerCost(activeRates.ch31_computer_package_value || 2000.00);
  }, [selectedRateYear, activeRates.ch31_computer_package_value]);

  return (
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
          onClick={openSettings}
        >
          <Settings size={12} />
          <span>Manage Base Rates</span>
        </button>
      </div>
      <h1 className="doc-title">Subsistence Allowance & Housing Calculator</h1>
      <p className="doc-subtitle">Compare regular Chapter 31 rates side-by-side with Post-9/11 housing options, including tuition offsets, books stipends, and OJT schedules.</p>
      
      {/* Rate Year Selector & Verification Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '12px 16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', marginBottom: '24px', marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Academic Year Rates:</span>
          <select
            className="form-control"
            style={{ width: 'auto', height: '32px', padding: '0 8px', fontSize: '0.8rem', minWidth: '150px' }}
            value={selectedRateYear}
            onChange={(e) => {
              setSelectedRateYear(e.target.value);
              const active = rates[e.target.value] || rates.ay2026;
              setCalcComputerCost(active.ch31_computer_package_value || 2000.00);
            }}
          >
            <option value="ay2025">AY 2025 - 2026</option>
            <option value="ay2026">AY 2026 - 2027 (Future/Current)</option>
          </select>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Rates Last Verified: <strong>{rates.lastVerified || "2026-05-23"}</strong></span>
        </div>
      </div>

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
                <label style={{ margin: 0 }}>GI Bill Eligibility Tier</label>
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
              )}

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

                {(() => {
                  const annualTuitionAndFees = Number(calcTuition);
                  const annualSupplies = calcIncludeComputer ? Number(calcComputerCost) : 0;
                  const totalAnnualCost = annualTuitionAndFees + annualSupplies;
                  
                  if (totalAnnualCost >= 50000) {
                    return (
                      <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '16px' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--danger-color)', margin: 0 }}>
                          <strong>VREO Approval Required:</strong> Annual program cost of ${totalAnnualCost.toLocaleString()} exceeds the $50,000 threshold. Rehabilitation plans with annual costs of $50,000 to $75,000 require VR&E Officer (VREO) approval. Costs above $75,000 require higher-level executive approval. (M28C.V.B.5.01)
                        </p>
                      </div>
                    );
                  } else if (totalAnnualCost > 25000) {
                    return (
                      <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', marginBottom: '16px' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--warning-color)', margin: 0 }}>
                          <strong>VREO Threshold Alert:</strong> Annual program cost is ${totalAnnualCost.toLocaleString()}. If this is an Individualized Extended Evaluation Plan (IEEP), VREO approval is required because it exceeds the $25,000 threshold. For regular plans, VREO approval is required starting at $50,000. (M28C.V.B.5.01)
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}

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
  );
}

export default CalculatorView;
