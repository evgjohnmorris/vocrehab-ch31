import { useState, useEffect } from 'react';
import CustomCursor from './CustomCursor';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BookmarkSidebar from './components/BookmarkSidebar';
import {
  MOBILE_NAV_ITEMS,
  getPageMeta,
  getViewFromHash,
  getViewPath,
  normalizeViewId
} from './config/pageRegistry';

// Views
import HomeDashboardView from './views/HomeDashboardView';
import DisputeHubView from './views/DisputeHubView';
import EntitlementWizardView from './views/EntitlementWizardView';
import CalculatorView from './views/CalculatorView';
import DisabilityHubView from './views/DisabilityHubView';
import FinancialPlannerView from './views/FinancialPlannerView';
import CareerStrategyView from './views/CareerStrategyView';
import SelfEmploymentView from './views/SelfEmploymentView';
import SpecialProgramsView from './views/SpecialProgramsView';
import CounselorDirectoryView from './views/CounselorDirectoryView';
import ResourceCenterView from './views/ResourceCenterView';
import GlossaryView from './views/GlossaryView';
import VaErrorSpotterView from './views/VaErrorSpotterView';
import DocumentGeneratorView from './views/DocumentGeneratorView';
import AuthorityLibraryView from './views/AuthorityLibraryView';
import ClaimArgumentBuilderView from './views/ClaimArgumentBuilderView';
import CoverageReportView from './views/CoverageReportView';
import SourceDiffView from './views/SourceDiffView';
import CaseStatusGuideView from './views/CaseStatusGuideView';
import IndependentLivingBuilderView from './views/IndependentLivingBuilderView';
import SchoolPaymentTrackerView from './views/SchoolPaymentTrackerView';
import FormsCenterView from './views/FormsCenterView';
import CasePacketBuilderView from './views/CasePacketBuilderView';
import TapsModuleView from './views/TapsModuleView';
import WrittenDecisionAnalyzerView from './views/WrittenDecisionAnalyzerView';
import VeteransBenefitsIndexView from './views/VeteransBenefitsIndexView';
import InServiceEducationView from './views/InServiceEducationView';
import FamilyCaregiversView from './views/FamilyCaregiversView';
import GlobalSearchView from './views/GlobalSearchView';
import { backendFetch } from './utils/backendApi';

const DEFAULT_RATES = {
  version: "2026.2",
  lastUpdated: "2026-05-25",
  lastVerified: "2026-05-25",
  ay2025_2026: {
    label: "Post-9/11 AY 2025–2026 / Chapter 31 FY 2026",
    ch31_institutional_full: [812.84, 1008.24, 1188.15, 86.58],
    ch31_institutional_threeQuarters: [610.76, 757.28, 888.32, 66.60],
    ch31_institutional_half: [408.66, 506.32, 595.16, 44.42],
    ch31_ojt: [710.67, 859.43, 990.47, 64.41],
    p911_online_rate: 1169.00,
    p911_foreign_rate: 2338.00,
    p911_private_tuition_cap: 29920.95,
    p911_flight_cap: 17097.67,
    p911_correspondence_cap: 14533.00,
    p911_books_cap: 1000.00,
    ch31_computer_package_value: 2000.00
  },
  ay2026_2027: {
    label: "Post-9/11 AY 2026–2027 / Chapter 31 FY 2026 until FY27 is published",
    ch31_institutional_full: [812.84, 1008.24, 1188.15, 86.58],
    ch31_institutional_threeQuarters: [610.76, 757.28, 888.32, 66.60],
    ch31_institutional_half: [408.66, 506.32, 595.16, 44.42],
    ch31_ojt: [710.67, 859.43, 990.47, 64.41],
    p911_online_rate: 1261.00,
    p911_foreign_rate: 2522.00,
    p911_private_tuition_cap: 30908.34,
    p911_flight_cap: 17661.89,
    p911_correspondence_cap: 15012.59,
    p911_books_cap: 1000.00,
    ch31_computer_package_value: 2000.00
  }
};

function App() {
  const canUseLocalBackend = typeof window !== 'undefined'
    && ['localhost', '127.0.0.1'].includes(window.location.hostname);

  const getInitialView = () => {
    if (typeof window === 'undefined') {
      return 'home';
    }

    const hashView = getViewFromHash(window.location.hash);
    if (hashView && hashView !== 'home') {
      return hashView;
    }

    const queryView = new URLSearchParams(window.location.search).get('view');
    return normalizeViewId(queryView || 'home');
  };

  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('m28c_theme') || 'dark');

  // Navigation State
  const [activeViewState, setActiveViewState] = useState(getInitialView);
  const activeView = normalizeViewId(activeViewState);
  const setActiveView = (view) => setActiveViewState(normalizeViewId(view));
  const [selectedSection, setSelectedSection] = useState({ type: 'usc', id: '38-usc-3100' });

  // Accordion Expand/Collapse State
  const [expandedCategories, setExpandedCategories] = useState({
    usc: true,
    cfr: false,
    m28c: true,
    m28cParts: {} // Part ID to boolean
  });

  // Privacy Mode State (Default to true, store in sessionStorage so it persists across page refreshes in the same tab)
  const [privacyMode, setPrivacyMode] = useState(() => {
    const saved = sessionStorage.getItem('m28c_privacy_mode');
    return saved ? JSON.parse(saved) : true;
  });

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState(() => {
    const isPrivacy = sessionStorage.getItem('m28c_privacy_mode') !== 'false';
    const saved = isPrivacy ? sessionStorage.getItem('m28c_bookmarks') : localStorage.getItem('m28c_bookmarks');
    return saved ? JSON.parse(saved) : [{ type: 'usc', id: '38-usc-3102' }];
  });

  // Rate Year Selection State ('ay2025_2026' | 'ay2026_2027')
  const [selectedRateYear, setSelectedRateYear] = useState(() => {
    const isPrivacy = sessionStorage.getItem('m28c_privacy_mode') !== 'false';
    const saved = isPrivacy ? sessionStorage.getItem('m28c_selected_rate_year') : localStorage.getItem('m28c_selected_rate_year');
    return (saved === 'ay2025' || saved === 'ay2026') ? 'ay2025_2026' : (saved || 'ay2025_2026');
  });

  // Calculator Rates
  const [rates, setRates] = useState(() => {
    const isPrivacy = sessionStorage.getItem('m28c_privacy_mode') !== 'false';
    const saved = isPrivacy ? sessionStorage.getItem('m28c_calculator_rates') : localStorage.getItem('m28c_calculator_rates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.ay2025_2026 && parsed.ay2026_2027) return parsed;
      } catch (e) {
        console.error('Failed to parse saved rates, using defaults', e);
      }
    }
    return DEFAULT_RATES;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState('syncing'); // Starts as 'syncing' to avoid setSyncStatus('syncing') on mount

  // Shared outputs lifted to App
  const [calculatedDisabilityPay, setCalculatedDisabilityPay] = useState(0);
  const [budgetMhaAmount, setBudgetMhaAmount] = useState(0);
  const [combinedRating, setCombinedRating] = useState(0);

  // Global Reduce Motion state
  const [reduceMotion, setReduceMotion] = useState(() => {
    const saved = localStorage.getItem('m28c_reduce_motion');
    return saved ? JSON.parse(saved) : false;
  });

  // Plain-Language Mode State for Legal Jargon
  const [plainLanguageMode, setPlainLanguageMode] = useState(false);

  // User Persona Mode State
  const [userMode, setUserMode] = useState(() => {
    const isPrivacy = sessionStorage.getItem('m28c_privacy_mode') !== 'false';
    const saved = isPrivacy ? sessionStorage.getItem('m28c_user_mode') : localStorage.getItem('m28c_user_mode');
    return saved || 'veteran';
  });

  // Case Stage State
  const [currentCaseStage, setCurrentCaseStage] = useState(() => {
    const isPrivacy = sessionStorage.getItem('m28c_privacy_mode') !== 'false';
    const saved = isPrivacy ? sessionStorage.getItem('m28c_case_stage') : localStorage.getItem('m28c_case_stage');
    return saved || 'not_applied';
  });

  // Accessibility settings state
  const [customCursorEnabled, setCustomCursorEnabled] = useState(() => {
    const saved = localStorage.getItem('m28c_custom_cursor');
    return saved ? JSON.parse(saved) : false;
  });
  const [largeTextMode, setLargeTextMode] = useState(() => {
    const saved = localStorage.getItem('m28c_large_text');
    return saved ? JSON.parse(saved) : false;
  });
  const [highContrastMode, setHighContrastMode] = useState(() => {
    const saved = localStorage.getItem('m28c_high_contrast');
    return saved ? JSON.parse(saved) : false;
  });
  const [dyslexiaSpacing, setDyslexiaSpacing] = useState(() => {
    const saved = localStorage.getItem('m28c_dyslexia_spacing');
    return saved ? JSON.parse(saved) : false;
  });

  // Sidebar Collapsed/Drawer State for mobile viewports
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Backend server online status
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [dataResetToken, setDataResetToken] = useState(0);

  // Ping backend on load and load initial states if connected
  useEffect(() => {
    if (!canUseLocalBackend) {
      console.log('Running in static-host mode. Local backend sync disabled.');
      return;
    }

    const readRemoteState = (key) => (
      backendFetch(`/api/user/${key}`, { privacyMode })
        .then((response) => (response.ok ? response.json() : null))
    );

    const writeRemoteState = (key, value) => (
      backendFetch(`/api/user/${key}`, {
        method: 'POST',
        includeJson: true,
        privacyMode,
        body: JSON.stringify(value)
      })
    );

    backendFetch('/api/status', { privacyMode })
      .then(res => {
        if (!res.ok) throw new Error('Backend not responding');
        return res.json();
      })
      .then(async (data) => {
        if (!data.ready) {
          throw new Error('Backend is online but not seeded.');
        }

        console.log('VRE Backend connected, running in server mode.');
        setIsBackendOnline(true);

        const [serverBookmarks, serverMode, serverStage] = await Promise.all([
          readRemoteState('bookmarks'),
          readRemoteState('user_mode'),
          readRemoteState('case_stage')
        ]);

        if (serverBookmarks && Array.isArray(serverBookmarks)) {
          setBookmarks(serverBookmarks);
        } else {
          writeRemoteState('bookmarks', bookmarks).catch((error) => {
            console.error('Failed to seed bookmarks on server:', error);
          });
        }

        if (serverMode) {
          setUserMode(serverMode);
        } else {
          writeRemoteState('user_mode', userMode).catch((error) => {
            console.error('Failed to seed user mode on server:', error);
          });
        }

        if (serverStage) {
          setCurrentCaseStage(serverStage);
        } else {
          writeRemoteState('case_stage', currentCaseStage).catch((error) => {
            console.error('Failed to seed case stage on server:', error);
          });
        }
      })
      .catch(() => {
        console.log('VRE Backend offline, running in offline fallback mode.');
        setIsBackendOnline(false);
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleHashChange = () => {
      setActiveViewState(getViewFromHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const nextHash = getViewPath(activeView);
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${nextHash}`);
    }
  }, [activeView]);

  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    const pageMeta = getPageMeta(activeView);
    document.title = pageMeta.metaTitle;

    const ensureMetaTag = (selector, attributeName, attributeValue) => {
      let tag = document.head.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attributeName, attributeValue);
        document.head.appendChild(tag);
      }
      return tag;
    };

    ensureMetaTag('meta[name="description"]', 'name', 'description').setAttribute('content', pageMeta.metaDescription);
    ensureMetaTag('meta[name="keywords"]', 'name', 'keywords').setAttribute('content', 'VA, VR&E, Chapter 31, veteran benefits, independent living, appeals, entitlement, subsistence calculator');
    ensureMetaTag('meta[property="og:title"]', 'property', 'og:title').setAttribute('content', pageMeta.metaTitle);
    ensureMetaTag('meta[property="og:description"]', 'property', 'og:description').setAttribute('content', pageMeta.metaDescription);
    ensureMetaTag('meta[property="og:type"]', 'property', 'og:type').setAttribute('content', 'website');
    ensureMetaTag('meta[property="og:url"]', 'property', 'og:url').setAttribute('content', `${window.location.origin}${window.location.pathname}${getViewPath(activeView)}`);
  }, [activeView]);

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all bookmarks, custom rates, accessibility settings, and session case details? This action cannot be undone.")) {
      localStorage.clear();
      sessionStorage.clear();
      setBookmarks([]);
      setRates(DEFAULT_RATES);
      setSelectedRateYear('ay2025_2026');
      setReduceMotion(false);
      setCalculatedDisabilityPay(0);
      setBudgetMhaAmount(0);
      setCombinedRating(0);
      setPrivacyMode(true);
      setUserMode('veteran');
      setCurrentCaseStage('not_applied');
      setCustomCursorEnabled(false);
      setLargeTextMode(false);
      setHighContrastMode(false);
      setDyslexiaSpacing(false);
      setPlainLanguageMode(false);
      setTheme('dark');
      setDataResetToken((currentToken) => currentToken + 1);
      sessionStorage.setItem('m28c_privacy_mode', 'true');
    }
  };

  // Toggle Theme effect
  useEffect(() => {
    const body = document.body;
    body.classList.remove('light-mode', 'rounders-theme');
    if (theme === 'light') {
      body.classList.add('light-mode');
    } else if (theme === 'rounders') {
      body.classList.add('rounders-theme');
    }
    localStorage.setItem('m28c_theme', theme);
  }, [theme]);

  // Sync Privacy Mode transitions
  useEffect(() => {
    sessionStorage.setItem('m28c_privacy_mode', JSON.stringify(privacyMode));
    if (privacyMode) {
      // Migrate from localStorage to sessionStorage, then clean localStorage
      const bm = localStorage.getItem('m28c_bookmarks');
      if (bm) sessionStorage.setItem('m28c_bookmarks', bm);
      const rt = localStorage.getItem('m28c_calculator_rates');
      if (rt) sessionStorage.setItem('m28c_calculator_rates', rt);
      const ry = localStorage.getItem('m28c_selected_rate_year');
      if (ry) sessionStorage.setItem('m28c_selected_rate_year', ry);

      localStorage.removeItem('m28c_bookmarks');
      localStorage.removeItem('m28c_calculator_rates');
      localStorage.removeItem('m28c_selected_rate_year');
    } else {
      // Migrate from sessionStorage to localStorage, then clean sessionStorage
      const bm = sessionStorage.getItem('m28c_bookmarks');
      if (bm) localStorage.setItem('m28c_bookmarks', bm);
      const rt = sessionStorage.getItem('m28c_calculator_rates');
      if (rt) localStorage.setItem('m28c_calculator_rates', rt);
      const ry = sessionStorage.getItem('m28c_selected_rate_year');
      if (ry) localStorage.setItem('m28c_selected_rate_year', ry);

      sessionStorage.removeItem('m28c_bookmarks');
      sessionStorage.removeItem('m28c_calculator_rates');
      sessionStorage.removeItem('m28c_selected_rate_year');
    }
  }, [privacyMode]);

  // Sync Bookmarks
  useEffect(() => {
    if (privacyMode) {
      sessionStorage.setItem('m28c_bookmarks', JSON.stringify(bookmarks));
      localStorage.removeItem('m28c_bookmarks');
    } else {
      localStorage.setItem('m28c_bookmarks', JSON.stringify(bookmarks));
      sessionStorage.removeItem('m28c_bookmarks');
    }

    if (isBackendOnline) {
      backendFetch('/api/user/bookmarks', {
        method: 'POST',
        includeJson: true,
        privacyMode,
        body: JSON.stringify(bookmarks)
      }).catch(err => console.error('Failed to sync bookmarks to server:', err));
    }
  }, [bookmarks, privacyMode, isBackendOnline]);

  // Listen to custom navigation events from LegalStatements
  useEffect(() => {
    const handleNav = (e) => {
      const { type, id } = e.detail;
      setSelectedSection({ type, id });
      setActiveView('authority_library');
    };
    window.addEventListener('navigate-to-authority', handleNav);
    return () => window.removeEventListener('navigate-to-authority', handleNav);
  }, []);

  // Sync Selected Rate Year
  useEffect(() => {
    if (privacyMode) {
      sessionStorage.setItem('m28c_selected_rate_year', selectedRateYear);
      localStorage.removeItem('m28c_selected_rate_year');
    } else {
      localStorage.setItem('m28c_selected_rate_year', selectedRateYear);
      sessionStorage.removeItem('m28c_selected_rate_year');
    }
  }, [selectedRateYear, privacyMode]);

  // Sync Calculator Rates
  useEffect(() => {
    if (privacyMode) {
      sessionStorage.setItem('m28c_calculator_rates', JSON.stringify(rates));
      localStorage.removeItem('m28c_calculator_rates');
    } else {
      localStorage.setItem('m28c_calculator_rates', JSON.stringify(rates));
      sessionStorage.removeItem('m28c_calculator_rates');
    }
  }, [rates, privacyMode]);

  // Sync Reduce Motion to LocalStorage
  useEffect(() => {
    localStorage.setItem('m28c_reduce_motion', JSON.stringify(reduceMotion));
  }, [reduceMotion]);

  // Accessibility Effects
  useEffect(() => {
    document.body.classList.toggle('large-text', largeTextMode);
    localStorage.setItem('m28c_large_text', JSON.stringify(largeTextMode));
  }, [largeTextMode]);

  useEffect(() => {
    document.body.classList.toggle('high-contrast', highContrastMode);
    localStorage.setItem('m28c_high_contrast', JSON.stringify(highContrastMode));
  }, [highContrastMode]);

  useEffect(() => {
    document.body.classList.toggle('dyslexia-spacing', dyslexiaSpacing);
    localStorage.setItem('m28c_dyslexia_spacing', JSON.stringify(dyslexiaSpacing));
  }, [dyslexiaSpacing]);

  useEffect(() => {
    localStorage.setItem('m28c_custom_cursor', JSON.stringify(customCursorEnabled));
  }, [customCursorEnabled]);

  // Sync userMode and currentCaseStage
  useEffect(() => {
    const storage = privacyMode ? sessionStorage : localStorage;
    storage.setItem('m28c_user_mode', userMode);
    
    if (isBackendOnline) {
      backendFetch('/api/user/user_mode', {
        method: 'POST',
        includeJson: true,
        privacyMode,
        body: JSON.stringify(userMode)
      }).catch(err => console.error('Failed to sync user mode to server:', err));
    }
  }, [userMode, privacyMode, isBackendOnline]);

  useEffect(() => {
    const storage = privacyMode ? sessionStorage : localStorage;
    storage.setItem('m28c_case_stage', currentCaseStage);

    if (isBackendOnline) {
      backendFetch('/api/user/case_stage', {
        method: 'POST',
        includeJson: true,
        privacyMode,
        body: JSON.stringify(currentCaseStage)
      }).catch(err => console.error('Failed to sync case stage to server:', err));
    }
  }, [currentCaseStage, privacyMode, isBackendOnline]);

  // Fetch rates.json on load for automatic VA calculator synchronization
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}rates.json`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch remote rates');
        return res.json();
      })
      .then(remoteData => {
        const saved = localStorage.getItem('m28c_calculator_rates');
        const active = saved ? JSON.parse(saved) : DEFAULT_RATES;
        
        // If version, lastUpdated or lastVerified from server is different, update
        if (
          remoteData.version !== active.version ||
          remoteData.lastUpdated !== active.lastUpdated ||
          remoteData.lastVerified !== active.lastVerified
        ) {
          const updatedRates = {
            ...active,
            ...remoteData
          };
          setRates(updatedRates);
          localStorage.setItem('m28c_calculator_rates', JSON.stringify(updatedRates));
          setSyncStatus('success');
        } else {
          setSyncStatus('success');
        }
      })
      .catch(err => {
        console.error('Rate sync failed, using offline defaults:', err);
        setSyncStatus('failed');
      });
  }, []);

  // Dynamic reference content loading removed since it is handled directly in AuthorityLibraryView

  // Collapsible toggle helpers
  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const togglePart = (partId) => {
    setExpandedCategories(prev => ({
      ...prev,
      m28cParts: {
        ...prev.m28cParts,
        [partId]: !prev.m28cParts[partId]
      }
    }));
  };

  // Bookmark Toggle
  const toggleBookmark = (type, id, title) => {
    const exists = bookmarks.some(b => b.id === id && b.type === type);
    if (exists) {
      setBookmarks(prev => prev.filter(b => !(b.id === id && b.type === type)));
    } else {
      setBookmarks(prev => [...prev, { type, id, title }]);
    }
  };

  // Render view dispatcher
  const renderView = () => {
    switch (activeView) {
      case 'home':
        return (
          <HomeDashboardView
            reduceMotion={reduceMotion}
            setActiveView={setActiveView}
            setSelectedSection={setSelectedSection}
            privacyMode={privacyMode}
            bookmarksCount={bookmarks.length}
            userMode={userMode}
            currentCaseStage={currentCaseStage}
            setCurrentCaseStage={setCurrentCaseStage}
            isBackendOnline={isBackendOnline}
            openSettings={() => setIsSettingsOpen(true)}
            onClearAllData={clearAllData}
          />
        );
      case 'dispute_hub':
        return (
          <DisputeHubView
            reduceMotion={reduceMotion}
            userMode={userMode}
            currentCaseStage={currentCaseStage}
            setCurrentCaseStage={setCurrentCaseStage}
          />
        );
      case 'authority_library':
        return (
          <AuthorityLibraryView 
            reduceMotion={reduceMotion}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            setActiveView={setActiveView}
            bookmarks={bookmarks}
            toggleBookmark={toggleBookmark}
            isBackendOnline={isBackendOnline}
          />
        );
      case 'wizard':
        return (
          <EntitlementWizardView 
            reduceMotion={reduceMotion} 
            setSelectedSection={setSelectedSection} 
            setActiveView={setActiveView}
            plainLanguageMode={plainLanguageMode}
            setPlainLanguageMode={setPlainLanguageMode}
          />
        );
      case 'calculator':
        return (
          <CalculatorView
            rates={rates}
            selectedRateYear={selectedRateYear}
            setSelectedRateYear={setSelectedRateYear}
            openSettings={() => setIsSettingsOpen(true)}
            onMhaChange={setBudgetMhaAmount}
            reduceMotion={reduceMotion}
          />
        );
      case 'disability_hub':
        return (
          <DisabilityHubView
            onDisabilityPayChange={setCalculatedDisabilityPay}
            onCombinedRatingChange={setCombinedRating}
            reduceMotion={reduceMotion}
          />
        );
      case 'financial_planner':
        return (
          <FinancialPlannerView
            calculatedDisabilityPay={calculatedDisabilityPay}
            budgetMhaAmount={budgetMhaAmount}
            combinedRating={combinedRating}
            reduceMotion={reduceMotion}
          />
        );
      case 'planning':
        return (
          <CareerStrategyView
            reduceMotion={reduceMotion}
            privacyMode={privacyMode}
            isBackendOnline={isBackendOnline}
            dataResetToken={dataResetToken}
          />
        );
      case 'self_employment':
        return <SelfEmploymentView reduceMotion={reduceMotion} />;
      case 'special_programs':
        return <SpecialProgramsView rates={rates[selectedRateYear] || rates.ay2025_2026} reduceMotion={reduceMotion} />;
      case 'error_spotter':
        return (
          <VaErrorSpotterView 
            reduceMotion={reduceMotion} 
            setActiveView={setActiveView}
            plainLanguageMode={plainLanguageMode}
            setPlainLanguageMode={setPlainLanguageMode}
          />
        );
      case 'document_generator':
        return (
          <DocumentGeneratorView 
            reduceMotion={reduceMotion} 
            plainLanguageMode={plainLanguageMode}
          />
        );
      case 'coverage_report':
        return <CoverageReportView reduceMotion={reduceMotion} />;
      case 'source_diff':
        return <SourceDiffView reduceMotion={reduceMotion} />;
      case 'claim_builder':
        return (
          <ClaimArgumentBuilderView
            reduceMotion={reduceMotion}
            privacyMode={privacyMode}
            isBackendOnline={isBackendOnline}
            dataResetToken={dataResetToken}
          />
        );
      case 'directory':
        return <CounselorDirectoryView reduceMotion={reduceMotion} />;
      case 'resources':
        return <ResourceCenterView reduceMotion={reduceMotion} />;
      case 'glossary':
        return <GlossaryView reduceMotion={reduceMotion} />;
      case 'case_status_guide':
        return <CaseStatusGuideView reduceMotion={reduceMotion} />;
      case 'independent_living_builder':
        return <IndependentLivingBuilderView reduceMotion={reduceMotion} />;
      case 'school_payment_tracker':
        return <SchoolPaymentTrackerView reduceMotion={reduceMotion} />;
      case 'forms_center':
        return <FormsCenterView reduceMotion={reduceMotion} />;
      case 'case_packet_builder':
        return (
          <CasePacketBuilderView 
            reduceMotion={reduceMotion} 
            userMode={userMode} 
            setUserMode={setUserMode} 
          />
        );
      case 'taps':
        return <TapsModuleView reduceMotion={reduceMotion} />;
      case 'in_service_edu':
        return <InServiceEducationView reduceMotion={reduceMotion} />;
      case 'family_caregivers':
        return <FamilyCaregiversView reduceMotion={reduceMotion} />;
      case 'global_search':
        return <GlobalSearchView reduceMotion={reduceMotion} isBackendOnline={isBackendOnline} />;
      case 'written_decision_analyzer':
        return <WrittenDecisionAnalyzerView reduceMotion={reduceMotion} />;
      case 'benefits_index':
        return <VeteransBenefitsIndexView reduceMotion={reduceMotion} />;

      default:
        return (
          <div className="doc-card text-center p-8 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl">
            <h2 className="text-xl font-bold text-slate-100">Welcome to the Chapter 31 Guide</h2>
            <p className="text-slate-400 mt-2 text-sm">Select a module from the sidebar to begin.</p>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">Skip to Main Content</a>
      {customCursorEnabled && <CustomCursor reduceMotion={reduceMotion} />}
      
      {/* SIDEBAR NAVIGATION */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        expandedCategories={expandedCategories}
        toggleCategory={toggleCategory}
        togglePart={togglePart}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* MAIN VIEWPORT LAYOUT */}
      <main className="main-layout" id="main-content" tabIndex="-1">
        {/* HEADER BAR */}
        <Header
          activeView={activeView}
          setActiveView={setActiveView}
          setSelectedSection={setSelectedSection}
          bookmarks={bookmarks}
          theme={theme}
          setTheme={setTheme}
          reduceMotion={reduceMotion}
          setReduceMotion={setReduceMotion}
          rates={rates}
          setRates={setRates}
          selectedRateYear={selectedRateYear}
          setSelectedRateYear={setSelectedRateYear}
          syncStatus={syncStatus}
          DEFAULT_RATES={DEFAULT_RATES}
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          privacyMode={privacyMode}
          setPrivacyMode={setPrivacyMode}
          onClearAllData={clearAllData}
          userMode={userMode}
          setUserMode={setUserMode}
          customCursorEnabled={customCursorEnabled}
          setCustomCursorEnabled={setCustomCursorEnabled}
          largeTextMode={largeTextMode}
          setLargeTextMode={setLargeTextMode}
          highContrastMode={highContrastMode}
          setHighContrastMode={setHighContrastMode}
          dyslexiaSpacing={dyslexiaSpacing}
          setDyslexiaSpacing={setDyslexiaSpacing}
          plainLanguageMode={plainLanguageMode}
          setPlainLanguageMode={setPlainLanguageMode}
          isBackendOnline={isBackendOnline}
        />

        {/* MAIN BODY CONTENT */}
        <div className="app-content">
          <div className="content-pane">
            {renderView()}
          </div>

          {/* RIGHT SIDEBAR (Bookmarks & AI Assistant) */}
          <BookmarkSidebar
            bookmarks={bookmarks}
            setSelectedSection={setSelectedSection}
            setActiveView={setActiveView}
            toggleBookmark={toggleBookmark}
            privacyMode={privacyMode}
            activeView={activeView}
            selectedSection={selectedSection}
            dataResetToken={dataResetToken}
          />
        </div>

        {/* MOBILE BOTTOM NAVIGATION BAR */}
        <nav className="mobile-bottom-nav" aria-label="Mobile Navigation Bar">
          {MOBILE_NAV_ITEMS.map((item) => {
            const { Icon } = item;
            const label = item.mobileLabel || item.label;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                className={`mobile-nav-tab ${isActive ? 'active' : ''}`}
                onClick={() => setActiveView(item.id)}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </main>
    </div>
  );
}

export default App;
