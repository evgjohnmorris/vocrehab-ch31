import {
  Activity,
  Award,
  BookOpen,
  Briefcase,
  Calculator,
  CheckCircle2,
  Compass,
  FileEdit,
  FileText,
  Gavel,
  GraduationCap,
  HeartHandshake,
  Home,
  Map,
  RefreshCw,
  Scale,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Target,
  Users
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
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleNavClick = (view) => {
    setActiveView(view);
    closeSidebar();
  };

  const handleKeyDown = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  const openAccessibilitySettings = () => {
    closeSidebar();
    window.dispatchEvent(new CustomEvent('open-accessibility-settings'));
  };

  const navSections = [
    {
      title: 'Quick Start',
      items: [
        { view: 'home', label: 'Dashboard', Icon: Home, priority: true },
        { view: 'global_search', label: 'Search', Icon: Search, priority: true, iconClassName: 'text-sky-400' }
      ]
    },
    {
      title: 'Casework',
      items: [
        {
          view: 'wizard',
          label: 'Entitlement',
          Icon: Award,
          onSelect: () => {
            handleNavClick('wizard');
            if (setWizardResult) {
              setWizardResult(null);
            }
          }
        },
        { view: 'claim_builder', label: 'Plan Builder', Icon: Compass },
        { view: 'planning', label: 'Career Strategy', Icon: Target },
        { view: 'dispute_hub', label: 'Appeals Hub', Icon: Scale },
        { view: 'written_decision_analyzer', label: 'Decision Analyzer', Icon: ShieldAlert, iconClassName: 'text-red-400' },
        { view: 'case_packet_builder', label: 'Case Packet', Icon: FileText },
        { view: 'school_payment_tracker', label: 'School Payments', Icon: GraduationCap },
        { view: 'calculator', label: 'Payments', Icon: Calculator }
      ]
    },
    {
      title: 'Special Tracks',
      items: [
        { view: 'independent_living_builder', label: 'Independent Living', Icon: Shield },
        {
          view: 'self_employment',
          label: 'Self-Employment',
          Icon: Briefcase,
          onSelect: () => {
            handleNavClick('self_employment');
            if (setSelfGeneratedLetter) {
              setSelfGeneratedLetter('');
            }
          }
        },
        { view: 'family_caregivers', label: 'Family Support', Icon: HeartHandshake, iconClassName: 'text-indigo-400' },
        { view: 'case_status_guide', label: 'Case Status', Icon: Activity }
      ]
    },
    {
      title: 'Reference',
      items: [
        { view: 'authority_library', activeViews: ['authority_library', 'reference'], label: 'Authority Library', Icon: Gavel },
        { view: 'benefits_index', label: 'Benefits Index', Icon: Compass },
        { view: 'forms_center', label: 'Forms Center', Icon: FileEdit },
        { view: 'resources', label: 'Resources', Icon: BookOpen, iconClassName: 'text-sky-400' }
      ]
    },
    {
      title: 'Transition',
      items: [
        { view: 'in_service_edu', label: 'In-Service Education', Icon: GraduationCap, iconClassName: 'text-amber-500' },
        { view: 'taps', label: 'TAP Guide', Icon: Map, iconClassName: 'text-amber-500' }
      ]
    },
    {
      title: 'Support',
      items: [
        { view: 'coverage_report', label: 'Coverage Report', Icon: CheckCircle2, iconClassName: 'text-emerald-400' },
        { view: 'source_diff', label: 'Source Updates', Icon: RefreshCw, iconClassName: 'text-indigo-400' },
        {
          view: 'directory',
          label: 'Contacts',
          Icon: Users,
          onSelect: () => {
            handleNavClick('directory');
            if (setDirQuery) {
              setDirQuery('');
            }
          }
        },
        { label: 'Accessibility', Icon: Settings, onSelect: openAccessibilitySettings }
      ]
    }
  ];

  const renderNavItem = ({ Icon, activeViews, iconClassName, label, onSelect, priority, view }) => {
    const isActive = Boolean(activeViews?.includes(activeView) || view === activeView);
    const className = ['nav-item', priority ? 'priority' : '', isActive ? 'active' : '']
      .filter(Boolean)
      .join(' ');
    const handleSelect = onSelect ?? (() => handleNavClick(view));

    return (
      <div
        key={view ?? label}
        className={className}
        onClick={handleSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => handleKeyDown(event, handleSelect)}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon size={18} className={iconClassName} />
        <span className="nav-item-label">{label}</span>
      </div>
    );
  };

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'mobile-open' : ''}`} aria-label="Main Navigation">
      <div className="branding">
        <div className="branding-logo">
          <ShieldCheck size={22} />
        </div>
        <div className="branding-text">
          <h1>Chapter 31 Navigator</h1>
          <p>Casework Workspace</p>
        </div>
      </div>

      <div className="nav-section">
        {navSections.map((section) => (
          <div key={section.title} className="nav-category">
            <div className="nav-title">{section.title}</div>
            {section.items.map(renderNavItem)}
          </div>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
