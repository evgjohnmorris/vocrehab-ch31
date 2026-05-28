import {
  ShieldCheck
} from 'lucide-react';
import { getSidebarSections, normalizeViewId } from '../config/pageRegistry';

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

  const openAccessibilitySettings = () => {
    closeSidebar();
    window.dispatchEvent(new CustomEvent('open-accessibility-settings'));
  };

  const navSections = getSidebarSections();

  const runViewSideEffects = (view) => {
    if (view === 'wizard' && setWizardResult) {
      setWizardResult(null);
    }

    if (view === 'self_employment' && setSelfGeneratedLetter) {
      setSelfGeneratedLetter('');
    }

    if (view === 'directory' && setDirQuery) {
      setDirQuery('');
    }
  };

  const renderNavItem = ({ Icon, iconClassName, label, actionKey, id, priority }) => {
    const isActive = !actionKey && normalizeViewId(activeView) === id;
    const className = ['nav-item', priority ? 'priority' : '', isActive ? 'active' : '']
      .filter(Boolean)
      .join(' ');
    const handleSelect = () => {
      if (actionKey === 'open-accessibility-settings') {
        openAccessibilitySettings();
        return;
      }

      runViewSideEffects(id);
      handleNavClick(id);
    };

    return (
      <button
        type="button"
        key={id}
        className={className}
        onClick={handleSelect}
        aria-pressed={isActive}
        title={label}
      >
        <Icon size={18} className={iconClassName} />
        <span className="nav-item-label">{label}</span>
      </button>
    );
  };

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'mobile-open' : ''}`} aria-label="Main Navigation">
      <div className="branding">
        <div className="branding-logo">
          <ShieldCheck size={22} />
        </div>
        <div className="branding-text">
          <span className="sidebar-badge">Authority + Casework</span>
          <h1>VR&amp;E Strategy Desk</h1>
          <p>Chapter 31 Operations</p>
        </div>
      </div>

      <nav className="nav-section" aria-label="Primary workspace sections">
        {navSections.map((section) => (
          <div key={section.title} className="nav-category">
            <div className="nav-title">{section.title}</div>
            {section.items.map(renderNavItem)}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
