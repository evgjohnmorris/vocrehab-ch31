import { Bookmark, Info, Trash2 } from 'lucide-react';

function BookmarkSidebar({ 
  bookmarks, 
  setSelectedSection, 
  setActiveView, 
  toggleBookmark 
}) {
  return (
    <aside className="side-panel">
      {/* Bookmarks Section */}
      <div className="panel-section">
        <div className="panel-title">
          <Bookmark size={16} />
          <span>My Bookmarks ({bookmarks.length})</span>
        </div>
        {bookmarks.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No bookmarks added yet. Click the bookmark icon on any document section to add it.</p>
        ) : (
          <div>
            {bookmarks.map(b => (
              <div 
                key={b.id} 
                className="panel-list-item"
              >
                <span 
                  className="panel-item-text"
                  onClick={() => {
                    setSelectedSection({ type: b.type, id: b.id });
                    setActiveView('reference');
                  }}
                >
                  {b.title}
                </span>
                <span 
                  className="remove-btn" 
                  onClick={() => toggleBookmark(b.type, b.id, b.title)}
                  title="Remove bookmark"
                >
                  <Trash2 size={12} />
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Reference Rules */}
      <div className="panel-section">
        <div className="panel-title">
          <Info size={16} />
          <span>Quick References</span>
        </div>
        
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div style={{ marginBottom: '12px', padding: '10px', backgroundColor: 'var(--hover-bg)', borderRadius: '6px' }}>
            <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '4px' }}>VA Form 28-1900</strong>
            The required application form for Chapter 31 benefits. Must be filed to begin the VRC evaluation process.
          </div>
          
          <div style={{ marginBottom: '12px', padding: '10px', backgroundColor: 'var(--hover-bg)', borderRadius: '6px' }}>
            <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '4px' }}>The 48-Month Rule</strong>
            Veterans are generally limited to 48 months of combined entitlement under Chapter 31 and other VA educational programs (e.g. GI Bill), unless an SEH is determined.
          </div>

          <div style={{ padding: '10px', backgroundColor: 'var(--hover-bg)', borderRadius: '6px' }}>
            <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '4px' }}>The Five Tracks</strong>
            Reemployment, Rapid Access, Self-Employment, Long-Term Services, Independent Living.
          </div>
        </div>
      </div>
    </aside>
  );
}

export default BookmarkSidebar;
