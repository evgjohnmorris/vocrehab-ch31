import { 
  ShieldCheck, Award, Calculator, Scale, 
  Compass, Briefcase, GraduationCap, Users, 
  FileText, FileEdit, Search, HeartHandshake, BookOpen,
  Gavel, CheckCircle2, RefreshCw, Home, Shield, Settings, Activity, Map, ShieldAlert, Target
} from 'lucide-react';

function Sidebar({ 
  activeView, 
  setActiveView, 
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
          <h1 style={{ fontSize: '0.82rem', lineHeight: '1.2' }}>Military & Veteran UI</h1>
          <p style={{ fontSize: '0.6rem', letterSpacing: '0' }}>Unified Resource Interface</p>
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
            <span>Dashboard Home</span>
          </div>
        </div>

        {/* Global Search */}
        <div className="nav-category" style={{ marginTop: '12px' }}>
          <div 
            className={`nav-item ${activeView === 'global_search' ? 'active' : ''}`}
            onClick={() => handleNavClick('global_search')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('global_search'))}
            style={{ fontWeight: 'bold' }}
          >
            <Search size={18} className="text-sky-400" />
            <span>Global Search</span>
          </div>
        </div>

        {/* In-Service & Transition */}
        <div className="nav-category" style={{ marginTop: '12px' }}>
          <div className="nav-title">In-Service & Transition</div>
          
          <div 
            className={`nav-item ${activeView === 'in_service_edu' ? 'active' : ''}`}
            onClick={() => handleNavClick('in_service_edu')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('in_service_edu'))}
          >
            <GraduationCap size={18} className="text-amber-500" />
            <span>In-Service Career & Edu</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'taps' ? 'active' : ''}`}
            onClick={() => handleNavClick('taps')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('taps'))}
          >
            <Map size={18} className="text-amber-500" />
            <span>Transition (TAP) Guide</span>
          </div>
        </div>

        {/* Veteran Benefits (Chapter 31) */}
        <div className="nav-category" style={{ marginTop: '12px' }}>
          <div className="nav-title">Veteran Chapter 31 VR&E</div>

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
            className={`nav-item ${activeView === 'planning' ? 'active' : ''}`}
            onClick={() => handleNavClick('planning')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('planning'))}
          >
            <Target size={18} />
            <span>Career Strategy & O*NET</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'independent_living_builder' ? 'active' : ''}`}
            onClick={() => handleNavClick('independent_living_builder')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('independent_living_builder'))}
          >
            <Shield size={18} />
            <span>Independent Living Builder</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'case_status_guide' ? 'active' : ''}`}
            onClick={() => handleNavClick('case_status_guide')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('case_status_guide'))}
          >
            <Activity size={18} />
            <span>Case Status Guide</span>
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
            className={`nav-item ${activeView === 'dispute_hub' ? 'active' : ''}`}
            onClick={() => handleNavClick('dispute_hub')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('dispute_hub'))}
          >
            <Scale size={18} />
            <span>Appeals & Disputes Hub</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'written_decision_analyzer' ? 'active' : ''}`}
            onClick={() => handleNavClick('written_decision_analyzer')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('written_decision_analyzer'))}
          >
            <ShieldAlert size={18} className="text-red-400" />
            <span>Written Decision Analyzer</span>
          </div>
        </div>

        {/* Family & Caregiver Support */}
        <div className="nav-category" style={{ marginTop: '12px' }}>
          <div className="nav-title">Family & Caregiver</div>
          
          <div 
            className={`nav-item ${activeView === 'family_caregivers' ? 'active' : ''}`}
            onClick={() => handleNavClick('family_caregivers')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('family_caregivers'))}
          >
            <HeartHandshake size={18} className="text-indigo-400" />
            <span>Family & Caregiver Support</span>
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
            className={`nav-item ${activeView === 'case_packet_builder' ? 'active' : ''}`}
            onClick={() => handleNavClick('case_packet_builder')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('case_packet_builder'))}
          >
            <FileText size={18} />
            <span>Case Packet Builder</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'forms_center' ? 'active' : ''}`}
            onClick={() => handleNavClick('forms_center')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('forms_center'))}
          >
            <FileEdit size={18} />
            <span>Forms & Packets Center</span>
          </div>

          <div 
            className={`nav-item ${activeView === 'school_payment_tracker' ? 'active' : ''}`}
            onClick={() => handleNavClick('school_payment_tracker')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('school_payment_tracker'))}
          >
            <GraduationCap size={18} />
            <span>School Payment Tracker</span>
          </div>
        </div>

        {/* Research Authority */}
        <div className="nav-category" style={{ marginTop: '12px' }}>
          <div className="nav-title">Research Authority</div>
          
          <div 
            className={`nav-item ${activeView === 'benefits_index' ? 'active' : ''}`}
            onClick={() => handleNavClick('benefits_index')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('benefits_index'))}
          >
            <Compass size={18} />
            <span>Benefits & Rights Index</span>
          </div>

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
            className={`nav-item ${activeView === 'resources' ? 'active' : ''}`}
            onClick={() => handleNavClick('resources')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, () => handleNavClick('resources'))}
          >
            <BookOpen size={18} className="text-sky-400" />
            <span>Resource Center</span>
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
      </div>
    </aside>
  );
}

export default Sidebar;
