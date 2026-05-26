import { useState } from 'react';
import { Scale, Book, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import statementsData from '../data/legal-statements.json';

export default function LegalStatement({ id, showCard = false }) {
  const statement = statementsData[id];
  const [isExpanded, setIsExpanded] = useState(false);

  if (!statement) {
    console.warn(`LegalStatement: Statement ID "${id}" not found.`);
    return null;
  }

  const { text, authorityIds, strength } = statement;

  const handleCitationClick = (citeId) => {
    // Determine type and section
    let type = '';
    let secId = '';

    if (citeId.startsWith('38-usc-')) {
      type = 'usc';
      secId = citeId.replace('38-usc-', '');
    } else if (citeId.startsWith('38-cfr-')) {
      type = 'cfr';
      // format in CFR view is e.g. "21_120"
      secId = citeId.replace('38-cfr-21-', '21_').replace('38-cfr-', '');
    } else if (citeId.startsWith('m28c_')) {
      type = 'm28c';
      secId = citeId;
    }

    if (type && secId) {
      const event = new CustomEvent('navigate-to-authority', { 
        detail: { type, id: secId } 
      });
      window.dispatchEvent(event);
    }
  };

  const getStrengthBadge = () => {
    switch (strength) {
      case 'binding':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded">
            <Scale size={10} />
            <span>BINDING STATUTE / REGULATION</span>
          </span>
        );
      case 'policy':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded">
            <Book size={10} />
            <span>VA MANUAL POLICY</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold text-slate-400 bg-slate-500/10 border border-slate-500/20 rounded">
            <ShieldAlert size={10} />
            <span>EXPLANATORY ANALYSIS</span>
          </span>
        );
    }
  };

  if (showCard) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {getStrengthBadge()}
              <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                <CheckCircle2 size={10} className="text-emerald-400" />
                <span>Verified Traceable Claim</span>
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium mt-1">
              "{text}"
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/60">
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Controlling Authorities:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {authorityIds.map(auth => {
              let display = auth.toUpperCase().replace(/-/g, ' ');
              if (auth.startsWith('38-usc-')) display = `38 U.S.C. § ${auth.replace('38-usc-', '')}`;
              if (auth.startsWith('38-cfr-')) display = `38 C.F.R. § ${auth.replace('38-cfr-21-', '21.').replace('38-cfr-', '')}`;
              return (
                <button
                  key={auth}
                  onClick={() => handleCitationClick(auth)}
                  className="text-[9px] bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 px-2 py-1 rounded transition duration-150"
                >
                  {display}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <span className="inline-flex flex-col gap-1 align-baseline max-w-full">
      <span className="inline-flex items-center gap-1.5 flex-wrap">
        <span className="text-slate-200 font-medium font-sans">
          {text}
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded text-slate-400 hover:text-slate-200 transition"
          aria-label="View legal authority information"
        >
          {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </button>
      </span>

      {isExpanded && (
        <span className="block bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 mt-1.5 max-w-lg animate-fadeIn text-left">
          <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Traceable Citation Information
          </span>
          <span className="flex flex-wrap items-center gap-2 mt-1">
            {getStrengthBadge()}
            {authorityIds.map(auth => {
              let display = auth.toUpperCase().replace(/-/g, ' ');
              if (auth.startsWith('38-usc-')) display = `38 U.S.C. § ${auth.replace('38-usc-', '')}`;
              if (auth.startsWith('38-cfr-')) display = `38 C.F.R. § ${auth.replace('38-cfr-21-', '21.').replace('38-cfr-', '')}`;
              return (
                <button
                  key={auth}
                  onClick={() => handleCitationClick(auth)}
                  className="text-[9px] bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-emerald-400 hover:text-emerald-300 px-1.5 py-0.5 rounded transition duration-150"
                >
                  {display}
                </button>
              );
            })}
          </span>
        </span>
      )}
    </span>
  );
}
