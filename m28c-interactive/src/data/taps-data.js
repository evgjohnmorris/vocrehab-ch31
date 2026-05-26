// Military Transition Assistance Program (TAP) Reference & Planning Data

export const TAPS_BRANCHES = {
  army: {
    id: 'army',
    name: 'U.S. Army',
    program: 'Soldier for Life – Transition Assistance Program (SFL-TAP)',
    portalUrl: 'https://www.sfl-tap.army.mil',
    supportPhone: '1-888-276-9472',
    colorTheme: {
      primary: '#4b5320', // Olive Drab
      secondary: '#d4af37', // Gold
      bgGradient: 'from-emerald-950/20 to-emerald-900/10'
    },
    resources: [
      { name: 'Army SFL-TAP Portal', url: 'https://www.sfl-tap.army.mil' },
      { name: 'Army TAP Interactive Map & Directory', url: 'https://www.sfl-tap.army.mil/locations' },
      { name: 'Army SkillBridge Guidelines', url: 'https://skillbridge.mil/military-members' }
    ]
  },
  navy: {
    id: 'navy',
    name: 'U.S. Navy',
    program: 'Navy Transition Assistance Program (TAP) / Fleet & Family Support',
    portalUrl: 'https://www.cnic.navy.mil/ffr/family_readiness/fleet_and_family_support_program/transition_assistance_program.html',
    supportPhone: '1-866-923-6478',
    colorTheme: {
      primary: '#0a1172', // Navy Blue
      secondary: '#c5a059', // Gold
      bgGradient: 'from-blue-950/20 to-blue-900/10'
    },
    resources: [
      { name: 'Navy Transition Assistance Program', url: 'https://www.mynavyhr.navy.mil/Career-Management/Transition/' },
      { name: 'Fleet and Family Support Center Locator', url: 'https://www.cnic.navy.mil/' },
      { name: 'Navy SkillBridge Authorization Policy', url: 'https://skillbridge.mil' }
    ]
  },
  airforce: {
    id: 'airforce',
    name: 'U.S. Air Force',
    program: 'Air Force TAP / Military & Family Readiness Center (M&FRC)',
    portalUrl: 'https://www.afpc.af.mil/Airman-and-Family/Transition-Assistance-Program/',
    supportPhone: '1-800-525-0102',
    colorTheme: {
      primary: '#003087', // Air Force Blue
      secondary: '#a6a6a6', // Silver
      bgGradient: 'from-cyan-950/20 to-cyan-900/10'
    },
    resources: [
      { name: 'AFPC Transition Support', url: 'https://www.afpc.af.mil/Airman-and-Family/Transition-Assistance-Program/' },
      { name: 'Air Force SkillBridge Instruction', url: 'https://skillbridge.mil' },
      { name: 'AF Portal Transition Guides', url: 'https://my.af.mil' }
    ]
  },
  marines: {
    id: 'marines',
    name: 'U.S. Marine Corps',
    program: 'Marine Corps Transition Readiness Program (TRP) / TRS',
    portalUrl: 'https://www.usmc-mccs.org/services/support/transition-readiness/',
    supportPhone: '1-703-784-9550',
    colorTheme: {
      primary: '#990000', // Crimson/Scarlet
      secondary: '#cc9900', // Gold
      bgGradient: 'from-red-950/20 to-red-900/10'
    },
    resources: [
      { name: 'MCCS Transition Readiness Seminar (TRS)', url: 'https://www.usmc-mccs.org/services/support/transition-readiness/' },
      { name: 'USMC SkillBridge Order (MARADMIN)', url: 'https://www.marines.mil' },
      { name: 'Marine For Life Network', url: 'https://www.marineforlife.org' }
    ]
  },
  coastguard: {
    id: 'coastguard',
    name: 'U.S. Coast Guard',
    program: 'USCG Transition Assistance Program / Office of Work-Life',
    portalUrl: 'https://www.dcms.uscg.mil/Our-Organization/Assistant-Commandant-for-Human-Resources-CG-1/Health-Safety-and-Work-Life-CG-11/Office-of-Work-Life-CG-111/Transition-Assistance-Program/',
    supportPhone: '1-800-872-4745',
    colorTheme: {
      primary: '#0056b3', // Coast Guard Blue
      secondary: '#dc3545', // Red
      bgGradient: 'from-indigo-950/20 to-indigo-900/10'
    },
    resources: [
      { name: 'USCG Office of Work-Life TAP', url: 'https://www.dcms.uscg.mil/worklife/transition/' },
      { name: 'USCG SkillBridge Participation Request', url: 'https://skillbridge.mil' },
      { name: 'USCG Transition Guide PDF', url: 'https://www.dcms.uscg.mil' }
    ]
  },
  spaceforce: {
    id: 'spaceforce',
    name: 'U.S. Space Force',
    program: 'USSF Transition Assistance Program (Space Force TAP)',
    portalUrl: 'https://www.spaceforce.mil',
    supportPhone: '1-800-525-0102',
    colorTheme: {
      primary: '#000018', // Deep Space Navy
      secondary: '#c0c0c0', // Platinum
      bgGradient: 'from-slate-950/40 to-slate-900/20'
    },
    resources: [
      { name: 'Space Force Transition Assistance Portal', url: 'https://www.spaceforce.mil' },
      { name: 'Guardian SkillBridge Internship Rules', url: 'https://skillbridge.mil' }
    ]
  }
};

export const TAPS_TIMELINE_CHECKPOINTS = [
  {
    daysRemaining: 730,
    title: 'Retirement Window Planning Opens',
    phase: 'Initial',
    importance: 'optional',
    description: 'For career personnel planning retirement, the transition window officially opens. You can start requesting educational and financial assessments.',
    requirements: ['Review pre-retirement worksheets', 'Locate service record logs']
  },
  {
    daysRemaining: 365,
    title: 'Mandatory Initial Counseling & Pre-Separation briefing',
    phase: 'Mandatory Core',
    importance: 'critical',
    description: 'By law (10 U.S.C. 1142), you must initiate your TAP process at least 365 days before separation. Contact your command counselor to schedule your Initial Counseling (IC) and pre-separation briefing.',
    requirements: ['Initiate eForm DD-2648 on milConnect', 'Complete branch-specific self-assessment', 'Schedule Core TAP workshop days']
  },
  {
    daysRemaining: 180,
    title: 'DoD SkillBridge Eligibility & VA BDD Claim Windows Open',
    phase: 'Career & Claims Start',
    importance: 'high',
    description: 'You are now eligible to start approved civilian internships under the DoD SkillBridge program (up to 180 days before separation). The VA Benefits Delivery at Discharge (BDD) disability claim filing window also opens (180 to 90 days out).',
    requirements: ['Submit commander SkillBridge approval request', 'Gather active duty medical records', 'Prepare VA Form 21-526EZ for BDD submission']
  },
  {
    daysRemaining: 90,
    title: 'VA BDD Claim Deadline & Mandatory Capstone Review',
    phase: 'Final Audits',
    importance: 'critical',
    description: 'This is the final deadline to submit a VA disability claim under the BDD program to receive ratings immediately upon discharge. You must also complete your Capstone Review (command/counselor sign-off on Career Readiness Standards).',
    requirements: ['Finalize VA BDD disability application', 'Assemble transition budget & job applications', 'Complete and sign DD-2648 eForm with Transition Counselor']
  },
  {
    daysRemaining: 60,
    title: 'Separation Health Assessment & Out-Processing',
    phase: 'Clearing Installation',
    importance: 'high',
    description: 'Complete your Separation Health Assessment (SHA) physical exam. Start clearing installation departments (housing, supply, dental, finance).',
    requirements: ['Attend Separation Health Assessment (SHA) exam', 'Clear CIF (Central Issue Facility) and base supply', 'Obtain dental health certification']
  },
  {
    daysRemaining: 30,
    title: 'Terminal Leave & Transition Out-Processing',
    phase: 'Terminal Phase',
    importance: 'optional',
    description: 'Begin transitional terminal leave (accrued leave) if authorized by command. Ensure final direct deposit information is correct for final paycheck.',
    requirements: ['Submit terminal leave orders', 'Perform final finance audit with command pay office', 'Download final LES (Leave and Earnings Statement)']
  },
  {
    daysRemaining: 0,
    title: 'Separation Date & DD-214 Issuance',
    phase: 'Transition Complete',
    importance: 'critical',
    description: 'Your military service concludes. Receive your DD-214 Member-4 copy. Register on VA.gov to access health care and subsistence benefits.',
    requirements: ['Acquire official signed DD Form 214', 'Apply for VA Health Care enrollment', 'Verify direct deposit for subsistence allowance payouts']
  }
];

export const TAPS_MOC_CROSSWALK = [
  {
    category: 'Combat Arms & Security',
    branches: ['MOS 11B/19D (Army)', 'Rating SO/SB (Navy)', 'AFSC 3P0X1 (Air Force)', 'MOS 0311/0321 (Marines)'],
    civilianEquivalent: 'Security Manager, Operations Supervisor, Corporate Security Director, Emergency Management Coordinator, Logistics Manager',
    keywords: [
      'Operational leadership under pressure',
      'Crisis management and threat mitigation',
      'Asset protection and risk assessment',
      'Resource logistics and tactical planning',
      'Standard operating procedure (SOP) compliance'
    ]
  },
  {
    category: 'Cyber, Comms, & Information Technology',
    branches: ['MOS 25B/17C (Army)', 'Rating IT/CT (Navy)', 'AFSC 1D7X1 (Air Force)', 'MOS 0621/0671 (Marines)'],
    civilianEquivalent: 'Network Administrator, Cybersecurity Analyst, Cloud Architect, Systems Engineer, IT Support Supervisor',
    keywords: [
      'Systems security administration',
      'Network infrastructure configuration',
      'Troubleshooting and helpdesk management',
      'Information assurance compliance (DoDI 8570)',
      'Hardware deployment and software migration'
    ]
  },
  {
    category: 'Logistics, Supply, & Supply Chain',
    branches: ['MOS 92Y/88M (Army)', 'Rating LS/SH (Navy)', 'AFSC 2G0X1 (Air Force)', 'MOS 3043/0431 (Marines)'],
    civilianEquivalent: 'Supply Chain Coordinator, Inventory Control Specialist, Logistics Director, Warehouse Operations Manager',
    keywords: [
      'Inventory control and supply chain logistics',
      'Property accountability management',
      'Procurement coordination and cost savings',
      'Shipping, receiving, and distribution oversight',
      'Fleet operations and vehicle maintenance schedules'
    ]
  },
  {
    category: 'Healthcare & Emergency Services',
    branches: ['MOS 68W (Army)', 'Rating HM (Navy)', 'AFSC 4N0X1 (Air Force)', 'Medic (Corpsman attached to Marines)'],
    civilianEquivalent: 'Emergency Medical Technician (EMT), Clinic Operations Manager, Physician Assistant Candidate, Medical Assistant',
    keywords: [
      'Emergency medical triage and trauma care',
      'Clinical operations and patient intake',
      'Medical record compliance (HIPAA)',
      'Pharmaceutical inventory control',
      'Healthcare safety and sanitation standards'
    ]
  },
  {
    category: 'Aviation Maintenance & Flight Ops',
    branches: ['MOS 15T/15U (Army)', 'Rating AD/AM (Navy)', 'AFSC 2A6X1 (Air Force)', 'MOS 6114/6217 (Marines)'],
    civilianEquivalent: 'Aerospace Technician, Aircraft Mechanic (A&P), Aviation Safety Inspector, Quality Assurance Lead',
    keywords: [
      'FAA A&P standards compliance',
      'Hydraulic, fuel, and electrical troubleshooting',
      'Quality assurance and airworthiness inspections',
      'Preventative maintenance scheduling',
      'Technical manual documentation review'
    ]
  },
  {
    category: 'Human Resources & Administration',
    branches: ['MOS 42A (Army)', 'Rating YN/PS (Navy)', 'AFSC 3F0X1 (Air Force)', 'MOS 0111 (Marines)'],
    civilianEquivalent: 'Human Resources Generalist, Office Manager, Records Compliance Officer, Recruiting Coordinator',
    keywords: [
      'Personnel record administration',
      'Benefits eligibility compliance tracking',
      'Executive correspondence preparation',
      'Onboarding and scheduling coordination',
      'Database entries and data confidentiality'
    ]
  }
];

export const TAPS_ITP_TEMPLATES = [
  {
    id: 'skillbridge_rational',
    name: 'DoD SkillBridge Commander Rationale Memo',
    purpose: 'Drafts a formal justification memo to your Commanding Officer requesting authorization to participate in the SkillBridge internship program.',
    template: `MEMORANDUM FOR RECORD

FROM: {{rank}} {{userName}}
TO: Commanding Officer, {{unitName}}
SUBJECT: Request to Participate in Department of Defense SkillBridge Program

1. Under Department of Defense Instruction (DoDI) 1322.29 and my service branch transition policies, I request authorization to participate in the DoD SkillBridge internship program with the host employer: {{civilianEmployer}}.

2. PROGRAM DETAILS:
   - Internship Position: {{civilianJob}}
   - Start Date: {{skillbridgeStart}}
   - End Date: {{separationDate}}
   - Duration: {{durationDays}} days (not to exceed 180 days prior to separation)

3. SERVICE MEMBER CONFIRMATION:
   - I have completed (or will complete) all mandatory Transition Assistance Program (TAP) counseling, including Initial Counseling and Pre-Separation briefings, prior to the start of this internship.
   - I understand that I will remain on active duty status, and my unit maintains administrative and military justice recall authority.
   - I have verified that this provider is an officially registered DoD SkillBridge partner.

4. COMMAND JUSTIFICATION:
   - My primary military duties ({{serviceConnectedConditions}}) will be fully handed off to {{handOffName}} by date {{handOffDate}} to prevent unit readiness degradation.
   - This training directly supports my post-transition career goal: {{civilianJob}}. Participating in this program will greatly reduce my transition stressors and ensure a seamless entry into civilian employment.

5. I request your approval of this career-readiness internship. Thank you for your support of my transition.

Respectfully submitted,

{{userName}}
{{rank}}, {{serviceBranch}}`
  },
  {
    id: 'terminal_leave',
    name: 'Transitional Terminal Leave Request Justification',
    purpose: 'Generates a support statement to attach to your command leave request showing that transition requirements are complete.',
    template: `MEMORANDUM FOR RECORD

Veteran Student: {{userName}}
Unit: {{unitName}}
Date: {{date}}

SUBJECT: Request for Transitional Terminal Leave Rationale

1. I request command authorization to utilize {{durationDays}} days of accumulated transition terminal leave starting {{skillbridgeStart}} through my official separation date of {{separationDate}}.

2. REQUISITE TRANSITION STATUS:
   - Mandatory Counseling eForm DD-2648: SIGNED and completed on {{handOffDate}}.
   - Final Separation Health Assessment (SHA) Exam: Completed on {{handOffDate}}.
   - Installation Clearance: Scheduled to clear all required departments by {{handOffDate}}.

3. OUT-PROCESSING CONTEXT:
   - I have coordinated with the supply clerk to clear my property accountability records (CIF) on {{handOffDate}}.
   - All critical military files and handoffs have been transferred to {{handOffName}} to preserve unit coverage.

4. Request your approval to start terminal leave.

{{userName}}
{{rank}}, U.S. Military`
  }
];
