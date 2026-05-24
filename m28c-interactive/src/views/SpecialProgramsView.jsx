import React, { useState } from 'react';
import { GraduationCap, Award, BookOpen, TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

function SpecialProgramsView({ rates, reduceMotion }) {
  // Localized states
  const [vetTecOnline, setVetTecOnline] = useState(false);
  const [sportsLoad, setSportsLoad] = useState('full');

  return (
    <motion.div 
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? {} : { opacity: 0, y: -15 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
      className="doc-card"
    >
      <span className="doc-tag font-bold text-amber-500 uppercase tracking-wider">Special VA Programs</span>
      <h1 className="doc-title mt-1.5 mb-1.5 text-2xl font-black text-slate-100">Special Retraining & Veteran Programs</h1>
      <p className="doc-subtitle text-xs text-slate-400">Track VET TEC housing allowances, calculate Sports4Vets Paralympic training support, and review graduate induction strategies.</p>
      <div className="doc-divider mb-6 mt-4"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: VET TEC, Sports4Vets and Graduate School */}
        <div className="lg:col-span-7 space-y-6">
          {/* VET TEC Technology Training Tracker */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300 relative overflow-hidden">
            <div className="absolute -inset-px bg-gradient-to-tr from-amber-500/5 via-transparent to-transparent pointer-events-none rounded-xl" />
            <h4 className="text-sm font-bold text-amber-500 mb-4 border-b border-slate-800 pb-2 flex items-center gap-2 relative z-10">
              <GraduationCap size={16} />
              VET TEC Technology Training Tracker
            </h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed relative z-10">
              The VET TEC program funds high-tech industry training. If authorized, you receive Monthly Housing Allowance (MHA) during your course.
            </p>
            <div className="space-y-4 relative z-10">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200 hover:text-white select-none">
                <input 
                  type="checkbox" 
                  className="accent-amber-500" 
                  checked={vetTecOnline} 
                  onChange={(e) => setVetTecOnline(e.target.checked)} 
                />
                <span>Online-Only Training Course (VET TEC online rate applies)</span>
              </label>
              
              <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Housing Rate Mode:</span>
                  <span className="font-semibold text-slate-200">{vetTecOnline ? 'Online MHA Rate' : 'Local Bah/MHA Rate'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">VET TEC MHA Monthly Estimate:</span>
                  <span className="font-bold text-amber-500 font-mono">
                    ${vetTecOnline 
                      ? rates.p911_online_rate.toLocaleString('en-US', { minimumFractionDigits: 2 }) 
                      : rates.ch31_institutional_full[0].toLocaleString('en-US', { minimumFractionDigits: 2 })
                    }/mo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sports4Vets Paralympic Allowance Calculator */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300 relative overflow-hidden">
            <div className="absolute -inset-px bg-gradient-to-tr from-amber-500/5 via-transparent to-transparent pointer-events-none rounded-xl" />
            <h4 className="text-sm font-bold text-amber-500 mb-4 border-b border-slate-800 pb-2 flex items-center gap-2 relative z-10">
              <Award size={16} />
              Sports4Vets Paralympic Allowance Calculator
            </h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed relative z-10">
              Veterans with service-connected disabilities training for the Paralympic or Olympic teams may qualify for a monthly allowance under 38 U.S.C. § 322.
            </p>
            
            <div className="space-y-4 relative z-10">
              <div className="form-group">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Athlete Training Load</label>
                <select
                  className="form-control w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 text-xs focus:border-amber-500 transition-all"
                  value={sportsLoad}
                  onChange={(e) => setSportsLoad(e.target.value)}
                >
                  <option value="full">Full-Time Training</option>
                  <option value="threeQuarters">3/4-Time Training</option>
                  <option value="half">1/2-Time Training</option>
                </select>
              </div>

              <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Training Support:</span>
                  <span className="font-bold text-amber-500 font-mono">
                    {(() => {
                      let val = 0;
                      if (sportsLoad === 'full') val = rates.ch31_institutional_full[0];
                      else if (sportsLoad === 'threeQuarters') val = rates.ch31_institutional_threeQuarters[0];
                      else if (sportsLoad === 'half') val = rates.ch31_institutional_half[0];
                      return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo`;
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Graduate School Strategy Advisor */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300 relative overflow-hidden">
            <div className="absolute -inset-px bg-gradient-to-tr from-amber-500/5 via-transparent to-transparent pointer-events-none rounded-xl" />
            <h4 className="text-sm font-bold text-amber-500 mb-4 border-b border-slate-800 pb-2 flex items-center gap-2 relative z-10">
              <BookOpen size={16} />
              Graduate School Induction Strategy Advisor
            </h4>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed relative z-10">
              <p>
                Securing Chapter 31 funding for postgraduate programs (Master's, J.D., M.D., Ph.D.) requires establishing that the postgraduate degree is the <strong>minimum entry requirement</strong> to overcome the veteran's vocational handicap.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-400">
                <li><strong>Entry-Level Justification:</strong> Obtain formal letters from employers or industry regulations showing that the master's or doctorate is mandatory for employment in your chosen sector (e.g. licensed psychologist, occupational therapist).</li>
                <li><strong>Labor Market Data:</strong> Present data showing employment options with an undergraduate degree are not compatible with your disability, whereas post-grad roles are compatible.</li>
                <li><strong>Track Alignment:</strong> Always align postgraduate requests under the Long-Term Services track and compile this evidence before requesting your IWRP review.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Calculations & Ratios Display */}
        <div className="lg:col-span-5 space-y-6">
          {/* Funding Ratios Card */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300 relative overflow-hidden">
            <div className="absolute -inset-px bg-gradient-to-tr from-amber-500/5 via-transparent to-transparent pointer-events-none rounded-xl" />
            <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2 relative z-10">
              <TrendingUp size={16} className="text-amber-500" />
              VET TEC Funding Ratios
            </h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed relative z-10">
              To incentivize high employment outcomes, VET TEC pays training providers based on the student's progress:
            </p>
            
            <div className="space-y-4 relative z-10">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>1. Enrollment Milestone</span>
                  <span>50% Funding</span>
                </div>
                <div className="h-2.5 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: '50%' }} />
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Paid to the provider when you formally enroll and start the technology program.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>2. Graduation Milestone</span>
                  <span>25% Funding</span>
                </div>
                <div className="h-2.5 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: '25%' }} />
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Paid to the provider when you successfully complete the course and graduate.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>3. Employment Milestone</span>
                  <span>25% Funding</span>
                </div>
                <div className="h-2.5 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: '25%' }} />
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Paid to the provider only when you find meaningful employment in the field of study within 180 days of graduation.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Rates Card */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300 relative overflow-hidden">
            <div className="absolute -inset-px bg-gradient-to-tr from-amber-500/5 via-transparent to-transparent pointer-events-none rounded-xl" />
            <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2 relative z-10">
              <DollarSign size={16} className="text-amber-500" />
              Active Monthly Rates Summary
            </h4>
            
            <div className="space-y-2 text-xs relative z-10">
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">VET TEC Online MHA:</span>
                <span className="font-semibold text-slate-200 font-mono">${rates.p911_online_rate.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">Sports4Vets Full load:</span>
                <span className="font-semibold text-slate-200 font-mono">${rates.ch31_institutional_full[0].toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">Sports4Vets 3/4 load:</span>
                <span className="font-semibold text-slate-200 font-mono">${rates.ch31_institutional_threeQuarters[0].toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sports4Vets 1/2 load:</span>
                <span className="font-semibold text-slate-200 font-mono">${rates.ch31_institutional_half[0].toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default SpecialProgramsView;
