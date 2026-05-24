import React, { useState, useEffect } from 'react';
import { US_CODE_SECTIONS, CFR_REGULATIONS, M28C_PARTS } from './data/data';
import CustomCursor from './CustomCursor';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BookmarkSidebar from './components/BookmarkSidebar';

// Views
import ReferenceLibraryView from './views/ReferenceLibraryView';
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

const DEFAULT_RATES = {
  version: "2026.1",
  ch31_institutional_full: [861.10, 1067.81, 1258.13, 91.85],
  ch31_institutional_threeQuarters: [646.71, 801.49, 943.40, 68.77],
  ch31_institutional_half: [432.31, 534.86, 629.57, 45.92],
  ch31_ojt: [710.67, 859.43, 990.47, 64.41],
  p911_online_rate: 1169.00,
  p911_foreign_rate: 2338.00,
  p911_private_tuition_cap: 29920.95,
  p911_flight_cap: 15497.13,
  p911_correspondence_cap: 13535.11,
  p911_books_cap: 1000.00,
  ch31_computer_package_value: 2000.00
};

function App() {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Navigation State
  const [activeView, setActiveView] = useState('reference'); // 'reference' | 'wizard' | 'calculator' ...
  const [selectedSection, setSelectedSection] = useState({ type: 'usc', id: '3100' });
  
  // Accordion Expand/Collapse State
  const [expandedCategories, setExpandedCategories] = useState({
    usc: true,
    cfr: false,
    m28c: true,
    m28cParts: {} // Part ID to boolean
  });

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem('m28c_bookmarks');
    return saved ? JSON.parse(saved) : [{ type: 'usc', id: '3102' }];
  });

  // Calculator Rates
  const [rates, setRates] = useState(() => {
    const saved = localStorage.getItem('m28c_calculator_rates');
    return saved ? JSON.parse(saved) : DEFAULT_RATES;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'success' | 'failed'

  // Shared outputs lifted to App
  const [calculatedDisabilityPay, setCalculatedDisabilityPay] = useState(0);
  const [budgetMhaAmount, setBudgetMhaAmount] = useState(0);
  const [combinedRating, setCombinedRating] = useState(0);

  // Global Reduce Motion state
  const [reduceMotion, setReduceMotion] = useState(() => {
    const saved = localStorage.getItem('m28c_reduce_motion');
    return saved ? JSON.parse(saved) : false;
  });

  // Toggle Theme effect
  useEffect(() => {
    const body = document.body;
    if (isDarkMode) {
      body.classList.remove('light-mode');
    } else {
      body.classList.add('light-mode');
    }
  }, [isDarkMode]);

  // Sync Bookmarks to LocalStorage
  useEffect(() => {
    localStorage.setItem('m28c_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Sync Reduce Motion to LocalStorage
  useEffect(() => {
    localStorage.setItem('m28c_reduce_motion', JSON.stringify(reduceMotion));
  }, [reduceMotion]);

  // Fetch rates.json on load for automatic VA calculator synchronization
  useEffect(() => {
    setSyncStatus('syncing');
    fetch('/rates.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch remote rates');
        return res.json();
      })
      .then(remoteData => {
        const saved = localStorage.getItem('m28c_calculator_rates');
        const active = saved ? JSON.parse(saved) : DEFAULT_RATES;
        
        // If version from server is different, update
        if (remoteData.version !== active.version) {
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

  // Find Selected Content Object for Reference Library
  const getSelectedContent = () => {
    if (selectedSection.type === 'usc') {
      return US_CODE_SECTIONS.find(sec => sec.id === selectedSection.id);
    } else if (selectedSection.type === 'cfr') {
      return CFR_REGULATIONS.find(reg => reg.id === selectedSection.id);
    } else {
      for (const part of M28C_PARTS) {
        const chapter = part.chapters.find(ch => ch.id === selectedSection.id);
        if (chapter) {
          return {
            ...chapter,
            subtitle: part.title,
            category: 'M28C Manual',
            tag: part.tag
          };
        }
      }
    }
    return null;
  };

  const activeContent = getSelectedContent();

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
      case 'reference':
        return (
          <ReferenceLibraryView
            activeContent={activeContent}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            bookmarks={bookmarks}
            toggleBookmark={toggleBookmark}
            reduceMotion={reduceMotion}
          />
        );
      case 'wizard':
        return <EntitlementWizardView reduceMotion={reduceMotion} />;
      case 'calculator':
        return (
          <CalculatorView
            rates={rates}
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
        return <CareerStrategyView reduceMotion={reduceMotion} />;
      case 'self_employment':
        return <SelfEmploymentView reduceMotion={reduceMotion} />;
      case 'special_programs':
        return <SpecialProgramsView rates={rates} reduceMotion={reduceMotion} />;
      case 'directory':
        return <CounselorDirectoryView reduceMotion={reduceMotion} />;
      case 'resources':
        return <ResourceCenterView reduceMotion={reduceMotion} />;
      case 'glossary':
        return <GlossaryView reduceMotion={reduceMotion} />;
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
      <CustomCursor reduceMotion={reduceMotion} />
      
      {/* SIDEBAR NAVIGATION */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        expandedCategories={expandedCategories}
        toggleCategory={toggleCategory}
        togglePart={togglePart}
      />

      {/* MAIN VIEWPORT LAYOUT */}
      <main className="main-layout">
        {/* HEADER BAR */}
        <Header
          activeView={activeView}
          setActiveView={setActiveView}
          setSelectedSection={setSelectedSection}
          bookmarks={bookmarks}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          reduceMotion={reduceMotion}
          setReduceMotion={setReduceMotion}
          rates={rates}
          setRates={setRates}
          syncStatus={syncStatus}
          DEFAULT_RATES={DEFAULT_RATES}
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
        />

        {/* MAIN BODY CONTENT */}
        <div className="app-content">
          <div className="content-pane">
            {renderView()}
          </div>

          {/* RIGHT SIDEBAR (Bookmarks & Quick References) */}
          <BookmarkSidebar
            bookmarks={bookmarks}
            setSelectedSection={setSelectedSection}
            setActiveView={setActiveView}
            toggleBookmark={toggleBookmark}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
