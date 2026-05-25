import { 
  BookOpen, FileText, Info, Users, ShieldCheck, 
  BookMarked, Calculator, HelpCircle, CheckCircle, ExternalLink, Scale 
} from 'lucide-react';
import { motion } from 'framer-motion';

function ResourceCenterView({ reduceMotion }) {
  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="doc-card"
    >
      <span className="doc-tag">Official References</span>
      <h1 className="doc-title">Resource Center</h1>
      <p className="doc-subtitle">Official VA manuals, eligibility handbooks, rate guides, and financial tools for Chapter 31.</p>
      <div className="doc-divider"></div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Category 1: Handbooks & Admin Guidance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--accent-color)', borderBottom: '2px solid var(--accent-color)', paddingBottom: '6px' }}>Handbooks & Regulations</h3>
          
          <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={16} style={{ color: 'var(--accent-color)' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>VR&E SCO Handbook</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              The official School Certifying Official (SCO) Handbook for VR&E. Guides school administrators on certifying student enrollment, managing OJT agreements, and processing authorizations.
            </p>
            <a href="https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000260798/VRE-School-Certifying-Official-Handbook" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
              Open SCO Handbook <ExternalLink size={12} />
            </a>
          </div>

          <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} style={{ color: 'var(--accent-color)' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>KnowVA VR&E Resource Hub</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Direct access to the VA's internal KnowVA VR&E reference base. Contains directories, policy overrides, and operational tools utilized by VR&E counselors.
            </p>
            <a href="https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000152782/VRE-Resource" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
              Open Resource Hub <ExternalLink size={12} />
            </a>
          </div>

          <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16} style={{ color: 'var(--accent-color)' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>Miscellaneous Resources</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              VA's reference list of miscellaneous manuals, directories, conflict resolution processes, and administrative worksheets.
            </p>
            <a href="https://www.knowva.ebenefits.va.gov/system/templates/selfservice/va_ssnew/help/customer/locale/en-US/portal/554400000001018/content/554400000152782/VRE-Resource#B%20Miscellaneous%20Resources" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
              Open Misc Resources <ExternalLink size={12} />
            </a>
          </div>

          <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={16} style={{ color: 'var(--accent-color)' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>VR&E Guidebook 3.0</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Comprehensive transition guidebook detailing application strategies, the 5 tracks, duty to assist, retroactive inductions, and VREO cost thresholds. Includes a key preparation checklist.
            </p>
            <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <strong>Pre-Assessment Checklist:</strong>
              <ul style={{ listStyleType: 'disc', paddingLeft: '14px', margin: '4px 0 0 0' }}>
                <li>Updated Resume</li>
                <li>Transcripts & Training Records</li>
                <li>Retroactive requests: Invoices, Admissions Letters, Curricula</li>
              </ul>
            </div>
            <a href="https://static1.squarespace.com/static/5e35dcc77332cf46d567118b/t/6852948eec86c35052307de1/1750242446430/VR%26E+Guidebook+3.0.pdf" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
              Download VR&E Guidebook 3.0 <ExternalLink size={12} />
            </a>
          </div>

          <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Scale size={16} style={{ color: 'var(--accent-color)' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>U.S. Code Download Portal</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Official portal to download the complete United States Code. Relevant for researching Title 38 U.S.C. Chapter 31 (Sections 3100-3122) for statutory guidance on entitlement, tracks, and allowances.
            </p>
            <a href="https://uscode.house.gov/download/download.shtml" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
              Open US Code Portal <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Category 2: Portals & Career Services */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--accent-color)', borderBottom: '2px solid var(--accent-color)', paddingBottom: '6px' }}>VA Career Portals</h3>

          <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} style={{ color: 'var(--accent-color)' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>VA VR&E Official Homepage</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              The core VBA page for the Veteran Readiness and Employment program. Apply online, track your claim, and explore the 5 rehabilitation tracks.
            </p>
            <a href="https://www.benefits.va.gov/vocrehab/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
              Visit VR&E Home <ExternalLink size={12} />
            </a>
          </div>

          <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} style={{ color: 'var(--accent-color)' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>Careers & Employment Hub</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Comprehensive VA page for active job seekers. Explore employment programs, career counseling, federal hiring advantages, and resume tools.
            </p>
            <a href="https://www.va.gov/careers-employment/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
              Open Careers Hub <ExternalLink size={12} />
            </a>
          </div>

          <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookMarked size={16} style={{ color: 'var(--accent-color)' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>Veteran Resources Catalog</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Directory of services including VetSuccess on Campus (VSOC), personalized career counseling (Chapter 36), and educational tracks.
            </p>
            <a href="https://www.va.gov/careers-employment/veteran-resources/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
              Open Resources Catalog <ExternalLink size={12} />
            </a>
          </div>

          <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} style={{ color: 'var(--accent-color)' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>VA QuickSubmit Portal</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Direct document upload portal to bypass standard EVA email processing. Use to upload your VA Form 28-1900, tuition invoices, transcripts, and medical evidence directly into your electronic case file.
            </p>
            <a href="https://access.va.gov/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
              Open QuickSubmit Portal <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Category 3: Financial & Special Access */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--accent-color)', borderBottom: '2px solid var(--accent-color)', paddingBottom: '6px' }}>Specialized & Financial</h3>

          <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Scale size={16} style={{ color: 'var(--accent-color)' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>Early Access via IDES</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Guidance for transitioning service members to access VR&E services early through the Integrated Disability Evaluation System (IDES) before official discharge.
            </p>
            <a href="https://www.va.gov/resources/accessing-veteran-readiness-and-employment-through-ides/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
              Learn About IDES <ExternalLink size={12} />
            </a>
          </div>

          <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={16} style={{ color: 'var(--accent-color)' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>Subsistence Allowance Rates</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Official rate table adjustments for Chapter 31 monthly payments. Compares full-time, half-time, and dependency-based adjustments.
            </p>
            <a href="https://www.benefits.va.gov/vocrehab/subsistence_allowance_rates.asp" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
              View Rate Tables <ExternalLink size={12} />
            </a>
          </div>

          <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={16} style={{ color: 'var(--accent-color)' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>VR&E Eligibility Guides</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Official eligibility criteria including active-duty rating standards, discharge requirements, and basic entitlement windows.
            </p>
            <a href="https://www.va.gov/careers-employment/vocational-rehabilitation/eligibility/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
              Verify Eligibility <ExternalLink size={12} />
            </a>
          </div>

          <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} style={{ color: 'var(--accent-color)' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>MIRECC FinVet Resources</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Mental health and financial planning program (VISN 19) providing budgeting toolkits, debt guides, and financial health resources for veterans in training.
            </p>
            <a href="https://www.mirecc.va.gov/visn19/finvet/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
              Explore FinVet <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Category 4: Federal & Advocacy Support */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--accent-color)', borderBottom: '2px solid var(--accent-color)', paddingBottom: '6px' }}>Federal & Advocacy</h3>

          <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Scale size={16} style={{ color: 'var(--accent-color)' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>CareerOneStop Voc Rehab</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              A Department of Labor sponsored resource portal detailing state-level vocational rehabilitation services, employment options, and guides for workers with disabilities.
            </p>
            <a href="https://www.careeronestop.org/ResourcesFor/WorkersWithDisabilities/vocational-rehabilitation.aspx" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
              Explore CareerOneStop <ExternalLink size={12} />
            </a>
          </div>

          <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={16} style={{ color: 'var(--accent-color)' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>DOL Voc Rehab FAQs</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              U.S. Department of Labor (OWCP) official FAQs covering rehabilitation rights, qualifications, training allowances, and worker protection programs.
            </p>
            <a href="https://www.dol.gov/agencies/owcp/dlhwc/FAQ/RehabFAQs" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
              View DOL FAQs <ExternalLink size={12} />
            </a>
          </div>

          <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} style={{ color: 'var(--accent-color)' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>NVF VR&E Benefit Guide</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              The National Veterans Foundation's independent guide explaining how Chapter 31 vocational rehabilitation works and detailing transition tracks for veterans.
            </p>
            <a href="https://nvf.org/veterans-vocational-rehabilitation/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
              Open NVF Guide <ExternalLink size={12} />
            </a>
          </div>

          <div className="resource-item" style={{ padding: '16px', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookMarked size={16} style={{ color: 'var(--accent-color)' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>VA TAP Benefits Guide (v6.1)</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Official Department of Defense and VA transition guide (September 2025). Explains Chapter 31 VR&E eligibility, IDES early entry, National Guard/Reserve requirements, and program tracks (Module 4, Page 110-115).
            </p>
            <a href="https://www.tapevents.mil/Assets/ResourceContent/TAP/VA-Benefits-Participant-Guide.pdf" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '600', alignSelf: 'flex-start', marginTop: '4px' }}>
              Download TAP Benefits Guide <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ResourceCenterView;
