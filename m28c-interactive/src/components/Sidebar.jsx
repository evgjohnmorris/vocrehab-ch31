import React from 'react';
import { 
  ShieldCheck, BookOpen, Award, Calculator, Scale, 
  DollarSign, Compass, Briefcase, GraduationCap, Users, 
  FileText, ExternalLink, ChevronRight, AlertTriangle, FileEdit 
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
  setDirQuery,
  isSidebarOpen,
  setIsSidebarOpen
}) {
  
  const handleNavClick = (view) => {
    setActiveView(view);
    setIsSidebarOpen(false);
  };

  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'mobile-open' : ''}`} aria-label="Main Navigation">
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
        {/* VR&E Core Modules */}
        <div className="nav-category">
          <div className="nav-title">VR&E Core Modules</div>
          
          <div 
            className={`nav-item ${activeView === 'reference' ? 'active' : ''}`}
            onClick={() => handleNavClick('reference')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('reference'))}
            aria-current={activeView === 'reference' ? 'page' : undefined}
          >
            <BookOpen size={18} />
            <span>Manual Reference</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'wizard' ? 'active' : ''}`}
            onClick={() => { handleNavClick('wizard'); if (setWizardResult) setWizardResult(null); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => { handleNavClick('wizard'); if (setWizardResult) setWizardResult(null); })}
            aria-current={activeView === 'wizard' ? 'page' : undefined}
          >
            <Award size={18} />
            <span>Entitlement Wizard</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'calculator' ? 'active' : ''}`}
            onClick={() => handleNavClick('calculator')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('calculator'))}
            aria-current={activeView === 'calculator' ? 'page' : undefined}
          >
            <Calculator size={18} />
            <span>Subsistence Calc</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'error_spotter' ? 'active' : ''}`}
            onClick={() => handleNavClick('error_spotter')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('error_spotter'))}
            aria-current={activeView === 'error_spotter' ? 'page' : undefined}
          >
            <AlertTriangle size={18} />
            <span>VA Error Spotter</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'document_generator' ? 'active' : ''}`}
            onClick={() => handleNavClick('document_generator')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('document_generator'))}
            aria-current={activeView === 'document_generator' ? 'page' : undefined}
          >
            <FileEdit size={18} />
            <span>Document Generator</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'self_employment' ? 'active' : ''}`}
            onClick={() => { handleNavClick('self_employment'); if (setSelfGeneratedLetter) setSelfGeneratedLetter(''); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => { handleNavClick('self_employment'); if (setSelfGeneratedLetter) setSelfGeneratedLetter(''); })}
            aria-current={activeView === 'self_employment' ? 'page' : undefined}
          >
            <Briefcase size={18} />
            <span>Self-Employment Track</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'special_programs' ? 'active' : ''}`}
            onClick={() => handleNavClick('special_programs')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('special_programs'))}
            aria-current={activeView === 'special_programs' ? 'page' : undefined}
          >
            <GraduationCap size={18} />
            <span>Special Retraining</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'directory' ? 'active' : ''}`}
            onClick={() => { handleNavClick('directory'); if (setDirQuery) setDirQuery(''); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => { handleNavClick('directory'); if (setDirQuery) setDirQuery(''); })}
            aria-current={activeView === 'directory' ? 'page' : undefined}
          >
            <Users size={18} />
            <span>Counselor Directory</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'glossary' ? 'active' : ''}`}
            onClick={() => handleNavClick('glossary')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('glossary'))}
            aria-current={activeView === 'glossary' ? 'page' : undefined}
          >
            <FileText size={18} />
            <span>Glossary of Terms</span>
          </div>
        </div>

        {/* Related VA Benefits / Planning Tools */}
        <div className="nav-category" style={{ marginTop: '16px' }}>
          <div className="nav-title">Related Benefits / Planning</div>
          
          <div 
            className={`nav-item ${activeView === 'disability_hub' ? 'active' : ''}`}
            onClick={() => handleNavClick('disability_hub')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('disability_hub'))}
            aria-current={activeView === 'disability_hub' ? 'page' : undefined}
          >
            <Scale size={18} />
            <span>Disability & SMC</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'financial_planner' ? 'active' : ''}`}
            onClick={() => handleNavClick('financial_planner')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('financial_planner'))}
            aria-current={activeView === 'financial_planner' ? 'page' : undefined}
          >
            <DollarSign size={18} />
            <span>Financial Planner</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'planning' ? 'active' : ''}`}
            onClick={() => handleNavClick('planning')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('planning'))}
            aria-current={activeView === 'planning' ? 'page' : undefined}
          >
            <Compass size={18} />
            <span>Career Plan & Strategy</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'resources' ? 'active' : ''}`}
            onClick={() => handleNavClick('resources')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('resources'))}
            aria-current={activeView === 'resources' ? 'page' : undefined}
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
              <div 
                className="collapsible-header" 
                onClick={() => toggleCategory('usc')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, () => toggleCategory('usc'))}
                aria-expanded={expandedCategories.usc}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Scale size={16} />
                  38 U.S.C. Chapter 31
                </span>
                <ChevronRight size={14} className={`collapsible-icon ${expandedCategories.usc ? 'expanded' : ''}`} />
              </div>
              
              {expandedCategories.usc && (
                <div role="group">
                  {US_CODE_SECTIONS.map(sec => (
                    <div 
                      key={sec.id}
                      className={`nav-item sub-item ${selectedSection.type === 'usc' && selectedSection.id === sec.id ? 'active' : ''}`}
                      onClick={() => { setSelectedSection({ type: 'usc', id: sec.id }); setIsSidebarOpen(false); }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => handleKeyDown(e, () => { setSelectedSection({ type: 'usc', id: sec.id }); setIsSidebarOpen(false); })}
                    >
                      {sec.id}: {sec.title.split('. ')[1]}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 38 CFR Accordion */}
            <div style={{ marginTop: '8px' }}>
              <div 
                className="collapsible-header" 
                onClick={() => toggleCategory('cfr')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, () => toggleCategory('cfr'))}
                aria-expanded={expandedCategories.cfr}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} />
                  38 CFR Part 21
                </span>
                <ChevronRight size={14} className={`collapsible-icon ${expandedCategories.cfr ? 'expanded' : ''}`} />
              </div>
              
              {expandedCategories.cfr && (
                <div role="group">
                  {CFR_REGULATIONS.map(reg => (
                    <div 
                      key={reg.id}
                      className={`nav-item sub-item ${selectedSection.type === 'cfr' && selectedSection.id === reg.id ? 'active' : ''}`}
                      onClick={() => { setSelectedSection({ type: 'cfr', id: reg.id }); setIsSidebarOpen(false); }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => handleKeyDown(e, () => { setSelectedSection({ type: 'cfr', id: reg.id }); setIsSidebarOpen(false); })}
                    >
                      {reg.id}: {reg.title.split('. ')[1]}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* M28C Accordion */}
            <div style={{ marginTop: '8px' }}>
              <div 
                className="collapsible-header" 
                onClick={() => toggleCategory('m28c')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, () => toggleCategory('m28c'))}
                aria-expanded={expandedCategories.m28c}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} />
                  M28C Chapters
                </span>
                <ChevronRight size={14} className={`collapsible-icon ${expandedCategories.m28c ? 'expanded' : ''}`} />
              </div>

              {expandedCategories.m28c && (
                <div role="group">
                  {M28C_PARTS.map(part => (
                    <div key={part.id}>
                      <div 
                        className="nav-item sub-item" 
                        style={{ fontWeight: '600', color: 'var(--text-primary)' }}
                        onClick={() => togglePart(part.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => handleKeyDown(e, () => togglePart(part.id))}
                        aria-expanded={expandedCategories.m28cParts[part.id]}
                      >
                        <ChevronRight size={12} className={`collapsible-icon ${expandedCategories.m28cParts[part.id] ? 'expanded' : ''}`} />
                        <span style={{ marginLeft: '4px' }}>{part.title.split('. ')[0]}</span>
                      </div>
                      
                      {expandedCategories.m28cParts[part.id] && (
                        <div role="group">
                          {part.chapters.map(ch => (
                            <div 
                              key={ch.id}
                              className={`nav-item sub-item ${selectedSection.type === 'm28c' && selectedSection.id === ch.id ? 'active' : ''}`}
                              onClick={() => { setSelectedSection({ type: 'm28c', id: ch.id }); setIsSidebarOpen(false); }}
                              style={{ paddingLeft: '48px', fontSize: '0.8rem' }}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => handleKeyDown(e, () => { setSelectedSection({ type: 'm28c', id: ch.id }); setIsSidebarOpen(false); })}
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
