/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { Search, BookOpen, ExternalLink, ShieldAlert, CheckCircle } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
function GlobalSearchView({ reduceMotion, isBackendOnline }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    setSearched(true);

    try {
      // Connect to the redeveloped Express backend search endpoint
      const response = await fetch(`http://localhost:5000/api/authority/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Search failed on the backend.');
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch search results. Standard SQL fallback active.');
      // Local fallback search (simulated from local storage bookmarks or empty)
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch();
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleDocumentClick = (type, id) => {
    // Dispatch the custom navigation event that App.jsx listens to
    window.dispatchEvent(
      new CustomEvent('navigate-to-authority', {
        detail: { type, id }
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="doc-card text-slate-100 pb-6 mb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20 shadow-md">
              <Search size={24} />
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">Global Authority Search</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Query federal legislation (USC Title 38), administrative code (CFR Part 21), and VA policy manuals (M28C) simultaneously.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto text-[10px] font-mono px-3 py-1.5 rounded-lg border bg-slate-950/50">
            {isBackendOnline ? (
              <>
                <CheckCircle size={10} className="text-emerald-500" />
                <span className="text-emerald-400 font-bold">SQL FTS5 INDEX ONLINE</span>
              </>
            ) : (
              <>
                <ShieldAlert size={10} className="text-amber-500" />
                <span className="text-amber-400 font-bold">LOCAL FALLBACK ONLY</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4">
        <div className="relative">
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter search terms (e.g. 'retroactive induction', '48 months', 'subsistence allowance')..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4.5 pl-12 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
          />
          <Search size={20} className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4 min-h-[300px]">
        <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Search Results</h3>
          <span className="text-[10px] text-slate-500 font-mono">
            {isLoading ? 'Searching...' : `${results.length} matches found`}
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
            <span className="text-xs text-slate-500">Searching SQLite indexing tables...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-amber-950/10 border border-amber-900/30 rounded-xl text-xs text-amber-350 flex items-center gap-2">
            <ShieldAlert size={14} className="shrink-0" />
            <span>{error} Please ensure the backend Node server is running on port 5000.</span>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4.5 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            {results.map((doc) => (
              <div 
                key={doc.id}
                className="bg-slate-950/30 border border-slate-900 hover:border-slate-800 transition rounded-xl p-4 space-y-2 cursor-pointer flex flex-col justify-between"
                onClick={() => handleDocumentClick(doc.type, doc.id)}
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      {doc.type === 'usc' ? 'Statute (U.S.C.)' : doc.type === 'cfr' ? 'Regulation (C.F.R.)' : 'Manual (M28C)'}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{doc.citation}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 mt-2">{doc.title}</h4>
                  
                  {doc.full_text && (
                    <p className="text-[10px] text-slate-450 leading-relaxed mt-2.5 line-clamp-3 bg-slate-950/20 p-2 border border-slate-900 rounded-lg">
                      {doc.full_text}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-900/50 flex justify-end">
                  <span className="text-[9px] font-bold text-sky-450 hover:underline flex items-center gap-1">
                    <span>Jump to Library Reference</span>
                    <ExternalLink size={8} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : searched ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <BookOpen size={36} className="text-slate-700 mb-2" />
            <span className="text-xs text-slate-400 font-bold">No matching authorities found</span>
            <p className="text-[10px] text-slate-500 max-w-sm mt-1 leading-normal">
              Try searching with legal terms like "feasibility", "subsistence", "3104", or "retroactive induction".
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-600">
            <Search size={36} className="mb-2" />
            <span className="text-xs">Enter search terms above to query the database.</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default GlobalSearchView;
