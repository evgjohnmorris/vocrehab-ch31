import React from 'react';
import { 
  ShieldCheck, BookOpen, Award, Calculator, Scale, 
  DollarSign, Compass, Briefcase, GraduationCap, Users, 
  FileText, ExternalLink, ChevronRight 
} from 'lucide-react';
import { US_CODE_SECTIONS, CFR_REGULATIONS, M28C_PARTS } from '../data/data';

function Sidebar({ 
  activeView, 
  setActiveView, 
  selectedSection, 
  setSelectedSection,
  expandedCategories, 
  toggleCategory, 
  togglePart,
  setWizardResult,
  setSelfGeneratedLetter,
  setDirQuery
}) {
  return (
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
            onClick={() => { setActiveView('wizard'); if (setWizardResult) setWizardResult(null); }}
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
            <span>Career Plan and Strategy</span>
          </div>
          <div 
            className={`nav-item ${activeView === 'self_employment' ? 'active' : ''}`}
            onClick={() => { setActiveView('self_employment'); if (setSelfGeneratedLetter) setSelfGeneratedLetter(''); }}
          >
            <Briefcase size={18} />
            <span>Self-Employment Track</span>
          </div>
          <div 
            className={`nav-item ${activeView === 'special_programs' ? 'active' : ''}`}
            onClick={() => setActiveView('special_programs')}
          >
            <GraduationCap size={18} />
            <span>Special Retraining Programs</span>
          </div>
          <div 
            className={`nav-item ${activeView === 'directory' ? 'active' : ''}`}
            onClick={() => { setActiveView('directory'); if (setDirQuery) setDirQuery(''); }}
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
  );
}

export default Sidebar;
