import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Scale, Book, Search, FileText, AlertTriangle, 
  Printer, Copy, Check, Info, ArrowRight, Loader2 
} from 'lucide-react';
import AuthorityBadge from '../components/AuthorityBadge';

function AuthorityLibraryView({ reduceMotion, setActiveView }) {
  const [activeTab, setActiveTab] = useState('crosswalk'); // 'crosswalk' | 'statutes' | 'regulations' | 'm28c'
  const [manifest, setManifest] = useState(null);
  const [crosswalk, setCrosswalk] = useState([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const manifestRes = await fetch(`${import.meta.env.BASE_URL}authority/index.json`);
        const manifestData = await manifestRes.json();
        setManifest(manifestData);

        const crosswalkRes = await fetch(`${import.meta.env.BASE_URL}authority/topic-crosswalk.json`);
        const crosswalkData = await crosswalkRes.json();
        setCrosswalk(crosswalkData);
      } catch (err) {
        console.error("Failed to load authority index or crosswalk metadata:", err);
      } finally {
        setIsLoadingMetadata(false);
      }
    };
    loadMetadata();
  }, []);
  
  // Searching & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Document Viewer State
  const [selectedItemId, setSelectedItemId] = useState(null); // id of current item (e.g., '3102' or '21_212' or 'm28c_v_b_6')
  const [selectedItemType, setSelectedItemType] = useState(null); // 'statutes' | 'regulations' | 'm28c'
  const [loadedContent, setLoadedContent] = useState({}); // cache: { 'statutes_3102': data }
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false); // true when copied

  // Fetch document text on demand using async fetch
  const loadDocument = async (type, id) => {
    const cacheKey = `${type}_${id}`;
    if (loadedContent[cacheKey]) {
      setSelectedItemType(type);
      setSelectedItemId(id);
      return;
    }

    setIsLoadingDoc(true);
    try {
      let url = '';
      if (type === 'statutes') {
        url = `${import.meta.env.BASE_URL}authority/usc/38-usc-${id}.json`;
      } else if (type === 'regulations') {
        const sec = id.replace('_', '-');
        url = `${import.meta.env.BASE_URL}authority/cfr/38-cfr-${sec}.json`;
      } else if (type === 'm28c') {
        const ch = id.replace(/_/g, '-');
        url = `${import.meta.env.BASE_URL}authority/m28c/${ch}.json`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status} when loading ${url}`);
      const data = await res.json();
      
      const normalizedData = {
        ...data,
        text: data.fullText || data.text
      };
      
      setLoadedContent(prev => ({ ...prev, [cacheKey]: normalizedData }));
      setSelectedItemType(type);
      setSelectedItemId(id);
    } catch (err) {
      console.error(`Failed to load document ${type}/${id}:`, err);
    } finally {
      setIsLoadingDoc(false);
    }
  };

  const activeDoc = selectedItemId ? loadedContent[`${selectedItemType}_${selectedItemId}`] : null;

  // Find if current doc has a plain English mapping in crosswalk
  const crosswalkMapping = activeDoc
    ? crosswalk.find(item => 
        item.requiredAuthorities.usc.some(auth => activeDoc.id === auth) ||
        item.requiredAuthorities.cfr.some(auth => activeDoc.id === auth) ||
        item.requiredAuthorities.m28c.some(auth => activeDoc.id === auth)
      )
    : null;

  // Copy Citation Helper
  const handleCopyCitation = () => {
    if (!activeDoc) return;
    let text;
    if (selectedItemType === 'statutes') {
      text = `${activeDoc.canonicalCitation || activeDoc.citation} – ${activeDoc.title} (2026)`;
    } else if (selectedItemType === 'regulations') {
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
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
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

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header bar */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                <Scale size={20} />
              </span>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">Litigation-Grade Authority Library</h1>
            </div>
            <p className="text-slate-400 text-xs mt-1 max-w-xl leading-relaxed">
              Explore official 38 U.S.C. statutes, 38 C.F.R. regulations, and KnowVA M28C guidelines. Bind counselors to legal citations and build strong strategy briefs.
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
              className="w-full bg-slate-950/40 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700 transition"
            />
          </div>
        </div>

        {/* Tab Selection */}
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
            <span>Interactive Crosswalk</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('statutes');
              if (!selectedItemId && manifest && manifest.statutes.length > 0) {
                loadDocument('statutes', manifest.statutes[0].id);
              }
            }}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition duration-200 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'statutes' 
                ? 'border-emerald-500 text-emerald-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale size={14} />
            <span>Statutes (38 U.S.C.)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('regulations');
              if (!selectedItemId && manifest && manifest.regulations.length > 0) {
                loadDocument('regulations', manifest.regulations[0].id);
              }
            }}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition duration-200 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'regulations' 
                ? 'border-emerald-500 text-emerald-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Book size={14} />
            <span>Regulations (38 C.F.R.)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('m28c');
              if (!selectedItemId && manifest && manifest.m28c.length > 0) {
                loadDocument('m28c', manifest.m28c[0].id);
              }
            }}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition duration-200 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'm28c' 
                ? 'border-emerald-500 text-emerald-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={14} />
            <span>KnowVA M28C Manual</span>
          </button>
        </div>
      </div>

      {/* Main content viewport */}
      <div className="min-h-[500px]">
        {/* CROSSWALK TAB */}
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
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Binding Law</div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {topic.requiredAuthorities.usc.map(auth => {
                            const id = auth.replace('38-usc-', '');
                            const display = `38 U.S.C. § ${id}`;
                            return (
                              <button
                                key={auth}
                                onClick={() => {
                                  setActiveTab('statutes');
                                  loadDocument('statutes', id);
                                }}
                                className="text-[10px] bg-slate-950/60 hover:bg-slate-950 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700 text-slate-400 px-2 py-1 rounded inline-flex items-center gap-1 transition"
                              >
                                <Scale size={10} className="text-emerald-400" />
                                <span>{display}</span>
                              </button>
                            );
                          })}
                          {topic.requiredAuthorities.cfr.map(auth => {
                            const section = auth.replace('38-cfr-21-', '21.').replace('38-cfr-', '').replace('-', '.');
                            const display = `38 C.F.R. § ${section}`;
                            const id = auth.replace('38-cfr-21-', '21_');
                            return (
                              <button
                                key={auth}
                                onClick={() => {
                                  setActiveTab('regulations');
                                  loadDocument('regulations', id);
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

                      {topic.requiredAuthorities.m28c.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase">Manual & Policy</div>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {topic.requiredAuthorities.m28c.map(auth => {
                              const display = auth.toUpperCase().replace(/-/g, '.');
                              const id = auth.replace(/-/g, '_');
                              return (
                                <button
                                  key={auth}
                                  onClick={() => {
                                    setActiveTab('m28c');
                                    loadDocument('m28c', id);
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
                      onClick={() => {
                        // Redirect to Claim builder tab or pre-select dispute area
                        setActiveView('document_generator');
                      }}
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

        {/* LEGAL BROWSER TABS (Statutes, Regulations, M28C) */}
        {activeTab !== 'crosswalk' && manifest && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Sidebar list (left col) */}
            <div className="md:col-span-4 bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[600px]">
              <div className="p-3 bg-slate-950/30 border-b border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Available Documents</span>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-slate-800/50">
                {/* Statutes List */}
                {activeTab === 'statutes' && manifest.statutes
                  .filter(s => s.citation.toLowerCase().includes(searchQuery.toLowerCase()) || s.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(s => (
                    <button
                      key={s.id}
                      onClick={() => loadDocument('statutes', s.id)}
                      className={`w-full text-left p-3.5 transition flex flex-col gap-1 ${
                        selectedItemId === s.id && selectedItemType === 'statutes'
                          ? 'bg-emerald-500/5 text-emerald-400 border-l-2 border-emerald-500'
                          : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-[10px] font-bold tracking-wider">{s.citation}</span>
                      <span className="text-xs font-semibold leading-snug">{s.title}</span>
                    </button>
                  ))}

                {/* Regulations List */}
                {activeTab === 'regulations' && manifest.regulations
                  .filter(r => r.citation.toLowerCase().includes(searchQuery.toLowerCase()) || r.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(r => (
                    <button
                      key={r.id}
                      onClick={() => loadDocument('regulations', r.id)}
                      className={`w-full text-left p-3.5 transition flex flex-col gap-1 ${
                        selectedItemId === r.id && selectedItemType === 'regulations'
                          ? 'bg-emerald-500/5 text-emerald-400 border-l-2 border-emerald-500'
                          : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-[10px] font-bold tracking-wider">{r.citation}</span>
                      <span className="text-xs font-semibold leading-snug">{r.title}</span>
                    </button>
                  ))}

                {/* M28C List */}
                {activeTab === 'm28c' && manifest.m28c
                  .filter(m => m.citation.toLowerCase().includes(searchQuery.toLowerCase()) || m.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(m => (
                    <button
                      key={m.id}
                      onClick={() => loadDocument('m28c', m.id)}
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
              </div>
            </div>

            {/* Document display (right col) */}
            <div className="md:col-span-8 flex flex-col h-[600px]">
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
                          {activeDoc.citation}
                        </span>
                        <AuthorityBadge level={activeDoc.level} />
                      </div>
                      <h2 className="text-sm font-bold text-slate-100 mt-1 leading-snug">
                        {activeDoc.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
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
                          <div className="mt-2.5 flex flex-wrap gap-2">
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/5 px-2 py-0.5 border border-amber-500/10 rounded">
                              Common VA Error: {crosswalkMapping.commonVaErrors[0]}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedItemType === 'regulations' && (
                      <div className="bg-amber-950/20 border border-amber-900/30 text-amber-300 rounded-xl p-4 flex gap-3 text-xs leading-relaxed mb-4">
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
                  </div>

                  {/* Footer metadata */}
                  <div className="p-4 border-t border-slate-800 bg-slate-950/30 text-[10px] text-slate-500 space-y-1">
                    {activeDoc.authority && (
                      <div>
                        <strong>Authority:</strong> {activeDoc.authority}
                      </div>
                    )}
                    {activeDoc.history && (
                      <div>
                        <strong>History:</strong> {activeDoc.history}
                      </div>
                    )}
                    {activeDoc.sourceCredit && (
                      <div>
                        <strong>Source Credit:</strong> {activeDoc.sourceCredit}
                      </div>
                    )}
                    <div>
                      <strong>Verified Status:</strong> Current in database as of last revision.
                    </div>
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
    </motion.div>
  );
}

export default AuthorityLibraryView;
