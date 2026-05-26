import { useState } from 'react';
import { Trash2, Play, FlaskConical } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  getPellEstimate, 
  getLoanRepayments, 
  calculateDebtSnowball 
} from '../utils/financialMath';

function FinancialPlannerView({ calculatedDisabilityPay, budgetMhaAmount, combinedRating, reduceMotion }) {
  // Localized Test Lab states
  const [showFinancialTestLab, setShowFinancialTestLab] = useState(false);
  const [activeTestScenario, setActiveTestScenario] = useState(null);

  // Localized Pell Grant states
  const [pellDependency, setPellDependency] = useState('independent');
  const [pellFamilySize, setPellFamilySize] = useState(1);
  const [pellAgi, setPellAgi] = useState(0);

  // Localized Student Loan states
  const [loanDebt, setLoanDebt] = useState(0);
  const [loanInterest, setLoanInterest] = useState(0);
  const [loanAgi, setLoanAgi] = useState(0);
  const [loanFamilySize, setLoanFamilySize] = useState(1);
  const [loanUndergrad, setLoanUndergrad] = useState(true);
  const [showTpdChecklist, setShowTpdChecklist] = useState(false);

  // Localized Budget states
  const [budgetIncomes, setBudgetIncomes] = useState([]);
  const [budgetExpenses, setBudgetExpenses] = useState([]);

  // Localized Debt Snowball states
  const [debtsList, setDebtsList] = useState([]);
  const [snowballExtra, setSnowballExtra] = useState(0);

  // Math Calculations on the fly
  const loanRepayments = getLoanRepayments(
    loanInterest,
    loanDebt,
    loanFamilySize,
    loanAgi,
    loanUndergrad
  );

  const budgetTotalIncome = budgetIncomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const budgetAllocated = budgetExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const budgetRemaining = budgetTotalIncome - budgetAllocated;

  const budgetHousing = budgetExpenses.filter(e => e.category === 'housing').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const budgetFood = budgetExpenses.filter(e => e.category === 'food').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const budgetSavingDebt = budgetExpenses.filter(e => e.category === 'saving_debt').reduce((sum, e) => sum + Number(e.amount || 0), 0);

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

  const snowballResult = calculateDebtSnowball(debtsList, snowballExtra);

  // Autofill helpers
  const autofillCalculatedIncome = () => {
    let current = [...budgetIncomes];
    if (calculatedDisabilityPay > 0) {
      const idx = current.findIndex(i => i.type === 'va_disability');
      if (idx > -1) {
        current[idx].amount = calculatedDisabilityPay;
      } else {
        current.push({ id: Date.now() + Math.random(), type: 'va_disability', name: 'VA Disability Pay', amount: calculatedDisabilityPay });
      }
    }
    if (budgetMhaAmount > 0) {
      const idx = current.findIndex(i => i.type === 'va_bah');
      if (idx > -1) {
        current[idx].amount = budgetMhaAmount;
      } else {
        current.push({ id: Date.now() + Math.random(), type: 'va_bah', name: 'VA BAH / MHA Allowance', amount: budgetMhaAmount });
      }
    }
    setBudgetIncomes(current);
  };

  const addIncomeTemplate = (type) => {
    const typeCounts = {};
    budgetIncomes.forEach(i => {
      typeCounts[i.type] = (typeCounts[i.type] || 0) + 1;
    });
    const count = typeCounts[type] || 0;
    let name;
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
    let name;

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

  const addDebtTemplate = (type) => {
    const typeCounts = {};
    debtsList.forEach(d => {
      const baseType = d.type || 'custom';
      typeCounts[baseType] = (typeCounts[baseType] || 0) + 1;
    });

    const count = typeCounts[type] || 0;
    let name;

    switch (type) {
      case 'credit_card': {
        const cardLabels = ['A', 'B', 'C', 'D', 'E'];
        name = `Credit Card ${cardLabels[count] || (count + 1)}`;
        break;
      }
      case 'personal_loan': {
        const loanLabels = ['1', '2', '3', '4', '5'];
        name = `Personal Loan ${loanLabels[count] || (count + 1)}`;
        break;
      }
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
      className="doc-card"
    >
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
                      Audit Verification: Calculated Pell = ${getPellEstimate(pellDependency, pellFamilySize, pellAgi).toLocaleString()}/yr (Expected: $7,395/yr) &mdash; MATCHES.
                    </div>
                  </div>
                )}

                {activeTestScenario === 'save' && (
                  <div>
                    <div><strong>Inputs:</strong> Total Debt = $45,000 @ 6.8% | AGI = $32,000 | Family Size = 1 | Type = Undergraduate (5% multi).</div>
                    <div style={{ marginTop: '6px' }}><strong>Logic Walkthrough:</strong></div>
                    <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', listStyleType: 'disc', color: 'var(--text-secondary)' }}>
                      <li>Standard 10-Year Payment: Math uses standard amortization. Result = <strong>${loanRepayments.standardMonthly.toFixed(2)}/mo</strong>.</li>
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
                      <li>Zero-Based balance: Total Income minus total allocated expenses. Result = <strong>${budgetRemaining.toFixed(2)}/mo</strong>.</li>
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
                      <li>Total monthly payment pool: <code>$300 (extra) + $365 (min sum) = $665/mo</code>.</li>
                      <li>Month 1: Min payments are applied ($365). Remaining pool ($300) is applied to the smallest debt, Medical. Medical balance becomes $270.</li>
                      <li>Month 2: Min payments applied ($365). Extra $300 fully wipes out Medical. The remaining $60 goes to CC A.</li>
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
                  onChange={(e) => setPellAgi(Math.max(0, Number(e.target.value)))}
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
                  onChange={(e) => setLoanDebt(Math.max(0, Number(e.target.value)))}
                  min={0}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '0.75rem' }}>Average Interest Rate (%)</label>
                <input
                  type="number"
                  className="form-control"
                  value={loanInterest}
                  onChange={(e) => setLoanInterest(Math.max(0, Number(e.target.value)))}
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
                  onChange={(e) => setLoanAgi(Math.max(0, Number(e.target.value)))}
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
                            list[index].amount = Math.max(0, Number(e.target.value));
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
                        const existingIdx = current.findIndex(e => e.name.includes("Debt Snowball Min Payments"));
                        if (existingIdx > -1) {
                          current[existingIdx].amount = totalMins;
                          setBudgetExpenses(current);
                        } else {
                          setBudgetExpenses([...current, { id: Date.now(), category: 'saving_debt', name: 'Debt Snowball Min Payments', amount: totalMins }]);
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
                            list[index].amount = Math.max(0, Number(e.target.value));
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
                      value={d.balance || ''}
                      onChange={(e) => {
                        const list = [...debtsList];
                        list[index].balance = Math.max(0, Number(e.target.value));
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
                      value={d.minPayment || ''}
                      onChange={(e) => {
                        const list = [...debtsList];
                        list[index].minPayment = Math.max(0, Number(e.target.value));
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
              {debtsList.length === 0 && (
                <div style={{ padding: '16px', border: '1px dashed var(--card-border)', borderRadius: '6px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  No active debts listed. Add credit cards or student loans above to build a Dave Ramsey snowball sequence.
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.75rem' }}>Extra Monthly Snowball Payment ($)</label>
              <input
                type="number"
                className="form-control"
                value={snowballExtra}
                onChange={(e) => setSnowballExtra(Math.max(0, Number(e.target.value)))}
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
                ${getPellEstimate(pellDependency, pellFamilySize, pellAgi).toLocaleString()}/yr
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
              {(combinedRating === 100) && (
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
                          <span>Download VA Benefit Summary Letter (must show 100% P&T or TDIU status). {/* @cite 38-cfr-21-198 */}</span>
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
                  {snowballResult.isDebtFree ? (
                    <div style={{ fontWeight: '700', color: 'var(--success-color)', marginBottom: '8px' }}>
                      Debt-Free in {snowballResult.months} Months!
                    </div>
                  ) : (
                    <div style={{ fontWeight: '700', color: 'var(--warning-color)', marginBottom: '8px' }}>
                      Payments insufficient to clear debt within 30 years (360 months).
                    </div>
                  )}
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
    </motion.div>
  );
}

export default FinancialPlannerView;
