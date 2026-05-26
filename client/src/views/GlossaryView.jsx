import { GLOSSARY_TERMS } from '../data/data';
import { motion } from 'framer-motion';

function GlossaryView({ reduceMotion }) {
  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="doc-card"
    >
      <span className="doc-tag">Reference Guide</span>
      <h1 className="doc-title">Glossary of VR&E Terms</h1>
      <p className="doc-subtitle">Key terms and abbreviations used in M28C, CFR, and U.S. Code Chapter 31.</p>
      <div className="doc-divider"></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        {GLOSSARY_TERMS.map(g => (
          <div 
            key={g.term}
            style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px' }}
          >
            <h4 style={{ color: 'var(--accent-color)', fontSize: '0.95rem', marginBottom: '4px' }}>{g.term}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{g.definition}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default GlossaryView;
