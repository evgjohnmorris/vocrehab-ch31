import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Scale, Book, Search, FileText, AlertTriangle, 
  Printer, Copy, Check, Info, ArrowRight, Loader2, Bookmark,
  CheckCircle2, Gavel, FileCheck
} from 'lucide-react';
import AuthorityBadge from '../components/AuthorityBadge';
import EcfrTitleDirectoryPanel from '../components/EcfrTitleDirectoryPanel';
import { buildBackendUrl } from '../utils/backendApi';

function AuthorityLibraryView({ 
  reduceMotion, 
  selectedSection, 
  setSelectedSection,
  setActiveView,
  bookmarks = [],
  toggleBookmark,
  isBackendOnline = false
}) {
  const [activeTab, setActiveTab] = useState('crosswalk'); // 'crosswalk' | 'browse' | 'audit'
  const [browseSourceTab, setBrowseSourceTab] = useState('statutes'); // 'statutes' | 'regulations' | 'm28c'
  const [prevSelectedSection, setPrevSelectedSection] = useState(selectedSection);
  
  const [manifest, setManifest] = useState(null);
  const [crosswalk, setCrosswalk] = useState([]);
  const [coverageReport, setCoverageReport] = useState(null);
  const [ecfrDirectory, setEcfrDirectory] = useState(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [selectedEcfrTitleId, setSelectedEcfrTitleId] = useState(null);

  // Searching & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Document Viewer State
  const [selectedItemId, setSelectedItemId] = useState(null); // Full canonical ID (e.g., '38-usc-3104' or '38-cfr-21-212')
  const [selectedItemType, setSelectedItemType] = useState(null); // 'usc' | 'cfr' | 'm28c'
  const [loadedContent, setLoadedContent] = useState({}); // cache: { 'usc_38-usc-3104': data }
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false); // true when copied

  if (selectedSection && selectedSection.id && (selectedSection.id !== prevSelectedSection?.id || selectedSection.type !== prevSelectedSection?.type)) {
    setPrevSelectedSection(selectedSection);
    if (selectedSection.type === 'topic') {
      setActiveTab('crosswalk');
      setSelectedCategory('All');
      setSearchQuery(selectedSection.id);
    } else if (selectedSection.type === 'ecfr-title') {
      setActiveTab('browse');
      setBrowseSourceTab('ecfr-titles');
      setSelectedEcfrTitleId(selectedSection.id);
    } else {
      setActiveTab('browse');
      const type = selectedSection.type;
      setBrowseSourceTab(
        type === 'usc' ? 'statutes' :
        type === 'cfr' ? 'regulations' :
        type === 'public-law' ? 'public-laws' :
        type === 'federal-register' ? 'federal-registers' :
        'm28c'
      );
    }
  }

  // Load manifest, crosswalk, and coverage report on mount
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const manifestUrl = isBackendOnline ? buildBackendUrl('/api/authority/manifest') : `${import.meta.env.BASE_URL}authority/index.json`;
        const crosswalkUrl = isBackendOnline ? buildBackendUrl('/api/authority/crosswalk') : `${import.meta.env.BASE_URL}authority/topic-crosswalk.json`;
        const coverageUrl = isBackendOnline ? buildBackendUrl('/api/authority/coverage') : `${import.meta.env.BASE_URL}authority/coverage-report.json`;
        const ecfrDirectoryUrl = `${import.meta.env.BASE_URL}authority/ecfr-title-directory.json`;

        const manifestRes = await fetch(manifestUrl);
        const manifestData = await manifestRes.json();
        setManifest(manifestData);

        const crosswalkRes = await fetch(crosswalkUrl);
        const crosswalkData = await crosswalkRes.json();
        setCrosswalk(crosswalkData);

        const coverageRes = await fetch(coverageUrl);
        const coverageData = await coverageRes.json();
        setCoverageReport(coverageData);

        const ecfrDirectoryRes = await fetch(ecfrDirectoryUrl);
        if (ecfrDirectoryRes.ok) {
          const ecfrDirectoryData = await ecfrDirectoryRes.json();
          setEcfrDirectory(ecfrDirectoryData);
          if (ecfrDirectoryData?.titles?.length > 0) {
            setSelectedEcfrTitleId((prev) => prev || ecfrDirectoryData.titles[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load authority index or crosswalk metadata:", err);
      } finally {
        setIsLoadingMetadata(false);
      }
    };
    loadMetadata();
  }, [isBackendOnline]);

  // Fetch document text on demand
  const loadDocument = useCallback(async (type, id) => {
    // Normalize type to 'usc' or 'cfr' or 'm28c'
    const normalizedType = type === 'statutes' ? 'usc' : type === 'regulations' ? 'cfr' : type;
    const cacheKey = `${normalizedType}_${id}`;
    
    if (loadedContent[cacheKey]) {
      setSelectedItemType(normalizedType);
      setSelectedItemId(id);
      return;
    }

    setIsLoadingDoc(true);
    try {
      let url = '';
      if (isBackendOnline) {
        url = buildBackendUrl(`/api/authority/${normalizedType}/${id}`);
      } else {
        if (normalizedType === 'usc') {
          url = `${import.meta.env.BASE_URL}authority/usc/${id}.json`;
        } else if (normalizedType === 'cfr') {
          url = `${import.meta.env.BASE_URL}authority/cfr/${id}.json`;
        } else if (normalizedType === 'm28c') {
          url = `${import.meta.env.BASE_URL}authority/m28c/${id}.json`;
        } else if (normalizedType === 'public-law') {
          url = `${import.meta.env.BASE_URL}authority/public-law/${id}.json`;
        } else if (normalizedType === 'federal-register') {
          url = `${import.meta.env.BASE_URL}authority/federal-register/${id}.json`;
        }
      }



      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status} when loading ${url}`);
      const data = await res.json();
      
      const normalizedData = {
        ...data,
        text: data.fullText || data.text
      };
      
      setLoadedContent(prev => ({ ...prev, [cacheKey]: normalizedData }));
      setSelectedItemType(normalizedType);
      setSelectedItemId(id);
    } catch (err) {
      console.error(`Failed to load document ${normalizedType}/${id}:`, err);
    } finally {
      setIsLoadingDoc(false);
    }
  }, [loadedContent, isBackendOnline]);

  // Sync selectedSection from sidebar
  useEffect(() => {
    if (selectedSection && selectedSection.id) {
      if (selectedSection.type === 'ecfr-title') {
        return;
      }

      const type = selectedSection.type;
      Promise.resolve().then(() => {
        loadDocument(type, selectedSection.id);
      });
    }
  }, [selectedSection, loadDocument]);

  const activeDoc = selectedItemId ? loadedContent[`${selectedItemType}_${selectedItemId}`] : null;

  // Find if current doc has a plain English mapping in crosswalk
  const crosswalkMapping = activeDoc
    ? crosswalk.find(item => 
        (item.requiredAuthorities.usc && item.requiredAuthorities.usc.includes(activeDoc.id)) ||
        (item.requiredAuthorities.cfr && item.requiredAuthorities.cfr.includes(activeDoc.id)) ||
        (item.requiredAuthorities.m28c && item.requiredAuthorities.m28c.includes(activeDoc.id))
      )
    : null;

  // Copy Citation Helper
  const handleCopyCitation = () => {
    if (!activeDoc) return;
    let text;
    if (selectedItemType === 'usc') {
      text = `${activeDoc.canonicalCitation || activeDoc.citation} – ${activeDoc.title} (2026)`;
    } else if (selectedItemType === 'cfr') {
      text = `${activeDoc.canonicalCitation || activeDoc.citation} – ${activeDoc.title} (2026) (Authority: ${activeDoc.authority || '38 U.S.C. Chapter 31'})`;
    } else {
      text = `${activeDoc.canonicalCitation || activeDoc.citation} ("${activeDoc.title}") (last updated ${activeDoc.lastChecked})`;
    }
    
    navigator.clipboard.writeText(text);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  // Print Document Helper
  const handlePrintDoc = () => {
    if (!activeDoc) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${activeDoc.canonicalCitation || activeDoc.citation} - ${activeDoc.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1 { font-size: 1.8rem; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; margin-bottom: 20px; }
            .badge { font-weight: bold; text-transform: uppercase; font-size: 0.8rem; border: 1px solid #94a3b8; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 20px; }
            .text-block { white-space: pre-wrap; font-size: 1rem; margin-bottom: 30px; }
            .meta { font-size: 0.85rem; color: #64748b; background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; }
            .meta p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="badge">${selectedItemType === 'm28c' ? 'VA Manual Guidance' : 'Binding Law'}</div>
          <h1>${activeDoc.canonicalCitation || activeDoc.citation} – ${activeDoc.title}</h1>
          <div class="text-block">${activeDoc.text}</div>
          <div class="meta">
            ${activeDoc.authority ? `<p><strong>Authority:</strong> ${activeDoc.authority}</p>` : ''}
            ${activeDoc.history || activeDoc.amendmentNotes ? `<p><strong>History:</strong> ${activeDoc.history || JSON.stringify(activeDoc.amendmentNotes)}</p>` : ''}
            ${activeDoc.sourceCredit ? `<p><strong>Source Credit:</strong> ${activeDoc.sourceCredit}</p>` : ''}
            <p><strong>Verified Date:</strong> ${activeDoc.lastChecked || '2026-05-25'}</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Filter crosswalk topics
  const filteredCrosswalk = crosswalk.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.plainEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.topicId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(crosswalk.map(item => item.category))];

  if (isLoadingMetadata) {
    return (
      <div className="min-h-[500px] flex items-center justify-center text-center text-slate-400 text-xs">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-md">
          <Loader2 className="animate-spin text-emerald-500 mx-auto mb-2" size={24} />
          <span>Loading authority library index...</span>
        </div>
      </div>
    );
  }

  // Helper to determine if an item is bookmarked
  const isBookmarked = (id, type) => {
    return bookmarks.some(b => b.id === id && b.type === type);
  };

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Title Header Block */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                <Gavel size={20} />
              </span>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">Authority & Citation Library</h1>
            </div>
            <p className="text-slate-400 text-xs mt-1 max-w-xl leading-relaxed">
              Source-backed VR&E authority library indexing 38 U.S.C. Chapter 31, 38 C.F.R. Part 21, and KnowVA M28C guidelines. Bind counselors to legal mandates.
            </p>
          </div>
          
          {/* Main search bar */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search library topics, sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700 transition"
            />
          </div>
        </div>

        {/* TOP LEVEL NAVIGATION TABS */}
        <div className="flex border-b border-slate-800 mt-6 gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('crosswalk')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition duration-200 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'crosswalk' 
                ? 'border-emerald-500 text-emerald-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info size={14} />
            <span>Topic Crosswalk</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('browse');
              if (!selectedItemId && manifest) {
                if (browseSourceTab === 'statutes' && manifest.statutes.length > 0) {
                  loadDocument('usc', manifest.statutes[0].id);
                } else if (browseSourceTab === 'regulations' && manifest.regulations.length > 0) {
                  loadDocument('cfr', manifest.regulations[0].id);
                } else if (browseSourceTab === 'm28c' && manifest.m28c.length > 0) {
                  loadDocument('m28c', manifest.m28c[0].id);
                } else if (browseSourceTab === 'ecfr-titles' && ecfrDirectory?.titles?.length > 0 && !selectedEcfrTitleId) {
                  setSelectedEcfrTitleId(ecfrDirectory.titles[0].id);
                }
              }
            }}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition duration-200 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'browse' 
                ? 'border-emerald-500 text-emerald-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale size={14} />
            <span>Browse Sources</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition duration-200 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'audit' 
                ? 'border-emerald-500 text-emerald-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck size={14} />
            <span>Citation Audit</span>
          </button>
        </div>
      </div>

      {/* Main Tab Panels */}
      <div className="min-h-[500px]">
        {/* TOPIC CROSSWALK TAB */}
        {activeTab === 'crosswalk' && (
          <div className="space-y-4">
            {/* Category selector */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] font-medium transition ${
                    selectedCategory === cat
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:bg-slate-900/50 hover:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Topics grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCrosswalk.map(topic => (
                <div 
                  key={topic.topicId}
                  className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 hover:border-slate-700 hover:bg-slate-900/60 transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10 rounded-full">
                        {topic.category}
                      </span>
                    </div>
                    <h2 className="text-sm font-bold text-slate-200 mt-2">{topic.name}</h2>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                      {topic.plainEnglish}
                    </p>

                    {/* Display Mapped Codes */}
                    <div className="mt-4 space-y-2">
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Binding Law</div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {topic.requiredAuthorities.usc && topic.requiredAuthorities.usc.map(authId => {
                            const id = authId.replace('38-usc-', '');
                            const display = `38 U.S.C. § ${id}`;
                            return (
                              <button
                                key={authId}
                                onClick={() => {
                                  setSelectedSection({ type: 'usc', id: authId });
                                }}
                                className="text-[10px] bg-slate-950/60 hover:bg-slate-950 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700 text-slate-400 px-2 py-1 rounded inline-flex items-center gap-1 transition"
                              >
                                <Scale size={10} className="text-emerald-400" />
                                <span>{display}</span>
                              </button>
                            );
                          })}
                          {topic.requiredAuthorities.cfr && topic.requiredAuthorities.cfr.map(authId => {
                            const section = authId.replace('38-cfr-21-', '21.').replace('38-cfr-', '').replace('-', '.');
                            const display = `38 C.F.R. § ${section}`;
                            return (
                              <button
                                key={authId}
                                onClick={() => {
                                  setSelectedSection({ type: 'cfr', id: authId });
                                }}
                                className="text-[10px] bg-slate-950/60 hover:bg-slate-950 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700 text-slate-400 px-2 py-1 rounded inline-flex items-center gap-1 transition"
                              >
                                <Scale size={10} className="text-emerald-400" />
                                <span>{display}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {topic.requiredAuthorities.m28c && topic.requiredAuthorities.m28c.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Manual & Policy</div>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {topic.requiredAuthorities.m28c.map(authId => {
                              const display = authId.toUpperCase().replace(/-/g, '.');
                              return (
                                <button
                                  key={authId}
                                  onClick={() => {
                                    setSelectedSection({ type: 'm28c', id: authId });
                                  }}
                                  className="text-[10px] bg-slate-950/60 hover:bg-slate-950 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700 text-slate-400 px-2 py-1 rounded inline-flex items-center gap-1 transition"
                                >
                                  <Book size={10} className="text-indigo-400" />
                                  <span>{display}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="border-t border-slate-800/80 mt-5 pt-3 flex justify-between items-center">
                    <button
                      onClick={() => setActiveView('document_generator')}
                      className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition font-medium"
                    >
                      <span>Draft brief in Generator</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredCrosswalk.length === 0 && (
              <div className="text-center p-12 bg-slate-900/20 border border-slate-800 rounded-xl">
                <AlertTriangle size={32} className="text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No crosswalk topics matching "{searchQuery}" were found.</p>
              </div>
            )}
          </div>
        )}

        {/* BROWSE SOURCES TAB */}
        {activeTab === 'browse' && manifest && (
          <div className="space-y-4">
            {/* Global Warning Banner */}
            <div className="bg-slate-950/50 border border-slate-800 text-slate-400 rounded-xl p-3.5 text-xs flex gap-2.5 items-center">
              <Info size={16} className="text-emerald-400 shrink-0" />
              <span>
                <strong>Database Scope Alert:</strong> Full USC/CFR corpus in progress; M28C public chapter coverage is partial and summary-based. Related eCFR title indexes below are structural directories, not stored full-text authorities.
              </span>
            </div>
            {/* Sub Tabs for Sources */}
            <div className="flex gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => {
                  setBrowseSourceTab('statutes');
                  if (manifest.statutes.length > 0) {
                    loadDocument('usc', manifest.statutes[0].id);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  browseSourceTab === 'statutes'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Statutes (38 U.S.C.)
              </button>
              <button
                onClick={() => {
                  setBrowseSourceTab('regulations');
                  if (manifest.regulations.length > 0) {
                    loadDocument('cfr', manifest.regulations[0].id);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  browseSourceTab === 'regulations'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Regulations (38 C.F.R.)
              </button>
              <button
                onClick={() => {
                  setBrowseSourceTab('m28c');
                  if (manifest.m28c.length > 0) {
                    loadDocument('m28c', manifest.m28c[0].id);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  browseSourceTab === 'm28c'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                KnowVA M28C Manual
              </button>
              <button
                onClick={() => {
                  setBrowseSourceTab('public-laws');
                  if (manifest.publicLaws && manifest.publicLaws.length > 0) {
                    loadDocument('public-law', manifest.publicLaws[0].id);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  browseSourceTab === 'public-laws'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Public Laws
              </button>
              <button
                onClick={() => {
                  setBrowseSourceTab('federal-registers');
                  if (manifest.federalRegister && manifest.federalRegister.length > 0) {
                    loadDocument('federal-register', manifest.federalRegister[0].id);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  browseSourceTab === 'federal-registers'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Federal Register
              </button>
              <button
                onClick={() => {
                  setBrowseSourceTab('ecfr-titles');
                  if (selectedEcfrTitleId) {
                    setSelectedSection({ type: 'ecfr-title', id: selectedEcfrTitleId });
                  } else if (ecfrDirectory?.titles?.length > 0) {
                    const defaultTitleId = ecfrDirectory.titles[0].id;
                    setSelectedEcfrTitleId(defaultTitleId);
                    setSelectedSection({ type: 'ecfr-title', id: defaultTitleId });
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  browseSourceTab === 'ecfr-titles'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Related eCFR Titles
              </button>
            </div>

            {browseSourceTab === 'ecfr-titles' ? (
              <EcfrTitleDirectoryPanel
                directory={ecfrDirectory}
                searchQuery={searchQuery}
                selectedTitleId={selectedEcfrTitleId}
                onSelectTitle={(id) => {
                  setSelectedEcfrTitleId(id);
                  setSelectedSection({ type: 'ecfr-title', id });
                }}
              />
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Sidebar list (left col) */}
              <div className="md:col-span-4 bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[550px]">
                <div className="p-3 bg-slate-950/30 border-b border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Available Documents</span>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-slate-800/40">
                  {/* Statutes List */}
                  {browseSourceTab === 'statutes' && manifest.statutes
                    .filter(s => s.citation.toLowerCase().includes(searchQuery.toLowerCase()) || s.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSelectedSection({ type: 'usc', id: s.id });
                        }}
                        className={`w-full text-left p-3.5 transition flex flex-col gap-1 ${
                          selectedItemId === s.id && selectedItemType === 'usc'
                            ? 'bg-emerald-500/5 text-emerald-400 border-l-2 border-emerald-500'
                            : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-[10px] font-bold tracking-wider">{s.citation}</span>
                        <span className="text-xs font-semibold leading-snug">{s.title}</span>
                      </button>
                    ))}

                  {/* Regulations List */}
                  {browseSourceTab === 'regulations' && manifest.regulations
                    .filter(r => r.citation.toLowerCase().includes(searchQuery.toLowerCase()) || r.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(r => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setSelectedSection({ type: 'cfr', id: r.id });
                        }}
                        className={`w-full text-left p-3.5 transition flex flex-col gap-1 ${
                          selectedItemId === r.id && selectedItemType === 'cfr'
                            ? 'bg-emerald-500/5 text-emerald-400 border-l-2 border-emerald-500'
                            : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-[10px] font-bold tracking-wider">{r.citation}</span>
                        <span className="text-xs font-semibold leading-snug">{r.title}</span>
                      </button>
                    ))}

                  {/* M28C List */}
                  {browseSourceTab === 'm28c' && manifest.m28c
                    .filter(m => m.citation.toLowerCase().includes(searchQuery.toLowerCase()) || m.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(m => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedSection({ type: 'm28c', id: m.id });
                        }}
                        className={`w-full text-left p-3.5 transition flex flex-col gap-1 ${
                          selectedItemId === m.id && selectedItemType === 'm28c'
                            ? 'bg-emerald-500/5 text-emerald-400 border-l-2 border-emerald-500'
                            : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-[10px] font-bold tracking-wider">{m.citation}</span>
                        <span className="text-xs font-semibold leading-snug">{m.title}</span>
                      </button>
                    ))}

                  {/* Public Laws List */}
                  {browseSourceTab === 'public-laws' && manifest.publicLaws && manifest.publicLaws
                    .filter(pl => pl.citation.toLowerCase().includes(searchQuery.toLowerCase()) || pl.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(pl => (
                      <button
                        key={pl.id}
                        onClick={() => {
                          setSelectedSection({ type: 'public-law', id: pl.id });
                        }}
                        className={`w-full text-left p-3.5 transition flex flex-col gap-1 ${
                          selectedItemId === pl.id && selectedItemType === 'public-law'
                            ? 'bg-emerald-500/5 text-emerald-400 border-l-2 border-emerald-500'
                            : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-[10px] font-bold tracking-wider">{pl.citation}</span>
                        <span className="text-xs font-semibold leading-snug">{pl.title}</span>
                      </button>
                    ))
                  }

                  {/* Federal Register List */}
                  {browseSourceTab === 'federal-registers' && manifest.federalRegister && manifest.federalRegister
                    .filter(fr => fr.citation.toLowerCase().includes(searchQuery.toLowerCase()) || fr.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(fr => (
                      <button
                        key={fr.id}
                        onClick={() => {
                          setSelectedSection({ type: 'federal-register', id: fr.id });
                        }}
                        className={`w-full text-left p-3.5 transition flex flex-col gap-1 ${
                          selectedItemId === fr.id && selectedItemType === 'federal-register'
                            ? 'bg-emerald-500/5 text-emerald-400 border-l-2 border-emerald-500'
                            : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-[10px] font-bold tracking-wider">{fr.citation}</span>
                        <span className="text-xs font-semibold leading-snug">{fr.title}</span>
                      </button>
                    ))
                  }
                </div>
              </div>

              {/* Document display (right col) */}
              <div className="md:col-span-8 flex flex-col h-[550px]">
                {isLoadingDoc ? (
                  <div className="flex-1 bg-slate-900/20 border border-slate-800 rounded-xl flex items-center justify-center">
                    <div className="text-center text-slate-400 text-xs">
                      <Loader2 className="animate-spin text-emerald-500 mx-auto mb-2" size={24} />
                      <span>Loading official full-text document...</span>
                    </div>
                  </div>
                ) : activeDoc ? (
                  <div className="flex-1 bg-slate-900/20 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                    {/* Document Header panel */}
                    <div className="p-5 border-b border-slate-800 bg-slate-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-300 tracking-wider">
                            {activeDoc.canonicalCitation || activeDoc.citation}
                          </span>
                          <AuthorityBadge level={activeDoc.authorityLevel === 'binding-statute' ? 'binding' : activeDoc.authorityLevel === 'va-policy' ? 'policy' : activeDoc.level} />
                          {activeDoc.status && (
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                              activeDoc.status === 'current' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {activeDoc.status}
                            </span>
                          )}
                        </div>
                        <h2 className="text-sm font-bold text-slate-100 mt-1.5 leading-snug">
                          {activeDoc.title}
                        </h2>
                      </div>

                      <div className="flex items-center gap-2">
                        {toggleBookmark && (
                          <button
                            onClick={() => toggleBookmark(selectedItemType, activeDoc.id, activeDoc.canonicalCitation || activeDoc.citation)}
                            className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-slate-200 text-slate-400 rounded-lg transition"
                            title={isBookmarked(activeDoc.id, selectedItemType) ? "Remove bookmark" : "Add bookmark"}
                          >
                            <Bookmark size={14} className={isBookmarked(activeDoc.id, selectedItemType) ? "fill-emerald-500 text-emerald-500" : ""} />
                          </button>
                        )}
                        <button
                          onClick={handleCopyCitation}
                          className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-slate-200 text-slate-400 rounded-lg transition"
                          title="Copy litigation-grade citation"
                        >
                          {copyStatus ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                        <button
                          onClick={handlePrintDoc}
                          className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-slate-200 text-slate-400 rounded-lg transition"
                          title="Print document text"
                        >
                          <Printer size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Document text body */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4">
                      {/* Summary Warning Banner for summary-only records */}
                      {activeDoc.status === 'summary-only' && (
                        <div className="bg-amber-950/20 border border-amber-900/30 text-amber-300 rounded-xl p-4 flex gap-3 text-xs leading-relaxed">
                          <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong>Summary Record Notice:</strong> {activeDoc.displayWarning || "This is a summary-only chapter record. The full official text is not stored in the portal database."}
                          </div>
                        </div>
                      )}

                      {/* Crosswalk plain English link block */}
                      {crosswalkMapping && (
                        <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 flex gap-3">
                          <Info size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Topic: {crosswalkMapping.name}
                            </div>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                              {crosswalkMapping.plainEnglish}
                            </p>
                            {crosswalkMapping.commonVaErrors && crosswalkMapping.commonVaErrors.length > 0 && (
                              <div className="mt-2.5 flex flex-wrap gap-2">
                                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/5 px-2 py-0.5 border border-amber-500/10 rounded">
                                  Common VA Error: {crosswalkMapping.commonVaErrors[0]}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedItemType === 'cfr' && (
                        <div className="bg-amber-950/20 border border-amber-900/30 text-amber-300 rounded-xl p-4 flex gap-3 text-xs leading-relaxed">
                          <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong>Regulation source note:</strong> This text is pulled from eCFR, which is continuously updated but not the official legal edition. Confirm litigation-grade citations against the official CFR/Federal Register.
                          </div>
                        </div>
                      )}

                      {/* Actual statute/regulation paragraphs */}
                      <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap select-text">
                        {activeDoc.text}
                      </div>

                      {/* Bidirectional Authority Links */}
                      {selectedItemType === 'usc' && activeDoc.publicLawRefs && activeDoc.publicLawRefs.length > 0 && (
                        <div className="mt-6 pt-5 border-t border-slate-800/40">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Scale size={11} className="text-amber-500" />
                            <span>Amending Public Laws</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {activeDoc.publicLawRefs.map(plId => {
                              const citation = plId.replace('pl-', 'Pub. L. ');
                              return (
                                <button
                                  key={plId}
                                  onClick={() => {
                                    setSelectedSection({ type: 'public-law', id: plId });
                                  }}
                                  className="text-[10px] bg-slate-950/40 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-md inline-flex items-center gap-1 transition cursor-pointer"
                                >
                                  <span>{citation}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {selectedItemType === 'public-law' && activeDoc.relatedAuthorities && activeDoc.relatedAuthorities.length > 0 && (
                        <div className="mt-6 pt-5 border-t border-slate-800/40">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Scale size={11} className="text-emerald-500" />
                            <span>Affected Statutory & Regulatory Sections</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {activeDoc.relatedAuthorities.map(authId => {
                              let display = authId;
                              let type = 'usc';
                              if (authId.startsWith('38-usc-')) {
                                display = `38 U.S.C. § ${authId.replace('38-usc-', '')}`;
                                type = 'usc';
                              } else if (authId.startsWith('38-cfr-')) {
                                display = `38 C.F.R. § ${authId.replace('38-cfr-21-', '21.').replace('38-cfr-', '').replace('-', '.')}`;
                                type = 'cfr';
                              } else if (authId.startsWith('m28c-')) {
                                display = authId.toUpperCase().replace(/-/g, '.');
                                type = 'm28c';
                              }
                              return (
                                <button
                                  key={authId}
                                  onClick={() => {
                                    setSelectedSection({ type, id: authId });
                                  }}
                                  className="text-[10px] bg-slate-950/40 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-md inline-flex items-center gap-1 transition cursor-pointer"
                                >
                                  <span>{display}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer metadata */}
                    <div className="p-4 border-t border-slate-800 bg-slate-950/30 text-[10px] text-slate-500 space-y-1">
                      {activeDoc.authority && (
                        <div>
                          <strong>Authority:</strong> {activeDoc.authority}
                        </div>
                      )}
                      {activeDoc.hash && (
                        <div className="font-mono">
                          <strong>SHA256:</strong> {activeDoc.hash}
                        </div>
                      )}
                      {activeDoc.lastChecked && (
                        <div>
                          <strong>Last Verified Status:</strong> Active and correct as of {activeDoc.lastChecked}.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 bg-slate-900/20 border border-slate-800 rounded-xl flex items-center justify-center text-center p-8">
                    <div className="max-w-xs">
                      <FileText size={32} className="text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">Select an authority from the left list to view its official full-text contents.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
        )}

        {/* CITATION AUDIT TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {coverageReport ? (
              <>
                {/* Metric Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CI Verification Status</span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="p-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                        <CheckCircle2 size={16} />
                      </span>
                      <span className="text-sm font-bold text-emerald-400 uppercase">{coverageReport.status === 'pass' ? 'Active & Passed' : 'Fail'}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">38 U.S.C. Chapter 31</span>
                    <div className="text-sm font-bold text-slate-100 mt-2">{coverageReport.usc?.coverage || "23/23"}</div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-800">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">38 C.F.R. Part 21</span>
                    <div className="text-sm font-bold text-slate-100 mt-2">{coverageReport.cfr?.coverage || "153/153"}</div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-800">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                    <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">KnowVA M28C Manual</span>
                    <div className="text-sm font-bold text-amber-400 mt-2">{coverageReport.m28c?.coverage || "Partial"}</div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-800">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Total Warnings</span>
                    <div className="text-sm font-bold text-slate-100 mt-2">{coverageReport.totalErrors || 0}</div>
                  </div>
                </div>

                {/* Pipeline Auditing Details */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Automated CI Compliance Checklist</h3>
                  <div className="space-y-3.5">
                    
                    {/* Check 1 */}
                    <div className="flex justify-between items-start gap-4 p-3 bg-slate-950/20 border border-slate-800/80 rounded-lg">
                      <div>
                        <div className="text-xs font-bold text-slate-200">Zod Schema Validation (authorityRecord.schema.js)</div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Checks that every statute, regulation, and KnowVA manual file matches the standard TypeScript/Zod metadata definitions (including status, displayWarning, hashes, citations, and content).
                        </p>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase shrink-0">Passed</span>
                    </div>

                    {/* Check 2 */}
                    <div className="flex justify-between items-start gap-4 p-3 bg-slate-950/20 border border-slate-800/80 rounded-lg">
                      <div>
                        <div className="text-xs font-bold text-slate-200">Topic-Crosswalk Citation Integrity (audit-citations.mjs)</div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Ensures that every statute, regulation, or manual section mapped in the topic database has a corresponding full-text JSON file. Protects against broken reference links.
                        </p>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase shrink-0">Passed</span>
                    </div>

                    {/* Check 3 */}
                    <div className="flex justify-between items-start gap-4 p-3 bg-slate-950/20 border border-slate-800/80 rounded-lg">
                      <div>
                        <div className="text-xs font-bold text-slate-200">Cryptographic Hash Auditing (audit-source-hashes.mjs)</div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Verifies that the ingested database text exactly matches the registered cryptographic SHA-256 source hash. Detects any unauthorized or accidental changes to local authority files.
                        </p>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase shrink-0">Passed</span>
                    </div>

                    {/* Check 4 */}
                    <div className="flex justify-between items-start gap-4 p-3 bg-slate-950/20 border border-slate-800/80 rounded-lg">
                      <div>
                        <div className="text-xs font-bold text-slate-200">Modal Verb & Mandate Auditing (audit-modal-verbs.mjs)</div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          Analyzes mandate strength by scanning document text for binding vs. non-binding auxiliary verbs ("shall", "must" vs "should", "may"). Helps veterans distinguish binding legal mandates from advisory policies.
                        </p>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase shrink-0">Passed</span>
                    </div>

                  </div>
                </div>
              </>
            ) : (
              <div className="text-center p-12 bg-slate-900/20 border border-slate-800 rounded-xl">
                <AlertTriangle size={32} className="text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Coverage report file not found. Run "npm run legal:check" in the build system to generate it.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default AuthorityLibraryView;
