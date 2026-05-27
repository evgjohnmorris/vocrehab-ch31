const CAREER_ALIAS_MAP = {
  'Software Developer': ['software engineer', 'programmer', 'full stack', 'web developer', 'app developer'],
  'Information Security Analyst': ['cybersecurity analyst', 'cyber analyst', 'infosec', 'security analyst'],
  'Logistics Manager': ['supply chain manager', 'distribution manager', 'operations logistics'],
  'Commercial Pilot': ['pilot', 'aviator', 'flight operations'],
  Accountant: ['cpa', 'auditor', 'bookkeeping', 'finance'],
  'Network Systems Administrator': ['network administrator', 'sysadmin', 'it administrator'],
  'Database Administrator': ['dba', 'database engineer'],
  'Project Management Specialist': ['project manager', 'pmp', 'program management'],
  'Management Analyst': ['business analyst', 'operations analyst'],
  'Human Resources Specialist': ['hr specialist', 'recruiter', 'talent acquisition'],
  'Registered Nurse': ['rn', 'nursing'],
  'Nurse Practitioner': ['np', 'advanced practice nurse'],
  'Physical Therapist': ['pt', 'rehabilitation therapist'],
  Lawyer: ['attorney', 'counsel'],
  'Paralegal and Legal Assistant': ['paralegal', 'legal assistant']
};

const PHYSICAL_DEMAND_RANK = {
  Sedentary: 0,
  Light: 1,
  Medium: 2,
  Heavy: 3
};

export const CAREER_DEMAND_FILTERS = [
  { value: 'all', label: 'All physical demands' },
  { value: 'Sedentary', label: 'Sedentary only' },
  { value: 'Light', label: 'Light only' },
  { value: 'Medium', label: 'Medium only' },
  { value: 'Heavy', label: 'Heavy only' }
];

export const CAREER_SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'compatibility', label: 'Best medical fit' },
  { value: 'growth', label: 'Highest growth' },
  { value: 'pay', label: 'Highest pay' },
  { value: 'title', label: 'Alphabetical' }
];

function normalizeQuery(query) {
  return String(query || '').trim().toLowerCase();
}

function tokenizeQuery(query) {
  return normalizeQuery(query).split(/\s+/).filter(Boolean);
}

export function parseCareerGrowthValue(outlook) {
  const match = String(outlook || '').match(/([+-]?\d+)/);
  if (!match) {
    return 0;
  }

  return Number.parseInt(match[1], 10) || 0;
}

function getDemandRank(physicalDemand) {
  return PHYSICAL_DEMAND_RANK[physicalDemand] ?? 99;
}

function buildCareerSearchText(career) {
  const aliases = CAREER_ALIAS_MAP[career.title] || [];
  const searchableParts = [
    career.title,
    aliases.join(' '),
    career.soc,
    career.soc?.replace(/[^\d]/g, ''),
    career.oohGroup,
    career.education,
    career.dot,
    career.dot?.replace(/[^\d]/g, ''),
    career.sic,
    career.naics,
    career.physicalDemand,
    career.duties
  ];

  return searchableParts.filter(Boolean).join(' ').toLowerCase();
}

export function buildCareerIndex(careers) {
  return careers.map((career, index) => ({
    index,
    ...career,
    titleLower: String(career.title || '').toLowerCase(),
    groupLower: String(career.oohGroup || '').toLowerCase(),
    educationLower: String(career.education || '').toLowerCase(),
    socLower: String(career.soc || '').toLowerCase(),
    growthValue: parseCareerGrowthValue(career.outlook),
    demandRank: getDemandRank(career.physicalDemand),
    searchText: buildCareerSearchText(career)
  }));
}

function getMatchScore(entry, query) {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    return 0;
  }

  const tokens = tokenizeQuery(normalizedQuery);
  let score = 0;

  if (entry.titleLower === normalizedQuery) {
    score += 240;
  }
  if (entry.titleLower.startsWith(normalizedQuery)) {
    score += 140;
  }
  if (entry.titleLower.includes(normalizedQuery)) {
    score += 100;
  }
  if (entry.socLower.includes(normalizedQuery)) {
    score += 90;
  }
  if (entry.groupLower.includes(normalizedQuery)) {
    score += 70;
  }
  if (entry.educationLower.includes(normalizedQuery)) {
    score += 50;
  }
  if (entry.searchText.includes(normalizedQuery)) {
    score += 30;
  }

  tokens.forEach((token) => {
    if (entry.titleLower.includes(token)) {
      score += 16;
    } else if (entry.searchText.includes(token)) {
      score += 6;
    }
  });

  return score;
}

export function evaluateCareerCompatibility(career, limitations) {
  if (!career) {
    return { compatible: true, reasons: [] };
  }

  const reasons = [];
  let compatible = true;

  if (limitations.limitStanding) {
    if (career.physicalDemand === 'Light' || career.physicalDemand === 'Medium' || career.physicalDemand === 'Heavy') {
      compatible = false;
      reasons.push(`Career requires standing or walking ("${career.physicalDemand}" strength rating), which conflicts with standing constraints.`);
    }
  }

  if (limitations.limitLifting) {
    if (career.physicalDemand === 'Light' || career.physicalDemand === 'Medium' || career.physicalDemand === 'Heavy') {
      compatible = false;
      reasons.push(`Career requires lifting capabilities beyond 15 lbs ("${career.physicalDemand}" strength rating).`);
    }
  }

  if (limitations.limitBending) {
    if (career.physicalDemand === 'Medium' || career.physicalDemand === 'Heavy') {
      compatible = false;
      reasons.push('Medium or heavy demand roles require frequent bending, kneeling, or crouching.');
    }
  }

  if (limitations.limitEnvironment) {
    if (career.title === 'Solar Photovoltaic Installer' || career.title === 'CNC Machinist' || career.title === 'Commercial Pilot') {
      compatible = false;
      reasons.push('Career involves outdoor exposure, non-climate-controlled environments, or specific pressure and altitude factors.');
    }
  }

  if (limitations.limitSitting && career.requiresSitting) {
    compatible = false;
    reasons.push('Career requires prolonged sitting ("Sedentary" or flight-deck posture), which conflicts with sitting tolerance limits.');
  }

  if (limitations.limitRepetitive && career.requiresRepetitiveMotion) {
    compatible = false;
    reasons.push('Role involves extensive keyboarding or repetitive wrist-finger motions, which conflicts with upper extremity limitations.');
  }

  if (limitations.limitSensory && career.requiresVisionHearing) {
    compatible = false;
    reasons.push('Career has strict FAA or DOT sensory, vision, or hearing thresholds that conflict with sensory limitations.');
  }

  if (limitations.limitStress && career.requiresHighStressConfinement) {
    compatible = false;
    reasons.push('High-stress operations, cockpit confinement, or rapid decision-making requirements conflict with stress tolerance thresholds.');
  }

  if (limitations.limitRespiratory && career.requiresRespiratorFumes) {
    compatible = false;
    reasons.push('Role requires exposure to machine coolant mist, dust, or potential pulmonary irritants, which conflicts with respiratory limits.');
  }

  return { compatible, reasons };
}

export function filterCareerIndex(entries, {
  query = '',
  group = 'all',
  demand = 'all',
  sortMode = 'recommended',
  compatibleOnly = false,
  compatibilityByIndex = {}
}) {
  const normalizedQuery = normalizeQuery(query);

  return entries
    .map((entry) => ({
      ...entry,
      matchScore: getMatchScore(entry, normalizedQuery),
      compatibility: compatibilityByIndex[entry.index] || { compatible: true, reasons: [] }
    }))
    .filter((entry) => {
      if (group !== 'all' && entry.oohGroup !== group) {
        return false;
      }

      if (demand !== 'all' && entry.physicalDemand !== demand) {
        return false;
      }

      if (compatibleOnly && !entry.compatibility.compatible) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return entry.matchScore > 0;
    })
    .sort((left, right) => {
      if (normalizedQuery && right.matchScore !== left.matchScore) {
        return right.matchScore - left.matchScore;
      }

      switch (sortMode) {
        case 'compatibility':
          if (Number(right.compatibility.compatible) !== Number(left.compatibility.compatible)) {
            return Number(right.compatibility.compatible) - Number(left.compatibility.compatible);
          }
          if (left.demandRank !== right.demandRank) {
            return left.demandRank - right.demandRank;
          }
          if (right.growthValue !== left.growthValue) {
            return right.growthValue - left.growthValue;
          }
          break;
        case 'growth':
          if (right.growthValue !== left.growthValue) {
            return right.growthValue - left.growthValue;
          }
          if (right.medianPay !== left.medianPay) {
            return right.medianPay - left.medianPay;
          }
          break;
        case 'pay':
          if (right.medianPay !== left.medianPay) {
            return right.medianPay - left.medianPay;
          }
          if (right.growthValue !== left.growthValue) {
            return right.growthValue - left.growthValue;
          }
          break;
        case 'title':
          return left.title.localeCompare(right.title);
        default:
          if (Number(right.compatibility.compatible) !== Number(left.compatibility.compatible)) {
            return Number(right.compatibility.compatible) - Number(left.compatibility.compatible);
          }
          if (right.growthValue !== left.growthValue) {
            return right.growthValue - left.growthValue;
          }
          if (right.medianPay !== left.medianPay) {
            return right.medianPay - left.medianPay;
          }
          if (left.demandRank !== right.demandRank) {
            return left.demandRank - right.demandRank;
          }
          break;
      }

      return left.title.localeCompare(right.title);
    });
}

export function summarizeCareerGroups(entries) {
  const counts = entries.reduce((accumulator, entry) => {
    accumulator[entry.oohGroup] = (accumulator[entry.oohGroup] || 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts)
    .map(([group, count]) => ({ group, count }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.group.localeCompare(right.group);
    });
}
