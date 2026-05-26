// Database of governing authorities, TA rules, PME milestones, commissioning programs, and graduate programs.

export const IN_SERVICE_PORTALS = [
  {
    id: 'dodi-132225',
    category: 'DoD Voluntary Education',
    authority: 'DoDI 1322.25 — Voluntary Education Programs',
    whatItControls: 'DoD policy for tuition assistance, DoD MOU institutions, counseling, institutional standards, and voluntary education rules.',
    url: 'https://www.esd.whs.mil/Portals/54/Documents/DD/issuances/dodi/132225p.pdf',
    type: 'Binding/policy source page'
  },
  {
    id: 'dodi-132235',
    category: 'DoD Military Education / PME',
    authority: 'DoDI 1322.35, Vol. 1 — Military Education: Program Management and Administration',
    whatItControls: 'DoD policy for organizing, managing, and implementing military education programs.',
    url: 'https://www.esd.whs.mil/Portals/54/Documents/DD/issuances/dodi/132235_vol1.PDF',
    type: 'PME policy source'
  },
  {
    id: 'cjcsi-180001',
    category: 'Officer PME / JPME',
    authority: 'CJCSI 1800.01G — Officer Professional Military Education Policy',
    whatItControls: 'Officer PME and Joint PME policy, Joint Learning Areas, oversight, JPME responsibilities.',
    url: 'https://www.jcs.mil/Portals/36/Documents/Doctrine/education/cjcsi_1800.01g.pdf?ver=0coDQMMSkLNWpcg_prd9Gw%3D%3D',
    type: 'Officer PME / JPME source'
  },
  {
    id: 'cjcsi-180501',
    category: 'Enlisted PME / EJPME',
    authority: 'CJCSI 1805.01C — Enlisted Professional Military Education Policy',
    whatItControls: 'Enlisted PME and Enlisted Joint PME policy.',
    url: 'https://www.jcs.mil/Doctrine/Joint-Education/',
    type: 'Enlisted PME source'
  },
  {
    id: 'dod-cool',
    category: 'DoD COOL',
    authority: 'DoD Credentialing Opportunities On-Line',
    whatItControls: 'Branch credentialing, licenses, certifications, funding links, MOS/rating/AFSC credential mapping.',
    url: 'https://www.cool.osd.mil/',
    type: 'Credentialing hub'
  },
  {
    id: 'dantes',
    category: 'DANTES',
    authority: 'Defense Activity for Non-Traditional Education Support',
    whatItControls: 'CLEP, DSST, exams, testing, education-support programs.',
    url: 'https://www.dantes.mil/',
    type: 'Testing and credit-by-exam hub'
  },
  {
    id: 'jst',
    category: 'JST',
    authority: 'Joint Services Transcript',
    whatItControls: 'Official transcript for military training and experience; used for college credit evaluation.',
    url: 'https://jst.doded.mil/',
    type: 'Transcript / college credit tool'
  },
  {
    id: 'usmap',
    category: 'USMAP',
    authority: 'United Services Military Apprenticeship Program',
    whatItControls: 'Registered apprenticeships for eligible service members.',
    url: 'https://usmap.osd.mil/',
    type: 'Apprenticeship hub'
  }
];

export const TA_BRANCH_RULES = {
  army: {
    branch: 'Army',
    portal: 'ArmyIgnitED / Army TA',
    capAnnual: 4500,
    capSemesterHour: 250,
    capQuarterHour: 166.67,
    keyRules: 'Army TA annual cap is $4,500 and semester-hour cap is 18 SH. First-time TA users must complete ArmyIgnitED training and use the decision-support tool.',
    poc: 'ArmyIgnitED / local education center',
    url: 'https://myarmybenefits.us.army.mil/Benefit-Library/Federal-Benefits/Tuition-Assistance-%28TA%29'
  },
  navy: {
    branch: 'Navy',
    portal: 'Navy College Program',
    capAnnual: 4500, // standard cap
    capSemesterHour: 250,
    capQuarterHour: 166.67,
    keyRules: 'Navy College is the TA/NCPACE portal; Navy COOL lists Navy TA caps at $250 per semester hour, $166.67 per quarter hour, and $16.67 per clock hour for eligible certificate/diploma programs.',
    poc: 'Navy College / NCVEC',
    url: 'https://www.cool.osd.mil/usn/costs_and_funding/index.html?TuitionAssistance='
  },
  marines: {
    branch: 'Marine Corps',
    portal: 'Marine Corps TA / Voluntary Education',
    capAnnual: 4500,
    capSemesterHour: 250,
    capQuarterHour: 166.67,
    keyRules: 'Marine Corps TA authorizes up to 100% tuition, not to exceed $250 per semester hour and $4,500 per fiscal year, subject to command eligibility policies.',
    poc: 'Installation Education Center',
    url: 'https://www.marines.mil/News/Messages/Messages-Display/Article/891373/marine-corps-tuition-assistance-ta-funding-policy/'
  },
  airforce: {
    branch: 'Air Force / Space Force',
    portal: 'AFVEC / DAF TA',
    capAnnual: 4500,
    capSemesterHour: 250,
    capQuarterHour: 166.67,
    keyRules: 'DAF pays up to $250 per semester hour, $166 per quarter hour, not to exceed $4,500 per fiscal year for approved degree programs at DoD MOU schools.',
    poc: 'AFVEC / base education office',
    url: 'https://myairforcebenefits.us.af.mil/Benefit-Library/Federal-Benefits/Military-Tuition-Assistance-%28MilTA%29?serv=20'
  },
  coastguard: {
    branch: 'Coast Guard',
    portal: 'ETQC / Voluntary Education',
    capAnnual: 4500,
    capSemesterHour: 250,
    capQuarterHour: 166.67,
    keyRules: 'Schools must have a current DoD MOU. Degree plans are required after the second course (or 6 SH) or at the start of a certificate program. Student is financially responsible if TA voucher is not approved before course starts.',
    poc: 'ESO / ETQC',
    url: 'https://www.forcecom.uscg.mil/Our-Organization/FORCECOM-UNITS/ETQC/Voluntary-Education/Tuition-Assistance/'
  }
};

export const CLEP_DSST_DATA = [
  {
    program: 'CLEP through DANTES',
    link: 'DANTES CLEP',
    url: 'https://www.dantes.mil/clep/',
    whatItProvides: 'DANTES fully funds one-time free CLEP exams for eligible personnel, letting service members earn college credit for prior knowledge.',
    requirements: 'Eligible military personnel; CAC eligibility verification.'
  },
  {
    program: 'DSST through DANTES',
    link: 'DANTES DSST',
    url: 'https://www.dantes.mil/dsst/',
    whatItProvides: 'DANTES-funded DSST exams help military members earn college credit and reduce TA cost/time toward degree.',
    requirements: 'Eligible military personnel; CAC at testing.'
  },
  {
    program: 'DANTES-funded eligibility',
    link: 'DANTES help center',
    url: 'https://dantes.zendesk.com/hc/en-us/articles/360061399792-Eligible-for-DANTES-funded-CLEP-and-DSST-exams',
    whatItProvides: 'Active duty, Guard, Reserve, Coast Guard, and Coast Guard Reserve members with valid CAC may be eligible.',
    requirements: 'Must present valid CAC at testing.'
  }
];

export const JST_DATA = [
  {
    resource: 'JST official site',
    url: 'https://jst.doded.mil/official.html',
    use: 'View, print, and save unofficial transcripts; request official JSTs to be sent directly to academic institutions.'
  },
  {
    resource: 'ACE Military Guide',
    url: 'https://www.acenet.edu/Programs-Services/Pages/Credit-Evaluation/Military-Guide.aspx',
    use: 'Search ACE credit recommendations for military courses and occupations to understand potential transfer credits.'
  },
  {
    resource: 'VA college-credit guidance',
    url: 'https://www.va.gov/resources/how-do-i-get-college-credits-for-my-military-service/',
    use: 'VA guidelines indicating that while JST maps training to credits, individual schools retain final authority over which credits to accept.'
  }
];

export const COOL_CA_BRANCH_DATA = [
  {
    branch: 'Army COOL / CA',
    portal: 'Army COOL / ArmyIgnitED',
    url: 'https://www.cool.osd.mil/army/costs_and_funding/index.html?credentialingassistance=',
    fundingRules: 'Army CA annual cap is $2,000. Limited to one credential path per fiscal year, maximum of three credentials in a 10-year period. First-time CA users must complete ArmyIgnitED training. Aviation credentials are capped at $1,000/year.'
  },
  {
    branch: 'Navy COOL',
    portal: 'Navy COOL',
    url: 'https://www.cool.osd.mil/usn/index.html',
    fundingRules: 'Maps Navy training/ratings to civilian certifications and licenses. Provides funding for exam vouchers, renewals, and background checks for eligible active and reserve Sailors.'
  },
  {
    branch: 'Marine Corps COOL',
    portal: 'Marine Corps COOL',
    url: 'https://www.cool.osd.mil/usmc/index.html',
    fundingRules: 'Maps Marine Corps MOS to civilian certifications. Authorizes funding for credential exams related to primary MOS, secondary MOS, or leadership certifications.'
  },
  {
    branch: 'Air Force COOL',
    portal: 'Air Force COOL',
    url: 'https://www.cool.osd.mil/usaf/index.html',
    fundingRules: 'AFSC-to-credential mapping. Provides a lifetime cap of $4,500 for eligible enlisted Airmen and Guardians to obtain professional certifications and licenses.'
  },
  {
    branch: 'Coast Guard COOL',
    portal: 'Coast Guard COOL',
    url: 'https://www.cool.osd.mil/uscg/index.html',
    fundingRules: 'Rating-to-credential mapping. Supports exam voucher funding for Coast Guard active duty and reserve members pursuing vocational certifications.'
  }
];

export const PME_BY_BRANCH = {
  joint: [
    {
      level: 'Joint Officer PME',
      program: 'Officer PME / JPME',
      audience: 'Officers',
      purpose: 'Officer PME and JPME policy, Joint Learning Areas, JPME oversight.',
      source: 'CJCSI 1800.01G'
    },
    {
      level: 'Joint Enlisted PME',
      program: 'Enlisted PME / EJPME',
      audience: 'Enlisted',
      purpose: 'Enlisted PME and Enlisted Joint PME policy.',
      source: 'CJCSI 1805.01C / Joint Education page'
    },
    {
      level: 'Naval War College Online PME',
      program: 'Online PME',
      audience: 'Officers, enlisted, DoN civilians',
      purpose: 'Four online PME courses through My Navy Portal; worldwide 24/7 PME access.',
      source: 'Naval War College'
    },
    {
      level: 'JPME Phase I',
      program: 'Naval Command and Staff / JPME Phase I',
      audience: 'Eligible officers and students',
      purpose: 'Six-course online program; completion earns JPME Phase I credit.',
      source: 'Naval War College'
    },
    {
      level: 'AJPME',
      program: 'Advanced Joint PME (Blended)',
      audience: 'Reserve Component officers O-4 to O-6',
      purpose: '40-week blended course; satisfies educational requirement for JQO Level III for RC officers.',
      source: 'MyNavyHR JPME'
    }
  ],
  army: [
    {
      level: 'Junior enlisted leader',
      program: 'Basic Leader Course / BLC',
      audience: 'Sergeants, promotable specialists, corporals',
      purpose: 'BLC prepares sergeants, promotable specialists, and corporals to lead team-level units and forms the foundation for further NCO development.',
      source: 'NCO Worldwide'
    },
    {
      level: 'Mid-level NCO',
      program: 'Advanced Leader Course / ALC',
      audience: 'Staff sergeant-level career development',
      purpose: 'Provides branch-specific technical and tactical training to prepare mid-grade NCOs to lead squad-sized elements.',
      source: 'Army U'
    },
    {
      level: 'Senior NCO',
      program: 'Senior Leader Course / SLC',
      audience: 'Sergeant first class-level development',
      purpose: 'Prepares senior NCOs to lead platoon-sized elements and perform staff functions at company or battalion levels.',
      source: 'Army U'
    },
    {
      level: 'Master-level NCO',
      program: 'Master Leader Course / MLC',
      audience: 'Select senior NCOs (MSG/1SG selects)',
      purpose: 'Prepares senior NCOs for staff duties and leadership roles at battalion level and above, bridging the gap between SLC and SMC.',
      source: 'Army U'
    },
    {
      level: 'Senior enlisted',
      program: 'Sergeants Major Course / SMC',
      audience: 'Senior enlisted leaders (SGM/CSM)',
      purpose: 'The capstone academic institution of the NCO Education System, preparing select NCOs for brigade and higher command staff leadership.',
      source: 'NCO Worldwide'
    }
  ],
  marines: [
    {
      level: 'Enlisted NCO',
      program: 'Sergeant School',
      audience: 'Newly promoted sergeants',
      purpose: 'First level of resident enlisted PME focusing on warfighting, leadership, and command team-level readiness.',
      source: 'MCU College of Enlisted Military Education'
    },
    {
      level: 'SNCO (Mid)',
      program: 'Career School',
      audience: 'Staff sergeant-level PME',
      purpose: 'Develops leadership, combat instruction, and administrative capabilities required of company/battery staff NCOs.',
      source: 'MCU Enlisted PME'
    },
    {
      level: 'SNCO (Senior)',
      program: 'Advanced School',
      audience: 'Gunnery sergeant-level PME',
      purpose: 'Capstones tactical leadership, logistics, and staff integration required of senior company SNCOs.',
      source: 'MCU Enlisted PME'
    },
    {
      level: 'Officer company grade',
      program: 'Expeditionary Warfare School / EWS',
      audience: 'Captains / company-grade officers',
      purpose: 'Professional instruction in amphibious operations, Marine Air-Ground Task Force (MAGTF) staff planning, and tactical leadership.',
      source: 'Marine Corps University'
    },
    {
      level: 'Officer field grade',
      program: 'Command and Staff College / CSC',
      audience: 'Majors / field-grade officers',
      purpose: 'Focuses on joint operations, international security studies, military history, and command staff operational environments.',
      source: 'Marine Corps University'
    },
    {
      level: 'Senior officer',
      program: 'War College / Senior PME',
      audience: 'LtCol / Col-level and equivalent',
      purpose: 'Strategic-level PME focused on national security policy, theater campaign planning, and joint forces command leadership.',
      source: 'Marine Corps University'
    }
  ],
  navy: [
    {
      level: 'Enlisted / Officer Base',
      program: 'Navy College / Education',
      audience: 'Sailors',
      purpose: 'General Navy education and career-development resources, tracking tuition assistance and academic pipelines.',
      source: 'MyNavyHR / local command ESO'
    },
    {
      level: 'Enlisted/Officer PME',
      program: 'Naval War College Online PME',
      audience: 'Officers, enlisted, DoN civilians',
      purpose: 'Four online PME courses through My Navy Portal covering basic, intermediate, and advanced naval warfare.',
      source: 'Naval War College / My Navy Portal'
    },
    {
      level: 'Officer Phase I JPME',
      program: 'JPME Phase I',
      audience: 'Eligible officers/students',
      purpose: 'Six-course Naval Command and Staff online distance education program earning JPME Phase I credit.',
      source: 'Naval War College'
    },
    {
      level: 'Reserve Officer JPME',
      program: 'AJPME',
      audience: 'Reserve Component O-4 to O-6',
      purpose: '40-week blended (online + resident) JPME course satisfying academic requirements for JQO Level III.',
      source: 'CNRFC N7 / MyNavyHR'
    }
  ],
  airforce: [
    {
      level: 'Junior Enlisted PME',
      program: 'Airman Leadership School / ALS',
      audience: 'Junior enlisted leaders (SrA)',
      purpose: 'The first level of Enlisted Professional Military Education, preparing senior airmen to be effective supervisors and team leaders.',
      source: 'AU Barnes Center'
    },
    {
      level: 'Enlisted NCO',
      program: 'NCO Academy / NCOA',
      audience: 'NCOs (SSgt / TSgt)',
      purpose: 'Prepares tech sergeants and staff sergeants to lead flights, squadrons, and manage resources under joint command principles.',
      source: 'AU Barnes Center'
    },
    {
      level: 'Senior NCO capstone',
      program: 'Senior SNCO Academy / SNCOA',
      audience: 'Senior NCOs (MSgt / SMSgt)',
      purpose: 'Prepares senior NCOs to serve as senior enlisted leaders on wing, major command, and joint staffs.',
      source: 'AU Barnes Center'
    },
    {
      level: 'Officer company grade',
      program: 'Squadron Officer School / SOS',
      audience: 'Company-grade officers (Captains)',
      purpose: 'Focuses on leadership development, critical thinking, doctrine, and team cohesion in command-related operations.',
      source: 'Air University'
    },
    {
      level: 'Officer intermediate grade',
      program: 'Air Command and Staff College / ACSC',
      audience: 'Intermediate developmental education (Majors)',
      purpose: 'Prepares intermediate-grade officers to lead joint forces and integrate aerospace capabilities into theater combat operations.',
      source: 'Air University'
    },
    {
      level: 'Senior officer PME',
      program: 'Air War College / AWC',
      audience: 'Senior developmental education (LtCol / Colonel)',
      purpose: 'Capstoning senior officers in national security strategy, coalition warfighting, global threat analysis, and defense planning.',
      source: 'Air University'
    }
  ]
};

export const COMMISSIONING_PROGRAMS = [
  {
    id: 'army-green-to-gold',
    branch: 'Army',
    name: 'Green to Gold (Active Duty Option / Scholarship)',
    requirements: {
      gpa: 2.5,
      citizenship: 'U.S. citizen',
      ageLimit: 'Must complete degree and commission before age 30 (waivers possible up to 39)',
      tis: 'Minimum 2 years of active duty service',
      other: 'GT score of 110 or higher; pass the Army Combat Fitness Test (ACFT); secure acceptance to a university with an Army ROTC program.'
    },
    output: 'Bachelor’s or Master’s degree + commission as an Army Officer',
    url: 'https://goarmy.com/careers-and-jobs/find-your-path/army-officers/green-to-gold'
  },
  {
    id: 'army-ocs',
    branch: 'Army',
    name: 'Army Officer Candidate School (OCS)',
    requirements: {
      gpa: 2.0, // standard college graduation GPA
      citizenship: 'U.S. citizen',
      ageLimit: 'Must commission before age 32 (waivers possible)',
      tis: 'No minimum TIS; available to enlisted Soldiers and college-degreed civilians',
      other: 'Must hold a 4-year college degree; GT score of 110 or higher; secret security clearance.'
    },
    output: 'Commission as an Army Officer (12-week resident program at Fort Moore)',
    url: 'https://goarmy.com/careers-and-jobs/find-your-path/army-officers'
  },
  {
    id: 'navy-sta21',
    branch: 'Navy',
    name: 'STA-21 (Seaman to Admiral-21)',
    requirements: {
      gpa: 2.5, // university admission dependent
      citizenship: 'U.S. citizen',
      ageLimit: 'Varies by program (e.g. Nukes must commission before age 27; Core before 31)',
      tis: 'No minimum TIS; must be on active duty in the Navy or Navy Reserve FTS',
      other: 'Minimum SAT scores (1000 combined) or ACT scores (21 math/English); command recommendation; submit full package matching annual NAVADMIN instructions.'
    },
    output: 'Up to $10,000/year scholarship, remain on active duty with full pay/allowances, earn Bachelor’s degree, commission as Navy Officer',
    url: 'https://www.netc.navy.mil/Commands/Naval-Service-Training-Command/STA-21/'
  },
  {
    id: 'navy-mecp',
    branch: 'Navy',
    name: 'Medical Enlisted Commissioning Program (MECP)',
    requirements: {
      gpa: 2.5,
      citizenship: 'U.S. citizen',
      ageLimit: 'Must commission before 42nd birthday',
      tis: 'Active duty in the Navy, Marine Corps, or Reserves on active status',
      other: 'SAT minimum of 1000 or ACT of 21; command recommendation; acceptance to an accredited baccalaureate nursing program.'
    },
    output: 'Earn a BSN (Bachelor of Science in Nursing) and commission as an Officer in the Nurse Corps',
    url: 'https://www.med.navy.mil/Naval-Medical-Leader-and-Professional-Development-Command/Professional-Development/Enlisted-Commissioning-Programs/-Medical-Enlisted-Commissioning-Programs-/'
  },
  {
    id: 'usmc-mecep',
    branch: 'Marine Corps',
    name: 'MECEP (Marine Enlisted Commissioning Education Program)',
    requirements: {
      gpa: 2.5, // college dependent
      citizenship: 'U.S. citizen',
      ageLimit: 'Must commission before age 30 (waiverable up to 35)',
      tis: 'Minimum 3 years of active duty service (or active reserve)',
      other: 'GT score of 115 or higher (or SAT 1000 / ACT 22); command recommendation; attend 10-week Officer Candidates School (OCS); attend college full-time at an NROTC-affiliated school while retaining active duty pay.'
    },
    output: 'Bachelor’s degree + commission as a Second Lieutenant',
    url: 'https://www.mcrc.marines.mil/Marine-Officer/Officer-Naval-Enlisted-Applicants/'
  },
  {
    id: 'usmc-ecp',
    branch: 'Marine Corps',
    name: 'ECP (Enlisted Commissioning Program)',
    requirements: {
      gpa: 2.0, // standard graduation
      citizenship: 'U.S. citizen',
      ageLimit: 'Must commission before age 30 (waiverable up to 35)',
      tis: 'Minimum 1 year of active service',
      other: 'Must already hold a 4-year degree from an accredited college; GT score of 115 or higher; pass command screening and OCS.'
    },
    output: 'Direct path to OCS + commission as a Second Lieutenant',
    url: 'https://www.manpower.marines.mil/Divisions/Manpower-Management/Enlisted-Assignments/Stay-Marine/Enlisted-to-Officer-Programs/'
  },
  {
    id: 'usmc-mcpr',
    branch: 'Marine Corps',
    name: 'MCP-R (Meritorious Commissioning Program Reserve)',
    requirements: {
      gpa: 2.0,
      citizenship: 'U.S. citizen',
      ageLimit: 'Must commission before age 30 (waiverable)',
      tis: 'Minimum 1 year of service in the Select Marine Corps Reserve (SMCR)',
      other: 'Associate’s degree or 75 completed semester hours; nominated by command; attend OCS.'
    },
    output: 'Reserve commission as a Second Lieutenant',
    url: 'https://www.manpower.marines.mil/Divisions/Manpower-Management/Enlisted-Assignments/Stay-Marine/Enlisted-to-Officer-Programs/'
  },
  {
    id: 'usmc-eja',
    branch: 'Marine Corps',
    name: 'Enlisted to Judge Advocate (E-JA)',
    requirements: {
      gpa: 3.0, // LSAT score dependent
      citizenship: 'U.S. citizen',
      ageLimit: 'Varies by LSAT and law school timeline',
      tis: 'Active duty enlisted Marine',
      other: 'Must hold a Bachelor’s degree; pass the LSAT exam; gain acceptance to an accredited ABA law school; complete OCS.'
    },
    output: 'Law degree + commission as a Marine Judge Advocate (Law Officer)',
    url: 'https://www.manpower.marines.mil/Divisions/Manpower-Management/Enlisted-Assignments/Stay-Marine/Enlisted-to-Officer-Programs/'
  },
  {
    id: 'af-lead',
    branch: 'Air Force',
    name: 'LEAD (Leaders in Enlisted Advancement to the Academy)',
    requirements: {
      gpa: 3.0,
      citizenship: 'U.S. citizen',
      ageLimit: 'Must not have passed 23rd birthday by July 1st of entry year (Prep School limit is 22)',
      tis: 'Active duty Airman/Guardian (or Guard/Reserve)',
      other: 'Unmarried; no dependents; meet USAFA academic and physical standards; commander nomination.'
    },
    output: 'Appointment to the Air Force Academy (USAFA) or USAFA Prep School, leading to Bachelor’s degree + commission',
    url: 'https://www.academyadmissions.com/prepare/enlisted/'
  },
  {
    id: 'af-pocerp',
    branch: 'Air Force',
    name: 'POC-ERP (Professional Officer Course-Early Release Program)',
    requirements: {
      gpa: 2.5,
      citizenship: 'U.S. citizen',
      ageLimit: 'Must commission before age 30 (waivers possible up to 39)',
      tis: 'Minimum 1 year of active service (or active Guard/Reserve)',
      other: 'Early discharge from active duty to join AFROTC full-time; must be able to complete degree requirements in 2 years or less.'
    },
    output: 'Early release to attend college + commission through AFROTC',
    url: 'https://www.afrotc.com/scholarships/enlisted/poc-erp_necp/'
  },
  {
    id: 'af-necp',
    branch: 'Air Force',
    name: 'NECP (Nurse Enlisted Commissioning Program)',
    requirements: {
      gpa: 3.0,
      citizenship: 'U.S. citizen',
      ageLimit: 'Must commission before 42nd birthday',
      tis: 'Minimum 1 year active service; minimum rank E-4',
      other: 'Worldwide qualified; maintain active duty pay/status while completing a full-time nursing degree program.'
    },
    output: 'Nursing degree + commission in the Nurse Corps',
    url: 'https://www.af.mil/News/Article-Display/Article/2045011/nurse-enlisted-commissioning-program-application-window-now-open/'
  },
  {
    id: 'joint-emdp2',
    branch: 'Air Force', // Jointly managed, USUHS based
    name: 'EMDP2 (Enlisted to Medical Degree Preparatory Program)',
    requirements: {
      gpa: 3.2,
      citizenship: 'U.S. citizen',
      ageLimit: 'Must commission before age 42',
      tis: 'Minimum 36 months of active service; maximum 10 years of active service',
      other: 'SAT minimum 1200 or ACT 26; command recommendation; hold a Bachelor’s degree with a solid academic track.'
    },
    output: '2-year full-time post-baccalaureate pre-med prep at USUHS while remaining on active duty with full pay and benefits, leading to medical school application.',
    url: 'https://medschool.usuhs.edu/academics/emdp2/program-description'
  }
];

export const GRADUATE_PROGRAMS = [
  {
    id: 'nps',
    branch: 'Navy',
    name: 'Naval Postgraduate School (NPS)',
    requirements: 'Active-duty Navy, Marine Corps, Coast Guard, or select other services. Admissions are community-specific; PhD applicants require annual board selections and PERS package submissions.',
    output: 'Subspecialty credentials, Graduate Certificates, Master\'s, or PhD degrees',
    url: 'https://nps.web/admissions/programs'
  },
  {
    id: 'afit',
    branch: 'Air Force',
    name: 'AFIT Graduate School of Engineering & Management',
    requirements: 'Air Force and Space Force officers, as well as select other branch personnel. Officers apply through the Advanced Academic Degree / SPEED processes at AFPC.',
    output: 'In-residence or distance learning Graduate degrees and professional certificates',
    url: 'https://www.afit.edu/ADMISSIONS/page.cfm?page=472&tabname=Tab3A'
  },
  {
    id: 'army-acs',
    branch: 'Army',
    name: 'Advanced Civil Schooling (ACS)',
    requirements: 'Regular Army or Voluntary Indefinite officer; generally not more than 17 years of Active Federal Service (AFS) at entry; undergraduate degree in appropriate discipline.',
    output: 'Fully funded advanced degree (Master\'s/PhD) at civilian schools for Army-required roles',
    url: 'https://myarmybenefits.us.army.mil/Benefit-Library/Federal-Benefits/Advanced-Civil-Schooling-%28ACS%29?serv=123'
  },
  {
    id: 'usuhs-md',
    branch: 'Joint',
    name: 'Uniformed Services University (USUHS) MD Program',
    requirements: 'Enlisted service members or civilians. Age limit generally 18-36 at matriculation (waiverable). Requires at least a 7-year active duty service commitment after graduation and residency.',
    output: 'Doctor of Medicine (MD) degree + commission in the Medical Corps',
    url: 'https://medschool.usuhs.edu/admissions/application-requirements'
  }
];

export const BRANCH_PORTAL_CONTACTS = [
  {
    branch: 'Army',
    portals: ['ArmyIgnitED', 'Army COOL', 'Army University', 'NCO Leadership Center of Excellence'],
    poc: 'Local Education Center; ArmyIgnitED Helpdesk; Unit schools channel.'
  },
  {
    branch: 'Navy',
    portals: ['Navy College Program', 'Navy COOL', 'MyNavyHR Education'],
    poc: 'MyNavy Career Center: 833-330-MNCC, 901-874-MNCC, DSN 882-6622. Navy COOL Email: navycool@us.navy.mil.'
  },
  {
    branch: 'Marine Corps',
    portals: ['Installation Education Center', 'Marine Corps University', 'MCRC Enlisted-to-Officer', 'Marine Corps COOL'],
    poc: 'Local Installation Education Center; Battalion Career Planner; MCRC Officer Programs.'
  },
  {
    branch: 'Air Force / Space Force',
    portals: ['AFVEC', 'Air University', 'AFIT Graduate School', 'AF COOL', 'AFPC'],
    poc: 'Base Education Office; AFPC Detachments; Air University Registrar for PME transcripts.'
  },
  {
    branch: 'Coast Guard',
    portals: ['ETQC Voluntary Education', 'Coast Guard COOL', 'Work-Life Office / ESO'],
    poc: 'Unit Educational Services Officer (ESO); ETQC helpdesk; Local command education support.'
  }
];
