import React, { useState } from 'react';
import { Search, Info } from 'lucide-react';
import { VRE_OFFICES } from '../data/data';
import { motion } from 'framer-motion';

function CounselorDirectoryView({ reduceMotion }) {
  const [dirQuery, setDirQuery] = useState('');

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
    </motion.div>
  );
}

export default CounselorDirectoryView;
