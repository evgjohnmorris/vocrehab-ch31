import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Printer, AlertTriangle, RefreshCw } from 'lucide-react';

const ADL_ITEMS = [
  { id: 'bathing', label: 'Bathing / Showering', category: 'mobility' },
  { id: 'dressing', label: 'Dressing / Grooming', category: 'mobility' },
  { id: 'transfers', label: 'Bed or Chair Transfers', category: 'mobility' },
  { id: 'toilet', label: 'Toileting / Hygiene', category: 'mobility' },
  { id: 'meals', label: 'Preparing Meals / Cooking', category: 'domestic' },
  { id: 'housework', label: 'Light Cleaning / Housework', category: 'domestic' },
  { id: 'shopping', label: 'Grocery Shopping / Lifting', category: 'community' },
  { id: 'driving', label: 'Driving or Accessing Public Transit', category: 'community' },
  { id: 'stairs', label: 'Climbing Stairs / Navigation', category: 'home_safety' },
  { id: 'outdoor', label: 'Walking on uneven surfaces', category: 'home_safety' }
];

function IndependentLivingBuilderView({ reduceMotion }) {
  const [checkedAdls, setCheckedAdls] = useState({});
  const [safetyNarrative, setSafetyNarrative] = useState('');
  const [caregiverBurden, setCaregiverBurden] = useState('no'); // 'yes' | 'no'
  const [modificationRequired, setModificationRequired] = useState('no'); // 'yes' | 'no'
  const [estModCost, setEstModCost] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const toggleAdl = (id) => {
    setCheckedAdls(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getAdlCount = () => Object.values(checkedAdls).filter(Boolean).length;

  const getVreoApprovalThreshold = () => {
    const cost = Number(estModCost);
    if (!cost) return null;
    if (cost >= 75000) return 'Director approval required';
    if (cost >= 25000) return 'VREO (Regional Officer) concurrence required';
    return 'VRC approval limit';
  };

  const compileILReport = () => {
    const adlsSelected = ADL_ITEMS.filter(item => checkedAdls[item.id]);
    
    return `INDEPENDENT LIVING (IL) ASSESSMENT & STRATEGY REPORT
PURSUANT TO: 38 U.S.C. § 3120 & 38 C.F.R. § 21.160
DATE: ${new Date().toLocaleDateString()}

============================================================
1. STATEMENT OF INDEPENDENT LIVING LIMITATIONS
The Veteran experiences significant limitations in daily functioning and community integration.
A program of vocational training is currently determined to be unfeasible. Consequently, 
independent living services are requested under 38 U.S.C. § 3120 to overcome daily barriers.

Identified ADL & Mobility Restrictions:
${adlsSelected.map(item => `* ${item.label} (Restriction Active)`).join('\n') || 'None checked'}

============================================================
2. HOME SAFETY & MODIFICATION EVALUATION
Modification Required: ${modificationRequired.toUpperCase()}
Estimated Modification Cost: ${estModCost ? `$${estModCost}` : 'Unspecified'}
Approval Level Level: ${getVreoApprovalThreshold() || 'Standard counselor limits'}

Safety Concerns & Barriers:
${safetyNarrative || '[ENTERED SAFETY NARRATIVE]'}

============================================================
3. CAREGIVER BURDEN & ASSISTANCE NEEDS
Does the Veteran require a caregiver or family assistance for daily tasks?
Answer: ${caregiverBurden.toUpperCase()}
The proposed independent living services are intended to improve independence and reduce 
caregiver/family reliance as authorized by 38 C.F.R. § 21.160.

============================================================
4. FORMAL REQUEST FOR ASSESSMENT (VA FORM 28-0791)
The Veteran formally requests that the VA:
1. Conduct a comprehensive Independent Living evaluation under 38 C.F.R. § 21.162.
2. Complete VA Form 28-0791 (Pre- and Post-Independent Living Assessment).
3. Draft an Independent Living Plan (ILP) incorporating necessary assistive technologies, 
   grab rails, ramp installation, or mobility devices.`;
  };

  const handleCopy = () => {
    const text = compileILReport();
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handlePrint = () => {
    const text = compileILReport();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>IL Assessment Report</title>
          <style>
            body { font-family: Courier, monospace; white-space: pre-wrap; padding: 40px; color: #0f172a; font-size: 0.9rem; line-height: 1.5; }
            h1 { font-family: sans-serif; font-size: 1.3rem; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>VR&E Independent Living Justification Statement</h1>
          <div>${text}</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const resetBuilder = () => {
    setCheckedAdls({});
    setSafetyNarrative('');
    setCaregiverBurden('no');
    setModificationRequired('no');
    setEstModCost('');
  };

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="doc-card text-slate-100"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
          <FileText size={20} />
        </span>
        <div>
          <h1 className="text-lg font-bold text-slate-100">Independent Living Needs Builder</h1>
          <p className="text-[11px] text-slate-400">Evaluate home independence, safety, and ADL limitations to request a VA Form 28-0791 evaluation.</p>
        </div>
      </div>

      <div className="doc-divider mb-6"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Panel */}
        <div className="lg:col-span-6 space-y-5">
          {/* Step 1: ADLs */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">1. Activities of Daily Living (ADLs) Restrictions</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ADL_ITEMS.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleAdl(item.id)}
                  className={`border rounded-lg p-2.5 cursor-pointer transition select-none flex items-center gap-2 text-xs ${
                    checkedAdls[item.id]
                      ? 'bg-indigo-500/5 border-indigo-800/80 text-slate-200'
                      : 'bg-slate-950/20 border-slate-800 hover:border-slate-700/80 text-slate-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!checkedAdls[item.id]}
                    onChange={() => {}}
                    className="pointer-events-none accent-indigo-500"
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Caregiver Burden */}
          <div className="space-y-2 bg-slate-900/20 p-4 border border-slate-800 rounded-xl">
            <label className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">2. Caregiver / Family Support Needed?</label>
            <p className="text-[10px] text-slate-450 leading-relaxed mb-2">Do your disabilities require others to help you with bathing, grocery shopping, or chores?</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 text-xs text-slate-350 cursor-pointer">
                <input
                  type="radio"
                  name="caregiver"
                  checked={caregiverBurden === 'yes'}
                  onChange={() => setCaregiverBurden('yes')}
                  className="accent-indigo-500"
                />
                <span>Yes, require assistance</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-350 cursor-pointer">
                <input
                  type="radio"
                  name="caregiver"
                  checked={caregiverBurden === 'no'}
                  onChange={() => setCaregiverBurden('no')}
                  className="accent-indigo-500"
                />
                <span>No, function independently</span>
              </label>
            </div>
          </div>

          {/* Step 3: Modifications */}
          <div className="space-y-3 bg-slate-900/20 p-4 border border-slate-800 rounded-xl">
            <label className="text-[10px] font-bold text-indigo-400 uppercase block">3. Home / Vehicle Modifications Needed?</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 text-xs text-slate-350 cursor-pointer">
                <input
                  type="radio"
                  name="mods"
                  checked={modificationRequired === 'yes'}
                  onChange={() => setModificationRequired('yes')}
                  className="accent-indigo-500"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-350 cursor-pointer">
                <input
                  type="radio"
                  name="mods"
                  checked={modificationRequired === 'no'}
                  onChange={() => setModificationRequired('no')}
                  className="accent-indigo-500"
                />
                <span>No</span>
              </label>
            </div>

            {modificationRequired === 'yes' && (
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 block mb-1">Estimated Cost (USD)</label>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={estModCost}
                    onChange={(e) => setEstModCost(Math.max(0, Number(e.target.value)) || '')}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200"
                  />
                </div>
                {estModCost && (
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded text-[10px] flex items-center gap-1.5 h-fit self-end">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <span>Approval: <strong>{getVreoApprovalThreshold()}</strong></span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 4: Narrative */}
          <div>
            <label className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">4. Safety Concerns & Barriers Details</label>
            <textarea
              placeholder="e.g. Shower has a high tub barrier leading to fall risks, or stairs prevent entry to home during flare-ups."
              value={safetyNarrative}
              onChange={(e) => setSafetyNarrative(e.target.value)}
              rows={4}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 resize-none focus:outline-none focus:border-slate-700"
            />
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex justify-between items-center bg-slate-950/30 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-300 font-semibold">{getAdlCount()} ADLs selected</span>
            <div className="flex gap-2">
              <button onClick={resetBuilder} className="btn btn-sm btn-secondary flex items-center gap-1">
                <RefreshCw size={12} />
                <span>Reset</span>
              </button>
              <button onClick={handleCopy} className="btn btn-sm btn-secondary flex items-center gap-1">
                {copySuccess ? 'Copied' : 'Copy'}
              </button>
              <button onClick={handlePrint} className="btn btn-sm btn-primary flex items-center gap-1">
                <Printer size={12} />
                <span>Print Report</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-6 overflow-y-auto max-h-[480px]">
            <pre className="text-[11px] text-slate-350 font-mono leading-relaxed whitespace-pre-wrap select-text">
              {compileILReport()}
            </pre>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default IndependentLivingBuilderView;
