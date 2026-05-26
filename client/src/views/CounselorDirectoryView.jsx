import { useState, useMemo } from 'react';
import { Search, Info, Map } from 'lucide-react';
import { VRE_OFFICES } from '../data/data';
import { motion } from 'framer-motion';

const MAP_OFFICES = [
  { office: 'Seattle, WA (346)', x: 90, y: 70, name: 'Seattle' },
  { office: 'San Diego, CA (377)', x: 100, y: 310, name: 'San Diego' },
  { office: 'Phoenix, AZ (345)', x: 175, y: 290, name: 'Phoenix' },
  { office: 'Denver, CO (339)', x: 320, y: 210, name: 'Denver' },
  { office: 'Houston, TX (362)', x: 450, y: 370, name: 'Houston' },
  { office: 'Chicago, IL (328)', x: 560, y: 170, name: 'Chicago' },
  { office: 'Winston-Salem, NC (318)', x: 690, y: 240, name: 'Winston-Salem' },
  { office: 'St. Petersburg, FL (317)', x: 710, y: 390, name: 'St. Petersburg' },
  { office: 'Boston, MA (301)', x: 760, y: 110, name: 'Boston' },
  { office: 'Atlanta, GA (316)', x: 660, y: 290, name: 'Atlanta' }
];

const US_POLYGON = [
  [80,70], [200,70], [300,75], [450,85], [520,95], [560,90], [590,110], [630,110], [650,90],
  [700,90], [740,70], [770,50], [780,70], [760,110], [740,130], [720,170], [710,210], [730,240], 
  [700,280], [685,320], [685,360], [725,395], [725,415], [705,405], [680,355], [650,350], 
  [600,360], [550,345], [480,360], [440,410], [410,380], [370,350], [260,340], [220,335], 
  [170,335], [100,310], [85,250], [70,180], [75,130]
];

function CounselorDirectoryView({ reduceMotion }) {
  const [dirQuery, setDirQuery] = useState('');
  const [selectedOfficeName, setSelectedOfficeName] = useState('');

  const dotGrid = useMemo(() => {
    const dots = [];
    const isPointInPolygon = (point, vs) => {
      const x = point[0], y = point[1];
      let inside = false;
      for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][0], yi = vs[i][1];
        const xj = vs[j][0], yj = vs[j][1];
        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    };

    for (let x = 60; x <= 790; x += 14) {
      for (let y = 50; y <= 420; y += 14) {
        if (isPointInPolygon([x, y], US_POLYGON)) {
          dots.push({ x, y });
        }
      }
    }
    return dots;
  }, []);

  const handleOfficeClick = (office) => {
    setSelectedOfficeName(office.name);
    setDirQuery(office.name);
  };

  // Sync map selection with search input
  const activeOffice = MAP_OFFICES.find(o => 
    dirQuery && o.name.toLowerCase().includes(dirQuery.toLowerCase())
  );
  const activeOfficeName = activeOffice ? activeOffice.name : selectedOfficeName;

  const selectedOfficeData = VRE_OFFICES.find(o => 
    activeOfficeName ? o.office.includes(activeOfficeName) : false
  );

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="doc-card"
    >
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
            {/* @cite 38-cfr-21-33 */}
            <strong>Submit a Formal Ask VA (AVA) Inquiry:</strong> Submit a formal, documented tracking ticket at <a href="https://ask.va.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}>ask.va.gov</a>. Select "Veteran Readiness & Employment" as the topic. This starts an official federal timeline that the office must resolve.
          </li>
          <li>
            <strong>Request a Counselor Change:</strong> If the relationship is unsalvageable, submit a formal written request via email to the VREO detailing the breakdown of communications and requesting case reassignment.
          </li>
        </ol>
      </div>

      {/* GIS Interactive Map Canvas Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 text-slate-300">
        {/* Map Box */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
              <Map size={16} />
              Interactive Regional Office Locator (GIS)
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-sky-500/10 text-sky-400 rounded border border-sky-500/20">Live GIS Mode</span>
          </div>
          
          <div className="relative bg-slate-950/40 border border-slate-900 rounded-2xl p-2 shadow-inner">
            <svg 
              viewBox="0 0 800 450" 
              className="w-full h-auto text-slate-800"
              style={{ maxHeight: '420px' }}
            >
              {/* US Outline Path */}
              <path 
                d="M 80,70 L 200,70 L 300,75 L 450,85 L 520,95 L 560,90 L 590,110 L 630,110 L 650,90 L 700,90 L 740,70 L 770,50 L 780,70 L 760,110 L 740,130 L 720,170 L 710,210 L 730,240 L 700,280 L 685,320 L 685,360 L 725,395 L 725,415 L 705,405 L 680,355 L 650,350 L 600,360 L 550,345 L 480,360 L 440,410 L 410,380 L 370,350 L 260,340 L 220,335 L 170,335 L 100,310 L 85,250 L 70,180 L 75,130 Z" 
                fill="rgba(15,23,42,0.35)" 
                stroke="rgba(216,161,41,0.12)" 
                strokeWidth="2" 
              />
              
              {/* Dot Grid */}
              {dotGrid.map((d, i) => {
                let isActiveNear = false;
                if (activeOffice) {
                  const dist = Math.hypot(d.x - activeOffice.x, d.y - activeOffice.y);
                  if (dist < 45) isActiveNear = true;
                }
                return (
                  <circle 
                    key={i} 
                    cx={d.x} 
                    cy={d.y} 
                    r={isActiveNear ? 2 : 1.2} 
                    fill={isActiveNear ? "var(--accent-color)" : "currentColor"} 
                    className={isActiveNear ? "text-amber-500 opacity-60" : "text-slate-700 opacity-25"}
                    style={{ transition: 'fill 0.3s, r 0.3s, opacity 0.3s' }}
                  />
                );
              })}

              {/* Office Beacons */}
              {MAP_OFFICES.map((mo) => {
                const isSelected = activeOfficeName === mo.name;
                return (
                  <g 
                    key={mo.name} 
                    className="cursor-pointer"
                    onClick={() => handleOfficeClick(mo)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Select ${mo.name} Regional Office`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleOfficeClick(mo);
                      }
                    }}
                  >
                    {/* Glowing ripple ring */}
                    {isSelected && (
                      <circle 
                        cx={mo.x} 
                        cy={mo.y} 
                        r="12" 
                        fill="none" 
                        stroke="var(--accent-color)" 
                        strokeWidth="1.5" 
                        opacity="0.8"
                        className="animate-ping"
                      />
                    )}
                    {/* Core Beacon pin */}
                    <circle 
                      cx={mo.x} 
                      cy={mo.y} 
                      r={isSelected ? 6 : 4.5} 
                      fill={isSelected ? "var(--accent-color)" : "#38bdf8"} 
                      stroke={isSelected ? "#ffffff" : "none"}
                      strokeWidth="1.5"
                      className="transition-all duration-300"
                    />
                    {/* Click target helper */}
                    <circle 
                      cx={mo.x} 
                      cy={mo.y} 
                      r="16" 
                      fill="transparent" 
                    />
                  </g>
                );
              })}

              {/* Labels overlay */}
              {MAP_OFFICES.map((mo) => {
                const isSelected = activeOfficeName === mo.name;
                return (
                  <text
                    key={`lbl-${mo.name}`}
                    x={mo.x}
                    y={mo.y - (isSelected ? 10 : 8)}
                    textAnchor="middle"
                    className={`text-[9px] font-bold pointer-events-none transition-all duration-300 ${
                      isSelected ? "fill-amber-400 font-extrabold" : "fill-slate-400 opacity-70"
                    }`}
                  >
                    {mo.name}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Office Details Panel */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Escalation Contacts
          </h3>
          
          {selectedOfficeData ? (
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all duration-300 h-[calc(100%-32px)] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="border-b border-slate-800 pb-2.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20">Selected Regional Office</span>
                  <h4 className="text-sm font-bold text-amber-400 mt-1.5">{selectedOfficeData.office}</h4>
                  <p className="text-xs text-slate-200 font-semibold mt-0.5">VR&E Officer: {selectedOfficeData.officer || "Vacant / Unassigned"}</p>
                </div>
                
                <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <p><strong>Mailing Address:</strong><br />
                    <span className="text-slate-400 text-[11px]">{selectedOfficeData.address}</span>
                  </p>
                  {selectedOfficeData.phone && (
                    <p><strong>Direct Line:</strong> <span className="text-slate-400 font-mono">{selectedOfficeData.phone}</span></p>
                  )}
                  {selectedOfficeData.fax && (
                    <p><strong>Direct Fax:</strong> <span className="text-slate-400 font-mono">{selectedOfficeData.fax}</span></p>
                  )}
                  {selectedOfficeData.email && (
                    <p><strong>Escalation Group Email:</strong><br />
                      <span className="text-amber-500 font-mono text-[11px]">{selectedOfficeData.email}</span>
                    </p>
                  )}
                </div>

                {selectedOfficeData.outStations && selectedOfficeData.outStations.length > 0 && (
                  <div className="border-t border-dashed border-slate-800 pt-2.5">
                    <span className="text-[10px] font-bold text-slate-200">Outstations & Field Offices:</span>
                    <div className="max-h-24 overflow-y-auto mt-1 space-y-1.5 pr-1">
                      {selectedOfficeData.outStations.map((os, idx) => (
                        <div key={idx} className="text-[10px] text-slate-400 leading-normal">
                          <strong className="text-slate-300">{os.name}:</strong> {os.address}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                {selectedOfficeData.email && (
                  <div className="flex gap-2">
                    <a 
                      href={`mailto:${selectedOfficeData.email}`} 
                      className="btn btn-primary flex-1 text-xs font-semibold py-2 h-9"
                    >
                      Email Office
                    </a>
                    <button
                      type="button"
                      className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md cursor-pointer transition-colors duration-150 text-[11px]"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedOfficeData.email);
                        alert("Email address copied to clipboard!");
                      }}
                    >
                      Copy
                    </button>
                  </div>
                )}
                {selectedOfficeData.phone && (
                  <a 
                    href={`tel:${selectedOfficeData.phone.split(' ')[0]}`} 
                    className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-md text-slate-300 text-xs font-semibold py-2 flex items-center justify-center gap-1.5 h-9"
                  >
                    Call Regional Office
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-[calc(100%-32px)]">
              <Info size={28} className="text-slate-600 mb-2" />
              <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">
                Click on any glowing blue beacon on the map to display official VREO direct supervisor contacts, address, phone numbers, and field outstations.
              </p>
            </div>
          )}
        </div>
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
    </motion.div>
  );
}

export default CounselorDirectoryView;
