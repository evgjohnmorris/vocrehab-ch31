import { useState, useEffect } from 'react';
import { Search, BookMarked, Settings, Sun, Moon, Eye, Menu, X, Shield, Trash2, HelpCircle } from 'lucide-react';
import DISPUTE_AREAS from '../data/workflows/disputeAreas.json';
import { buildBackendUrl } from '../utils/backendApi';

function Header({
  setActiveView,
  setSelectedSection,
  bookmarks,
  theme,
  setTheme,
  reduceMotion,
  setReduceMotion,
  rates,
  setRates,
  selectedRateYear,
  setSelectedRateYear,
  syncStatus,
  DEFAULT_RATES,
  isSettingsOpen,
  setIsSettingsOpen,
  isSidebarOpen,
  setIsSidebarOpen,
  privacyMode,
  setPrivacyMode,
  onClearAllData,
  userMode,
  setUserMode,
  customCursorEnabled,
  setCustomCursorEnabled,
  largeTextMode,
  setLargeTextMode,
  highContrastMode,
  setHighContrastMode,
  dyslexiaSpacing,
  setDyslexiaSpacing,
  plainLanguageMode,
  setPlainLanguageMode,
  isBackendOnline = false
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  
  // Dynamic search data states
  const [manifest, setManifest] = useState(null);
  const [crosswalk, setCrosswalk] = useState([]);
  const [ecfrDirectory, setEcfrDirectory] = useState(null);
  const [searchFilter, setSearchFilter] = useState('all'); // 'all' | 'usc' | 'cfr' | 'm28c' | 'topic' | 'workflow'

  // Bind settingsForm to the active rates year subset
  const [settingsForm, setSettingsForm] = useState(rates[selectedRateYear] || rates.ay2025_2026);
  const [prevSelectedRateYear, setPrevSelectedRateYear] = useState(selectedRateYear);
  const [prevRates, setPrevRates] = useState(rates);

  // Sync settings form with rates when rates or selected rate year change
  if (selectedRateYear !== prevSelectedRateYear || rates !== prevRates) {
    setPrevSelectedRateYear(selectedRateYear);
    setPrevRates(rates);
    setSettingsForm(rates[selectedRateYear] || rates.ay2025_2026);
  }

  useEffect(() => {
    const handleOpenAccess = () => setIsAccessibilityOpen(true);
    window.addEventListener('open-accessibility-settings', handleOpenAccess);
    return () => window.removeEventListener('open-accessibility-settings', handleOpenAccess);
  }, []);

  // Fetch search metadata from the authority backend
  useEffect(() => {
    const loadSearchMetadata = async () => {
      try {
        const baseUrl = import.meta.env?.BASE_URL || '/';
        const manifestUrl = isBackendOnline ? buildBackendUrl('/api/authority/manifest') : `${baseUrl}authority/index.json`;
        const crosswalkUrl = isBackendOnline ? buildBackendUrl('/api/authority/crosswalk') : `${baseUrl}authority/topic-crosswalk.json`;
        const ecfrDirectoryUrl = `${baseUrl}authority/ecfr-title-directory.json`;

        const manifestRes = await fetch(manifestUrl);
        if (manifestRes.ok) {
          const manifestData = await manifestRes.json();
          setManifest(manifestData);
        }
        const crosswalkRes = await fetch(crosswalkUrl);
        if (crosswalkRes.ok) {
          const crosswalkData = await crosswalkRes.json();
          setCrosswalk(crosswalkData);
        }

        const ecfrDirectoryRes = await fetch(ecfrDirectoryUrl);
        if (ecfrDirectoryRes.ok) {
          const ecfrDirectoryData = await ecfrDirectoryRes.json();
          setEcfrDirectory(ecfrDirectoryData);
        }
      } catch (err) {
        console.error("Failed to load header search metadata:", err);
      }
    };
    loadSearchMetadata();
  }, [isBackendOnline]);

  // Close search results dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Real-time Search Logic calculated synchronously on render
  const searchResults = (() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    // Synonym mapping dictionary to resolve informal queries to formal legal references
    const synonyms = {
      'laptop': ['supplies', 'technology', 'equipment', 'computer', '21.212', 'm28c.v.a.3', 'v-a-3', '21.210'],
      'laptops': ['supplies', 'technology', 'equipment', 'computer', '21.212', 'm28c.v.a.3', 'v-a-3', '21.210'],
      'computer': ['supplies', 'technology', 'equipment', 'computer', '21.212', 'm28c.v.a.3', 'v-a-3', '21.210'],
      'computers': ['supplies', 'technology', 'equipment', 'computer', '21.212', 'm28c.v.a.3', 'v-a-3', '21.210'],
      'case closed': ['discontinued', 'interrupted', 'closure', 'closed', '21.197', '21.198', 'm28c.v.a.1', 'v-a-1'],
      'case closure': ['discontinued', 'interrupted', 'closure', 'closed', '21.197', '21.198', 'm28c.v.a.1', 'v-a-1'],
      'discontinued': ['discontinued', 'interrupted', 'closure', 'closed', '21.197', '21.198', 'm28c.v.a.1', 'v-a-1'],
      'interrupted': ['discontinued', 'interrupted', 'closure', 'closed', '21.197', '21.198', 'm28c.v.a.1', 'v-a-1'],
      'bah': ['mha', 'housing', 'subsistence', 'post-9/11', 'rate', '21.260', 'm28c.v.b.7', 'v-b-7'],
      'mha': ['mha', 'housing', 'subsistence', 'post-9/11', 'rate', '21.260', 'm28c.v.b.7', 'v-b-7'],
      'housing allowance': ['mha', 'housing', 'subsistence', 'post-9/11', 'rate', '21.260', 'm28c.v.b.7', 'v-b-7'],
      'ghosted': ['nonresponse', 'delay', 'counselor', 'respond', 'communication', 'm28c.ii.a.1', 'ii-a-1'],
      'counselor delay': ['nonresponse', 'delay', 'counselor', 'respond', 'communication', 'm28c.ii.a.1', 'ii-a-1'],
      'no response': ['nonresponse', 'delay', 'counselor', 'respond', 'communication', 'm28c.ii.a.1', 'ii-a-1'],
      'graduate school': ['feasibility', "master's", 'degree', 'advanced training', 'post-baccalaureate', '21.72', 'm28c.iv.c.4', 'iv-c-4'],
      'masters': ['feasibility', "master's", 'degree', 'advanced training', 'post-baccalaureate', '21.72', 'm28c.iv.c.4', 'iv-c-4'],
      'phd': ['feasibility', "master's", 'degree', 'advanced training', 'post-baccalaureate', '21.72', 'm28c.iv.c.4', 'iv-c-4'],
      'advanced training': ['feasibility', "master's", 'degree', 'advanced training', 'post-baccalaureate', '21.72', 'm28c.iv.c.4', 'iv-c-4']
    };

    const searchPhrases = [query];
    Object.keys(synonyms).forEach(key => {
      if (query.includes(key)) {
        searchPhrases.push(...synonyms[key]);
      }
    });

    const results = [];

    const isMatch = (text, citation) => {
      const lowerText = (text || '').toLowerCase();
      const lowerCitation = (citation || '').toLowerCase();
      return searchPhrases.some(phrase => lowerText.includes(phrase) || lowerCitation.includes(phrase));
    };

    // 1. Search U.S. Code
    if (searchFilter === 'all' || searchFilter === 'usc') {
      (manifest?.statutes || []).forEach(sec => {
        if (isMatch(sec.title, sec.citation)) {
          results.push({
            type: 'usc',
            id: sec.id,
            title: sec.citation,
            snippet: sec.title,
            category: 'U.S. Code'
          });
        }
      });
    }

    // 2. Search CFR
    if (searchFilter === 'all' || searchFilter === 'cfr') {
      (manifest?.regulations || []).forEach(reg => {
        if (isMatch(reg.title, reg.citation)) {
          results.push({
            type: 'cfr',
            id: reg.id,
            title: reg.citation,
            snippet: reg.title,
            category: '38 CFR Part 21'
          });
        }
      });
    }

    // 3. Search M28C
    if (searchFilter === 'all' || searchFilter === 'm28c') {
      (manifest?.m28c || []).forEach(ch => {
        if (isMatch(ch.title, ch.citation)) {
          results.push({
            type: 'm28c',
            id: ch.id,
            title: ch.citation,
            snippet: ch.title,
            category: 'KnowVA M28C Manual'
          });
        }
      });
    }

    // 4. Search Topics
    if (searchFilter === 'all' || searchFilter === 'topic') {
      (crosswalk || []).forEach(item => {
        const topicText = `${item.name} ${item.plainEnglish} ${item.category}`;
        if (isMatch(topicText, item.topicId)) {
          results.push({
            type: 'topic',
            id: item.topicId,
            title: item.name,
            snippet: item.plainEnglish,
            category: `Topic: ${item.category}`
          });
        }
      });
    }

    // 5. Search Workflows
    if (searchFilter === 'all' || searchFilter === 'workflow') {
      DISPUTE_AREAS.forEach(area => {
        const workflowText = `${area.name} ${area.description} ${area.rebuttalPushback}`;
        if (isMatch(workflowText, area.id)) {
          results.push({
            type: 'workflow',
            id: area.id,
            title: area.name,
            snippet: area.description,
            category: 'Objections & Workflows'
          });
        }
      });
    }

    if (searchFilter === 'all' || searchFilter === 'ecfr') {
      (ecfrDirectory?.titles || []).forEach(title => {
        const titleText = `${title.label} ${title.shortLabel} ${(title.keywords || []).join(' ')}`;
        if (isMatch(titleText, `title ${title.titleNumber}`)) {
          results.push({
            type: 'ecfr-title',
            id: title.id,
            title: title.label,
            snippet: `${title.stats.sections} indexed sections • ${title.stats.parts} parts • structure snapshot ${title.structureDate}`,
            category: 'Related eCFR Title'
          });
        }
      });
    }

    return results.slice(0, 10); // Limit to top 10
  })();

  return (
    <>
      <header className="header">
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle Navigation Sidebar"
          aria-expanded={isSidebarOpen}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={18} className="search-input-icon" />
            <input 
              type="text" 
              placeholder="Search U.S. Code, CFR, M28C, and related eCFR titles..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
            />
          </div>
          
          {showSearchResults && (searchQuery.trim().length > 0) && (
            <div className="search-results-dropdown">
              {/* Search filter tabs */}
              <div 
                style={{
                  display: 'flex',
                  gap: '4px',
                  padding: '8px',
                  borderBottom: '1px solid var(--card-border)',
                  backgroundColor: 'rgba(11, 15, 25, 0.98)',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap'
                }}
                className="scrollbar-none"
              >
                {[
                  { label: 'All', value: 'all' },
                  { label: 'Statutes', value: 'usc' },
                  { label: 'Regulations', value: 'cfr' },
                  { label: 'Manual (M28C)', value: 'm28c' },
                  { label: 'eCFR Titles', value: 'ecfr' },
                  { label: 'Topics', value: 'topic' },
                  { label: 'Workflows', value: 'workflow' }
                ].map(tab => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchFilter(tab.value);
                    }}
                    style={{
                      padding: '4px 8px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      border: '1px solid',
                      borderColor: searchFilter === tab.value ? 'var(--accent-color)' : 'transparent',
                      color: searchFilter === tab.value ? 'var(--accent-color)' : 'var(--text-secondary)',
                      backgroundColor: searchFilter === tab.value ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {searchResults.length > 0 ? (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {searchResults.map(res => (
                    <div 
                      key={`${res.type}-${res.id}`} 
                      className="search-result-item"
                      onClick={() => {
                        if (res.type === 'workflow') {
                          const event = new CustomEvent('change-dispute-area', { detail: res.id });
                          window.dispatchEvent(event);
                          setActiveView('dispute_hub');
                        } else {
                          setSelectedSection({ type: res.type, id: res.id });
                          setActiveView('reference');
                        }
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="search-result-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{res.title}</span>
                        <span style={{ fontSize: '9px', opacity: 0.6, textTransform: 'uppercase', marginLeft: '8px' }}>{res.category}</span>
                      </div>
                      <div className="search-result-snippet">{res.snippet}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  No matches found for "{searchQuery}" under {searchFilter.toUpperCase()} filter.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="header-actions">
          {/* Bookmarks Quick access */}
          <div style={{ position: 'relative' }}>
            <button 
              className="action-btn"
              title="View Bookmarks"
              onClick={() => {
                setActiveView('reference');
                if (bookmarks.length > 0) {
                  setSelectedSection({ type: bookmarks[0].type, id: bookmarks[0].id });
                }
              }}
            >
              <BookMarked size={18} />
            </button>
          </div>

          {/* Rates Sync and Settings button */}
          <button 
            className="action-btn"
            onClick={() => {
              setSettingsForm(rates[selectedRateYear] || rates.ay2025_2026);
              setIsSettingsOpen(true);
            }}
            title="Calculator Rate Settings & VA Sync"
            style={{ position: 'relative' }}
          >
            <Settings size={18} />
            {syncStatus === 'success' && (
              <span 
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--success-color)',
                  border: '2px solid var(--card-bg)'
                }}
                title="VA Rates Synced"
              />
            )}
            {syncStatus === 'failed' && (
              <span 
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--danger-color)',
                  border: '2px solid var(--card-bg)'
                }}
                title="Rate Sync Offline (Using Local Defaults)"
              />
            )}
          </button>

          {/* SQLite Database Connection Indicator */}
          <div 
            className="action-btn select-none"
            title={isBackendOnline ? "SQLite Database Backend: CONNECTED" : "SQLite Database Backend: OFFLINE (Using Static Fallbacks)"}
            style={{
              borderColor: isBackendOnline ? '#10b981' : 'var(--card-border)',
              color: isBackendOnline ? '#10b981' : 'var(--text-muted)',
              backgroundColor: isBackendOnline ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '0 8px',
              fontSize: '10px',
              fontWeight: '700',
              height: '36px',
              borderRadius: '8px'
            }}
          >
            <span 
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isBackendOnline ? '#10b981' : '#64748b'
              }}
            />
            <span>SQL</span>
          </div>

          {/* User Mode Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 h-9">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">Mode</span>
            <select 
              value={userMode} 
              onChange={(e) => setUserMode(e.target.value)} 
              className="bg-transparent text-xs text-slate-200 border-none outline-none font-semibold cursor-pointer pr-1"
              style={{ paddingRight: '12px' }}
              aria-label="Select User Mode Mode"
            >
              <option value="veteran" style={{backgroundColor: '#0b0f19'}}>Veteran</option>
              <option value="advocate" style={{backgroundColor: '#0b0f19'}}>Advocate/VSO</option>
              <option value="school" style={{backgroundColor: '#0b0f19'}}>School/SCO</option>
              <option value="legal" style={{backgroundColor: '#0b0f19'}}>Legal/Attorney</option>
            </select>
          </div>

          {/* Theme cycle toggle */}
          <button 
            className="action-btn"
            onClick={() => {
              if (theme === 'dark') setTheme('light');
              else if (theme === 'light') setTheme('rounders');
              else setTheme('dark');
            }}
            title={`Active Theme: ${theme.toUpperCase()}. Click to cycle (Dark -> Light -> Rounders Cream).`}
            aria-label={`Cycle theme. Current theme is ${theme}`}
          >
            {theme === 'dark' && <Moon size={18} />}
            {theme === 'light' && <Sun size={18} />}
            {theme === 'rounders' && <span style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: '800', color: '#ac5a39', fontSize: '15px' }}>R</span>}
          </button>

          {/* Accessibility Settings toggle */}
          <button 
            className="action-btn"
            onClick={() => setIsAccessibilityOpen(true)}
            title="Accessibility Settings"
            aria-label="Open Accessibility Settings Panel"
            style={{
              borderColor: (largeTextMode || highContrastMode || dyslexiaSpacing || reduceMotion) ? 'var(--accent-color)' : 'var(--card-border)',
              color: (largeTextMode || highContrastMode || dyslexiaSpacing || reduceMotion) ? 'var(--accent-color)' : 'var(--text-secondary)'
            }}
          >
            <Eye size={18} />
          </button>

          {/* Privacy Mode Toggle */}
          <button 
            className="action-btn"
            onClick={() => setPrivacyMode(!privacyMode)}
            title={privacyMode ? "Privacy Mode: ACTIVE (Session-only, memory storage)" : "Privacy Mode: INACTIVE (Saved in browser)"}
            style={{
              borderColor: privacyMode ? '#10b981' : 'var(--card-border)',
              color: privacyMode ? '#10b981' : 'var(--text-secondary)',
              backgroundColor: privacyMode ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
            }}
          >
            <Shield size={18} />
          </button>

          {/* Clear all local data */}
          <button 
            className="action-btn"
            onClick={onClearAllData}
            title="Clear All Case & Rate Data"
            style={{
              borderColor: 'var(--card-border)',
              color: '#ef4444'
            }}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      {/* RATE SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Calculator Rate Settings</h2>
              <button className="close-btn" onClick={() => setIsSettingsOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Manage allowance rates manually to align with the latest VA updates. Changes save to your browser's local storage.
              </p>

              <div className="form-group" style={{ marginBottom: '24px', borderBottom: '1px solid var(--card-border)', paddingBottom: '16px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-color)' }}>Select Target Academic Year to Edit</label>
                <select 
                  className="form-control"
                  style={{ marginTop: '6px' }}
                  value={selectedRateYear}
                  onChange={(e) => setSelectedRateYear(e.target.value)}
                >
                  <option value="ay2025_2026">Post-9/11 AY 2025–2026 / Chapter 31 FY 2026</option>
                  <option value="ay2026_2027">Post-9/11 AY 2026–2027 / Chapter 31 FY 2026 (until FY27 is published)</option>
                </select>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                  Post-9/11 rates update on August 1st. Chapter 31 subsistence rates update on October 1st.
                </span>
              </div>
              
              <div className="settings-section">
                <h3>Chapter 31 Standard Subsistence Rates</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Inst. Full Time (0 / 1 / 2 / Add'l Dep)</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {settingsForm.ch31_institutional_full && settingsForm.ch31_institutional_full.map((val, idx) => (
                        <input 
                          key={idx}
                          type="number" 
                          className="form-control"
                          style={{ padding: '6px' }}
                          value={val}
                          onChange={(e) => {
                            const newArr = [...settingsForm.ch31_institutional_full];
                            newArr[idx] = Number(e.target.value);
                            setSettingsForm({ ...settingsForm, ch31_institutional_full: newArr });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Inst. 3/4 Time (0 / 1 / 2 / Add'l Dep)</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {settingsForm.ch31_institutional_threeQuarters && settingsForm.ch31_institutional_threeQuarters.map((val, idx) => (
                        <input 
                          key={idx}
                          type="number" 
                          className="form-control"
                          style={{ padding: '6px' }}
                          value={val}
                          onChange={(e) => {
                            const newArr = [...settingsForm.ch31_institutional_threeQuarters];
                            newArr[idx] = Number(e.target.value);
                            setSettingsForm({ ...settingsForm, ch31_institutional_threeQuarters: newArr });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Inst. 1/2 Time (0 / 1 / 2 / Add'l Dep)</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {settingsForm.ch31_institutional_half && settingsForm.ch31_institutional_half.map((val, idx) => (
                        <input 
                          key={idx}
                          type="number" 
                          className="form-control"
                          style={{ padding: '6px' }}
                          value={val}
                          onChange={(e) => {
                            const newArr = [...settingsForm.ch31_institutional_half];
                            newArr[idx] = Number(e.target.value);
                            setSettingsForm({ ...settingsForm, ch31_institutional_half: newArr });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Apprentice/OJT (0 / 1 / 2 / Add'l Dep)</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {settingsForm.ch31_ojt && settingsForm.ch31_ojt.map((val, idx) => (
                        <input 
                          key={idx}
                          type="number" 
                          className="form-control"
                          style={{ padding: '6px' }}
                          value={val}
                          onChange={(e) => {
                            const newArr = [...settingsForm.ch31_ojt];
                            newArr[idx] = Number(e.target.value);
                            setSettingsForm({ ...settingsForm, ch31_ojt: newArr });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section" style={{ marginTop: '20px' }}>
                <h3>Post-9/11 GI Bill & Tuition Caps</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Online-Only MHA Max Rate ($)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={settingsForm.p911_online_rate || 0}
                      onChange={(e) => setSettingsForm({ ...settingsForm, p911_online_rate: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Foreign School MHA Max Rate ($)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={settingsForm.p911_foreign_rate || 0}
                      onChange={(e) => setSettingsForm({ ...settingsForm, p911_foreign_rate: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Private School Tuition Cap ($)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={settingsForm.p911_private_tuition_cap || 0}
                      onChange={(e) => setSettingsForm({ ...settingsForm, p911_private_tuition_cap: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Books & Supplies Cap ($)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={settingsForm.p911_books_cap || 0}
                      onChange={(e) => setSettingsForm({ ...settingsForm, p911_books_cap: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    {/* @cite 38-cfr-21-212 */}
                    <label>VR&E Required Laptop Benchmark ($)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={settingsForm.ch31_computer_package_value || 0}
                      onChange={(e) => setSettingsForm({ ...settingsForm, ch31_computer_package_value: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button 
                className="btn" 
                style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-primary)' }}
                onClick={() => {
                  const resetRates = {
                    ...rates,
                    [selectedRateYear]: DEFAULT_RATES[selectedRateYear]
                  };
                  setRates(resetRates);
                  localStorage.setItem('m28c_calculator_rates', JSON.stringify(resetRates));
                  setSettingsForm(DEFAULT_RATES[selectedRateYear]);
                  setIsSettingsOpen(false);
                }}
              >
                Reset to Default
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn" style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-primary)' }} onClick={() => setIsSettingsOpen(false)}>Cancel</button>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    const updatedRates = {
                      ...rates,
                      [selectedRateYear]: settingsForm
                    };
                    setRates(updatedRates);
                    localStorage.setItem('m28c_calculator_rates', JSON.stringify(updatedRates));
                    setIsSettingsOpen(false);
                  }}
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAccessibilityOpen && (
        <div className="modal-overlay" onClick={() => setIsAccessibilityOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Accessibility & Display Settings</h2>
              <button className="close-btn" onClick={() => setIsAccessibilityOpen(false)} aria-label="Close accessibility options">×</button>
            </div>
            <div className="modal-body space-y-4">
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Tailor the portal display to accommodate visual, physical, and cognitive preferences.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 hover:bg-slate-900/60 rounded">
                  <label htmlFor="accessibility-theme" className="text-xs font-semibold text-slate-200">Active Theme Color Palette</label>
                  <select
                    id="accessibility-theme"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="bg-slate-950 text-xs text-slate-200 border border-slate-800 rounded p-1 font-semibold cursor-pointer outline-none"
                    style={{ backgroundColor: '#0b0f19' }}
                  >
                    <option value="dark">Charcoal Dark Mode</option>
                    <option value="light">Steel Light Mode</option>
                    <option value="rounders">Rounders Magazine Cream</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-2 hover:bg-slate-900/60 rounded">
                  <label htmlFor="accessibility-plain" className="text-xs font-semibold text-slate-200">Plain Language Mode (Translate Jargon)</label>
                  <input
                    id="accessibility-plain"
                    type="checkbox"
                    checked={plainLanguageMode}
                    onChange={(e) => setPlainLanguageMode(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-2 hover:bg-slate-900/60 rounded">
                  <label htmlFor="accessibility-large" className="text-xs font-semibold text-slate-200">Large Text Mode (115% Zoom)</label>
                  <input
                    id="accessibility-large"
                    type="checkbox"
                    checked={largeTextMode}
                    onChange={(e) => setLargeTextMode(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-2 hover:bg-slate-900/60 rounded">
                  <label htmlFor="accessibility-contrast" className="text-xs font-semibold text-slate-200">High Contrast Mode</label>
                  <input
                    id="accessibility-contrast"
                    type="checkbox"
                    checked={highContrastMode}
                    onChange={(e) => setHighContrastMode(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-2 hover:bg-slate-900/60 rounded">
                  <label htmlFor="accessibility-motion" className="text-xs font-semibold text-slate-200">Reduce Motion (Hide Animations)</label>
                  <input
                    id="accessibility-motion"
                    type="checkbox"
                    checked={reduceMotion}
                    onChange={(e) => setReduceMotion(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-2 hover:bg-slate-900/60 rounded">
                  <label htmlFor="accessibility-spacing" className="text-xs font-semibold text-slate-200">Dyslexia-Friendly Spacing</label>
                  <input
                    id="accessibility-spacing"
                    type="checkbox"
                    checked={dyslexiaSpacing}
                    onChange={(e) => setDyslexiaSpacing(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-2 hover:bg-slate-900/60 rounded">
                  <label htmlFor="accessibility-cursor" className="text-xs font-semibold text-slate-200">Enable Custom Cursor (Opt-In)</label>
                  <input
                    id="accessibility-cursor"
                    type="checkbox"
                    checked={customCursorEnabled}
                    onChange={(e) => setCustomCursorEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                  />
                </div>
              </div>

              <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl mt-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-blue-400" />
                  <span>Keyboard Navigation Shortcuts</span>
                </h4>
                <ul className="text-[10px] text-slate-450 space-y-1 list-disc pl-4 leading-relaxed">
                  <li>Use <kbd className="bg-slate-900 px-1 border border-slate-850 rounded">Tab</kbd> to focus interactive elements and <kbd className="bg-slate-900 px-1 border border-slate-850 rounded">Enter</kbd> or <kbd className="bg-slate-900 px-1 border border-slate-850 rounded">Space</kbd> to select.</li>
                  <li>Click <a href="#main-content" className="text-blue-400 underline">Skip to Main Content</a> at any time to bypass sidebar navigation.</li>
                  <li>All modal dialogs can be closed by pressing the escape key or clicking the overlay.</li>
                </ul>
              </div>
            </div>
            <div className="modal-footer flex justify-end gap-2">
              <button className="btn btn-primary" onClick={() => setIsAccessibilityOpen(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
