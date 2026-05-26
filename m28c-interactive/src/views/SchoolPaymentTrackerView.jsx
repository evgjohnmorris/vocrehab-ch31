import { useState } from 'react';
import { motion } from 'framer-motion';
import { Printer, AlertTriangle, RefreshCw } from 'lucide-react';

function SchoolPaymentTrackerView({ reduceMotion }) {
  const [termStart, setTermStart] = useState('');
  const [tuitionDue, setTuitionDue] = useState('');
  const [authSent, setAuthSent] = useState('no');
  const [scoContacted, setScoContacted] = useState('no');
  const [booksApproved, setBooksApproved] = useState('no');
  const [invoiceSubmitted, setInvoiceSubmitted] = useState('no');
  const [paymentPosted, setPaymentPosted] = useState('no');
  const [escalationNarrative, setEscalationNarrative] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const getEscalationStatus = () => {
    if (paymentPosted === 'yes') return { label: 'Payment Completed', color: 'text-emerald-400', alert: 'success' };
    
    if (tuitionDue) {
      const today = new Date();
      const dueDate = new Date(tuitionDue);
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7) return { label: 'EMERGENCY ESCALATION NEEDED (Due in <= 7 days)', color: 'text-red-400', alert: 'danger' };
      if (diffDays <= 21) return { label: 'WARNING: Payment Approaching Due Date', color: 'text-amber-400', alert: 'warning' };
    }
    
    return { label: 'Awaiting Invoice/Payment processing', color: 'text-slate-350', alert: 'info' };
  };

  const statusInfo = getEscalationStatus();

  const compileTrackerMemo = () => {
    return `VR&E SCHOOL PAYMENT & TUITION TRACKING MEMORANDUM
DATE: ${new Date().toLocaleDateString()}
TERM START: ${termStart || 'Unspecified'}
TUITION DUE DATE: ${tuitionDue || 'Unspecified'}
============================================================
1. PAYMENT STATUS & CHECKLIST TRACKER
* VA Authorization Sent: ${authSent.toUpperCase()}
* SCO Certifying Contacted: ${scoContacted.toUpperCase()}
* Books/Vouchers Approved: ${booksApproved.toUpperCase()}
* Tungsten Invoice Submitted: ${invoiceSubmitted.toUpperCase()}
* VA Tuition Payment Posted: ${paymentPosted.toUpperCase()}

Escalation Status: ${statusInfo.label}

============================================================
2. SCHOOL COMPLIANCE MEMORANDUM (38 C.F.R. § 21.262)
Under 38 C.F.R. § 21.262, the Department of Veterans Affairs has established 
a direct-billing agreement with the training institution for approved participants.
The school is prohibited from dropping the veteran, charging late registration fees, 
or restricting access to academic facilities due to payment delays by the VA, 
provided a valid enrollment authorization was submitted.

School Certifying Checklist:
1. Ensure the VRC submitted authorization in the Tungsten portal.
2. Confirm the SCO certified the enrollment in the VA Once / Enrollment Manager system.
3. Verify that the school invoice matches the authorization parameters exactly.

============================================================
3. EMERGENCY TUITION ESCALATION MESSAGE
To: VR&E Regional Office / VRC Counselor
Subject: EMERGENCY TUITION DELAY ESCALATION — TERM: ${termStart || '[TERM]'}

This message serves as an urgent escalation regarding unpaid tuition for the current term.
The tuition due date is ${tuitionDue || '[DATE]'}, and payment remains unposted. 
Failure to post authorization puts the veteran at risk of course cancellation or enrollment drops,
contrary to the intent of the rehabilitation plan.

Escalation Action Details:
${escalationNarrative || '[ENTER ESCALATION DETAILS AND SCHOOL IMPACTS]'}

============================================================
*** CONFIDENTIAL: Internal record compiled for school compliance. ***`;
  };

  const handleCopy = () => {
    const text = compileTrackerMemo();
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handlePrint = () => {
    const text = compileTrackerMemo();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Tuition Payment Memo</title>
          <style>
            body { font-family: Courier, monospace; white-space: pre-wrap; padding: 40px; color: #0f172a; font-size: 0.9rem; line-height: 1.5; }
            h1 { font-family: sans-serif; font-size: 1.3rem; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>VR&E Tuition Tracking & Compliance Brief</h1>
          <div>${text}</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const resetTracker = () => {
    setTermStart('');
    setTuitionDue('');
    setAuthSent('no');
    setScoContacted('no');
    setBooksApproved('no');
    setInvoiceSubmitted('no');
    setPaymentPosted('no');
    setEscalationNarrative('');
  };

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="doc-card text-slate-100"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
          <AlertTriangle size={20} />
        </span>
        <div>
          <h1 className="text-lg font-bold text-slate-100">School Payment Tracker</h1>
          <p className="text-[11px] text-slate-400">Track registration dates, tuition billing milestones, and generate compliance letters for unpaid terms.</p>
        </div>
      </div>

      <div className="doc-divider mb-6"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input form */}
        <div className="lg:col-span-6 space-y-4">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">1. Academic Dates & Deadlines</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/20 p-4 border border-slate-800 rounded-xl">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Term Start Date</label>
              <input
                type="date"
                value={termStart}
                onChange={(e) => setTermStart(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tuition Due Date</label>
              <input
                type="date"
                value={tuitionDue}
                onChange={(e) => setTuitionDue(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200"
              />
            </div>
          </div>

          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">2. Billing & Authorization Milestones</span>

          <div className="space-y-2 bg-slate-900/20 p-4 border border-slate-800 rounded-xl">
            {/* Auth */}
            <div className="flex justify-between items-center text-xs py-1">
              <span className="text-slate-350">Has the counselor uploaded the authorization in Tungsten?</span>
              <select 
                value={authSent} 
                onChange={(e) => setAuthSent(e.target.value)}
                className="bg-slate-900 border-slate-800 text-[11px] rounded p-1 text-slate-200"
                aria-label="Tungsten authorization status"
              >
                <option value="no">No / Pending</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            
            {/* SCO */}
            <div className="flex justify-between items-center text-xs py-1 border-t border-slate-850">
              <span className="text-slate-350">Has the SCO certified your hours in Enrollment Manager?</span>
              <select 
                value={scoContacted} 
                onChange={(e) => setScoContacted(e.target.value)}
                className="bg-slate-900 border-slate-800 text-[11px] rounded p-1 text-slate-200"
                aria-label="Enrollment manager status"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            {/* Books */}
            <div className="flex justify-between items-center text-xs py-1 border-t border-slate-850">
              <span className="text-slate-350">Are your bookstore/supply vouchers authorized?</span>
              <select 
                value={booksApproved} 
                onChange={(e) => setBooksApproved(e.target.value)}
                className="bg-slate-900 border-slate-800 text-[11px] rounded p-1 text-slate-200"
                aria-label="Book vouchers status"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            {/* Invoice */}
            <div className="flex justify-between items-center text-xs py-1 border-t border-slate-850">
              <span className="text-slate-350">Has the school submitted the invoice to VA?</span>
              <select 
                value={invoiceSubmitted} 
                onChange={(e) => setInvoiceSubmitted(e.target.value)}
                className="bg-slate-900 border-slate-800 text-[11px] rounded p-1 text-slate-200"
                aria-label="Invoice status"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            {/* Payment */}
            <div className="flex justify-between items-center text-xs py-1 border-t border-slate-850">
              <span className="text-slate-350">Has the tuition payment posted on your student account?</span>
              <select 
                value={paymentPosted} 
                onChange={(e) => setPaymentPosted(e.target.value)}
                className="bg-slate-900 border-slate-800 text-[11px] rounded p-1 text-slate-200"
                aria-label="Posted status"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </div>

          {/* Status Display */}
          <div className={`p-4 border rounded-xl flex items-start gap-2 bg-slate-950/40 ${
            statusInfo.alert === 'danger' ? 'border-red-500/30' : statusInfo.alert === 'warning' ? 'border-amber-500/30' : 'border-blue-500/30'
          }`}>
            <AlertTriangle size={16} className={
              statusInfo.alert === 'danger' ? 'text-red-400' : statusInfo.alert === 'warning' ? 'text-amber-400' : 'text-blue-400'
            } />
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-200">Payment Health: {statusInfo.label}</span>
              <p className="text-[10px] text-slate-400 leading-normal">
                {statusInfo.alert === 'danger' 
                  ? 'CRITICAL: Your tuition deadline is imminent and no payment has posted. Prepare the Emergency Tuition Escalation letter on the right and email the VREO immediately.'
                  : 'Maintain contact with your school billing office. If tuition is unpaid, remind them that 38 C.F.R. § 21.262 protects you from drops.'
                }
              </p>
            </div>
          </div>

          {/* Narrative */}
          <div>
            <label className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">3. Describe Specific School Impact details</label>
            <textarea
              placeholder="e.g. My school drops classes on June 1st for unpaid balances, or the book voucher is missing preventing me from getting syllabi."
              value={escalationNarrative}
              onChange={(e) => setEscalationNarrative(e.target.value)}
              rows={3}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 resize-none focus:outline-none focus:border-slate-700"
            />
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex justify-between items-center bg-slate-950/30 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-300 font-semibold">Compliance Brief & Escalation</span>
            <div className="flex gap-2">
              <button onClick={resetTracker} className="btn btn-sm btn-secondary flex items-center gap-1">
                <RefreshCw size={12} />
                <span>Reset</span>
              </button>
              <button onClick={handleCopy} className="btn btn-sm btn-secondary flex items-center gap-1">
                {copySuccess ? 'Copied' : 'Copy'}
              </button>
              <button onClick={handlePrint} className="btn btn-sm btn-primary flex items-center gap-1">
                <Printer size={12} />
                <span>Print Memo</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-6 overflow-y-auto max-h-[500px]">
            <pre className="text-[11px] text-slate-355 font-mono leading-relaxed whitespace-pre-wrap select-text">
              {compileTrackerMemo()}
            </pre>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default SchoolPaymentTrackerView;
