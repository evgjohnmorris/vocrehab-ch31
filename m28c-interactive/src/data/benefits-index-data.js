export const BENEFITS_CATEGORIES = [
  { id: "health", name: "Health Care & Medical Access", icon: "Activity" },
  { id: "disability", name: "Disability Compensation & SMC", icon: "ShieldAlert" },
  { id: "pension", name: "Pension & Income Support", icon: "DollarSign" },
  { id: "education", name: "Education & Training", icon: "GraduationCap" },
  { id: "vre", name: "VR&E / Chapter 31", icon: "Briefcase" },
  { id: "employment", name: "Employment & Federal Hiring", icon: "Award" },
  { id: "housing", name: "Housing & Home Loans", icon: "Home" },
  { id: "homelessness", name: "Homelessness & Housing Stability", icon: "Shield" },
  { id: "family", name: "Family, Caregiver & Survivor Benefits", icon: "Users" },
  { id: "insurance", name: "Insurance", icon: "FileText" },
  { id: "burial", name: "Burial & Memorial", icon: "FileText" },
  { id: "business", name: "Business & Contracting", icon: "Briefcase" },
  { id: "commissary", name: "Commissary / Exchange / MWR Access", icon: "Award" },
  { id: "records", name: "Records, IDs & Proof of Service", icon: "FileText" },
  { id: "legal", name: "Legal Rights & Protections", icon: "Scale" },
  { id: "state", name: "State / Local / Tribal Benefits", icon: "Map" },
  { id: "transportation", name: "Transportation & Adaptive Mobility", icon: "Activity" },
  { id: "assistive", name: "Assistive Technology & Accessibility", icon: "Compass" },
  { id: "justice", name: "Justice-Involved / Reentry", icon: "Scale" },
  { id: "appeals", name: "Forms, Records Requests & Appeals", icon: "FileEdit" },
  { id: "career_tech", name: "Career, Tech & Transition Programs", icon: "Compass" }
];

export const BENEFITS_INDEX = [
  // 1. Health Care & Medical Access
  {
    id: "va-healthcare-enrollment",
    categoryId: "health",
    name: "VA Health Care Enrollment",
    authority: "38 U.S.C. Chapter 17; 38 C.F.R. Part 17",
    qualifies: "Veterans who served in active military, naval, or air service and were discharged under conditions other than dishonorable. Enhanced eligibility applies to combat veterans, lower income levels, and those with service-connected disabilities.",
    provides: "Comprehensive health services including preventive care, primary care, specialty care, mental health care, surgery, and inpatient hospitalization.",
    formOrPortal: "VA Form 10-10EZ (or online application via VA.gov)",
    evidence: "DD Form 214 showing character of service, health insurance information, and household income details.",
    deadlines: "None. Veterans can apply at any time after separation, though combat veterans discharged on or after Oct 1, 2013, have an enhanced 10-year enrollment window.",
    denialReason: "Dishonorable character of discharge; failure to meet minimum active duty service requirements (generally 24 continuous months for enlistments after Sept 7, 1980).",
    nextAction: "File VA Form 10-10EZ online or visit the nearest VA medical center eligibility office.",
    related: ["va-community-care", "prescriptions-copay"],
    warning: "State and local VA facilities may have differing clinic availability or wait times, and travel pay criteria vary."
  },
  {
    id: "va-community-care",
    categoryId: "health",
    name: "VA Community Care Program",
    authority: "38 U.S.C. § 1703; VA MISSION Act of 2018",
    qualifies: "Enrolled veterans who meet at least one of six criteria: VA does not offer the required service, state lacks a full-service facility, veteran meets the 30-day/20-day drive-time standard, care standards aren't met, or in the veteran's best medical interest.",
    provides: "Authorization to receive medical care from approved private providers in the community, paid for by the VA.",
    formOrPortal: "Referral authorized directly by VA primary care provider and community care staff.",
    evidence: "Medical justification from a VA provider showing that VA-facility care is unavailable or causes excessive drive/wait times.",
    deadlines: "Must obtain pre-authorization from VA before receiving non-emergency community care.",
    denialReason: "Seeking care without prior VA approval; drive/wait times do not exceed statutory thresholds (30 min for primary/mental care, 60 min for specialty care).",
    nextAction: "Request a community care referral from your VA primary care physician during your clinic visit.",
    related: ["va-healthcare-enrollment", "urgent-care-access"],
    warning: "Veterans must ensure the private provider is in the VA Community Care Network (CCN); otherwise, the veteran is liable for costs."
  },

  // 2. Disability Compensation & SMC
  {
    id: "disability-compensation",
    categoryId: "disability",
    name: "VA Disability Compensation",
    authority: "38 U.S.C. § 1110 (Wartime) & § 1131 (Peacetime)",
    qualifies: "Veterans with a current physical or mental disability caused or aggravated by events, injuries, or illnesses during active duty service.",
    provides: "Tax-free monthly monetary payments based on combined disability rating (10% to 100%), and access to ancillary benefits.",
    formOrPortal: "VA Form 21-526EZ (online via VA.gov or QuickSubmit)",
    evidence: "DD Form 214, service treatment records (STRs), current medical diagnosis/nexus statement, and personal/buddy statements.",
    deadlines: "None. However, filing within 1 year of separation preserves the effective date back to the discharge date.",
    denialReason: "No current diagnosis; no in-service event or injury documented; lack of medical nexus (link) between current condition and service.",
    nextAction: "File an Intent to File (VA Form 21-0966) immediately to lock in your effective date, then gather medical evidence and file Form 21-526EZ.",
    related: ["special-monthly-compensation", "dependency-allowance"],
    warning: "State property tax exemptions and tuition waivers are tied to specific disability rating percentages, often requiring 100% P&T or IU."
  },
  {
    id: "special-monthly-compensation",
    categoryId: "disability",
    name: "Special Monthly Compensation (SMC)",
    authority: "38 U.S.C. § 1114; 38 C.F.R. § 3.350",
    qualifies: "Veterans who have service-connected disabilities resulting in severe impairment such as loss of use of limbs, blindness, housebound status, or needing Aid and Attendance.",
    provides: "Higher monthly tax-free compensation rates (SMC-K through SMC-R) added to or replacing standard disability rates.",
    formOrPortal: "VA Form 21-2680 (for Aid & Attendance) or claimed as part of VA Form 21-526EZ.",
    evidence: "Comprehensive medical evaluation showing need for daily assistance with activities of daily living (bathing, dressing, eating) or anatomical loss.",
    deadlines: "None. Can be claimed whenever the severity criteria are medically met.",
    denialReason: "Medical documentation does not show a constant need for daily assistance or the specific loss/loss of use criteria are not met.",
    nextAction: "Have a treating physician complete VA Form 21-2680 detailing physical and cognitive limitations, then upload via QuickSubmit.",
    related: ["disability-compensation", "aid-attendance-pension"],
    warning: "SMC evaluations can trigger a re-examination of your existing ratings, which carries a risk of reduction if conditions have improved."
  },

  // 3. Pension & Income Support
  {
    id: "veterans-pension",
    categoryId: "pension",
    name: "Veterans Non-Service-Connected Pension",
    authority: "38 U.S.C. § 1521; 38 C.F.R. § 3.3",
    qualifies: "Wartime veterans who are age 65 or older, OR permanently and totally disabled, AND have household income and net worth below limits set by Congress ($155,656 for 2026).",
    provides: "Monthly tax-free payment equal to the difference between the veteran's countable income and the Maximum Annual Pension Rate (MAPR).",
    formOrPortal: "VA Form 21P-527EZ",
    evidence: "DD Form 214 showing wartime service (at least 90 days with 1 day of wartime), detailed asset list, income records, and medical records if under age 65.",
    deadlines: "None. Benefits are effective from the date of application receipt.",
    denialReason: "Household income or net worth exceeds statutory limits; lack of qualifying wartime service dates; character of discharge.",
    nextAction: "File VA Form 21P-527EZ along with complete financial declarations and medical reports.",
    related: ["aid-attendance-pension", "survivors-pension"],
    warning: "VA performs look-back audits on asset transfers made within 3 years of application to prevent asset-dumping to meet limits."
  },

  // 4. Education & Training
  {
    id: "post-911-gi-bill",
    categoryId: "education",
    name: "Post-9/11 GI Bill (Chapter 33)",
    authority: "38 U.S.C. Chapter 33; 38 C.F.R. Part 21 Subpart P",
    qualifies: "Veterans with at least 90 days of aggregate active service after Sept 10, 2001, or discharged with a service-connected disability after 30 continuous days.",
    provides: "Up to 36 months of tuition/fees (capped at public rate or private cap), Monthly Housing Allowance (MHA), and books/supplies stipend.",
    formOrPortal: "VA Form 22-1990 (online via VA.gov)",
    evidence: "DD Form 214, Certificate of Eligibility (COE) issued by VA, and school program enrollment certifications.",
    deadlines: "For veterans discharged before Jan 1, 2013, benefits expire 15 years after discharge. For those discharged on or after Jan 1, 2013, benefits do not expire.",
    denialReason: "Dishonorable discharge; insufficient qualifying active duty service; entitlement fully exhausted.",
    nextAction: "Apply for a Certificate of Eligibility (COE) online via VA.gov, then submit the COE to your school's certifying official.",
    related: ["yellow-ribbon-program", "vet-tec-2"],
    warning: "Tuition caps for private schools adjust annually. Housing rates are based on the school campus ZIP code, not the home address."
  },

  // 5. VR&E / Chapter 31
  {
    id: "vre-chapter-31",
    categoryId: "vre",
    name: "Veteran Readiness and Employment (VR&E)",
    authority: "38 U.S.C. Chapter 31; 38 C.F.R. Part 21 Subpart A",
    qualifies: "Veterans with a service-connected disability rating of 20% or more (or 10% under special circumstances) and an employment handicap.",
    provides: "Comprehensive evaluations, career counseling, rehabilitation planning, college/vocational training funding, books/supplies, assistive tech, and job placement support.",
    formOrPortal: "VA Form 28-1900 (online via VA.gov)",
    evidence: "VA rating decision showing service connection, vocational goals, and medical documentation of limitations.",
    deadlines: "For veterans discharged before Jan 1, 2013, eligibility is 12 years from rating or discharge. No expiration for discharges after Jan 1, 2013.",
    denialReason: "No service-connected rating; counselor determines no 'employment handicap' exists; veteran is determined capable of employment without training.",
    nextAction: "Submit VA Form 28-1900, schedule an initial counseling session, and compile evidence of how your disability interferes with your career.",
    related: ["retroactive-induction", "subsistence-allowance-ch31"],
    warning: "Chapter 31 is an employment program, not an education program. Training is only authorized if it directly resolves your employment handicap."
  },

  // 6. Employment & Federal Hiring
  {
    id: "veterans-preference-federal",
    categoryId: "employment",
    name: "Federal Veterans' Preference",
    authority: "5 U.S.C. § 2108, § 3309; 5 C.F.R. Part 211",
    qualifies: "Veterans who served during designated wartime eras, campaigns, or have a service-connected disability rating. 5-point or 10-point preference applies.",
    provides: "Added points (5 or 10) on civil service exams, or preferential hiring placement on competitive federal job certificates.",
    formOrPortal: "SF-15 (Application for 10-Point Veteran Preference) uploaded to USAJOBS.",
    evidence: "DD Form 214 showing qualifying dates/campaign medals; for 10-point preference, a VA civil service preference letter.",
    deadlines: "Must be submitted at the time of job application via USAJOBS.",
    denialReason: "Service dates do not meet wartime/expeditionary criteria; rating letter not attached; application submitted after vacancy close date.",
    nextAction: "Generate your VA Civil Service Preference Letter via VA.gov, complete SF-15, and attach them to your USAJOBS profile.",
    related: ["vra-hiring-authority", "veoa-hiring-authority"],
    warning: "Preference does not guarantee selection, and rules differ significantly between competitive service and excepted service agencies."
  },

  // 7. Housing & Home Loans
  {
    id: "va-home-loan",
    categoryId: "housing",
    name: "VA-Backed Home Loan Guarantee",
    authority: "38 U.S.C. Chapter 37; 38 C.F.R. Part 36",
    qualifies: "Veterans, active duty service members, and certain survivors who meet length-of-service standards and credit/income guidelines.",
    provides: "Federal guarantee allowing lenders to offer loans with no down payment, no private mortgage insurance (PMI), and competitive interest rates.",
    formOrPortal: "VA Form 26-1880 (Certificate of Eligibility)",
    evidence: "DD Form 214 (or statement of service for active duty) used to generate a Certificate of Eligibility (COE).",
    deadlines: "None. The benefit can be used repeatedly throughout the veteran's lifetime.",
    denialReason: "Length of service requirements not met; bankruptcy/foreclosures unresolved; funding fee exemption eligibility not documented.",
    nextAction: "Request a Certificate of Eligibility (COE) online, then contact a VA-approved lender to secure a pre-approval.",
    related: ["funding-fee-exemption", "adapted-housing-grants"],
    warning: "Veterans with a 10% or higher disability rating are exempt from the VA funding fee, saving thousands in closing costs."
  },

  // 8. Homelessness & Housing Stability
  {
    id: "hud-vash-program",
    categoryId: "homelessness",
    name: "HUD-VASH Housing Voucher Program",
    authority: "42 U.S.C. § 1437f(o)(19); MISSION Act",
    qualifies: "Homeless veterans, or veterans at imminent risk of homelessness, who require clinical case management services to maintain housing.",
    provides: "Combined HUD Housing Choice Voucher (Section 8) rental assistance and dedicated VA clinical case management.",
    formOrPortal: "Referral via local VA Medical Center Homeless Program or Vet Center.",
    evidence: "Verification of veteran status (DD214), documentation of homelessness, and agreement to participate in VA case management.",
    deadlines: "None. Vouchers are distributed based on local availability and clinical priority.",
    denialReason: "Income exceeds local voucher limits; household member registered as a lifetime sex offender; refusal of VA clinical case management.",
    nextAction: "Contact the National Call Center for Homeless Veterans (877-424-3838) or walk into a local VA medical center's homeless outreach office.",
    related: ["ssvf-housing-assistance", "gpd-transitional-housing"],
    warning: "Voucher recipients must locate landlords willing to accept Section 8, and rentals must pass HUD safety inspections."
  },

  // 9. Family, Caregiver & Survivor Benefits
  {
    id: "champva-medical",
    categoryId: "family",
    name: "CHAMPVA (Civilian Health and Medical Program of VA)",
    authority: "38 U.S.C. § 1781; 38 C.F.R. § 17.270",
    qualifies: "Spouses, survivors, and dependent children of veterans who are rated 100% Permanent & Total, died of a service-connected condition, or died on active duty.",
    provides: "Comprehensive health insurance covering cost-shares for prescriptions, hospital stays, outpatient care, and medical equipment.",
    formOrPortal: "VA Form 10-10d (CHAMPVA Application) mailed to VA Health Administration Center.",
    evidence: "DD214, VA rating decision showing 100% P&T status, marriage certificate, birth certificates for children, and school enrollment letters for adult dependents.",
    deadlines: "None. However, applying promptly ensures retroactive coverage back to the date the veteran's 100% P&T rating was established.",
    denialReason: "Veteran is not rated 100% Permanent and Total; dependent is eligible for TRICARE (makes them ineligible for CHAMPVA).",
    nextAction: "Compile marriage and birth certificates, download VA Form 10-10d, and mail the packet to the Denver CHAMPVA office.",
    related: ["survivors-pension", "dea-chapter-35"],
    warning: "CHAMPVA is always secondary to other health insurance (except Medicaid). Check copay caps and deductible rules."
  },

  // 10. Insurance
  {
    id: "valife-insurance",
    categoryId: "insurance",
    name: "Veterans Affairs Life Insurance (VALife)",
    authority: "38 U.S.C. § 1922B; 38 C.F.R. Part 19",
    qualifies: "Veterans age 80 or under with any level of service-connected disability rating (0% to 100%). No medical underwriting required.",
    provides: "Guaranteed-acceptance whole life insurance coverage up to $40,000, with cash value accumulation over time.",
    formOrPortal: "Online application portal via VA.gov/life-insurance",
    evidence: "VA rating decision showing service connection of at least one disability (even at 0%).",
    deadlines: "Must apply within 2 years of receiving a new service-connected disability rating if age 81 or older; otherwise no limit for under age 80.",
    denialReason: "Over age 80 without a recent (within 2 years) new service-connected rating; failure to pay monthly premiums.",
    nextAction: "Access the VA.gov life insurance portal and apply online to lock in premium rates based on your current age.",
    related: ["vgli-insurance", "sgli-insurance"],
    warning: "VALife policies require a 2-year waiting period of premium payments before the full death benefit becomes payable."
  },

  // 11. Burial & Memorial
  {
    id: "national-cemetery-burial",
    categoryId: "burial",
    name: "Burial in a VA National Cemetery",
    authority: "38 U.S.C. Chapter 24; 38 C.F.R. Part 38",
    qualifies: "Veterans discharged under conditions other than dishonorable, active duty members, and their eligible spouses and dependent children.",
    provides: "Gravesite, opening and closing of the grave, perpetual care, government headstone/marker, and military funeral honors at no cost.",
    formOrPortal: "VA Form 40-10007 (Application for Pre-Need Eligibility Determination)",
    evidence: "DD Form 214 showing character of service, marriage certificate (for spouse interment), and discharge records.",
    deadlines: "None. Can be planned in advance via pre-need application or requested at the time of death.",
    denialReason: "Dishonorable discharge; service limited to Guard/Reserve without active federal service or retirement eligibility.",
    nextAction: "File VA Form 40-10007 pre-need application to confirm eligibility and simplify future arrangements for family members.",
    related: ["burial-allowance", "burial-flag"],
    warning: "VA does not cover private funeral home costs, cremation services, or transportation from distant locations unless specific criteria are met."
  },

  // 12. Business & Contracting
  {
    id: "sdvosb-certification",
    categoryId: "business",
    name: "SDVOSB (Service-Disabled Veteran-Owned Small Business) Certification",
    authority: "15 U.S.C. § 657f; SBA VetCert Program",
    qualifies: "Small businesses owned and controlled (51% or more) by one or more service-disabled veterans.",
    provides: "Eligibility to compete for federal sole-source and set-aside contracts. Federal agencies have a statutory goal to award 5% of contracts to certified SDVOSBs.",
    formOrPortal: "SBA VetCert Portal (veterans.certify.sba.gov)",
    evidence: "VA rating decision showing service connection, business tax returns, incorporation documents, and proof of veteran management/control.",
    deadlines: "None. Recertification is required every 3 years through the SBA portal.",
    denialReason: "VA rating is not service-connected; veteran does not exercise day-to-day control of operations; ownership is less than 51%.",
    nextAction: "Gather business records, verify your VA rating letter, and register your profile on the SBA VetCert platform.",
    related: ["vosb-certification", "sba-boots-to-business"],
    warning: "Misrepresenting SDVOSB status carries severe federal criminal and civil penalties under the False Claims Act."
  },

  // 13. Commissary / Exchange / MWR Access
  {
    id: "commissary-exchange-access",
    categoryId: "commissary",
    name: "Commissary, Exchange & MWR Privileges",
    authority: "Section 1065 of Title 10, United States Code; NDAA 2020",
    qualifies: "Veterans with a service-connected disability rating (0% to 100%), Purple Heart recipients, former POWs, and certified caregivers.",
    provides: "Base access to shop at military commissaries, exchanges, and use select Morale, Welfare, and Recreation (MWR) facilities.",
    formOrPortal: "Veteran Health Identification Card (VHIC) issued by VA, registered at installation security.",
    evidence: "VHIC card showing 'Service Connected', 'Purple Heart', or 'Former POW' on the front, plus primary photo ID.",
    deadlines: "None. Privileges are permanent once eligibility is established.",
    denialReason: "No VHIC card; veteran has a dishonorable discharge; background check failure at the base visitor center.",
    nextAction: "Obtain a VHIC card from your local VA medical center enrollment clinic, then present it at a military base visitor control center.",
    related: ["vhic-id-card", "records-dd214"],
    warning: "Commissary purchases are subject to a small surcharge (generally 5%) and commercial credit card processing fees."
  },

  // 14. Records, IDs & Proof of Service
  {
    id: "records-dd214",
    categoryId: "records",
    name: "Request Military Service Records (DD Form 214)",
    authority: "Privacy Act of 1974; 32 C.F.R. Part 286",
    qualifies: "Veterans, next of kin of deceased veterans, or authorized representatives.",
    provides: "Official copy of DD Form 214/215, which serves as primary proof of service, character of discharge, and campaign medals.",
    formOrPortal: "Standard Form 180 (SF-180) or online via eVetRecs (National Archives)",
    evidence: "Veteran full name, SSN, service number, branch, dates of service, and signed authorization.",
    deadlines: "None. Records can be requested at any time.",
    denialReason: "Incomplete identifying information; requester is not next-of-kin or lack of power of attorney for living veterans.",
    nextAction: "Log into the National Archives eVetRecs portal or mail a signed SF-180 to the National Personnel Records Center (NPRC).",
    related: ["cfile-request", "vhic-id-card"],
    warning: "NPRC processing times can range from a few days for emergencies to several months for archived historic records."
  },

  // 15. Legal Rights & Protections
  {
    id: "userra-protections",
    categoryId: "legal",
    name: "USERRA Reemployment Rights",
    authority: "38 U.S.C. §§ 4301-4335; 20 C.F.R. Part 1002",
    qualifies: "Servicemembers, veterans, and Guard/Reserve members who leave civilian jobs for voluntary or involuntary active service.",
    provides: "Right to return to your civilian job with the same seniority, status, and pay rate you would have attained had you remained continuously employed.",
    formOrPortal: "Department of Labor VETS Form 1010 (to file a complaint)",
    evidence: "Documentation of pre-service employment, military orders, timely application for reinstatement, and discharge conditions.",
    deadlines: "Must report back or apply for reemployment within 90 days of release for service lasting more than 180 days.",
    denialReason: "Employer's circumstances have changed making reemployment impossible; service exceeded the 5-year cumulative limit.",
    nextAction: "Notify your employer in writing of your intent to return, and file DOL Form 1010 if reinstatement is denied or delayed.",
    related: ["scra-legal-protections"],
    warning: "USERRA applies to almost all employers, regardless of size, including the federal government, state governments, and private businesses."
  },

  // 16. State / Local / Tribal Benefits
  {
    id: "state-property-tax-exemption",
    categoryId: "state",
    name: "State Disabled Veteran Property Tax Exemption",
    authority: "State-specific statutes (e.g., Va. Code § 58.1-3219.5)",
    qualifies: "Veterans rated 100% disabled Permanent & Total, or rated at Individual Unemployability (IU), who own and occupy a primary residence.",
    provides: "Partial or full exemption from municipal real estate taxes on the primary residence.",
    formOrPortal: "Application submitted to the local county or city tax assessor's office.",
    evidence: "VA summary letter showing 100% P&T rating or IU, proof of homeownership, and occupancy records.",
    deadlines: "Varies by state/county, but typically must be filed annually or by the local tax assessment deadline.",
    denialReason: "VA rating is not 100% Permanent & Total (temporary ratings do not qualify); property is not the veteran's primary residence.",
    nextAction: "Request a VA benefits summary letter, locate your deed/mortgage statement, and visit your local assessor's website.",
    related: ["state-tuition-waivers", "disabled-veteran-plates"],
    warning: "Property tax exemptions are highly variable by state. Some states offer zero exemption, while others exempt 100% of taxes."
  },

  // 17. Transportation & Adaptive Mobility
  {
    id: "va-beneficiary-travel",
    categoryId: "transportation",
    name: "VA Beneficiary Travel Reimbursement",
    authority: "38 U.S.C. § 111; 38 C.F.R. Part 70",
    qualifies: "Veterans with a service-connected rating of 30% or more, or receiving VA pension, or traveling for service-connected treatment.",
    provides: "Mileage reimbursement or coverage of special mode transportation (wheelchair van/ambulance) when traveling to VA medical care.",
    formOrPortal: "VA Access Portal (BTSSS - Beneficiary Travel Self-Service System)",
    evidence: "VA appointment record, travel receipts (tolls/parking), and bank account details for direct deposit.",
    deadlines: "Travel claims must be submitted within 30 days of the qualifying medical appointment.",
    denialReason: "Disability rating below 30% without pension eligibility; travel was to a non-VA facility without referral; claim filed late.",
    nextAction: "Log into BTSSS within 30 days of your appointment, enter your travel details, and upload necessary toll/parking receipts.",
    related: ["automobile-adaptive-allowance", "transportation-disabled-parking"],
    warning: "Reimbursements are subject to a standard deductible ($3.00 per one-way trip, capped at $18.00 per calendar month) unless waived."
  },

  // 18. Assistive Technology & Accessibility
  {
    id: "va-prosthetics-sensory-aids",
    categoryId: "assistive",
    name: "VA Prosthetic and Sensory Aids Service",
    authority: "38 U.S.C. § 1714; 38 C.F.R. § 17.150",
    qualifies: "Enrolled veterans receiving VA health care who have a clinical need for devices due to physical limitations or sensory deficits.",
    provides: "Prosthetic limbs, hearing aids, eyeglasses, wheelchairs, orthotic braces, and home/workplace adaptive modifications.",
    formOrPortal: "Referral by a VA clinical physician or audiologist to the Prosthetic Department.",
    evidence: "Clinical prescription from a VA doctor and medical assessment showing functional limitation.",
    deadlines: "None. Provided as part of ongoing VA medical treatment.",
    denialReason: "No clinical necessity established by VA doctor; veteran seeking device from outside provider without VA authorization.",
    nextAction: "Schedule a primary care appointment at the VA clinic to request an evaluation and formal referral to the Prosthetic service.",
    related: ["va-beneficiary-travel", "adapted-housing-grants"],
    warning: "Hearing aids and eyeglasses require specific eligibility tiers, typically tied to service-connected ratings or enrollment groups."
  },

  // 19. Justice-Involved / Reentry
  {
    id: "veterans-justice-outreach",
    categoryId: "justice",
    name: "Veterans Justice Outreach (VJO) Program",
    authority: "38 U.S.C. § 2061; VA Reentry Initiative",
    qualifies: "Justice-involved veterans in contact with local law enforcement, jails, or specialized Veterans Treatment Courts.",
    provides: "Clinical case management, treatment placement (substance use/PTSD), and court coordination/diversion advocacy.",
    formOrPortal: "Direct referral by defense attorney, probation officer, or jail liaison to the VJO Specialist.",
    evidence: "Proof of veteran status (DD214) and clinical assessment showing qualifying mental health/substance needs.",
    deadlines: "None. Outreach is active throughout the pretrial and sentencing phases.",
    denialReason: "Veteran has a dishonorable discharge (limits access to VA treatment programs); charges are ineligible for local diversion.",
    nextAction: "Request that your defense attorney contact the local VJO Specialist assigned to the regional VA Medical Center.",
    related: ["discharge-upgrade-help", "records-dd214"],
    warning: "VJO Specialists advocate for treatment diversion, but they do not provide legal representation or overwrite judicial sentences."
  },

  // 20. Forms, Records Requests & Appeals
  {
    id: "ama-higher-level-review",
    categoryId: "appeals",
    name: "Higher-Level Review (VA Form 20-0996)",
    authority: "38 U.S.C. § 5104B; 38 C.F.R. § 3.2601",
    qualifies: "Veterans who received an adverse VA rating decision within the past 365 days and believe an error was made on the current record.",
    provides: "De novo (new) review of the existing evidence by a senior claims adjudicator, with an optional informal telephone conference.",
    formOrPortal: "VA Form 20-0996 (online via VA.gov or QuickSubmit)",
    evidence: "No new evidence can be submitted. The review is strictly based on the records in the eFolder at the time of the decision.",
    deadlines: "Must be filed within 365 days of the date on the VA decision notice letter.",
    denialReason: "Filing after the 365-day appeal window has closed; attempting to submit new medical records as part of the review.",
    nextAction: "File VA Form 20-0996, select your specific contested issues, and check the box requesting an Informal Conference.",
    related: ["ama-supplemental-claim", "disability-compensation"],
    warning: "If you have new medical records or evidence to show the VA, do not file an HLR; you must file a Supplemental Claim instead."
  },

  // 21. Career, Technology, Credentials & Transition Programs
  {
    id: "vet-tec-2-0",
    categoryId: "career_tech",
    name: "VET TEC 2.0 (High-Technology Training Program)",
    authority: "38 U.S.C. § 3001 note; Veterans Education and Training Programs",
    qualifies: "Veterans or transitioning service members (within 180 days of discharge) under age 62, with an other-than-dishonorable discharge, and at least 36 months of active duty service.",
    provides: "Tuition coverage for approved high-tech training courses (coding bootcamps, IT certs, cybersecurity) and a Monthly Housing Allowance (MHA).",
    formOrPortal: "VA Form 22-10297 (Apply online via VA.gov)",
    evidence: "DD214 showing character of service and active-duty duration, Certificate of Eligibility (COE) for education benefits, and proof of provider acceptance.",
    deadlines: "Program is funded annually through Sept 30, 2027, subject to participation caps.",
    denialReason: "Age 62 or older; less than 36 months of active duty service; program or provider is not approved for VET TEC 2.0; annual funding exhausted.",
    nextAction: "Verify provider approval status, submit VA Form 22-10297 online, and prepare monthly enrollment verification setup.",
    related: ["post-911-gi-bill", "vre-chapter-31"],
    warning: "Monthly housing payments require students to complete monthly enrollment verification, otherwise payments will be suspended."
  },
  {
    id: "dod-skillbridge",
    categoryId: "career_tech",
    name: "DoD SkillBridge Program",
    authority: "10 U.S.C. § 1143(e); DoD Instruction 1322.29",
    qualifies: "Active duty service members of any rank within 180 days of scheduled separation or retirement, with command approval.",
    provides: "Opportunity to participate in civilian job training, internships, or apprenticeships with approved employers while maintaining full military pay and benefits.",
    formOrPortal: "Application via the official DoD SkillBridge portal and internal service command routing channels.",
    evidence: "Written commander approval checklist, transition office counseling proof, and employer acceptance letter.",
    deadlines: "Must be completed prior to separation date; application timeline typically starts 12 months before discharge.",
    denialReason: "Command denies request due to operational/readiness needs; provider is not an approved DoD SkillBridge partner.",
    nextAction: "Identify an approved provider on the SkillBridge directory, secure a placement offer, and submit a command approval package.",
    related: ["transition-assistance-program", "federal-fellowships"],
    warning: "SkillBridge is restricted to active duty members prior to discharge. Separated veterans are ineligible."
  },
  {
    id: "transition-assistance-program",
    categoryId: "career_tech",
    name: "TAP (Transition Assistance Program)",
    authority: "10 U.S.C. Chapter 58 (Pre-separation counseling)",
    qualifies: "Separating, demobilizing, or retiring active duty service members, National Guard, and Reserve components.",
    provides: "Mandatory pre-separation counseling, VA benefits briefings, DOL employment workshops, and capstone validation.",
    formOrPortal: "DD Form 2648 (eForm completed via DoD TAP portal)",
    evidence: "Active military identity, service history, and counselor certifications.",
    deadlines: "Must start no later than 365 days before scheduled separation; recommended to start 18 to 24 months prior for retirees.",
    denialReason: "Failure to complete mandatory modules; commander or counselor refuses to sign off on Capstone checklist.",
    nextAction: "Contact your installation's transition support office to schedule your initial pre-separation briefing.",
    related: ["dod-skillbridge", "records-dd214"],
    warning: "TAP is a legal statutory requirement for separation. Completing it on time is necessary to receive your DD214."
  },
  {
    id: "gi-bill-licensing-reimbursement",
    categoryId: "career_tech",
    name: "GI Bill Licensing & Certification Test Reimbursement",
    authority: "38 U.S.C. § 3452(b) & § 3501(a)(5)",
    qualifies: "Veterans or dependents eligible for Post-9/11 GI Bill, MGIB, or DEA who take approved licensing or certification exams.",
    provides: "Direct reimbursement of exam fees (re-testing allowed). Post-9/11 GI Bill entitlement is charged proportionally.",
    formOrPortal: "VA Form 22-0803 (Request for Reimbursement of Licensing or Certification Test Fees)",
    evidence: "Official exam receipt showing cost, copy of test results, test date, and organization name.",
    deadlines: "None. Must submit claims after taking the exam.",
    denialReason: "Testing organization or specific exam is not approved for VA reimbursement; applicant lacks GI Bill entitlement.",
    nextAction: "Ensure your exam is listed in the VA's WEAMS database, pay and take the test, and submit VA Form 22-0803 with your receipt.",
    related: ["post-911-gi-bill", "dod-cool-assistance"],
    warning: "Reimbursement charges your GI Bill entitlement months. Verify if using entitlement for a low-cost exam is mathematically optimal."
  },
  {
    id: "dod-cool-assistance",
    categoryId: "career_tech",
    name: "DoD COOL (Credentialing Opportunities On-Line)",
    authority: "10 U.S.C. § 2015; Branch-specific Credentialing Assistance policies",
    qualifies: "Active duty service members, Guard, and Reserve components in qualifying status.",
    provides: "Funding (up to $4,000/year for some services) to pay for courses, study materials, exam vouchers, and renewals for civilian credentials.",
    formOrPortal: "Portal request via service-specific COOL websites (e.g., Army COOL, Navy COOL).",
    evidence: "MOS/Rating mapping confirmation, command approval, credential provider invoice, and education counselor verification.",
    deadlines: "Requests must be approved and funded before enrolling in the training course or scheduling the exam.",
    denialReason: "Funding caps exhausted; credential does not align with service guidelines; training started prior to approval.",
    nextAction: "Log into your branch's COOL portal, search for certifications mapped to your MOS, and submit a Credentialing Assistance request.",
    related: ["gi-bill-licensing-reimbursement", "dod-skillbridge"],
    warning: "Credentialing Assistance is restricted to active status. Unused funding balances do not roll over or transfer after separation."
  }
];
