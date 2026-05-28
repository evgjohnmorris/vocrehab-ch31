import {
  Activity,
  AlertTriangle,
  Award,
  BookOpen,
  Briefcase,
  Calculator,
  CheckCircle2,
  Compass,
  FileEdit,
  FileText,
  Gavel,
  GraduationCap,
  HeartHandshake,
  Home,
  Map,
  RefreshCw,
  Scale,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  Target,
  Users
} from 'lucide-react';

export const VIEW_ALIASES = {
  reference: 'authority_library'
};

export const NAV_SECTION_TITLES = {
  quick_start: 'Quick Start',
  casework: 'Casework',
  special_tracks: 'Special Tracks',
  reference: 'Reference',
  transition: 'Transition',
  support: 'Support'
};

export const NAV_SECTION_ORDER = [
  'quick_start',
  'casework',
  'special_tracks',
  'reference',
  'transition',
  'support'
];

export const APP_PAGES = [
  {
    id: 'home',
    label: 'Dashboard',
    mobileLabel: 'Home',
    section: 'quick_start',
    Icon: Home,
    sidebar: true,
    mobile: false,
    priority: true,
    readiness: 'hybrid',
    userNeed: 'See case posture, current stage, and next best action fast.',
    plannedNext: 'Add risk scoring, evidence gaps, and deadline-aware recommendations.'
  },
  {
    id: 'global_search',
    label: 'Search',
    mobileLabel: 'Search',
    section: 'quick_start',
    Icon: Search,
    sidebar: true,
    mobile: false,
    priority: true,
    iconClassName: 'text-sky-400',
    readiness: 'hybrid',
    userNeed: 'Jump directly to authority, workflow, or indexed content without hunting.',
    plannedNext: 'Unify search across authorities, cases, forms, programs, contacts, and schools.'
  },
  {
    id: 'wizard',
    label: 'Entitlement',
    mobileLabel: 'Wizard',
    section: 'casework',
    Icon: Award,
    sidebar: true,
    mobile: true,
    readiness: 'frontend',
    userNeed: 'Get a fast entitlement and eligibility orientation.',
    plannedNext: 'Move eligibility logic, evidence prompts, and track recommendations into the backend.'
  },
  {
    id: 'claim_builder',
    label: 'Plan Builder',
    mobileLabel: 'Plan',
    section: 'casework',
    Icon: Compass,
    sidebar: true,
    mobile: false,
    readiness: 'hybrid',
    userNeed: 'Build a defensible IPE path with facts, authorities, and strategy.',
    plannedNext: 'Add backend template runs, issue checklists, and letter history.'
  },
  {
    id: 'planning',
    label: 'Career Strategy',
    mobileLabel: 'Career',
    section: 'casework',
    Icon: Target,
    sidebar: true,
    mobile: false,
    readiness: 'hybrid',
    userNeed: 'Tie a training request to occupation, labor market, and school evidence.',
    plannedNext: 'Add deeper CIP, IPEDS, WEAMS, and occupation-fit recommendation services.'
  },
  {
    id: 'dispute_hub',
    label: 'Appeals Hub',
    mobileLabel: 'Appeals',
    section: 'casework',
    Icon: Scale,
    sidebar: true,
    mobile: false,
    readiness: 'frontend',
    userNeed: 'Know what kind of problem happened and what escalation path fits it.',
    plannedNext: 'Back it with issue taxonomy, lane recommendation, and rebuttal rules.'
  },
  {
    id: 'written_decision_analyzer',
    label: 'Decision Analyzer',
    mobileLabel: 'Analyze',
    section: 'casework',
    Icon: ShieldAlert,
    sidebar: true,
    mobile: false,
    iconClassName: 'text-red-400',
    readiness: 'frontend',
    userNeed: 'Turn a denial or adverse action into a structured review plan.',
    plannedNext: 'Add text ingestion, decision parsing, defect spotting, and review-lane outputs.'
  },
  {
    id: 'case_packet_builder',
    label: 'Case Packet',
    mobileLabel: 'Packet',
    section: 'casework',
    Icon: FileText,
    sidebar: true,
    mobile: false,
    readiness: 'frontend',
    userNeed: 'Assemble facts, evidence, and arguments into a usable advocacy packet.',
    plannedNext: 'Add generated packet storage, export history, and evidence bundle versions.'
  },
  {
    id: 'school_payment_tracker',
    label: 'School Payments',
    mobileLabel: 'School',
    section: 'casework',
    Icon: GraduationCap,
    sidebar: true,
    mobile: false,
    readiness: 'frontend',
    userNeed: 'Track authorizations, invoices, books, and urgent school-payment failures.',
    plannedNext: 'Add term ledgers, SCO contacts, invoice states, and emergency escalation triggers.'
  },
  {
    id: 'calculator',
    label: 'Payments',
    mobileLabel: 'Calc',
    section: 'casework',
    Icon: Calculator,
    sidebar: true,
    mobile: true,
    readiness: 'frontend',
    userNeed: 'Estimate subsistence and compare Chapter 31 versus Post-9/11 outcomes.',
    plannedNext: 'Move rate versions, effective dates, and historical calculation rules into the backend.'
  },
  {
    id: 'independent_living_builder',
    label: 'Independent Living',
    mobileLabel: 'IL',
    section: 'special_tracks',
    Icon: Shield,
    sidebar: true,
    mobile: false,
    readiness: 'frontend',
    userNeed: 'Show how functional limitations justify Independent Living services and items.',
    plannedNext: 'Add ADL and IADL evidence capture, accommodation catalogs, and request templates.'
  },
  {
    id: 'self_employment',
    label: 'Self-Employment',
    mobileLabel: 'Business',
    section: 'special_tracks',
    Icon: Briefcase,
    sidebar: true,
    mobile: false,
    readiness: 'hybrid',
    userNeed: 'Connect business planning to Chapter 31 self-employment evidence.',
    plannedNext: 'Add strategy ontology outputs, startup evidence packets, and contracting indexes.'
  },
  {
    id: 'family_caregivers',
    label: 'Family Support',
    mobileLabel: 'Family',
    section: 'special_tracks',
    Icon: HeartHandshake,
    sidebar: true,
    mobile: false,
    iconClassName: 'text-indigo-400',
    readiness: 'frontend',
    userNeed: 'Find caregiver and family-adjacent support programs without leaving the workflow.',
    plannedNext: 'Add benefit-router matching and cross-program evidence packets.'
  },
  {
    id: 'case_status_guide',
    label: 'Case Status',
    mobileLabel: 'Status',
    section: 'special_tracks',
    Icon: Activity,
    sidebar: true,
    mobile: false,
    readiness: 'frontend',
    userNeed: 'Understand interrupted, discontinued, rehabilitated, and related status rules.',
    plannedNext: 'Add status timeline history and notice-driven deadline calculations.'
  },
  {
    id: 'authority_library',
    label: 'Authority Library',
    mobileLabel: 'Library',
    section: 'reference',
    Icon: Gavel,
    sidebar: true,
    mobile: true,
    aliases: ['reference'],
    readiness: 'live',
    userNeed: 'Read binding authority, policy, and related sources in one research surface.',
    plannedNext: 'Add version history, freshness warnings, saved research packets, and citation diffing.'
  },
  {
    id: 'benefits_index',
    label: 'Benefits Index',
    mobileLabel: 'Benefits',
    section: 'reference',
    Icon: Compass,
    sidebar: true,
    mobile: false,
    readiness: 'frontend',
    userNeed: 'See adjacent programs that can support the Chapter 31 plan.',
    plannedNext: 'Back it with the workforce-program matcher and ranked support stacks.'
  },
  {
    id: 'forms_center',
    label: 'Forms Center',
    mobileLabel: 'Forms',
    section: 'reference',
    Icon: FileEdit,
    sidebar: true,
    mobile: false,
    readiness: 'hybrid',
    userNeed: 'Find the right current VA or related form without stale PDFs.',
    plannedNext: 'Add revision monitoring, use-case guidance, and stale-form warnings.'
  },
  {
    id: 'resources',
    label: 'Resources',
    mobileLabel: 'Resources',
    section: 'reference',
    Icon: BookOpen,
    sidebar: true,
    mobile: false,
    iconClassName: 'text-sky-400',
    readiness: 'frontend',
    userNeed: 'Reach curated federal, transition, and standards resources quickly.',
    plannedNext: 'Move cards into admin-managed content blocks with freshness tracking.'
  },
  {
    id: 'in_service_edu',
    label: 'In-Service Education',
    mobileLabel: 'In-Service',
    section: 'transition',
    Icon: GraduationCap,
    sidebar: true,
    mobile: false,
    iconClassName: 'text-amber-500',
    readiness: 'frontend',
    userNeed: 'Plan education and credential moves before separation.',
    plannedNext: 'Add branch-aware funding, timeline checklists, and provider verification.'
  },
  {
    id: 'taps',
    label: 'TAP Guide',
    mobileLabel: 'TAP',
    section: 'transition',
    Icon: Map,
    sidebar: true,
    mobile: false,
    iconClassName: 'text-amber-500',
    readiness: 'frontend',
    userNeed: 'Navigate transition programs, entrepreneurship, and employment resources.',
    plannedNext: 'Add structured program indexing, deadlines, and recommended next actions by user profile.'
  },
  {
    id: 'coverage_report',
    label: 'Coverage Report',
    mobileLabel: 'Coverage',
    section: 'support',
    Icon: CheckCircle2,
    sidebar: true,
    mobile: false,
    iconClassName: 'text-emerald-400',
    readiness: 'live',
    userNeed: 'Understand how complete and current the authority corpus is.',
    plannedNext: 'Add source freshness trends, gaps by domain, and admin triage queues.'
  },
  {
    id: 'source_diff',
    label: 'Source Updates',
    mobileLabel: 'Diffs',
    section: 'support',
    Icon: RefreshCw,
    sidebar: true,
    mobile: false,
    iconClassName: 'text-indigo-400',
    readiness: 'live',
    userNeed: 'See when official source material changes and what may need review.',
    plannedNext: 'Add human review workflow, severity scoring, and auto-generated change summaries.'
  },
  {
    id: 'directory',
    label: 'Contacts',
    mobileLabel: 'Contacts',
    section: 'support',
    Icon: Users,
    sidebar: true,
    mobile: false,
    readiness: 'hybrid',
    userNeed: 'Find the right regional office and escalation contact quickly.',
    plannedNext: 'Add verification timestamps, outstation routing, and user-reported correction review.'
  },
  {
    id: 'accessibility_settings',
    label: 'Accessibility',
    mobileLabel: 'Access',
    section: 'support',
    Icon: Settings,
    sidebar: true,
    mobile: false,
    actionKey: 'open-accessibility-settings',
    readiness: 'frontend',
    userNeed: 'Adjust readability, motion, and input behavior without leaving the workflow.',
    plannedNext: 'Persist named presets and add page-level accessibility diagnostics.'
  },
  {
    id: 'disability_hub',
    label: 'Disability Hub',
    Icon: Shield,
    sidebar: false,
    mobile: false,
    readiness: 'frontend',
    userNeed: 'Model disability impacts and compensation context.',
    plannedNext: 'Link functional limitations to case evidence and occupation compatibility.'
  },
  {
    id: 'financial_planner',
    label: 'Financial Planner',
    Icon: Calculator,
    sidebar: false,
    mobile: false,
    readiness: 'frontend',
    userNeed: 'Estimate broader budget posture beyond subsistence.',
    plannedNext: 'Add scenario storage, debt flags, and school-payment integration.'
  },
  {
    id: 'special_programs',
    label: 'Special Programs',
    Icon: Compass,
    sidebar: false,
    mobile: false,
    readiness: 'frontend',
    userNeed: 'Explore special-track benefit variants and exceptions.',
    plannedNext: 'Connect to program match logic and track-aware evidence requirements.'
  },
  {
    id: 'error_spotter',
    label: 'Error Spotter',
    mobileLabel: 'Errors',
    Icon: AlertTriangle,
    sidebar: false,
    mobile: true,
    readiness: 'frontend',
    userNeed: 'Identify common VA case handling errors quickly.',
    plannedNext: 'Add structured defect taxonomy, examples, and escalation outputs.'
  },
  {
    id: 'document_generator',
    label: 'Document Generator',
    mobileLabel: 'Docs',
    Icon: FileEdit,
    sidebar: false,
    mobile: true,
    readiness: 'frontend',
    userNeed: 'Draft advocacy documents with less manual rewriting.',
    plannedNext: 'Add template versions, variable validation, and generated output history.'
  },
  {
    id: 'glossary',
    label: 'Glossary',
    Icon: BookOpen,
    sidebar: false,
    mobile: false,
    readiness: 'frontend',
    userNeed: 'Decode VR&E and review-lane terminology fast.',
    plannedNext: 'Turn glossary entries into admin-managed content with source citations.'
  }
];

export const PAGE_REGISTRY = Object.fromEntries(APP_PAGES.map((page) => [page.id, page]));

export const PAGE_PATHS = {
  home: '#/dashboard',
  global_search: '#/search',
  wizard: '#/entitlement',
  claim_builder: '#/plan-builder',
  planning: '#/career-strategy',
  dispute_hub: '#/appeals',
  written_decision_analyzer: '#/decision-analyzer',
  case_packet_builder: '#/case-packet',
  school_payment_tracker: '#/school-payments',
  calculator: '#/subsistence-calculator',
  independent_living_builder: '#/independent-living',
  self_employment: '#/self-employment',
  family_caregivers: '#/family-support',
  case_status_guide: '#/case-status',
  authority_library: '#/authority-library',
  benefits_index: '#/benefits-index',
  forms_center: '#/forms',
  resources: '#/resources',
  in_service_edu: '#/in-service-education',
  taps: '#/tap-guide',
  coverage_report: '#/coverage-report',
  source_diff: '#/source-updates',
  directory: '#/contacts',
  accessibility_settings: '#/accessibility',
  disability_hub: '#/disability-hub',
  financial_planner: '#/financial-planner',
  special_programs: '#/special-programs',
  error_spotter: '#/error-spotter',
  document_generator: '#/document-generator',
  glossary: '#/glossary'
};

const PATH_TO_VIEW = Object.fromEntries(
  Object.entries(PAGE_PATHS).map(([view, path]) => [path.replace(/^#/, ''), view])
);

const DEFAULT_DESCRIPTION = 'Veteran Resource Guide for Chapter 31 VR&E casework, entitlement, appeals, school payments, independent living, and authority-backed document building.';

export function normalizeViewId(view) {
  if (!view) {
    return 'home';
  }

  return VIEW_ALIASES[view] || view;
}

export function getPageMeta(view) {
  const page = PAGE_REGISTRY[normalizeViewId(view)] || PAGE_REGISTRY.home;
  return {
    ...page,
    path: PAGE_PATHS[page.id] || '#/dashboard',
    metaTitle: page.metaTitle || `${page.label} | Veteran Resource Guide`,
    metaDescription: page.metaDescription || page.userNeed || DEFAULT_DESCRIPTION
  };
}

export function getSidebarSections() {
  return NAV_SECTION_ORDER.map((sectionId) => ({
    id: sectionId,
    title: NAV_SECTION_TITLES[sectionId],
    items: APP_PAGES.filter((page) => page.sidebar && page.section === sectionId)
  })).filter((section) => section.items.length > 0);
}

export const MOBILE_NAV_ITEMS = APP_PAGES.filter((page) => page.mobile);

export function getViewPath(view) {
  const normalizedView = normalizeViewId(view);
  return PAGE_PATHS[normalizedView] || '#/dashboard';
}

export function getViewFromHash(hash) {
  if (!hash) {
    return 'home';
  }

  const cleanedHash = hash.startsWith('#') ? hash.slice(1) : hash;
  const normalizedHash = cleanedHash.startsWith('/') ? cleanedHash : `/${cleanedHash}`;
  return normalizeViewId(PATH_TO_VIEW[normalizedHash] || PATH_TO_VIEW[cleanedHash] || 'home');
}

export function getHiddenToolPages() {
  return APP_PAGES.filter((page) => !page.sidebar && page.id !== 'accessibility_settings');
}
