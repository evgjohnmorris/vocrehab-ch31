// @allow-modal
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Printer, AlertTriangle, RefreshCw, User, Activity, Laptop, MapPin, Home, Heart,
  Check, Copy, Info, CheckCircle2, Scale, DollarSign
} from 'lucide-react';

const IL_DOMAINS = [
  {
    id: 'personal_care',
    name: 'Personal Care & Daily Activities',
    icon: User,
    items: [
      { id: 'bathing', label: 'Bathing / Showering', desc: 'Ability to safely enter/exit shower and wash independently' },
      { id: 'dressing', label: 'Dressing / Grooming', desc: 'Ability to button clothes, put on socks/shoes' },
      { id: 'eating', label: 'Eating / Feeding', desc: 'Ability to cut food, handle utensils, and swallow' },
      { id: 'toilet', label: 'Toileting / Hygiene', desc: 'Ability to transfer to toilet and clean self' }
    ]
  },
  {
    id: 'mobility',
    name: 'Mobility & Physical Movement',
    icon: Activity,
    items: [
      { id: 'transfers', label: 'Bed/Chair Transfers', desc: 'Ability to get in/out of bed or standing position' },
      { id: 'walking', label: 'Walking on uneven surfaces', desc: 'Ability to navigate grass, gravel, or yard area' },
      { id: 'stairs', label: 'Climbing Stairs', desc: 'Ability to ascend/descend steps into or within home' },
      { id: 'balance', label: 'Balance & Standing Control', desc: 'Ability to stand long enough for essential tasks' }
    ]
  },
  {
    id: 'communication',
    name: 'Communication & Technology',
    icon: Laptop,
    items: [
      { id: 'writing', label: 'Writing / Typing', desc: 'Ability to sign forms, write letters, or use computer' },
      { id: 'sensory', label: 'Sensory Access (Vision/Hearing)', desc: 'Ability to read printed materials or hear alarm safety indicators' },
      { id: 'cognitive', label: 'Memory / Focus Activities', desc: 'Ability to manage schedules, remember appointments' }
    ]
  },
  {
    id: 'community_transit',
    name: 'Community & Transportation',
    icon: MapPin,
    items: [
      { id: 'driving', label: 'Driving / Vehicle Entry', desc: 'Ability to enter, exit, and safely operate a car' },
      { id: 'public_transit', label: 'Accessing Public Transit', desc: 'Ability to walk to transit and board buses/trains' },
      { id: 'shopping', label: 'Grocery Shopping / Lifting', desc: 'Ability to navigate stores and carry grocery items' }
    ]
  },
  {
    id: 'home_safety',
    name: 'Home Environment & Safety',
    icon: Home,
    items: [
      { id: 'escapability', label: 'Emergency Escapability', desc: 'Ability to exit home rapidly in case of fire or hazard' },
      { id: 'cleaning', label: 'Light Cleaning / Housework', desc: 'Ability to sweep, vacuum, do laundry, or wash dishes' },
      { id: 'cooking', label: 'Meal Preparation', desc: 'Ability to safely lift hot pots and operate stove/oven' }
    ]
  },
  {
    id: 'leisure_social',
    name: 'Leisure & Social Recreation',
    icon: Heart,
    items: [
      { id: 'hobbies', label: 'Adaptive Hobbies / Integration', desc: 'Ability to engage in exercise, craftwork, or play' },
      { id: 'socializing', label: 'Social Engagement', desc: 'Ability to visit family, friends, or veterans clubs' }
    ]
  }
];

const EQUIPMENT_SUGGESTIONS = {
  bathing: ['Shower Bench', 'Safety Grab Bars', 'Handheld Shower Wand', 'Non-Slip Tub Coating'],
  dressing: ['Sock Aid helper', 'Elastic Shoelaces', 'Button Hook', 'Dressing Stick helper'],
  eating: ['Weighted Utensils', 'Scoop Plate (Suction Base)', 'Nosey Cutout Cup', 'Built-Up Handle grips'],
  toilet: ['Raised Toilet Seat', 'Toilet Safety Rails', 'Bidet Attachment', 'Long-Handled Wiper'],
  transfers: ['Transfer Board', 'Bed Assist Rail', 'Standing Assist Bar', 'Swivel Seat Cushion'],
  walking: ['Quad Cane', 'Rollator Walker with Seat', 'Orthopedic Braces', 'All-Terrain Walk Tips'],
  stairs: ['Indoor Stair Lift', 'Modular Wheelchair Ramp', 'Threshold Ramps', 'Additional Handrails'],
  balance: ['Shower Grab Bars', 'Anti-Fatigue Kitchen Mat', 'Transfer Pole'],
  writing: ['Ergonomic Pen Grips', 'Speech-to-Text Software', 'Adaptive Keyboard', 'Vertical Mouse'],
  sensory: ['Large Print Keyboard', 'Screen Magnifier', 'Amplified Telephone', 'Vibrating Fire Alarm'],
  cognitive: ['Voice-Activated Smart Assistant', 'Pill Dispenser with Alarm', 'Visual Calendar Board'],
  driving: ['Steering Spinner Knob', 'Hand Controls (Gas/Brake)', 'Panoramic Rearview Mirror', 'Swivel Transfer Cushion'],
  public_transit: ['Folding Travel Cane', 'Noise-Cancelling Headphones', 'Portable Folding Stool'],
  shopping: ['Grabber Reacher Tool', 'Lightweight Wheeled Cart', 'Padded Lift Straps'],
  escapability: ['Emergency Evacuation Sled', 'Strobe Smoke Detector', 'Door Threshold Ramps', 'Smart Door Lock'],
  cleaning: ['Robotic Vacuum', 'Long-Handled Dustpan', 'Stick Vacuum', 'Extended Tub Scrubber'],
  cooking: ['Electric Jar Opener', 'Angled Cutting Board', 'Two-Handled Pots', 'Stove Dial Turner Hook'],
  hobbies: ['Adaptive Gardening Tools', 'Ergonomic Craft Scissors', 'Card Holder / Book Stand'],
  socializing: ['Sensory Regulation Earplugs', 'Portable Speaker', 'Wheelchair Travel Bag']
};

function IndependentLivingBuilderView({ reduceMotion }) {
  // Tabs selectors
  const [activeConfigTab, setActiveConfigTab] = useState('domains'); // 'domains' | 'modifications' | 'rebuttal' | 'form_mock'
  const [activeDomain, setActiveDomain] = useState('personal_care');
  const [activePreviewTab, setActivePreviewTab] = useState('memo'); // 'memo' | 'checklist'

  // Input states
  const [checkedAdls, setCheckedAdls] = useState({});
  const [adlSeverities, setAdlSeverities] = useState({});
  const [adlBarriers, setAdlBarriers] = useState({});
  const [adlCaregiver, setAdlCaregiver] = useState({});
  const [adlEquipment, setAdlEquipment] = useState({});

  const [modificationRequired, setModificationRequired] = useState('no'); // 'yes' | 'no'
  const [estModCost, setEstModCost] = useState('');
  const [hisaCoordination, setHisaCoordination] = useState(false);

  const [counselorObjections, setCounselorObjections] = useState('');
  const [unfeasibleReason, setUnfeasibleReason] = useState('');
  const [medicalProof, setMedicalProof] = useState('');

  const [copySuccess, setCopySuccess] = useState(false);

  // Handlers
  const toggleAdl = (id) => {
    setCheckedAdls(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const setSeverity = (id, level) => {
    setAdlSeverities(prev => ({ ...prev, [id]: level }));
  };

  const handleBarrierChange = (id, text) => {
    setAdlBarriers(prev => ({ ...prev, [id]: text }));
  };

  const handleCaregiverChange = (id, text) => {
    setAdlCaregiver(prev => ({ ...prev, [id]: text }));
  };

  const toggleEquipment = (adlId, eqName) => {
    const current = adlEquipment[adlId] || [];
    const updated = current.includes(eqName)
      ? current.filter(x => x !== eqName)
      : [...current, eqName];
    setAdlEquipment(prev => ({ ...prev, [adlId]: updated }));
  };

  const getAdlCount = () => Object.values(checkedAdls).filter(Boolean).length;

  const getVreoApprovalThreshold = () => {
    const cost = Number(estModCost);
    if (!cost) return 'No modifications priced';
    if (cost >= 75000) return 'VR&E Service Executive Director (Central Office) Approval Required (Timeline: 3-6 months)';
    if (cost >= 25000) return 'VREO (Regional Officer) Concurrence Required under M28C.V.B.5 (Timeline: 1-2 months)';
    return 'VRC Counselor Approval Limit (Timeline: 2-4 weeks)';
  };

  const getDelegatedAuthorityClass = () => {
    const cost = Number(estModCost);
    if (cost >= 75000) return 'border-rose-500/30 text-rose-400 bg-rose-500/10';
    if (cost >= 25000) return 'border-amber-500/30 text-amber-400 bg-amber-500/10';
    return 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10';
  };

  const compileILReport = () => {
    // Collect selected ADLs and details
    const selectedAdlList = [];
    IL_DOMAINS.forEach(domain => {
      domain.items.forEach(item => {
        if (checkedAdls[item.id]) {
          const sev = adlSeverities[item.id] || 'moderate';
          const barrier = adlBarriers[item.id] || '';
          const caregiver = adlCaregiver[item.id] || '';
          const eq = adlEquipment[item.id] || [];
          selectedAdlList.push({
            label: item.label,
            category: domain.name,
            severity: sev,
            barrier,
            caregiver,
            equipment: eq
          });
        }
      });
    });

    const adlText = selectedAdlList.map((adl, idx) => {
      let text = `${idx + 1}. DOMAIN: ${adl.category} - ${adl.label}
   SEVERITY LEVEL: ${adl.severity.toUpperCase()}
   BARRIER DESCRIPTION: ${adl.barrier || 'Symptom limitation restricts daily task performance.'}
   CAREGIVER IMPACT: ${adl.caregiver || 'No caregiver impact documented.'}`;
      if (adl.equipment.length > 0) {
        text += `\n   RECOMMENDED ASSISTIVE TECHNOLOGY: ${adl.equipment.join(', ')}`;
      }
      return text;
    }).join('\n\n');

    // Modification coordination section
    const modText = modificationRequired === 'yes'
      ? `HOME / VEHICLE MODIFICATIONS (38 C.F.R. § 21.212)
Status: Required
Estimated Cost: ${estModCost ? `$${estModCost}` : '[UNSPECIFIED]'}
Approval Authority: ${getVreoApprovalThreshold()}
HISA Grant Coordination: ${hisaCoordination ? 'Yes (Coordinate under 38 U.S.C. § 1717 / 38 C.F.R. § 17.141)' : 'No (Direct Chapter 31 VR&E Uncapped Modification requested)'}
Note: VR&E home modifications are uncapped and based on necessity, independent of HISA limits.`
      : `HOME / VEHICLE MODIFICATIONS
Status: Not requested at this time.`;

    // Feasibility rebuttal section
    const rebuttalText = `FEASIBILITY AUDIT & LEGAL REBUTTAL (38 C.F.R. § 21.40)
Objections Raised by VRC: ${counselorObjections || 'None documented.'}
Medical Rationale for Feasibility Barrier: ${unfeasibleReason || 'Severe physical or cognitive barriers prevent immediate vocational training.'}
Medical Proof Attachment: ${medicalProof || 'VA disability rating letter and clinical treatment records.'}
Legal Argument: Under 38 C.F.R. § 21.40 and § 21.160, when employment feasibility is doubtful, the VA must provide a program of independent living services to determine if feasibility can eventually be established. A denial based on the possibility of future employment feasibility violates the remedial intent of the statute.`;

    return `INDEPENDENT LIVING (IL) ASSESSMENT & STRATEGY REPORT
PURSUANT TO: 38 U.S.C. § 3120 & 38 C.F.R. § 21.160
DATE: ${new Date().toLocaleDateString()}

============================================================
1. REHABILITATION GOAL & LEGISLATIVE CITATIONS
The Veteran formally requests an Independent Living Program (ILP) under 38 U.S.C. § 3120.
The goal of this program is to enable the Veteran to achieve maximum independence in daily 
living activities and reduce reliance on caregiver/family assistance (38 C.F.R. § 21.160).

============================================================
2. ASSESSMENT OF DAILY LIVING DOMAINS (M28C.IV.C.2)
The Veteran experiences significant limitations across the following functional domains:

${adlText || 'No daily living barriers selected.'}

============================================================
3. ${modText}

============================================================
4. ${rebuttalText}

============================================================
5. FORMAL REQUEST FOR ASSESSMENT (VA FORM 28-0791)
Pursuant to 38 C.F.R. § 21.162, the Veteran requests a comprehensive assessment:
1. Conduct the formal evaluation using VA Form 28-0791 (Pre- and Post-Assessment).
2. Authorize the necessary assistive devices, safety rails, or home ramps as specified.

Respectfully Submitted,

___________________________________
[Veteran Signature]`;
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
    setAdlSeverities({});
    setAdlBarriers({});
    setAdlCaregiver({});
    setAdlEquipment({});
    setModificationRequired('no');
    setEstModCost('');
    setHisaCoordination(false);
    setCounselorObjections('');
    setUnfeasibleReason('');
    setMedicalProof('');
  };

  // Compile active equipment list across all checked ADLs
  const totalEquipmentList = useMemo(() => {
    const list = [];
    Object.keys(checkedAdls).forEach(id => {
      if (checkedAdls[id] && adlEquipment[id]) {
        adlEquipment[id].forEach(eq => {
          if (!list.includes(eq)) list.push(eq);
        });
      }
    });
    return list;
  }, [checkedAdls, adlEquipment]);

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="doc-card text-slate-100"
    >
      {/* View Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
          <FileText size={20} />
        </span>
        <div>
          <h1 className="text-lg font-bold text-slate-100">Independent Living Needs Builder</h1>
          <p className="text-[11px] text-slate-400">Evaluate daily living limitations, model home safety needs, HISA caps, and map entries to VA Form 28-0791.</p>
        </div>
      </div>

      <div className="doc-divider mb-6"></div>

      {/* Configurator Navigation Tabs */}
      <div className="tabs-header mb-6">
        <button 
          className={`tab-btn ${activeConfigTab === 'domains' ? 'active' : ''}`}
          onClick={() => setActiveConfigTab('domains')}
        >
          ADL Assessment Domains
        </button>
        <button 
          className={`tab-btn ${activeConfigTab === 'modifications' ? 'active' : ''}`}
          onClick={() => setActiveConfigTab('modifications')}
        >
          Home & Travel Modifications
        </button>
        <button 
          className={`tab-btn ${activeConfigTab === 'rebuttal' ? 'active' : ''}`}
          onClick={() => setActiveConfigTab('rebuttal')}
        >
          Feasibility Rebuttal Planner
        </button>
        <button 
          className={`tab-btn ${activeConfigTab === 'form_mock' ? 'active' : ''}`}
          onClick={() => setActiveConfigTab('form_mock')}
        >
          VA Form 28-0791 Mock Map
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT CONFIGURATION PANEL (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* TAB 1: DOMAINS */}
          {activeConfigTab === 'domains' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 leading-relaxed">
                <Info size={14} className="inline mr-1.5 align-text-bottom" />
                <strong>M28C Six-Domain Assessment:</strong> Check daily tasks where your service-connected disabilities create functional limitations. Provide specific barriers and select requested assistive equipment.
              </div>

              {/* Grid of Domain Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {IL_DOMAINS.map(domain => {
                  const IconComp = domain.icon;
                  const count = domain.items.filter(item => checkedAdls[item.id]).length;
                  return (
                    <button
                      key={domain.id}
                      type="button"
                      onClick={() => setActiveDomain(domain.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-left cursor-pointer transition ${
                        activeDomain === domain.id
                          ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300'
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <IconComp size={14} className={activeDomain === domain.id ? 'text-indigo-400' : 'text-slate-400'} />
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold truncate leading-tight">{domain.name}</div>
                        {count > 0 && <span className="text-[9px] text-emerald-400 font-bold">{count} active</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Domain Items */}
              <div className="space-y-3 bg-slate-900/20 border border-slate-850 p-5 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {IL_DOMAINS.find(d => d.id === activeDomain)?.name} Checklist
                </span>
                
                <div className="space-y-3.5">
                  {IL_DOMAINS.find(d => d.id === activeDomain)?.items.map(item => {
                    const isChecked = !!checkedAdls[item.id];
                    const selectedSev = adlSeverities[item.id] || 'moderate';
                    return (
                      <div key={item.id} className="border border-slate-850 bg-slate-950/20 rounded-lg p-3 space-y-3">
                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleAdl(item.id)}
                            className="mt-0.5 accent-indigo-500 cursor-pointer"
                          />
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold text-slate-200">{item.label}</span>
                            <p className="text-[10px] text-slate-400 leading-tight">{item.desc}</p>
                          </div>
                        </label>

                        {/* Expanded details when checked */}
                        {isChecked && (
                          <div className="pl-6 border-l border-indigo-500/30 space-y-3 pt-1 animate-fadeIn">
                            
                            {/* Severity levels */}
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Limitation Severity</label>
                              <div className="flex gap-1.5">
                                {['mild', 'moderate', 'severe', 'critical'].map(lvl => (
                                  <button
                                    key={lvl}
                                    type="button"
                                    onClick={() => setSeverity(item.id, lvl)}
                                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition cursor-pointer ${
                                      selectedSev === lvl
                                        ? 'bg-indigo-600 text-white shadow shadow-indigo-600/30'
                                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
                                    }`}
                                  >
                                    {lvl}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Specific barriers and caregiver impact */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Specific Daily Barrier</label>
                                <textarea
                                  placeholder="e.g. slips easily, cannot stand safely"
                                  value={adlBarriers[item.id] || ''}
                                  onChange={(e) => handleBarrierChange(item.id, e.target.value)}
                                  rows={2}
                                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 resize-none focus:border-indigo-500 outline-none leading-normal"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Caregiver Support Impact</label>
                                <textarea
                                  placeholder="e.g. requires spouse to assist with exit"
                                  value={adlCaregiver[item.id] || ''}
                                  onChange={(e) => handleCaregiverChange(item.id, e.target.value)}
                                  rows={2}
                                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 resize-none focus:border-indigo-500 outline-none leading-normal"
                                />
                              </div>
                            </div>

                            {/* Assistive Equipment suggestions */}
                            {EQUIPMENT_SUGGESTIONS[item.id] && (
                              <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1.5">Suggested Adaptive Aids</label>
                                <div className="flex flex-wrap gap-1.5">
                                  {EQUIPMENT_SUGGESTIONS[item.id].map(eq => {
                                    const isEqSelected = (adlEquipment[item.id] || []).includes(eq);
                                    return (
                                      <button
                                        key={eq}
                                        type="button"
                                        onClick={() => toggleEquipment(item.id, eq)}
                                        className={`px-2 py-1 rounded text-[10px] font-medium border transition cursor-pointer flex items-center gap-1 ${
                                          isEqSelected
                                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300'
                                            : 'bg-slate-900/60 border-slate-850 text-slate-400 hover:border-slate-800'
                                        }`}
                                      >
                                        {isEqSelected && <Check size={10} />}
                                        <span>{eq}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MODIFICATIONS */}
          {activeConfigTab === 'modifications' && (
            <div className="space-y-4">
              <div className="space-y-3 bg-slate-900/20 border border-slate-850 p-5 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <Home size={14} className="text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Housing & Vehicle Structural Alterations</span>
                </div>
                
                <div>
                  <label className="text-[10px] text-slate-400 block mb-2">Do your daily living restrictions require physical home or vehicle modifications?</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="mods_required"
                        checked={modificationRequired === 'yes'}
                        onChange={() => setModificationRequired('yes')}
                        className="accent-indigo-500"
                      />
                      <span>Yes, modifications required</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="mods_required"
                        checked={modificationRequired === 'no'}
                        onChange={() => setModificationRequired('no')}
                        className="accent-indigo-500"
                      />
                      <span>No modifications needed</span>
                    </label>
                  </div>
                </div>

                {modificationRequired === 'yes' && (
                  <div className="pt-2 space-y-4 animate-fadeIn">
                    
                    {/* Cost Input slider/number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Estimated Modification Cost ($)</label>
                        <div className="relative">
                          <DollarSign size={12} className="absolute left-2.5 top-3 text-slate-500" />
                          <input
                            type="number"
                            value={estModCost}
                            onChange={(e) => setEstModCost(Math.max(0, Number(e.target.value)) || '')}
                            placeholder="e.g. 35000"
                            className="w-full bg-slate-950 border border-slate-800 rounded py-2 pl-8 pr-2 text-xs text-slate-100 focus:border-indigo-500 outline-none font-mono"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={hisaCoordination}
                            onChange={(e) => setHisaCoordination(e.target.checked)}
                            className="accent-indigo-500 cursor-pointer"
                          />
                          <div>
                            <span className="font-semibold text-slate-200">Coordinate with HISA Grant</span>
                            <p className="text-[9px] text-slate-450 leading-tight">Leverage VA HISA program for cost sharing/approvals.</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Cost Delegated Authority Warning bar */}
                    {estModCost && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-400 uppercase">Delegated Concurrence Levels</span>
                          <span className="font-mono text-indigo-400">${Number(estModCost).toLocaleString()}</span>
                        </div>
                        
                        {/* Interactive progress bar */}
                        <div className="relative h-2.5 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="absolute left-0 top-0 h-full bg-indigo-500 transition-all duration-300"
                            style={{ width: `${Math.min(100, (Number(estModCost) / 100000) * 100)}%` }}
                          />
                          {/* Markers */}
                          <div className="absolute left-1/4 top-0 w-0.5 h-full bg-slate-800" title="$25,000 threshold" />
                          <div className="absolute left-[75%] top-0 w-0.5 h-full bg-slate-800" title="$75,000 threshold" />
                        </div>
                        
                        <div className="flex justify-between text-[8px] text-slate-500 font-mono px-1">
                          <span>$0</span>
                          <span>$25K (VREO Level)</span>
                          <span>$75K (Director Level)</span>
                          <span>$100K+</span>
                        </div>

                        {/* Cost Level Advisory */}
                        <div className={`p-3 rounded-lg border text-[10px] leading-relaxed flex items-start gap-2 ${getDelegatedAuthorityClass()}`}>
                          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                          <div>
                            <strong>Concurrence Requirement:</strong> {getVreoApprovalThreshold()}
                            <p className="text-[9px] text-slate-400 mt-1">
                              * Higher modification costs require hierarchical approval layers, extending review periods. Structural modifications must meet Americans with Disabilities Act (ADA) accessibility requirements.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Legal Brief Comparison Card */}
                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl space-y-2 text-xs leading-relaxed text-indigo-300">
                      <div className="flex items-center gap-1">
                        <Scale size={13} />
                        <strong>Legal Fact Sheet: VR&E vs. HISA Grants</strong>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Counselors often claim home structural alterations must be funded by the HISA (Home Improvements and Structural Alterations) grant first. 
                      </p>
                      <p className="text-[10px] text-slate-400">
                        <strong>The Law:</strong> HISA grants are strictly capped ($6,800 under 38 U.S.C. § 1717). In contrast, home modifications provided under Chapter 31 VR&E are **uncapped** and funded based on individual rehabilitation necessity (38 C.F.R. § 21.212). The veteran is not required to exhaust HISA before receiving VR&E modifications.
                      </p>
                    </div>

                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: REBUTTAL */}
          {activeConfigTab === 'rebuttal' && (
            <div className="space-y-4">
              <div className="space-y-4 bg-slate-900/20 border border-slate-850 p-5 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <Scale size={14} className="text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Feasibility Denial & Rebuttal Planner</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  VRC counselors frequently deny Independent Living plans by asserting that employment is still feasible. Citing **38 C.F.R. § 21.40** and **38 C.F.R. § 21.160** defeats this claim.
                </p>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">What objections did the VRC counselor raise?</label>
                    <textarea
                      placeholder="e.g. Counselor claims employment feasibility is not ruled out yet, or that my condition might improve."
                      value={counselorObjections}
                      onChange={(e) => setCounselorObjections(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 resize-none focus:border-indigo-500 outline-none leading-normal"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Explain why employment is currently unfeasible</label>
                    <textarea
                      placeholder="e.g. Severe chronic pain and cognitive impairments prevent sitting, standing, or concentrating for more than 15 minutes, rendering sedentary work impossible."
                      value={unfeasibleReason}
                      onChange={(e) => setUnfeasibleReason(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 resize-none focus:border-indigo-500 outline-none leading-normal"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Medical/Psychological Evidence Available</label>
                    <textarea
                      placeholder="e.g. IMO from Dr. Reynolds dated 04/15/2026 stating unfeasibility for any vocational program."
                      value={medicalProof}
                      onChange={(e) => setMedicalProof(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 resize-none focus:border-indigo-500 outline-none leading-normal"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-lg text-[10px] text-slate-400 leading-relaxed space-y-1 font-mono">
                  <div><strong>Legal Precedent (38 C.F.R. § 21.40):</strong></div>
                  <div>If employment feasibility is doubtful or uncertain, a program of independent living services must be provided to evaluate or establish feasibility. Counselor cannot deny IL services based on speculation.</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FORM MOCK MAP */}
          {activeConfigTab === 'form_mock' && (
            <div className="space-y-4">
              <div className="bg-slate-900/20 border border-slate-850 p-5 rounded-xl space-y-4">
                <div className="flex items-center gap-1.5">
                  <FileText size={14} className="text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">VA Form 28-0791 Pre-Fill Block Map</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                  This mock preview shows how the information you compiled maps to specific boxes on the official **VA Form 28-0791 (Preliminary Assessment)**. Use these blocks to fill out the form.
                </p>

                <div className="space-y-3.5 border border-slate-800 bg-slate-950 p-4 rounded-xl font-mono text-[10px] text-slate-350">
                  <div className="border-b border-slate-850 pb-2 text-[11px] font-bold text-indigo-400">
                    VA FORM 28-0791 PRELIMINARY ASSESSMENT MOCKUP
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-[9px] text-slate-500 uppercase">Block 15: ADL Restrictions & Daily living limitations</div>
                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-850 max-h-[120px] overflow-y-auto">
                      {getAdlCount() === 0 ? 'No ADL checklist items selected.' : (
                        IL_DOMAINS.map(domain => {
                          const active = domain.items.filter(item => checkedAdls[item.id]);
                          if (active.length === 0) return null;
                          return (
                            <div key={domain.id} className="mb-1">
                              <strong>{domain.name}:</strong> {active.map(a => `${a.label} (${adlSeverities[a.id] || 'moderate'})`).join(', ')}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[9px] text-slate-500 uppercase">Block 16: Housing Barriers & Necessary Home Modifications</div>
                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-850">
                      {modificationRequired === 'yes' ? (
                        <div>
                          - Physical structural modifications required (Est. cost: ${estModCost ? `$${estModCost}` : 'unspecified'}).
                          {hisaCoordination && '\n- Cost-sharing coordination requested under HISA Grant (38 U.S.C. § 1717).'}
                        </div>
                      ) : (
                        'No housing or vehicle barriers reported.'
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[9px] text-slate-500 uppercase">Block 17: Transportation Needs</div>
                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-850">
                      {checkedAdls.driving || checkedAdls.public_transit ? (
                        <div>
                          - Limitations in mobility/driving active. Adaptive hand controls or transport services required.
                        </div>
                      ) : (
                        'Independent travel status indicated.'
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[9px] text-slate-500 uppercase">Block 18: Caregiver assistance dependency</div>
                    <div className="bg-slate-900/50 p-2.5 rounded border border-slate-850">
                      {Object.keys(adlCaregiver).some(id => checkedAdls[id] && adlCaregiver[id]) ? (
                        Object.keys(adlCaregiver).map(id => {
                          if (checkedAdls[id] && adlCaregiver[id]) {
                            const name = IL_DOMAINS.flatMap(d => d.items).find(item => item.id === id)?.label;
                            return (
                              <div key={id}>
                                <strong>{name}:</strong> {adlCaregiver[id]}
                              </div>
                            );
                          }
                          return null;
                        })
                      ) : (
                        'No active caregiver dependency reported.'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT PREVIEW & ACTION PANEL (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Action Toolbar header */}
          <div className="flex justify-between items-center bg-slate-900/30 border border-slate-850 rounded-xl p-4">
            {/* Tabs inside preview */}
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setActivePreviewTab('memo')}
                className={`px-2.5 py-1 font-bold rounded cursor-pointer transition ${
                  activePreviewTab === 'memo' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Strategy Memo
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('checklist')}
                className={`px-2.5 py-1 font-bold rounded cursor-pointer transition ${
                  activePreviewTab === 'checklist' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Attachments Checklist
              </button>
            </div>
            
            <div className="flex gap-1.5">
              <button
                onClick={resetBuilder}
                className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer"
                title="Reset Workspace"
              >
                <RefreshCw size={12} />
              </button>
              <button
                onClick={handleCopy}
                className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer"
                title="Copy Memo"
              >
                <Copy size={12} />
              </button>
              <button
                onClick={handlePrint}
                className="p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-white transition cursor-pointer"
                title="Print Memo"
              >
                <Printer size={12} />
              </button>
            </div>
          </div>

          {/* Tab 1: Memo precompiled view */}
          {activePreviewTab === 'memo' && (
            <div className="space-y-4">
              {copySuccess && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center rounded-lg text-xs font-semibold animate-fadeIn">
                  Memo copied to clipboard successfully!
                </div>
              )}
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 overflow-y-auto max-h-[480px]">
                <pre className="text-[10px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap select-text">
                  {compileILReport()}
                </pre>
              </div>
            </div>
          )}

          {/* Tab 2: Supporting Documents Checklist */}
          {activePreviewTab === 'checklist' && (
            <div className="bg-slate-900/20 border border-slate-850 p-5 rounded-xl space-y-4">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Supporting Documents Checklist</span>
              </div>
              <p className="text-[10px] text-slate-450 leading-relaxed">
                Prior to submitting your IL request (VA Form 28-0791) to your counselor, secure these supporting exhibits to prevent administrative denials:
              </p>
              
              <div className="space-y-2.5 text-xs text-slate-300">
                <label className="flex items-start gap-2.5 p-2 bg-slate-950/20 border border-slate-850 rounded hover:border-slate-800 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 accent-emerald-500" />
                  <span className="text-[11px] leading-snug">
                    <strong>VA Disability Rating Decision Letter</strong> listing all service-connected conditions and active diagnostic codes.
                  </span>
                </label>
                <label className="flex items-start gap-2.5 p-2 bg-slate-950/20 border border-slate-850 rounded hover:border-slate-800 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 accent-emerald-500" />
                  <span className="text-[11px] leading-snug">
                    <strong>Recent VA Clinical Progress Notes</strong> detailing severity of ADL limitations and pain levels.
                  </span>
                </label>
                
                {modificationRequired === 'yes' && (
                  <>
                    <label className="flex items-start gap-2.5 p-2 bg-slate-950/20 border border-slate-850 rounded hover:border-slate-850 cursor-pointer">
                      <input type="checkbox" className="mt-0.5 accent-emerald-500" />
                      <span className="text-[11px] leading-snug text-indigo-300">
                        <strong>Contractor Structural Cost Estimate</strong> outlining specifications for ramps/grab bars.
                      </span>
                    </label>
                    <label className="flex items-start gap-2.5 p-2 bg-slate-950/20 border border-slate-850 rounded hover:border-slate-850 cursor-pointer">
                      <input type="checkbox" className="mt-0.5 accent-emerald-500" />
                      <span className="text-[11px] leading-snug text-indigo-300">
                        <strong>Property Deed / Landlord Permission</strong> authorizing structural modifications to the residence.
                      </span>
                    </label>
                  </>
                )}

                {Object.keys(adlCaregiver).some(id => checkedAdls[id] && adlCaregiver[id]) && (
                  <label className="flex items-start gap-2.5 p-2 bg-slate-950/20 border border-slate-850 rounded hover:border-slate-850 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 accent-emerald-500" />
                    <span className="text-[11px] leading-snug text-rose-300">
                      <strong>VA PCAFC (Caregiver Program) Approval Letter</strong> or private care log proving dependency status.
                    </span>
                  </label>
                )}

                {(unfeasibleReason || counselorObjections) && (
                  <label className="flex items-start gap-2.5 p-2 bg-slate-950/20 border border-slate-850 rounded hover:border-slate-850 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 accent-emerald-500" />
                    <span className="text-[11px] leading-snug text-amber-300">
                      <strong>Independent Medical Opinion (IMO)</strong> or Social Security Disability (SSDI) decision stating unfeasibility for any active work.
                    </span>
                  </label>
                )}

                {totalEquipmentList.length > 0 && (
                  <label className="flex items-start gap-2.5 p-2 bg-slate-950/20 border border-slate-850 rounded hover:border-slate-850 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 accent-emerald-500" />
                    <span className="text-[11px] leading-snug text-emerald-300">
                      <strong>Product Catalog Sheets</strong> for requested assistive tech ({totalEquipmentList.slice(0, 3).join(', ')}...).
                    </span>
                  </label>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </motion.div>
  );
}

export default IndependentLivingBuilderView;
