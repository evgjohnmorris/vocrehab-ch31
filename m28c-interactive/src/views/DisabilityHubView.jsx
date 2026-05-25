import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  VA_DISABILITY_COMP_TABLE_2026, 
  VA_PENSION_MAPR_2026, 
  SMC_RATES_2026 
} from '../data/data';
import { 
  calculateCombinedRating, 
  calculateDisabilityPay, 
  calculatePensionResult, 
  calculateRetirementResult 
} from '../utils/disabilityMath';

function BodyLimbSelector({ selectedLimbs = {}, onChange }) {
  const toggleLimb = (limb) => {
    const updated = {
      leftArm: false,
      rightArm: false,
      leftLeg: false,
      rightLeg: false,
      ...selectedLimbs,
      [limb]: !selectedLimbs[limb]
    };
    onChange(updated);
  };

  const getStroke = (isActive) => isActive ? '#818cf8' : '#475569';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(15, 23, 42, 0.3)', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
      <svg width="40" height="60" viewBox="0 0 60 90" style={{ userSelect: 'none' }}>
        {/* Head */}
        <circle cx="30" cy="12" r="6" fill="#475569" />
        {/* Torso */}
        <rect x="24" y="20" width="12" height="30" rx="3" fill="#475569" />
        
        {/* Left Arm */}
        <path
          d="M 22 22 L 12 45"
          stroke={getStroke(selectedLimbs.leftArm)}
          strokeWidth="6"
          strokeLinecap="round"
          style={{ cursor: 'pointer', transition: 'stroke 0.2s' }}
          onClick={() => toggleLimb('leftArm')}
          tabIndex={0}
          aria-label="Left Arm"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleLimb('leftArm'); } }}
        />
        {/* Right Arm */}
        <path
          d="M 38 22 L 48 45"
          stroke={getStroke(selectedLimbs.rightArm)}
          strokeWidth="6"
          strokeLinecap="round"
          style={{ cursor: 'pointer', transition: 'stroke 0.2s' }}
          onClick={() => toggleLimb('rightArm')}
          tabIndex={0}
          aria-label="Right Arm"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleLimb('rightArm'); } }}
        />
        {/* Left Leg */}
        <path
          d="M 26 52 L 20 80"
          stroke={getStroke(selectedLimbs.leftLeg)}
          strokeWidth="6"
          strokeLinecap="round"
          style={{ cursor: 'pointer', transition: 'stroke 0.2s' }}
          onClick={() => toggleLimb('leftLeg')}
          tabIndex={0}
          aria-label="Left Leg"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleLimb('leftLeg'); } }}
        />
        {/* Right Leg */}
        <path
          d="M 34 52 L 40 80"
          stroke={getStroke(selectedLimbs.rightLeg)}
          strokeWidth="6"
          strokeLinecap="round"
          style={{ cursor: 'pointer', transition: 'stroke 0.2s' }}
          onClick={() => toggleLimb('rightLeg')}
          tabIndex={0}
          aria-label="Right Leg"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleLimb('rightLeg'); } }}
        />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '0.62rem', fontWeight: 'bold', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Limbs Affected</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
          <button
            type="button"
            onClick={() => toggleLimb('leftArm')}
            style={{
              padding: '2px 4px',
              borderRadius: '4px',
              fontSize: '0.65rem',
              fontWeight: 'bold',
              border: '1px solid',
              cursor: 'pointer',
              backgroundColor: selectedLimbs.leftArm ? 'rgba(99, 102, 241, 0.2)' : 'var(--glass-bg)',
              borderColor: selectedLimbs.leftArm ? 'var(--accent-color)' : 'var(--card-border)',
              color: selectedLimbs.leftArm ? 'var(--accent-color)' : 'var(--text-secondary)',
              outline: 'none'
            }}
            aria-label="Left Arm extremity"
          >
            L Arm
          </button>
          <button
            type="button"
            onClick={() => toggleLimb('rightArm')}
            style={{
              padding: '2px 4px',
              borderRadius: '4px',
              fontSize: '0.65rem',
              fontWeight: 'bold',
              border: '1px solid',
              cursor: 'pointer',
              backgroundColor: selectedLimbs.rightArm ? 'rgba(99, 102, 241, 0.2)' : 'var(--glass-bg)',
              borderColor: selectedLimbs.rightArm ? 'var(--accent-color)' : 'var(--card-border)',
              color: selectedLimbs.rightArm ? 'var(--accent-color)' : 'var(--text-secondary)',
              outline: 'none'
            }}
            aria-label="Right Arm extremity"
          >
            R Arm
          </button>
          <button
            type="button"
            onClick={() => toggleLimb('leftLeg')}
            style={{
              padding: '2px 4px',
              borderRadius: '4px',
              fontSize: '0.65rem',
              fontWeight: 'bold',
              border: '1px solid',
              cursor: 'pointer',
              backgroundColor: selectedLimbs.leftLeg ? 'rgba(99, 102, 241, 0.2)' : 'var(--glass-bg)',
              borderColor: selectedLimbs.leftLeg ? 'var(--accent-color)' : 'var(--card-border)',
              color: selectedLimbs.leftLeg ? 'var(--accent-color)' : 'var(--text-secondary)',
              outline: 'none'
            }}
            aria-label="Left Leg extremity"
          >
            L Leg
          </button>
          <button
            type="button"
            onClick={() => toggleLimb('rightLeg')}
            style={{
              padding: '2px 4px',
              borderRadius: '4px',
              fontSize: '0.65rem',
              fontWeight: 'bold',
              border: '1px solid',
              cursor: 'pointer',
              backgroundColor: selectedLimbs.rightLeg ? 'rgba(99, 102, 241, 0.2)' : 'var(--glass-bg)',
              borderColor: selectedLimbs.rightLeg ? 'var(--accent-color)' : 'var(--card-border)',
              color: selectedLimbs.rightLeg ? 'var(--accent-color)' : 'var(--text-secondary)',
              outline: 'none'
            }}
            aria-label="Right Leg extremity"
          >
            R Leg
          </button>
        </div>
      </div>
    </div>
  );
}

function DisabilityHubView({ onDisabilityPayChange, onCombinedRatingChange, reduceMotion }) {
  // Localized Disability Ratings States
  const [disabilityRatings, setDisabilityRatings] = useState([]);
  const [depSpouse, setDepSpouse] = useState(false);
  const [depSpouseAa, setDepSpouseAa] = useState(false);
  const [depChildrenUnder18, setDepChildrenUnder18] = useState(0);
  const [depChildrenSchool, setDepChildrenSchool] = useState(0);
  const [depParents, setDepParents] = useState(0);
  const [smcLevel, setSmcLevel] = useState('none');
  const [hasSmcK, setHasSmcK] = useState(false);
  const [smcKCount, setSmcKCount] = useState(1);

  // Localized Pension States
  const [showPensionCalc, setShowPensionCalc] = useState(false);
  const [pensionIncome, setPensionIncome] = useState(0);
  const [pensionExpenses, setPensionExpenses] = useState(0);
  const [pensionNetWorth, setPensionNetWorth] = useState(0);
  const [pensionCategory, setPensionCategory] = useState('basic');

  // Localized Chapter 61 Retirement States
  const [showRetirementCalc, setShowRetirementCalc] = useState(false);
  const [retBasePay, setRetBasePay] = useState(0);
  const [retYearsService, setRetYearsService] = useState(0);
  const [retDodRating, setRetDodRating] = useState(10);
  const [retSystem, setRetSystem] = useState('high3');
  const [retMedical, setRetMedical] = useState(true);
  const [retCombat, setRetCombat] = useState(false);
  const [retCombatRating, setRetCombatRating] = useState(10);

  // Perform Calculations on the fly
  const { rounded: currentCombinedRating, finalVal: currentRawRating, steps: currentVaMathSteps } = calculateCombinedRating(disabilityRatings);

  const calculatedDisabilityPay = calculateDisabilityPay({
    combinedRating: currentCombinedRating,
    smcLevel,
    hasSmcK,
    smcKCount,
    depSpouse,
    depSpouseAa,
    depChildrenUnder18,
    depChildrenSchool,
    depParents,
    VA_DISABILITY_COMP_TABLE_2026,
    SMC_RATES_2026
  });

  const pensionResult = calculatePensionResult({
    pensionNetWorth,
    pensionExpenses,
    pensionIncome,
    pensionCategory,
    depSpouse,
    depChildrenUnder18,
    depChildrenSchool,
    VA_PENSION_MAPR_2026
  });

  const retirementResult = calculateRetirementResult({
    retSystem,
    retYearsService,
    retBasePay,
    retMedical,
    retDodRating,
    retCombat,
    retCombatRating,
    calculatedDisabilityPay,
    combinedRating: currentCombinedRating,
    VA_DISABILITY_COMP_TABLE_2026
  });

  // Sync disability pay and rating back to parent for budget integration and TPD checklist
  useEffect(() => {
    onDisabilityPayChange(calculatedDisabilityPay);
    if (onCombinedRatingChange) {
      onCombinedRatingChange(currentCombinedRating);
    }
  }, [calculatedDisabilityPay, currentCombinedRating, onDisabilityPayChange, onCombinedRatingChange]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
      className="doc-card"
    >
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
              onClick={() => setDisabilityRatings([...disabilityRatings, { id: Date.now() + Math.random(), value: 10, bilateral: false, affectedLimbs: { leftArm: false, rightArm: false, leftLeg: false, rightLeg: false } }])}
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

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <BodyLimbSelector
                    selectedLimbs={rating.affectedLimbs || { leftArm: false, rightArm: false, leftLeg: false, rightLeg: false }}
                    onChange={(updatedLimbs) => {
                      const list = [...disabilityRatings];
                      list[index].affectedLimbs = updatedLimbs;
                      list[index].bilateral = Object.values(updatedLimbs).some(v => v === true);
                      setDisabilityRatings(list);
                    }}
                  />
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
            {disabilityRatings.length === 0 && (
              <div style={{ padding: '20px', border: '1px dashed var(--card-border)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                No disability ratings added yet. Click "+ Add Disability" to begin combined rating calculations.
              </div>
            )}
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
                      onChange={(e) => setPensionIncome(Math.max(0, Number(e.target.value)))}
                      min={0}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem' }}>Annual Unreimbursed Medical Expenses ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={pensionExpenses}
                      onChange={(e) => setPensionExpenses(Math.max(0, Number(e.target.value)))}
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
                      onChange={(e) => setPensionNetWorth(Math.max(0, Number(e.target.value)))}
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
                      onChange={(e) => setRetBasePay(Math.max(0, Number(e.target.value)))}
                      min={0}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem' }}>Years of Active Duty Service</label>
                    <input
                      type="number"
                      className="form-control"
                      value={retYearsService}
                      onChange={(e) => setRetYearsService(Math.max(0, Number(e.target.value)))}
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
    </motion.div>
  );
}

export default DisabilityHubView;
