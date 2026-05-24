import React, { useState, useEffect } from 'react';
import { Search, BookMarked, Settings, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import { US_CODE_SECTIONS, CFR_REGULATIONS, M28C_PARTS } from '../data/data';

function Header({
  activeView,
  setActiveView,
  setSelectedSection,
  bookmarks,
  isDarkMode,
  setIsDarkMode,
  reduceMotion,
  setReduceMotion,
  rates,
  setRates,
  syncStatus,
  DEFAULT_RATES,
  isSettingsOpen,
  setIsSettingsOpen
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [settingsForm, setSettingsForm] = useState(rates);

  // Sync settings form with rates when rates change
  useEffect(() => {
    setSettingsForm(rates);
  }, [rates]);

  // Real-time Search Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = [];

    // Search U.S. Code
    US_CODE_SECTIONS.forEach(sec => {
      const titleMatch = sec.title.toLowerCase().includes(query);
      const textMatch = sec.content.toLowerCase().includes(query);
      if (titleMatch || textMatch) {
        results.push({
          type: 'usc',
          id: sec.id,
          title: sec.title,
          snippet: sec.subtitle,
          category: 'U.S. Code'
        });
      }
    });

    // Search CFR
    CFR_REGULATIONS.forEach(reg => {
      const titleMatch = reg.title.toLowerCase().includes(query);
      const textMatch = reg.content.toLowerCase().includes(query);
      if (titleMatch || textMatch) {
        results.push({
          type: 'cfr',
          id: reg.id,
          title: reg.title,
          snippet: reg.subtitle,
          category: '38 CFR Part 21'
        });
      }
    });

    // Search M28C Parts
    M28C_PARTS.forEach(part => {
      part.chapters.forEach(ch => {
        const titleMatch = ch.title.toLowerCase().includes(query);
        const textMatch = ch.content.toLowerCase().includes(query);
        if (titleMatch || textMatch) {
          results.push({
            type: 'm28c',
            id: ch.id,
            title: ch.title,
            snippet: part.title,
            category: part.title
          });
        }
      });
    });

    setSearchResults(results.slice(0, 10)); // Limit to top 10
  }, [searchQuery]);

  return (
    <>
      <header className="header">
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={18} className="search-input-icon" />
            <input 
              type="text" 
              placeholder="Search U.S. Code, CFR, & M28C guidelines..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
            />
          </div>
          
          {showSearchResults && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map(res => (
                <div 
                  key={res.id} 
                  className="search-result-item"
                  onClick={() => {
                    setSelectedSection({ type: res.type, id: res.id });
                    setActiveView('reference');
                    setShowSearchResults(false);
                    setSearchQuery('');
                  }}
                >
                  <div className="search-result-title">{res.title}</div>
                  <div className="search-result-snippet">{res.snippet}</div>
                </div>
              ))}
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
              setSettingsForm(rates);
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

          {/* Dark/Light mode toggle */}
          <button 
            className="action-btn"
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Reduce Motion toggle */}
          <button 
            className="action-btn"
            onClick={() => setReduceMotion(!reduceMotion)}
            title={reduceMotion ? "Enable Motion Animations" : "Reduce Motion Animations"}
            style={{
              borderColor: reduceMotion ? 'var(--accent-color)' : 'var(--card-border)',
              color: reduceMotion ? 'var(--accent-color)' : 'var(--text-secondary)'
            }}
          >
            {reduceMotion ? <EyeOff size={18} /> : <Eye size={18} />}
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
              
              <div className="settings-section">
                <h3>Chapter 31 Standard Subsistence Rates</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Inst. Full Time (0 / 1 / 2 / Add'l Dep)</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {settingsForm.ch31_institutional_full.map((val, idx) => (
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
                      {settingsForm.ch31_institutional_threeQuarters.map((val, idx) => (
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
                      {settingsForm.ch31_institutional_half.map((val, idx) => (
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
                      {settingsForm.ch31_ojt.map((val, idx) => (
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
                      value={settingsForm.p911_online_rate}
                      onChange={(e) => setSettingsForm({ ...settingsForm, p911_online_rate: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Foreign School MHA Max Rate ($)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={settingsForm.p911_foreign_rate}
                      onChange={(e) => setSettingsForm({ ...settingsForm, p911_foreign_rate: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Private School Tuition Cap ($)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={settingsForm.p911_private_tuition_cap}
                      onChange={(e) => setSettingsForm({ ...settingsForm, p911_private_tuition_cap: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Books & Supplies Cap ($)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={settingsForm.p911_books_cap}
                      onChange={(e) => setSettingsForm({ ...settingsForm, p911_books_cap: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>VR&E Required Laptop Benchmark ($)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={settingsForm.ch31_computer_package_value}
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
                  setSettingsForm(DEFAULT_RATES);
                  setRates(DEFAULT_RATES);
                  localStorage.setItem('m28c_calculator_rates', JSON.stringify(DEFAULT_RATES));
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
                    setRates(settingsForm);
                    localStorage.setItem('m28c_calculator_rates', JSON.stringify(settingsForm));
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
    </>
  );
}

export default Header;
