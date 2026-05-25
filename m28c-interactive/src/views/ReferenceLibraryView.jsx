import { Bookmark, BookOpen, ExternalLink, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function ReferenceLibraryView({ 
  activeContent, 
  selectedSection, 
  setSelectedSection, 
  bookmarks, 
  toggleBookmark, 
  reduceMotion,
  isLoadingContent
}) {
  if (isLoadingContent) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl">
        <div className="text-center text-slate-400 text-xs">
          <Loader2 className="animate-spin text-emerald-500 mx-auto mb-2" size={24} />
          <span>Loading reference document...</span>
        </div>
      </div>
    );
  }
  if (!activeContent) {
    return (
      <div className="doc-card text-center p-8 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl hover:border-slate-700 transition-all duration-300">
        <BookOpen size={48} className="text-slate-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-200">Select a Reference Section</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
          Browse the VR&E policy library using the Reference Tree in the sidebar. You can explore statutory law under 38 U.S.C., federal regulations under 38 CFR Part 21, or operational procedures in the M28C Manual.
        </p>
        <div style={{ marginTop: '16px' }}>
          <button className="btn btn-primary btn-sm mx-auto" onClick={() => setSelectedSection({ type: 'usc', id: '3100' })}>
            Start Browsing
          </button>
        </div>
      </div>
    );
  }

  const isBookmarked = bookmarks.some(b => b.id === selectedSection.id);

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="doc-card"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="doc-tag">{activeContent.tag || activeContent.category}</span>
          <h1 className="doc-title">{activeContent.title}</h1>
          <p className="doc-subtitle">{activeContent.subtitle}</p>
        </div>
        <button 
          className="action-btn"
          onClick={() => toggleBookmark(selectedSection.type, selectedSection.id, activeContent.title)}
          title="Bookmark Section"
          style={{ color: isBookmarked ? 'var(--accent-color)' : '' }}
        >
          <Bookmark size={18} fill={isBookmarked ? 'var(--accent-color)' : 'none'} />
        </button>
      </div>
      <div className="doc-divider"></div>
      <div 
        className="doc-body" 
        dangerouslySetInnerHTML={{ __html: activeContent.content }}
      />
      
      <div className="doc-footer">
        <div className="doc-info">
          <span>Source: Official eBenefits, GovInfo & eCFR Repositories</span>
        </div>
        <a 
          href={selectedSection.type === 'usc' 
            ? 'https://uscode.house.gov/view.xhtml?req=granuleid%3AUSC-prelim-title38-chapter31&edition=prelim'
            : selectedSection.type === 'cfr'
            ? 'https://www.ecfr.gov/current/title-38'
            : 'https://www.knowva.ebenefits.va.gov/'}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ height: '32px', fontSize: '0.75rem', gap: '4px', display: 'inline-flex', alignItems: 'center' }}
        >
          <span>View Official Source</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </motion.div>
  );
}

export default ReferenceLibraryView;
