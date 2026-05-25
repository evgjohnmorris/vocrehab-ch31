import { 
  ShieldCheck, Award, Calculator, Scale, 
  Compass, Briefcase, GraduationCap, Users, 
  FileText, ChevronRight, FileEdit,
  Gavel, FileCheck, CheckCircle2, RefreshCw, Home, Shield, Settings
} from 'lucide-react';
import authorityManifest from '../data/authority/manifest.json';

function Sidebar({ 
  activeView, 
  setActiveView, 
  selectedSection, 
  setSelectedSection,
  expandedCategories, 
  toggleCategory, 
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
        {/* Get Help Now */}
        <div className="nav-category">
          <div 
            className={`nav-item ${activeView === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('home'))}
            aria-current={activeView === 'home' ? 'page' : undefined}
            style={{ fontWeight: 'bold' }}
          >
            <Home size={18} />
            <span>Get Help Now (Dashboard)</span>
          </div>
        </div>

        {/* My VR&E Situation */}
        <div className="nav-category" style={{ marginTop: '12px' }}>
          <div className="nav-title">My VR&E Situation</div>
          
          <div 
            className={`nav-item ${activeView === 'wizard' ? 'active' : ''}`}
            onClick={() => { handleNavClick('wizard'); if (setWizardResult) setWizardResult(null); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => { handleNavClick('wizard'); if (setWizardResult) setWizardResult(null); })}
          >
            <Award size={18} />
            <span>Eligibility & Entitlement</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'claim_builder' ? 'active' : ''}`}
            onClick={() => handleNavClick('claim_builder')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('claim_builder'))}
          >
            <Compass size={18} />
            <span>IPE / Plan Builder</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'special_programs' ? 'active' : ''}`}
            onClick={() => handleNavClick('special_programs')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('special_programs'))}
          >
            <GraduationCap size={18} />
            <span>School / Training Track</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'dispute_hub' && sessionStorage.getItem('dispute_hub_prefill') === 'computer_denial' ? 'active' : ''}`}
            onClick={() => {
              sessionStorage.setItem('dispute_hub_prefill', 'computer_denial');
              window.dispatchEvent(new CustomEvent('change-dispute-area', { detail: 'computer_denial' }));
              handleNavClick('dispute_hub');
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => {
              sessionStorage.setItem('dispute_hub_prefill', 'computer_denial');
              window.dispatchEvent(new CustomEvent('change-dispute-area', { detail: 'computer_denial' }));
              handleNavClick('dispute_hub');
            })}
          >
            <Briefcase size={18} />
            <span>Supplies & Tech Requests</span>
          </div>

          <div 
            className={`nav-item`}
            onClick={() => {
              sessionStorage.setItem('dispute_hub_prefill', 'feasibility_denial');
              window.dispatchEvent(new CustomEvent('change-dispute-area', { detail: 'feasibility_denial' }));
              handleNavClick('dispute_hub');
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => {
              sessionStorage.setItem('dispute_hub_prefill', 'feasibility_denial');
              window.dispatchEvent(new CustomEvent('change-dispute-area', { detail: 'feasibility_denial' }));
              handleNavClick('dispute_hub');
            })}
          >
            <Shield size={18} />
            <span>Independent Living Help</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'self_employment' ? 'active' : ''}`}
            onClick={() => { handleNavClick('self_employment'); if (setSelfGeneratedLetter) setSelfGeneratedLetter(''); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => { handleNavClick('self_employment'); if (setSelfGeneratedLetter) setSelfGeneratedLetter(''); })}
          >
            <Briefcase size={18} />
            <span>Self-Employment Track</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'dispute_hub' && !sessionStorage.getItem('dispute_hub_prefill') ? 'active' : ''}`}
            onClick={() => {
              sessionStorage.removeItem('dispute_hub_prefill');
              handleNavClick('dispute_hub');
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => {
              sessionStorage.removeItem('dispute_hub_prefill');
              handleNavClick('dispute_hub');
            })}
          >
            <Scale size={18} />
            <span>Appeals & Disputes Hub</span>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="nav-category" style={{ marginTop: '12px' }}>
          <div className="nav-title">Primary Tools</div>

          <div 
            className={`nav-item ${activeView === 'calculator' ? 'active' : ''}`}
            onClick={() => handleNavClick('calculator')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('calculator'))}
          >
            <Calculator size={18} />
            <span>Calculate Payments</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'document_generator' ? 'active' : ''}`}
            onClick={() => handleNavClick('document_generator')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('document_generator'))}
          >
            <FileEdit size={18} />
            <span>Build a Letter / Document</span>
          </div>

          <div 
            className={`nav-item`}
            onClick={() => {
              // Directs to evidence sufficiency checklist within dispute hub
              window.dispatchEvent(new CustomEvent('change-dispute-tab', { detail: 'evidence' }));
              handleNavClick('dispute_hub');
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => {
              window.dispatchEvent(new CustomEvent('change-dispute-tab', { detail: 'evidence' }));
              handleNavClick('dispute_hub');
            })}
          >
            <FileCheck size={18} />
            <span>Track Evidence Packages</span>
          </div>
        </div>

        {/* Research Authority */}
        <div className="nav-category" style={{ marginTop: '12px' }}>
          <div className="nav-title">Research Authority</div>
          
          <div 
            className={`nav-item ${activeView === 'authority_library' ? 'active' : ''}`}
            onClick={() => handleNavClick('authority_library')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('authority_library'))}
          >
            <Gavel size={18} />
            <span>Authority Library</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'coverage_report' ? 'active' : ''}`}
            onClick={() => handleNavClick('coverage_report')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('coverage_report'))}
          >
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>Coverage & Trust Report</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'source_diff' ? 'active' : ''}`}
            onClick={() => handleNavClick('source_diff')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('source_diff'))}
          >
            <RefreshCw size={18} className="text-indigo-400" />
            <span>Source Updates</span>
          </div>
        </div>

        {/* Support & Configuration */}
        <div className="nav-category" style={{ marginTop: '12px' }}>
          <div className="nav-title">Support & System</div>

          <div 
            className={`nav-item ${activeView === 'directory' ? 'active' : ''}`}
            onClick={() => { handleNavClick('directory'); if (setDirQuery) setDirQuery(''); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => { handleNavClick('directory'); if (setDirQuery) setDirQuery(''); })}
          >
            <Users size={18} />
            <span>Find Contacts (ROs)</span>
          </div>

          <div 
            className="nav-item"
            onClick={() => window.dispatchEvent(new CustomEvent('open-accessibility-settings'))}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => window.dispatchEvent(new CustomEvent('open-accessibility-settings')))}
          >
            <Settings size={18} />
            <span>Accessibility Settings</span>
          </div>
        </div>
        
        {(activeView === 'authority_library' || activeView === 'reference') && (
          <div style={{ marginTop: '16px', borderTop: '1px solid var(--sidebar-border)', paddingTop: '16px' }}>
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
                  {authorityManifest.statutes.map(sec => (
                    <div 
                      key={sec.id}
                      className={`nav-item sub-item ${selectedSection.type === 'usc' && selectedSection.id === sec.id ? 'active' : ''}`}
                      onClick={() => { setSelectedSection({ type: 'usc', id: sec.id }); setIsSidebarOpen(false); }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => handleKeyDown(e, () => { setSelectedSection({ type: 'usc', id: sec.id }); setIsSidebarOpen(false); })}
                    >
                      § {sec.id.split('-').pop()}: {sec.title}
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
                  {authorityManifest.regulations.map(reg => (
                    <div 
                      key={reg.id}
                      className={`nav-item sub-item ${selectedSection.type === 'cfr' && selectedSection.id === reg.id ? 'active' : ''}`}
                      onClick={() => { setSelectedSection({ type: 'cfr', id: reg.id }); setIsSidebarOpen(false); }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => handleKeyDown(e, () => { setSelectedSection({ type: 'cfr', id: reg.id }); setIsSidebarOpen(false); })}
                    >
                      § {reg.section}: {reg.title}
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
                  {authorityManifest.m28c.map(ch => (
                    <div 
                      key={ch.id}
                      className={`nav-item sub-item ${selectedSection.type === 'm28c' && selectedSection.id === ch.id ? 'active' : ''}`}
                      onClick={() => { setSelectedSection({ type: 'm28c', id: ch.id }); setIsSidebarOpen(false); }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => handleKeyDown(e, () => { setSelectedSection({ type: 'm28c', id: ch.id }); setIsSidebarOpen(false); })}
                    >
                      {ch.citation}: {ch.title}
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
