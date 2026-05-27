// @allow-modal
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { 
  Scale, Compass, FileText, Search, CheckCircle, AlertTriangle, Info, Activity, ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CAREERS_DATABASE } from '../data/school_data';
import { INDUSTRIES_LOOKUP } from '../data/industry_data';
import { generateJustificationLetter } from '../utils/letterGenerators';
import { fetchCurrentPlanDraft, fetchReferenceLibraryOverview, saveCurrentPlanDraft } from '../utils/backendApi';
import {
  buildCareerIndex,
  CAREER_DEMAND_FILTERS,
  CAREER_SORT_OPTIONS,
  evaluateCareerCompatibility,
  filterCareerIndex,
  summarizeCareerGroups
} from '../utils/careerIndex';

const CAREER_STRATEGY_DRAFT_TYPE = 'career_strategy_workspace';
const CAREER_STRATEGY_STORAGE_KEY = 'm28c_career_strategy_workspace';
const OFFICIAL_INDUSTRY_REFERENCES = [
  {
    id: 'naics-manual',
    source: 'U.S. Census Bureau',
    title: '2022 NAICS Manual',
    href: 'https://www.census.gov/naics/reference_files_tools/2022_NAICS_Manual.pdf',
    badge: 'Official PDF',
    description: 'Full classification manual for validating sector language, hierarchy, and exact 2022 code definitions.'
  },
  {
    id: 'iso-9001-standard',
    source: 'International Organization for Standardization',
    title: 'ISO 9001:2015',
    href: 'https://www.iso.org/standard/62085.html',
    badge: 'Official ISO',
    description: 'Current official quality-management standard page for manufacturing, operations, supply-chain, and service roles.'
  },
  {
    id: 'iso-9001-explained',
    source: 'International Organization for Standardization',
    title: 'ISO 9001 Explained',
    href: 'https://www.iso.org/home/insights-news/resources/iso-9001-explained.html',
    badge: 'Quick Guide',
    description: 'Practical explainer covering how ISO 9001 works, who uses it, and what the requirements mean operationally.'
  }
];

function clampCareerIndex(index) {
  if (!Number.isFinite(index)) {
    return 0;
  }

  const normalized = Math.max(0, Math.min(CAREERS_DATABASE.length - 1, Math.trunc(index)));
  return normalized;
}

function createDefaultGoalIndexWorkspace() {
  return {
    query: '',
    group: 'all',
    demand: 'all',
    sortMode: 'recommended',
    compatibleOnly: false
  };
}

function createDefaultCareerStrategyDraft() {
  return {
    schemaVersion: 1,
    timeline: {
      transitionYear: 8,
      taStartYear: 2,
      taEndYear: 6,
      useSkillBridge: true,
      skillBridgeDuration: 6,
      gibillMonths: 36,
      gibillStartYear: 9,
      vreMonths: 24,
      vreStartYear: 12,
      hasSEH: false
    },
    strategist: {
      selectedCareerIndex: 0,
      goalIndex: createDefaultGoalIndexWorkspace(),
      limitations: {
        limitStanding: false,
        limitLifting: false,
        limitBending: false,
        limitEnvironment: false,
        limitSitting: false,
        limitRepetitive: false,
        limitSensory: false,
        limitStress: false,
        limitRespiratory: false
      }
    },
    profiler: {
      riasecR: 3,
      riasecI: 3,
      riasecA: 3,
      riasecS: 3,
      riasecE: 3,
      riasecC: 3,
      showProfiler: false
    },
    justification: {
      justCurrentGoal: 'Operations Specialist',
      justProposedGoal: 'Software Developer',
      justReason: 'disability_worsened',
      justMedicalEvidence: true,
      justPhysicalImpact: 'Current job requires frequent bending, lifting, and carrying gear up to 50 lbs, which exacerbates my service-connected spinal stenosis and lumbar strain. Sitting at a computer desk is medically recommended.',
      justGeneratedLetter: ''
    },
    industryFinder: {
      industrySearchQuery: '',
      showIndustryFinder: false
    }
  };
}

function normalizeCareerStrategyDraft(rawDraft) {
  const defaults = createDefaultCareerStrategyDraft();
  if (!rawDraft || typeof rawDraft !== 'object' || Array.isArray(rawDraft)) {
    return defaults;
  }

  return {
    schemaVersion: 1,
    timeline: {
      ...defaults.timeline,
      ...(rawDraft.timeline || {})
    },
    strategist: {
      selectedCareerIndex: clampCareerIndex(rawDraft.strategist?.selectedCareerIndex ?? defaults.strategist.selectedCareerIndex),
      goalIndex: {
        ...defaults.strategist.goalIndex,
        ...(rawDraft.strategist?.goalIndex || {})
      },
      limitations: {
        ...defaults.strategist.limitations,
        ...(rawDraft.strategist?.limitations || {})
      }
    },
    profiler: {
      ...defaults.profiler,
      ...(rawDraft.profiler || {})
    },
    justification: {
      ...defaults.justification,
      ...(rawDraft.justification || {})
    },
    industryFinder: {
      ...defaults.industryFinder,
      ...(rawDraft.industryFinder || {})
    }
  };
}

function readCareerStrategyDraft(privacyMode) {
  const storage = privacyMode ? sessionStorage : localStorage;
  const rawDraft = storage.getItem(CAREER_STRATEGY_STORAGE_KEY);
  if (!rawDraft) {
    return null;
  }

  try {
    return normalizeCareerStrategyDraft(JSON.parse(rawDraft));
  } catch (error) {
    console.warn('Failed to parse saved career strategy draft, ignoring stored value.', error);
    return null;
  }
}

function writeCareerStrategyDraft(privacyMode, draftPayload) {
  const storage = privacyMode ? sessionStorage : localStorage;
  const otherStorage = privacyMode ? localStorage : sessionStorage;
  storage.setItem(CAREER_STRATEGY_STORAGE_KEY, JSON.stringify(draftPayload));
  otherStorage.removeItem(CAREER_STRATEGY_STORAGE_KEY);
}

function buildCareerStrategyDraftTitle(proposedGoal, careerIndex) {
  if (typeof proposedGoal === 'string' && proposedGoal.trim()) {
    return `${proposedGoal.trim()} strategy draft`;
  }

  const career = CAREERS_DATABASE[clampCareerIndex(careerIndex)] || CAREERS_DATABASE[0];
  return `${career.title} strategy draft`;
}

function CareerStrategyView({
  reduceMotion,
  privacyMode = false,
  isBackendOnline = false,
  dataResetToken = 0
}) {
  const [transitionYear, setTransitionYear] = useState(8);
  const [taStartYear, setTaStartYear] = useState(2);
  const [taEndYear, setTaEndYear] = useState(6);
  const [useSkillBridge, setUseSkillBridge] = useState(true);
  const [skillBridgeDuration, setSkillBridgeDuration] = useState(6);
  const [gibillMonths, setGibillMonths] = useState(36);
  const [gibillStartYear, setGibillStartYear] = useState(9);
  const [vreMonths, setVreMonths] = useState(24);
  const [vreStartYear, setVreStartYear] = useState(12);
  const [hasSEH, setHasSEH] = useState(false);
  const [selectedCareerIndex, setSelectedCareerIndex] = useState(0);
  const [limitStanding, setLimitStanding] = useState(false);
  const [limitLifting, setLimitLifting] = useState(false);
  const [limitBending, setLimitBending] = useState(false);
  const [limitEnvironment, setLimitEnvironment] = useState(false);
  const [limitSitting, setLimitSitting] = useState(false);
  const [limitRepetitive, setLimitRepetitive] = useState(false);
  const [limitSensory, setLimitSensory] = useState(false);
  const [limitStress, setLimitStress] = useState(false);
  const [limitRespiratory, setLimitRespiratory] = useState(false);
  const [riasecR, setRiasecR] = useState(3);
  const [riasecI, setRiasecI] = useState(3);
  const [riasecA, setRiasecA] = useState(3);
  const [riasecS, setRiasecS] = useState(3);
  const [riasecE, setRiasecE] = useState(3);
  const [riasecC, setRiasecC] = useState(3);
  const [showProfiler, setShowProfiler] = useState(false);
  const [justCurrentGoal, setJustCurrentGoal] = useState('Operations Specialist');
  const [justProposedGoal, setJustProposedGoal] = useState('Software Developer');
  const [justReason, setJustReason] = useState('disability_worsened');
  const [justMedicalEvidence, setJustMedicalEvidence] = useState(true);
  const [justPhysicalImpact, setJustPhysicalImpact] = useState(
    'Current job requires frequent bending, lifting, and carrying gear up to 50 lbs, which exacerbates my service-connected spinal stenosis and lumbar strain. Sitting at a computer desk is medically recommended.'
  );
  const [justGeneratedLetter, setJustGeneratedLetter] = useState('');
  const [careerSearchQuery, setCareerSearchQuery] = useState('');
  const [careerGroupFilter, setCareerGroupFilter] = useState('all');
  const [careerDemandFilter, setCareerDemandFilter] = useState('all');
  const [careerSortMode, setCareerSortMode] = useState('recommended');
  const [careerCompatibleOnly, setCareerCompatibleOnly] = useState(false);
  const [industrySearchQuery, setIndustrySearchQuery] = useState('');
  const [showIndustryFinder, setShowIndustryFinder] = useState(false);
  const [draftId, setDraftId] = useState(null);
  const [draftStatus, setDraftStatus] = useState(isBackendOnline ? 'ready' : 'local');
  const [draftError, setDraftError] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const hasHydratedRef = useRef(false);
  const skipAutosaveRef = useRef(true);
  const saveTimerRef = useRef(null);

  const deferredCareerSearchQuery = useDeferredValue(careerSearchQuery);
  const careerIndexEntries = useMemo(() => buildCareerIndex(CAREERS_DATABASE), []);
  const careerGroupSummary = useMemo(() => summarizeCareerGroups(careerIndexEntries), [careerIndexEntries]);

  const activeLimitations = useMemo(() => ({
    limitStanding,
    limitLifting,
    limitBending,
    limitEnvironment,
    limitSitting,
    limitRepetitive,
    limitSensory,
    limitStress,
    limitRespiratory
  }), [
    limitStanding,
    limitLifting,
    limitBending,
    limitEnvironment,
    limitSitting,
    limitRepetitive,
    limitSensory,
    limitStress,
    limitRespiratory
  ]);

  const compatibilityByIndex = useMemo(() => careerIndexEntries.reduce((accumulator, careerEntry) => {
    accumulator[careerEntry.index] = evaluateCareerCompatibility(careerEntry, activeLimitations);
    return accumulator;
  }, {}), [activeLimitations, careerIndexEntries]);

  const filteredCareerEntries = useMemo(() => filterCareerIndex(careerIndexEntries, {
    query: deferredCareerSearchQuery,
    group: careerGroupFilter,
    demand: careerDemandFilter,
    sortMode: careerSortMode,
    compatibleOnly: careerCompatibleOnly,
    compatibilityByIndex
  }), [
    careerCompatibleOnly,
    careerDemandFilter,
    careerGroupFilter,
    careerIndexEntries,
    careerSortMode,
    compatibilityByIndex,
    deferredCareerSearchQuery
  ]);

  const careerIndexStats = useMemo(() => ({
    total: careerIndexEntries.length,
    compatible: careerIndexEntries.filter((entry) => compatibilityByIndex[entry.index]?.compatible).length,
    highGrowth: careerIndexEntries.filter((entry) => entry.growthValue >= 15).length,
    lowDemand: careerIndexEntries.filter((entry) => entry.physicalDemand === 'Sedentary' || entry.physicalDemand === 'Light').length
  }), [careerIndexEntries, compatibilityByIndex]);

  const selectedCareerVisibleInResults = useMemo(
    () => filteredCareerEntries.some((entry) => entry.index === selectedCareerIndex),
    [filteredCareerEntries, selectedCareerIndex]
  );

  const currentCareer = useMemo(
    () => CAREERS_DATABASE[clampCareerIndex(selectedCareerIndex)] || CAREERS_DATABASE[0],
    [selectedCareerIndex]
  );

  const currentCareerCompatibility = useMemo(
    () => compatibilityByIndex[selectedCareerIndex] || { compatible: true, reasons: [] },
    [compatibilityByIndex, selectedCareerIndex]
  );
  const [referenceLibraryOverview, setReferenceLibraryOverview] = useState(null);

  const industryReferenceLinks = useMemo(() => ([
    {
      id: 'selected-naics-lookup',
      source: 'U.S. Census Bureau',
      title: `Selected goal NAICS lookup`,
      href: `https://www.census.gov/naics/?input=${encodeURIComponent(currentCareer.naics || currentCareer.title)}&year=2022`,
      badge: 'Live Lookup',
      description: `Open the official 2022 NAICS search prefilled for ${currentCareer.title} (${currentCareer.naics}).`
    },
    ...OFFICIAL_INDUSTRY_REFERENCES
  ]), [currentCareer]);

  useEffect(() => {
    if (!isBackendOnline) {
      return;
    }

    let isCancelled = false;

    fetchReferenceLibraryOverview({ privacyMode })
      .then((overview) => {
        if (!isCancelled) {
          setReferenceLibraryOverview(overview);
        }
      })
      .catch((error) => {
        console.error('Failed to load backend reference library overview:', error);
      });

    return () => {
      isCancelled = true;
    };
  }, [isBackendOnline, privacyMode]);

  const applyDraft = useCallback((draft) => {
    const normalizedDraft = normalizeCareerStrategyDraft(draft);
    setTransitionYear(normalizedDraft.timeline.transitionYear);
    setTaStartYear(normalizedDraft.timeline.taStartYear);
    setTaEndYear(normalizedDraft.timeline.taEndYear);
    setUseSkillBridge(Boolean(normalizedDraft.timeline.useSkillBridge));
    setSkillBridgeDuration(normalizedDraft.timeline.skillBridgeDuration);
    setGibillMonths(normalizedDraft.timeline.gibillMonths);
    setGibillStartYear(normalizedDraft.timeline.gibillStartYear);
    setVreMonths(normalizedDraft.timeline.vreMonths);
    setVreStartYear(normalizedDraft.timeline.vreStartYear);
    setHasSEH(Boolean(normalizedDraft.timeline.hasSEH));
    setSelectedCareerIndex(normalizedDraft.strategist.selectedCareerIndex);
    setLimitStanding(Boolean(normalizedDraft.strategist.limitations.limitStanding));
    setLimitLifting(Boolean(normalizedDraft.strategist.limitations.limitLifting));
    setLimitBending(Boolean(normalizedDraft.strategist.limitations.limitBending));
    setLimitEnvironment(Boolean(normalizedDraft.strategist.limitations.limitEnvironment));
    setLimitSitting(Boolean(normalizedDraft.strategist.limitations.limitSitting));
    setLimitRepetitive(Boolean(normalizedDraft.strategist.limitations.limitRepetitive));
    setLimitSensory(Boolean(normalizedDraft.strategist.limitations.limitSensory));
    setLimitStress(Boolean(normalizedDraft.strategist.limitations.limitStress));
    setLimitRespiratory(Boolean(normalizedDraft.strategist.limitations.limitRespiratory));
    setCareerSearchQuery(normalizedDraft.strategist.goalIndex.query);
    setCareerGroupFilter(normalizedDraft.strategist.goalIndex.group);
    setCareerDemandFilter(normalizedDraft.strategist.goalIndex.demand);
    setCareerSortMode(normalizedDraft.strategist.goalIndex.sortMode);
    setCareerCompatibleOnly(Boolean(normalizedDraft.strategist.goalIndex.compatibleOnly));
    setRiasecR(normalizedDraft.profiler.riasecR);
    setRiasecI(normalizedDraft.profiler.riasecI);
    setRiasecA(normalizedDraft.profiler.riasecA);
    setRiasecS(normalizedDraft.profiler.riasecS);
    setRiasecE(normalizedDraft.profiler.riasecE);
    setRiasecC(normalizedDraft.profiler.riasecC);
    setShowProfiler(Boolean(normalizedDraft.profiler.showProfiler));
    setJustCurrentGoal(normalizedDraft.justification.justCurrentGoal);
    setJustProposedGoal(normalizedDraft.justification.justProposedGoal);
    setJustReason(normalizedDraft.justification.justReason);
    setJustMedicalEvidence(Boolean(normalizedDraft.justification.justMedicalEvidence));
    setJustPhysicalImpact(normalizedDraft.justification.justPhysicalImpact);
    setJustGeneratedLetter(normalizedDraft.justification.justGeneratedLetter);
    setIndustrySearchQuery(normalizedDraft.industryFinder.industrySearchQuery);
    setShowIndustryFinder(Boolean(normalizedDraft.industryFinder.showIndustryFinder));
  }, []);

  const buildDraftPayload = useCallback(() => ({
    schemaVersion: 1,
    timeline: {
      transitionYear,
      taStartYear,
      taEndYear,
      useSkillBridge,
      skillBridgeDuration,
      gibillMonths,
      gibillStartYear,
      vreMonths,
      vreStartYear,
      hasSEH
    },
    strategist: {
      selectedCareerIndex,
      goalIndex: {
        query: careerSearchQuery,
        group: careerGroupFilter,
        demand: careerDemandFilter,
        sortMode: careerSortMode,
        compatibleOnly: careerCompatibleOnly
      },
      limitations: {
        limitStanding,
        limitLifting,
        limitBending,
        limitEnvironment,
        limitSitting,
        limitRepetitive,
        limitSensory,
        limitStress,
        limitRespiratory
      }
    },
    profiler: {
      riasecR,
      riasecI,
      riasecA,
      riasecS,
      riasecE,
      riasecC,
      showProfiler
    },
    justification: {
      justCurrentGoal,
      justProposedGoal,
      justReason,
      justMedicalEvidence,
      justPhysicalImpact,
      justGeneratedLetter
    },
    industryFinder: {
      industrySearchQuery,
      showIndustryFinder
    }
  }), [
    careerCompatibleOnly,
    careerDemandFilter,
    careerGroupFilter,
    careerSearchQuery,
    careerSortMode,
    gibillMonths,
    gibillStartYear,
    hasSEH,
    industrySearchQuery,
    justCurrentGoal,
    justGeneratedLetter,
    justMedicalEvidence,
    justPhysicalImpact,
    justProposedGoal,
    justReason,
    limitBending,
    limitEnvironment,
    limitLifting,
    limitRepetitive,
    limitRespiratory,
    limitSensory,
    limitSitting,
    limitStanding,
    limitStress,
    riasecA,
    riasecC,
    riasecE,
    riasecI,
    riasecR,
    riasecS,
    selectedCareerIndex,
    showIndustryFinder,
    showProfiler,
    skillBridgeDuration,
    taEndYear,
    taStartYear,
    transitionYear,
    useSkillBridge,
    vreMonths,
    vreStartYear
  ]);

  const resetDraftSessionMeta = useCallback(() => {
    setDraftError('');
    setDraftId(null);
    setLastSavedAt(null);
  }, []);

  const markLocalDraftState = useCallback(() => {
    setDraftStatus('local');
    setDraftError('');
  }, []);

  const buildDraftPayloadRef = useRef(buildDraftPayload);

  useEffect(() => {
    buildDraftPayloadRef.current = buildDraftPayload;
  }, [buildDraftPayload]);

  const persistDraft = useCallback(async (draftPayload) => {
    const payloadToPersist = draftPayload ?? buildDraftPayloadRef.current();
    if (!isBackendOnline) {
      writeCareerStrategyDraft(privacyMode, payloadToPersist);
      markLocalDraftState();
      return null;
    }

    setDraftStatus('saving');
    const savedDraft = await saveCurrentPlanDraft(CAREER_STRATEGY_DRAFT_TYPE, payloadToPersist, {
      privacyMode,
      title: buildCareerStrategyDraftTitle(payloadToPersist.justification.justProposedGoal, payloadToPersist.strategist.selectedCareerIndex)
    });

    const normalizedPayload = normalizeCareerStrategyDraft(savedDraft.payload || payloadToPersist);
    writeCareerStrategyDraft(privacyMode, normalizedPayload);
    setDraftId(savedDraft.id);
    setLastSavedAt(savedDraft.updatedAt || new Date().toISOString());
    setDraftStatus('synced');
    setDraftError('');
    return savedDraft;
  }, [isBackendOnline, markLocalDraftState, privacyMode]);

  const handleTransitionYearChange = (val) => {
    setTransitionYear(val);
    if (taEndYear > val) {
      setTaEndYear(val);
    }
    if (taStartYear > val) {
      setTaStartYear(val);
    }
  };

  const handleTaStartChange = (val) => {
    const startVal = Math.min(val, taEndYear);
    setTaStartYear(Math.min(startVal, transitionYear));
  };

  const handleTaEndChange = (val) => {
    const endVal = Math.max(val, taStartYear);
    setTaEndYear(Math.min(endVal, transitionYear));
  };

  const handleCareerSelection = useCallback((nextIndex) => {
    const normalizedIndex = clampCareerIndex(nextIndex);
    setSelectedCareerIndex(normalizedIndex);
    const career = CAREERS_DATABASE[normalizedIndex];
    if (career) {
      setJustProposedGoal(career.title);
    }
  }, []);

  const clearCareerIndexFilters = useCallback(() => {
    setCareerSearchQuery('');
    setCareerGroupFilter('all');
    setCareerDemandFilter('all');
    setCareerSortMode('recommended');
    setCareerCompatibleOnly(false);
  }, []);

  useEffect(() => {
    const sourceStorage = privacyMode ? localStorage : sessionStorage;
    const targetStorage = privacyMode ? sessionStorage : localStorage;
    const sourceDraft = sourceStorage.getItem(CAREER_STRATEGY_STORAGE_KEY);
    const targetDraft = targetStorage.getItem(CAREER_STRATEGY_STORAGE_KEY);

    if (!targetDraft && sourceDraft) {
      targetStorage.setItem(CAREER_STRATEGY_STORAGE_KEY, sourceDraft);
    }

    sourceStorage.removeItem(CAREER_STRATEGY_STORAGE_KEY);
  }, [privacyMode]);

  useEffect(() => {
    let cancelled = false;
    const localDraft = readCareerStrategyDraft(privacyMode);
    const fallbackDraft = localDraft || createDefaultCareerStrategyDraft();

    hasHydratedRef.current = false;
    skipAutosaveRef.current = true;
    queueMicrotask(() => {
      if (!cancelled) {
        resetDraftSessionMeta();
      }
    });
    queueMicrotask(() => {
      if (!cancelled) {
        applyDraft(fallbackDraft);
      }
    });

    if (!isBackendOnline) {
      queueMicrotask(markLocalDraftState);
      hasHydratedRef.current = true;
      window.setTimeout(() => {
        skipAutosaveRef.current = false;
      }, 0);
      return () => {
        cancelled = true;
      };
    }

    queueMicrotask(() => {
      if (!cancelled) {
        setDraftStatus('loading');
      }
    });

    const loadRemoteDraft = async () => {
      try {
        const remoteDraft = await fetchCurrentPlanDraft(CAREER_STRATEGY_DRAFT_TYPE, { privacyMode });
        if (cancelled) {
          return;
        }

        if (remoteDraft?.payload) {
          const normalizedPayload = normalizeCareerStrategyDraft(remoteDraft.payload);
          applyDraft(normalizedPayload);
          writeCareerStrategyDraft(privacyMode, normalizedPayload);
          setDraftId(remoteDraft.id);
          setLastSavedAt(remoteDraft.updatedAt || null);
          setDraftStatus('synced');
          return;
        }

        if (localDraft) {
          await persistDraft(localDraft);
        } else {
          setDraftStatus('ready');
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setDraftStatus(localDraft ? 'local' : 'error');
        setDraftError(error.message || 'Failed to load career strategy draft.');
      } finally {
        if (!cancelled) {
          hasHydratedRef.current = true;
          window.setTimeout(() => {
            skipAutosaveRef.current = false;
          }, 0);
        }
      }
    };

    loadRemoteDraft();

    return () => {
      cancelled = true;
    };
  }, [applyDraft, dataResetToken, isBackendOnline, markLocalDraftState, persistDraft, privacyMode, resetDraftSessionMeta]);

  useEffect(() => () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      return undefined;
    }

    const draftPayload = buildDraftPayload();
    writeCareerStrategyDraft(privacyMode, draftPayload);

    if (skipAutosaveRef.current) {
      skipAutosaveRef.current = false;
      return undefined;
    }

    if (!isBackendOnline) {
      queueMicrotask(markLocalDraftState);
      return undefined;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      setDraftStatus('saving');
      persistDraft(draftPayload).catch((error) => {
        setDraftStatus('local');
        setDraftError(error.message || 'Failed to save career strategy draft.');
      });
    }, 700);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [
    buildDraftPayload,
    isBackendOnline,
    markLocalDraftState,
    persistDraft,
    privacyMode
  ]);

  const handleSaveDraftNow = () => {
    const draftPayload = buildDraftPayload();
    writeCareerStrategyDraft(privacyMode, draftPayload);
    persistDraft(draftPayload).catch((error) => {
      setDraftStatus('local');
      setDraftError(error.message || 'Failed to save career strategy draft.');
    });
  };

  const draftStatusMeta = useMemo(() => {
    switch (draftStatus) {
      case 'loading':
        return {
          label: 'Loading draft',
          className: 'bg-sky-500/10 border-sky-500/30 text-sky-300'
        };
      case 'saving':
        return {
          label: 'Saving to SQLite',
          className: 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        };
      case 'synced':
        return {
          label: 'Synced to SQLite',
          className: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        };
      case 'ready':
        return {
          label: 'Ready to save',
          className: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
        };
      case 'error':
        return {
          label: 'Load error',
          className: 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        };
      default:
        return {
          label: 'Stored locally',
          className: 'bg-slate-500/10 border-slate-500/30 text-slate-300'
        };
    }
  }, [draftStatus]);

  const lastSavedLabel = useMemo(() => {
    if (!lastSavedAt) {
      return '';
    }

    try {
      return new Date(lastSavedAt).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  }, [lastSavedAt]);

  const getRiasecRecommendations = () => {
    const scores = [
      { name: 'Realistic', value: riasecR, description: 'Hands-on, machine-oriented, outdoors, or physical work.' },
      { name: 'Investigative', value: riasecI, description: 'Analytical, research-oriented, problem-solving, science/math.' },
      { name: 'Artistic', value: riasecA, description: 'Creative, designing, layout, writing, expressive work.' },
      { name: 'Social', value: riasecS, description: 'Helping, instructing, advising, coordinating, teaching.' },
      { name: 'Enterprising', value: riasecE, description: 'Leadership, project management, operations, business ventures.' },
      { name: 'Conventional', value: riasecC, description: 'Data processing, spreadsheets, audit, systematic records.' }
    ];
    
    scores.sort((a, b) => b.value - a.value);
    const topScore = scores[0];
    
    let matches = [];
    if (topScore.name === 'Realistic') {
      matches = CAREERS_DATABASE.filter(c => c.physicalDemand === 'Medium' || c.physicalDemand === 'Heavy');
    } else if (topScore.name === 'Investigative') {
      matches = CAREERS_DATABASE.filter(c => c.oohGroup === 'Computer and Information Technology');
    } else if (topScore.name === 'Artistic') {
      matches = CAREERS_DATABASE.filter(c => c.title === 'Business Operations Specialist' || c.title === 'Software Developer');
    } else if (topScore.name === 'Social') {
      matches = CAREERS_DATABASE.filter(c => c.title === 'Business Operations Specialist' || c.title === 'Logistics Manager');
    } else if (topScore.name === 'Enterprising') {
      matches = CAREERS_DATABASE.filter(c => c.title === 'Business Operations Specialist' || c.title === 'Logistics Manager' || c.title === 'Commercial Pilot');
    } else if (topScore.name === 'Conventional') {
      matches = CAREERS_DATABASE.filter(c => c.title === 'Accountant' || c.title === 'Logistics Manager');
    }
    
    return { topScore, matches };
  };

  const handleGenerateLetter = () => {
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const letter = generateJustificationLetter({
      dateStr,
      career: currentCareer,
      justReason,
      justCurrentGoal,
      justPhysicalImpact,
      justMedicalEvidence
    });
    setJustGeneratedLetter(letter);
  };

  const pct = (val) => `${(val / 15) * 100}%`;

  const audits = [];
  const totalVAEduMonths = gibillMonths + vreMonths;
  
  if (totalVAEduMonths > 48) {
    if (!hasSEH) {
      audits.push({
        id: 'cap_exceeded',
        type: 'danger',
        title: '48-Month Statutory Limit Exceeded',
        message: `Your planned path uses ${totalVAEduMonths} months of combined VA benefits (Post-9/11 GI Bill + VR&E). Under 38 U.S.C. 3695, a veteran cannot exceed 48 months of combined entitlement unless a Serious Employment Handicap (SEH) is established.`,
        cite: '38 U.S.C. 3695'
      });
    } else {
      audits.push({
        id: 'seh_authorized',
        type: 'success',
        title: 'SEH Exception Authorized (48-Month Limit Bypassed)',
        message: `Serious Employment Handicap (SEH) is active. The statutory 48-month entitlement cap is legally bypassed under 38 U.S.C. § 3102, allowing up to ${vreMonths} months of rehabilitation services in addition to GI Bill benefits.`,
        cite: '38 U.S.C. 3102'
      });
    }
  }

  // Active Duty / VR&E Conflict
  if (vreMonths > 0 && vreStartYear <= transitionYear) {
    audits.push({
      id: 'vre_active_duty',
      type: 'warning',
      title: 'VR&E Active Duty Conflict',
      message: 'VR&E (Chapter 31) is scheduled during active duty service. While active-duty service members awaiting medical separation can apply under IDES, full VR&E services and subsistence allowance are generally limited to veterans with a service-connected disability rating.',
      cite: '38 U.S.C. 3102'
    });
  }

  // Active Duty / TA separation conflict
  if (taStartYear > transitionYear || taEndYear > transitionYear) {
    audits.push({
      id: 'ta_separation',
      type: 'warning',
      title: 'TA Separation Conflict',
      message: 'Tuition Assistance (TA) is scheduled during veteran status. TA is strictly an active-duty benefit and cannot be used post-separation.',
      cite: 'DoD Vol. Ed. Partnership Memorandum'
    });
  }

  // SkillBridge separation conflict
  if (useSkillBridge && transitionYear < 1) {
    audits.push({
      id: 'sb_no_service',
      type: 'warning',
      title: 'SkillBridge Service Requirement',
      message: 'DoD SkillBridge requires active duty service status. Verify that your transition timeline matches your service dates.',
      cite: 'DoD Instruction 1322.29'
    });
  }

  // Overlap check
  const gibillStartVal = gibillStartYear - 1;
  const gibillEndVal = gibillStartVal + (gibillMonths / 12);
  const vreStartVal = vreStartYear - 1;
  const vreEndVal = vreStartVal + (vreMonths / 12);

  const isOverlapping = vreMonths > 0 && gibillMonths > 0 && 
                        (vreStartVal < gibillEndVal && gibillStartVal < vreEndVal);
  if (isOverlapping) {
    audits.push({
      id: 'va_overlap',
      type: 'warning',
      title: 'Overlapping VA Entitlements',
      message: 'Post-9/11 GI Bill and VR&E (Chapter 31) are scheduled to overlap. Veterans cannot receive concurrent payments from both chapters for the same course of study. These benefits require sequential rather than concurrent scheduling.',
      cite: '38 CFR 21.21'
    });
  }

  return (
    <motion.div 
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? {} : { opacity: 0, y: -15 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
      className="doc-card"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <span className="doc-tag">VA Career Plan and Strategy</span>
          <h1 className="doc-title">Career Plan, Strategy and Justification Wizard</h1>
          <p className="doc-subtitle">Generate legally structured VRC justification letters, assess physical compatibility, and find industry classification codes.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${draftStatusMeta.className}`}>
            {draftStatusMeta.label}
          </span>
          {draftId && (
            <span className="text-[10px] text-slate-500">
              Draft ID: <span className="font-mono text-slate-400">{draftId.slice(0, 10)}</span>
            </span>
          )}
          {lastSavedLabel && (
            <span className="text-[10px] text-slate-500">Last saved {lastSavedLabel}</span>
          )}
          {draftError && (
            <span className="text-[10px] text-amber-300">{draftError}</span>
          )}
          {isBackendOnline && (
            <button
              type="button"
              className="px-3 py-1.5 text-[10px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded border border-amber-300/20 cursor-pointer transition-colors duration-150"
              onClick={handleSaveDraftNow}
            >
              Save Workspace
            </button>
          )}
        </div>
      </div>
      <div className="doc-divider"></div>

      {/* 15-Year Entitlement & Transition Stack Chart */}
      <div className="mb-8 p-6 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl hover:border-slate-700 transition-all duration-300 relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} />
              15-Year Entitlement & Transition Stack Chart
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Model your transition timeline, sequence active-duty tuition assistance (TA), SkillBridge, GI Bill, and VR&E, and audit statutory caps.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20">38 U.S.C. § 3695 Compliant</span>
          </div>
        </div>

        {/* Timeline Tracks */}
        <div className="space-y-4 mb-6">
          {/* Header labels */}
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Benefit Track</div>
            <div className="col-span-9 relative h-6">
              {Array.from({ length: 15 }).map((_, i) => (
                <div 
                  key={i} 
                  className="absolute text-[10px] font-bold text-slate-400 text-center -translate-x-1/2" 
                  style={{ left: `${((i + 0.5) / 15) * 100}%` }}
                >
                  Yr {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Track 1: Service Status */}
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-3 text-xs font-bold text-slate-300 flex flex-col">
              <span>Service Status</span>
              <span className="text-[10px] text-slate-500 font-normal">Active vs. Veteran</span>
            </div>
            <div className="col-span-9 relative h-10 bg-slate-950/40 border border-slate-900 rounded-lg overflow-hidden">
              {/* Grid lines */}
              <div className="absolute inset-0 flex justify-between pointer-events-none">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="h-full border-r border-slate-900/30" style={{ left: `${(i / 15) * 100}%`, position: 'absolute' }} />
                ))}
              </div>
              
              {/* Active Duty Bar */}
              <div 
                className="absolute top-1 bottom-1 bg-gradient-to-r from-sky-500/20 to-cyan-500/30 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold flex items-center justify-center rounded-md cursor-help shadow-sm transition-all duration-300"
                style={{ left: 0, width: pct(transitionYear) }}
                title={`Active Duty Service: Years 1 to ${transitionYear}`}
              >
                Active Duty ({transitionYear} Yrs)
              </div>

              {/* Veteran Bar */}
              {15 - transitionYear > 0 && (
                <div 
                  className="absolute top-1 bottom-1 bg-gradient-to-r from-slate-800/40 to-slate-900/50 border border-slate-700/30 text-slate-400 text-[10px] font-bold flex items-center justify-center rounded-md cursor-help transition-all duration-300"
                  style={{ left: pct(transitionYear), width: pct(15 - transitionYear) }}
                  title={`Veteran Status: Years ${transitionYear + 1} to 15`}
                >
                  Veteran ({15 - transitionYear} Yrs)
                </div>
              )}
            </div>
          </div>

          {/* Track 2: Tuition Assistance */}
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-3 text-xs font-bold text-slate-300 flex flex-col">
              <span>Tuition Assistance (TA)</span>
              <span className="text-[10px] text-slate-500 font-normal">Active Duty Ed Benefit</span>
            </div>
            <div className="col-span-9 relative h-10 bg-slate-950/40 border border-slate-900 rounded-lg overflow-hidden">
              {/* Grid lines */}
              <div className="absolute inset-0 flex justify-between pointer-events-none">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="h-full border-r border-slate-900/30" style={{ left: `${(i / 15) * 100}%`, position: 'absolute' }} />
                ))}
              </div>
              
              {/* TA Bar */}
              {taEndYear >= taStartYear && taStartYear <= transitionYear && (
                <div 
                  className="absolute top-1 bottom-1 bg-gradient-to-r from-emerald-600/20 to-teal-500/30 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center justify-center rounded-md cursor-help transition-all duration-300"
                  style={{ 
                    left: pct(taStartYear - 1), 
                    width: pct(Math.min(taEndYear, transitionYear) - taStartYear + 1) 
                  }}
                  title={`Tuition Assistance (TA): Years ${taStartYear} to ${Math.min(taEndYear, transitionYear)}`}
                >
                  TA ({Math.min(taEndYear, transitionYear) - taStartYear + 1} Yrs)
                </div>
              )}
            </div>
          </div>

          {/* Track 3: SkillBridge */}
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-3 text-xs font-bold text-slate-300 flex flex-col">
              <span>DoD SkillBridge</span>
              <span className="text-[10px] text-slate-500 font-normal">Transition Internship</span>
            </div>
            <div className="col-span-9 relative h-10 bg-slate-950/40 border border-slate-900 rounded-lg overflow-hidden">
              {/* Grid lines */}
              <div className="absolute inset-0 flex justify-between pointer-events-none">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="h-full border-r border-slate-900/30" style={{ left: `${(i / 15) * 100}%`, position: 'absolute' }} />
                ))}
              </div>
              
              {/* SkillBridge Bar */}
              {useSkillBridge && transitionYear > 0 && (
                <div 
                  className="absolute top-1 bottom-1 bg-gradient-to-r from-purple-600/20 to-fuchsia-500/30 border border-purple-500/30 text-purple-300 text-[10px] font-bold flex items-center justify-center rounded-md cursor-help transition-all duration-300"
                  style={{ 
                    left: pct(transitionYear - skillBridgeDuration / 12), 
                    width: pct(skillBridgeDuration / 12) 
                  }}
                  title={`DoD SkillBridge: Last ${skillBridgeDuration} Months of Active Duty`}
                >
                  SkillBridge ({skillBridgeDuration} Mo)
                </div>
              )}
            </div>
          </div>

          {/* Track 4: Post-9/11 GI Bill */}
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-3 text-xs font-bold text-slate-300 flex flex-col">
              <span>Post-9/11 GI Bill (Ch33)</span>
              <span className="text-[10px] text-slate-500 font-normal">VA Education Benefit</span>
            </div>
            <div className="col-span-9 relative h-10 bg-slate-950/40 border border-slate-900 rounded-lg overflow-hidden">
              {/* Grid lines */}
              <div className="absolute inset-0 flex justify-between pointer-events-none">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="h-full border-r border-slate-900/30" style={{ left: `${(i / 15) * 100}%`, position: 'absolute' }} />
                ))}
              </div>
              
              {/* GI Bill Bar */}
              {gibillMonths > 0 && (
                <div 
                  className="absolute top-1 bottom-1 bg-gradient-to-r from-indigo-600/20 to-blue-500/30 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold flex items-center justify-center rounded-md cursor-help transition-all duration-300"
                  style={{ 
                    left: pct(gibillStartYear - 1), 
                    width: pct(gibillMonths / 12) 
                  }}
                  title={`Post-9/11 GI Bill: ${gibillMonths} Months starting in Year ${gibillStartYear}`}
                >
                  GI Bill ({gibillMonths} Mo)
                </div>
              )}
            </div>
          </div>

          {/* Track 5: VR&E Ch31 */}
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-3 text-xs font-bold text-slate-300 flex flex-col">
              <span>VR&E Chapter 31</span>
              <span className="text-[10px] text-slate-500 font-normal">VA Employment Program</span>
            </div>
            <div className="col-span-9 relative h-10 bg-slate-950/40 border border-slate-900 rounded-lg overflow-hidden">
              {/* Grid lines */}
              <div className="absolute inset-0 flex justify-between pointer-events-none">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="h-full border-r border-slate-900/30" style={{ left: `${(i / 15) * 100}%`, position: 'absolute' }} />
                ))}
              </div>
              
              {/* VR&E Bar */}
              {vreMonths > 0 && (
                <div 
                  className="absolute top-1 bottom-1 bg-gradient-to-r from-amber-600/20 to-orange-500/30 border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center justify-center rounded-md cursor-help transition-all duration-300"
                  style={{ 
                    left: pct(vreStartYear - 1), 
                    width: pct(vreMonths / 12) 
                  }}
                  title={`VR&E Chapter 31: ${vreMonths} Months starting in Year ${vreStartYear}`}
                >
                  VR&E ({vreMonths} Mo)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-slate-950/30 border border-slate-800 rounded-xl mb-6">
          {/* Column 1: Service & Transition */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-1.5 flex items-center gap-1.5">
              <span>Service & Transition</span>
            </h4>
            
            <div className="form-group">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Transition Year: Year {transitionYear}</label>
              <input 
                type="range" min="1" max="15" value={transitionYear} 
                onChange={(e) => handleTransitionYearChange(parseInt(e.target.value))}
                className="w-full accent-amber-500 h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[9px] text-slate-500 mt-1 block">Separate active duty pay from veteran status benefits.</span>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                <input 
                  type="checkbox" 
                  checked={useSkillBridge} 
                  onChange={(e) => setUseSkillBridge(e.target.checked)}
                  className="accent-amber-500"
                />
                <strong>DoD SkillBridge</strong>
              </label>
              {useSkillBridge && (
                <div className="mt-2 pl-5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Duration: {skillBridgeDuration} Months</label>
                  <input 
                    type="range" min="1" max="6" value={skillBridgeDuration} 
                    onChange={(e) => setSkillBridgeDuration(parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Column 2: In-Service Education (TA) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-1.5">In-Service Education</h4>
            
            <div className="form-group">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">TA Active Window: Yr {taStartYear} to Yr {taEndYear}</label>
              <div className="flex gap-2 items-center mb-1">
                <select 
                  className="form-control text-xs" 
                  value={taStartYear} 
                  onChange={(e) => handleTaStartChange(parseInt(e.target.value))}
                >
                  {Array.from({ length: 15 }).map((_, i) => (
                    <option key={i} value={i + 1}>Start: Year {i + 1}</option>
                  ))}
                </select>
                <span className="text-slate-500 text-xs">to</span>
                <select 
                  className="form-control text-xs" 
                  value={taEndYear} 
                  onChange={(e) => handleTaEndChange(parseInt(e.target.value))}
                >
                  {Array.from({ length: 15 }).map((_, i) => (
                    <option key={i} value={i + 1}>End: Year {i + 1}</option>
                  ))}
                </select>
              </div>
              <span className="text-[9px] text-slate-500 block">Tuition Assistance is only available during active duty service.</span>
            </div>
          </div>

          {/* Column 3: Post-Service VA Benefits */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800/80 pb-1.5">Post-Service VA Benefits</h4>

            <div className="form-group mb-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Post-9/11 GI Bill: {gibillMonths} Months (Yr {gibillStartYear})</label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <span className="text-[9px] text-slate-500 block mb-0.5">Start Year</span>
                  <input 
                    type="range" min="1" max="15" value={gibillStartYear} 
                    onChange={(e) => setGibillStartYear(parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[9px] text-slate-500 block mb-0.5">Months (Max 36)</span>
                  <input 
                    type="range" min="0" max="36" step="1" value={gibillMonths} 
                    onChange={(e) => setGibillMonths(parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="form-group mb-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">VR&E Ch31: {vreMonths} Months (Yr {vreStartYear})</label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <span className="text-[9px] text-slate-500 block mb-0.5">Start Year</span>
                  <input 
                    type="range" min="1" max="15" value={vreStartYear} 
                    onChange={(e) => setVreStartYear(parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[9px] text-slate-500 block mb-0.5">Months (Max {hasSEH ? 72 : 48})</span>
                  <input 
                    type="range" min="0" max={hasSEH ? 72 : 48} step="1" value={vreMonths} 
                    onChange={(e) => setVreMonths(parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                <input 
                  type="checkbox" 
                  checked={hasSEH} 
                  onChange={(e) => {
                    setHasSEH(e.target.checked);
                    if (!e.target.checked && vreMonths > 48) {
                      setVreMonths(48);
                    }
                  }}
                  className="accent-amber-500"
                />
                <strong className="text-amber-400">Establish Serious Employment Handicap (SEH)</strong>
              </label>
              <span className="text-[9px] text-slate-500 block mt-1">Under 38 U.S.C. 3102, an SEH bypasses the standard 48-month entitlement limit.</span>
            </div>
          </div>
        </div>

        {/* Audit Log Results */}
        <div className="bg-slate-950/20 border border-slate-800 rounded-xl p-4">
          <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Scale size={13} className="text-slate-400" />
            <span>Statutory Compliance Audits & Citations</span>
          </h4>
          
          {audits.length > 0 ? (
            <div className="space-y-2">
              {audits.map((a) => (
                <div key={a.id} className={`flex items-start gap-3 p-3 rounded-lg border text-xs leading-relaxed ${
                  a.type === 'danger' ? 'bg-red-500/5 border-red-500/20 text-red-400' :
                  a.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' :
                  'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                }`}>
                  <div className="flex-shrink-0 mt-0.5 font-bold">
                    {a.type === 'danger' ? '[LIMIT]' : a.type === 'warning' ? '[CONFLICT]' : '[APPROVED]'}
                  </div>
                  <div className="flex-1">
                    <strong className="block text-slate-200">{a.title}</strong>
                    <span className="text-slate-400 block mt-0.5">{a.message}</span>
                  </div>
                  <div className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800/80 text-slate-400 flex-shrink-0 self-center">
                    {a.cite}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-xs text-emerald-400">
              <div className="font-bold">[COMPLIANT]</div>
              <div className="flex-1">
                <strong className="block text-slate-200">Timeline Audited: 100% Compliant</strong>
                <span className="text-slate-400 block mt-0.5">Your proposed sequence complies with all active-duty service limits, 38 U.S.C. § 3695 caps, and concurrent usage regulations.</span>
              </div>
              <div className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800/80 text-slate-400">
                38 U.S.C. § 3695
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Bento Grid for Input Cards */}
        <div className="lg:col-span-7 space-y-6">
          {/* Labor Market & Disability Compatibility Strategist */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300">
            <h4 className="text-sm font-bold text-amber-500 mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
              <Scale size={16} />
              Labor Market & Disability Compatibility Strategist
            </h4>
            
            <div className="form-group">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Target Occupational Goal (OOH/O*NET Classification Database)</label>
              <div className="space-y-3 rounded-xl border border-slate-800/80 bg-slate-950/35 p-3">
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.45fr)]">
                  <div className="space-y-3">
                    <div className="relative">
                      <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        className="form-control pl-9 text-xs"
                        placeholder="Search title, SOC, OOH group, education, SIC, NAICS, or duties..."
                        value={careerSearchQuery}
                        onChange={(e) => setCareerSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <select
                        className="form-control text-xs"
                        value={careerGroupFilter}
                        onChange={(e) => setCareerGroupFilter(e.target.value)}
                      >
                        <option value="all">All OOH families</option>
                        {careerGroupSummary.map((groupEntry) => (
                          <option key={groupEntry.group} value={groupEntry.group}>
                            {groupEntry.group} ({groupEntry.count})
                          </option>
                        ))}
                      </select>

                      <select
                        className="form-control text-xs"
                        value={careerDemandFilter}
                        onChange={(e) => setCareerDemandFilter(e.target.value)}
                      >
                        {CAREER_DEMAND_FILTERS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>

                      <select
                        className="form-control text-xs"
                        value={careerSortMode}
                        onChange={(e) => setCareerSortMode(e.target.value)}
                      >
                        {CAREER_SORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>

                      <label className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-200">
                        <input
                          type="checkbox"
                          className="accent-amber-500"
                          checked={careerCompatibleOnly}
                          onChange={(e) => setCareerCompatibleOnly(e.target.checked)}
                        />
                        <span>Show medically compatible only</span>
                      </label>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[10px]">
                      <span className="rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-slate-300">
                        {careerIndexStats.total} indexed goals
                      </span>
                      <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">
                        {careerIndexStats.compatible} compatible right now
                      </span>
                      <span className="rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-1 text-sky-300">
                        {careerIndexStats.highGrowth} high-growth roles
                      </span>
                      <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-amber-300">
                        {careerIndexStats.lowDemand} low-demand roles
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {careerGroupSummary.map((groupEntry) => (
                        <button
                          key={groupEntry.group}
                          type="button"
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors duration-150 ${
                            careerGroupFilter === groupEntry.group
                              ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                              : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                          }`}
                          onClick={() => setCareerGroupFilter(careerGroupFilter === groupEntry.group ? 'all' : groupEntry.group)}
                        >
                          {groupEntry.group} ({groupEntry.count})
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/45">
                    <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                        {filteredCareerEntries.length} results
                      </div>
                      <button
                        type="button"
                        className="text-[10px] font-bold uppercase tracking-wide text-slate-400 transition-colors duration-150 hover:text-slate-200"
                        onClick={clearCareerIndexFilters}
                      >
                        Clear filters
                      </button>
                    </div>

                    <div className="max-h-80 space-y-2 overflow-y-auto p-2">
                      {filteredCareerEntries.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-slate-800 bg-slate-950/35 px-3 py-6 text-center text-xs text-slate-400">
                          No occupational goals match the current search and filter settings.
                        </div>
                      ) : (
                        filteredCareerEntries.map((careerEntry) => {
                          const isSelected = careerEntry.index === selectedCareerIndex;
                          const compatibility = careerEntry.compatibility;

                          return (
                            <button
                              key={`${careerEntry.soc}-${careerEntry.index}`}
                              type="button"
                              className={`block w-full rounded-xl border p-3 text-left transition-all duration-150 ${
                                isSelected
                                  ? 'border-amber-500/45 bg-amber-500/10 shadow-[0_0_0_1px_rgba(245,158,11,0.08)]'
                                  : 'border-slate-800 bg-slate-900/65 hover:border-slate-700 hover:bg-slate-900'
                              }`}
                              onClick={() => handleCareerSelection(careerEntry.index)}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <strong className="block text-sm text-slate-100">{careerEntry.title}</strong>
                                  <span className="mt-1 block text-[11px] text-slate-400">
                                    {careerEntry.oohGroup} · {careerEntry.soc}
                                  </span>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                  {isSelected && (
                                    <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                                      Selected
                                    </span>
                                  )}
                                  <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                    compatibility.compatible
                                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                                      : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                                  }`}>
                                    {compatibility.compatible ? 'Compatible' : 'Needs review'}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-slate-400 sm:grid-cols-4">
                                <span>Pay: <strong className="text-slate-200">${careerEntry.medianPay.toLocaleString()}</strong></span>
                                <span>Growth: <strong className="text-slate-200">{careerEntry.outlook}</strong></span>
                                <span>Demand: <strong className="text-slate-200">{careerEntry.physicalDemand}</strong></span>
                                <span>Prep: <strong className="text-slate-200">{careerEntry.education}</strong></span>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {!selectedCareerVisibleInResults && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-200">
                    <span>The current selected goal is hidden by the active filters.</span>
                    <button
                      type="button"
                      className="rounded-full border border-amber-500/35 px-2.5 py-1 font-bold uppercase tracking-wide text-[10px]"
                      onClick={clearCareerIndexFilters}
                    >
                      Reveal selection
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Disability / Physical Constraints Checkboxes */}
            <div className="my-4 p-4 bg-slate-950/40 rounded-xl border border-slate-800/80">
              <h5 className="text-[11px] uppercase tracking-wider font-bold text-slate-300 mb-3">Indicated Disability & Functional Limitations</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Standing Limit", checked: limitStanding, set: setLimitStanding },
                  { label: "Lifting Limit (>15 lbs)", checked: limitLifting, set: setLimitLifting },
                  { label: "Bending/Kneeling", checked: limitBending, set: setLimitBending },
                  { label: "Climate/Altitude", checked: limitEnvironment, set: setLimitEnvironment },
                  { label: "Prolonged Sitting", checked: limitSitting, set: setLimitSitting },
                  { label: "Repetitive Motion", checked: limitRepetitive, set: setLimitRepetitive },
                  { label: "Sensory (Vision/Hearing)", checked: limitSensory, set: setLimitSensory },
                  { label: "High Stress/Confinement", checked: limitStress, set: setLimitStress },
                  { label: "Respiratory/Dust Limit", checked: limitRespiratory, set: setLimitRespiratory }
                ].map((item, index) => (
                  <label key={index} className="flex items-center gap-2 cursor-pointer text-xs text-slate-200 hover:text-white select-none">
                    <input 
                      type="checkbox" 
                      className="accent-amber-500" 
                      checked={item.checked} 
                      onChange={(e) => item.set(e.target.checked)} 
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Compatibility Badge & Reasons */}
            {(() => {
              const { compatible, reasons } = currentCareerCompatibility;
              return (
                <div className={`flex items-start gap-3 p-4 rounded-xl border ${
                  compatible 
                    ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' 
                    : 'border-amber-500/30 bg-amber-500/5 text-amber-400'
                } mb-4`}>
                  <div className="flex-shrink-0 mt-0.5">
                    {compatible ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                  </div>
                  <div className="text-xs leading-relaxed">
                    <strong className="block text-slate-200 mb-0.5">Status: {compatible ? "Medically Compatible" : "Potential Physical Conflict"}</strong>
                    {reasons.length > 0 ? (
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-400 mt-1">
                        {reasons.map((r, idx) => <li key={idx}>{r}</li>)}
                      </ul>
                    ) : (
                      <span className="text-slate-400 block">
                        The demands of this role are fully compatible with your physical capacities.
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* LMI & Compatibility Test Lab */}
            <div className="p-4 bg-slate-950/20 border border-slate-800/80 rounded-xl mb-4">
              <div className="flex justify-between items-center mb-2">
                <h5 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">Compatibility Test Lab & Auditor</h5>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">Active</span>
              </div>
              <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
                Load a pre-configured veteran profile to instantly populate disability limitations and audit compatibility calculations.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  className="text-left p-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    setLimitStanding(true);
                    setLimitLifting(true);
                    setLimitBending(true);
                    setLimitEnvironment(false);
                    setLimitSitting(false);
                    setLimitRepetitive(false);
                    setLimitSensory(false);
                    setLimitStress(false);
                    setLimitRespiratory(false);
                    handleCareerSelection(CAREERS_DATABASE.findIndex(c => c.title === 'Software Developer'));
                  }}
                >
                  <strong className="text-[11px] text-slate-200 block">Profile A: Orthopedic Limits</strong>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Standing & lifting limits. Software Dev target (Compatible).</span>
                </button>
                
                <button
                  type="button"
                  className="text-left p-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    setLimitStanding(true);
                    setLimitLifting(false);
                    setLimitBending(true);
                    setLimitEnvironment(true);
                    setLimitSitting(false);
                    setLimitRepetitive(false);
                    setLimitSensory(false);
                    setLimitStress(false);
                    setLimitRespiratory(true);
                    handleCareerSelection(CAREERS_DATABASE.findIndex(c => c.title === 'Solar Photovoltaic Installer'));
                  }}
                >
                  <strong className="text-[11px] text-slate-200 block">Profile B: Outdoors & Dust</strong>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Climate & respiratory limits. Solar Installer (Conflict).</span>
                </button>

                <button
                  type="button"
                  className="text-left p-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    setLimitStanding(false);
                    setLimitLifting(false);
                    setLimitBending(false);
                    setLimitEnvironment(false);
                    setLimitSitting(true);
                    setLimitRepetitive(true);
                    setLimitSensory(false);
                    setLimitStress(false);
                    setLimitRespiratory(false);
                    handleCareerSelection(CAREERS_DATABASE.findIndex(c => c.title === 'Accountant'));
                  }}
                >
                  <strong className="text-[11px] text-slate-200 block">Profile C: Hand Repetition</strong>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Sitting & keyboard limits. Accountant (Conflict).</span>
                </button>

                <button
                  type="button"
                  className="text-left p-2.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    setLimitStanding(false);
                    setLimitLifting(false);
                    setLimitBending(false);
                    setLimitEnvironment(true);
                    setLimitSitting(true);
                    setLimitRepetitive(false);
                    setLimitSensory(true);
                    setLimitStress(true);
                    setLimitRespiratory(false);
                    handleCareerSelection(CAREERS_DATABASE.findIndex(c => c.title === 'Commercial Pilot'));
                  }}
                >
                  <strong className="text-[11px] text-slate-200 block">Profile D: Sensory & Flight</strong>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Sensory, stress & climate limits. Pilot (Conflict).</span>
                </button>
              </div>
            </div>

            {/* Official Classification Info Grid */}
            {(() => {
              const currentCareer = CAREERS_DATABASE[selectedCareerIndex] || CAREERS_DATABASE[0];
              return (
                <div className="text-xs">
                  <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl text-slate-300 mb-3">
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <strong>O*NET-SOC Code:</strong> <span className="text-slate-100 font-mono">{currentCareer.soc}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <strong>DOT Code:</strong> <span className="text-slate-100 font-mono">{currentCareer.dot}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <strong>SVP Preparation:</strong> <span className="text-slate-100">{currentCareer.svp} ({currentCareer.svp >= 8 ? "4-10 yrs" : currentCareer.svp >= 7 ? "2-4 yrs" : "Under 2 yrs"})</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <strong>DOT Physical Demand:</strong> <span className="text-slate-100 font-semibold">{currentCareer.physicalDemand}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <strong>Industry SIC Code:</strong> <span className="text-slate-100 font-mono">{currentCareer.sic}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <strong>NAICS Sector:</strong> <span className="text-slate-100 font-mono">{currentCareer.naics}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <strong>BLS Median Pay:</strong> <span className="text-amber-500 font-semibold">${currentCareer.medianPay.toLocaleString()}/yr</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <strong>BLS Growth Rate:</strong> <span className="text-slate-100">{currentCareer.outlook}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed p-2">
                    <strong>Essential Duties:</strong> {currentCareer.duties}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* O*NET Interest Profiler (Holland Codes) */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold text-amber-500 flex items-center gap-2">
                <Compass size={16} />
                O*NET Interest Profiler (Holland Codes)
              </h4>
              <button
                type="button"
                className="px-2.5 py-1 text-[10px] font-bold uppercase bg-slate-800 hover:bg-slate-700 text-amber-500 rounded border border-slate-700 cursor-pointer transition-colors duration-150"
                onClick={() => setShowProfiler(!showProfiler)}
              >
                {showProfiler ? "Hide Profiler" : "Open Profiler"}
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Assess your vocational interests using Holland's RIASEC model and get matched with suitable goals from the career database.
            </p>

            {showProfiler && (
              <div className="border-t border-dashed border-slate-800 pt-4 space-y-4">
                <span className="text-[11px] text-slate-400 block mb-2">Rate your interest in each vocational category (1 = Dislike, 5 = Strongly Enjoy):</span>
                
                <div className="space-y-3">
                  {[
                    { label: "Realistic (R): Hands-on/Build", val: riasecR, set: setRiasecR },
                    { label: "Investigative (I): Analytical/Tech", val: riasecI, set: setRiasecI },
                    { label: "Artistic (A): Design/Creative", val: riasecA, set: setRiasecA },
                    { label: "Social (S): Helping/Mentoring", val: riasecS, set: setRiasecS },
                    { label: "Enterprising (E): Leadership/Biz", val: riasecE, set: setRiasecE },
                    { label: "Conventional (C): Audit/Details", val: riasecC, set: setRiasecC }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="w-48 text-slate-300">{item.label}</span>
                      <input 
                        type="range" min="1" max="5" value={item.val} 
                        onChange={(e) => item.set(parseInt(e.target.value))} 
                        className="flex-1 mx-4 accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="w-4 font-bold text-slate-100 text-right">{item.val}</span>
                    </div>
                  ))}
                </div>

                {/* Profiler Recommendation Result */}
                {(() => {
                  const { topScore, matches } = getRiasecRecommendations();
                  return (
                    <div className="mt-4 p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
                      <div className="text-xs text-slate-200 mb-3 pb-3 border-b border-slate-900">
                        Primary Interest Match: <strong className="text-amber-500 font-semibold">{topScore.name}</strong>
                        <p className="margin-0 text-[10px] text-slate-400 mt-1 leading-normal">{topScore.description}</p>
                      </div>
                      {matches.length > 0 ? (
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Matched Careers:</span>
                          <div className="space-y-2">
                            {matches.map((c, idx) => {
                              const originalIndex = CAREERS_DATABASE.findIndex(dbC => dbC.title === c.title);
                              return (
                                <div key={idx} className="flex justify-between items-center bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                                  <span className="text-xs text-slate-200 font-medium">{c.title} <span className="text-[10px] text-slate-400 font-mono">({c.soc})</span></span>
                                  <button
                                    type="button"
                                    className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded cursor-pointer transition-colors duration-150"
                                    onClick={() => handleCareerSelection(originalIndex)}
                                  >
                                    Set as Goal
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No exact database matches. Try raising Realistic, Investigative, Enterprising, or Conventional categories.</span>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* VRC Program Change Justification Generator */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300">
            <h4 className="text-sm font-bold text-amber-500 mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
              <FileText size={16} />
              VRC Program Change Justification Generator
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="form-group mb-0">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Current Vocational Goal (IWRP)</label>
                <input
                  type="text"
                  className="form-control"
                  value={justCurrentGoal}
                  onChange={(e) => setJustCurrentGoal(e.target.value)}
                />
              </div>

              <div className="form-group mb-0">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Proposed Vocational Goal</label>
                <input
                  type="text"
                  className="form-control"
                  value={justProposedGoal}
                  onChange={(e) => setJustProposedGoal(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Reason for Change of Program</label>
              <select
                className="form-control"
                value={justReason}
                onChange={(e) => setJustReason(e.target.value)}
              >
                <option value="disability_worsened">Medical/Disability constraints worsened</option>
                <option value="market_demand">Career market suitability change</option>
                <option value="counselor_advice">VRC directive and guidance</option>
              </select>
            </div>

            <div className="form-group mb-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Explain physical impact of the current goal</label>
              <textarea
                className="form-control h-20 p-3 text-xs resize-y"
                value={justPhysicalImpact}
                onChange={(e) => setJustPhysicalImpact(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 mb-4 cursor-pointer select-none">
              <input
                type="checkbox"
                id="justMedical"
                className="accent-amber-500"
                checked={justMedicalEvidence}
                onChange={(e) => setJustMedicalEvidence(e.target.checked)}
              />
              <label htmlFor="justMedical" className="text-xs text-slate-300 cursor-pointer">
                Medical evidence is available to support this change
              </label>
            </div>

            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={handleGenerateLetter}
            >
              Generate Formal Justification Letter
            </button>
          </div>

          {/* SEC SIC & NAICS Industry Finder */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold text-amber-500 flex items-center gap-2">
                <Search size={16} />
                SEC SIC & NAICS Industry Code Finder
              </h4>
              <button
                type="button"
                className="px-2.5 py-1 text-[10px] font-bold uppercase bg-slate-800 hover:bg-slate-700 text-amber-500 rounded border border-slate-700 cursor-pointer transition-colors duration-150"
                onClick={() => setShowIndustryFinder(!showIndustryFinder)}
              >
                {showIndustryFinder ? "Hide Finder" : "Open Finder"}
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Crosswalk the selected occupational goal against the SIC and NAICS index, then verify it with official Census and ISO references without leaving the planning workflow.
            </p>

            {showIndustryFinder && (
              <div className="border-t border-dashed border-slate-800 pt-4 space-y-4">
                {isBackendOnline && referenceLibraryOverview && (
                  <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/5 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                          Backend Code Library
                        </span>
                        <strong className="mt-1 block text-xs text-slate-100">
                          CIP to SOC to O*NET to BLS to IPE
                        </strong>
                      </div>
                      <span className="rounded-full border border-cyan-400/20 bg-slate-950/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200">
                        Server Indexed
                      </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-4">
                      <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 block">Occupations</span>
                        <strong className="mt-1 block text-sm text-slate-100">{referenceLibraryOverview.counts.occupations}</strong>
                      </div>
                      <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 block">Industries</span>
                        <strong className="mt-1 block text-sm text-slate-100">{referenceLibraryOverview.counts.industries}</strong>
                      </div>
                      <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 block">Training Programs</span>
                        <strong className="mt-1 block text-sm text-slate-100">{referenceLibraryOverview.counts.trainingPrograms}</strong>
                      </div>
                      <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 block">Crosswalks</span>
                        <strong className="mt-1 block text-sm text-slate-100">{referenceLibraryOverview.counts.crosswalks}</strong>
                      </div>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      {referenceLibraryOverview.chain.join(' -> ')}
                    </p>
                  </div>
                )}

                <div className="grid gap-3 lg:grid-cols-2">
                  {industryReferenceLinks.map((reference) => (
                    <a
                      key={reference.id}
                      href={reference.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 text-left transition-all duration-150 hover:border-slate-700 hover:bg-slate-950/60"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            {reference.source}
                          </span>
                          <strong className="mt-1 block text-xs text-slate-100">
                            {reference.title}
                          </strong>
                        </div>
                        <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-amber-300">
                          {reference.badge}
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                        {reference.description}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
                        Open reference <ExternalLink size={11} />
                      </span>
                    </a>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  ISO full-text standards are licensed publications. This workspace links to ISO&apos;s official standard pages and guidance instead of mirroring third-party PDFs.
                </p>

                <div className="form-group mb-3 space-y-2">
                  <div className="space-y-2">
                    <input
                      type="text"
                      className="form-control text-xs"
                      placeholder="Search by keyword (e.g. software, logistics, pilot, CNC)..."
                      value={industrySearchQuery}
                      onChange={(e) => setIndustrySearchQuery(e.target.value)}
                    />
                    <div className="grid gap-2 sm:grid-cols-3">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-amber-300 transition-colors duration-150 hover:border-slate-600 hover:text-amber-200"
                        onClick={() => setIndustrySearchQuery(currentCareer.title)}
                      >
                        Use selected goal
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-cyan-300 transition-colors duration-150 hover:border-slate-600 hover:text-cyan-200"
                        onClick={() => setIndustrySearchQuery(currentCareer.sic)}
                      >
                        Use SIC {currentCareer.sic}
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-emerald-300 transition-colors duration-150 hover:border-slate-600 hover:text-emerald-200"
                        onClick={() => setIndustrySearchQuery(currentCareer.naics)}
                      >
                        Use NAICS {currentCareer.naics}
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Pull the selected occupational goal, SIC, or NAICS code directly into the crosswalk search when you need faster industry matching.
                  </p>
                </div>

                {/* Industry Search Results */}
                {(() => {
                  const q = industrySearchQuery.trim().toLowerCase();
                  const isSearchActive = q.length >= 2;

                  const filtered = INDUSTRIES_LOOKUP.filter(ind => {
                    if (!isSearchActive) {
                      return INDUSTRIES_LOOKUP.indexOf(ind) < 8;
                    }
                    return (
                      ind.title.toLowerCase().includes(q) ||
                      ind.desc.toLowerCase().includes(q) ||
                      ind.keyword.toLowerCase().includes(q) ||
                      ind.sic.includes(q) ||
                      ind.naics.includes(q)
                    );
                  });

                  if (filtered.length === 0) {
                    return <p className="text-xs text-slate-400 italic">No matching industries found. Try searching by keywords like "software", "aviation", "electrical", or codes.</p>;
                  }

                  const maxResults = 100;
                  const displayed = filtered.slice(0, maxResults);
                  const hasMore = filtered.length > maxResults;

                  return (
                    <div className="space-y-3">
                      {!isSearchActive && (
                        <p className="text-[10px] text-slate-400 italic leading-normal">
                          Showing common industry groups. Type 2+ characters to search the full SEC database of 2,100+ classifications.
                        </p>
                      )}
                      {isSearchActive && hasMore && (
                        <p className="text-[10px] text-amber-500 font-medium">
                          Showing top {maxResults} of {filtered.length} matches. Please refine search query for more specific results.
                        </p>
                      )}
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {displayed.map((ind, idx) => (
                          <div key={idx} className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-1.5">
                            <div className="flex justify-between items-center">
                              <strong className="text-xs text-slate-200">{ind.title}</strong>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed">{ind.desc}</p>
                            <div className="flex gap-4 text-[10px] text-slate-400">
                              <span>SIC: <strong className="text-slate-300 font-mono">{ind.sic}</strong></span>
                              <span>NAICS: <strong className="text-slate-300 font-mono">{ind.naics}</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Outcomes Panel */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-300 relative overflow-hidden">
            <div className="absolute -inset-px bg-gradient-to-tr from-amber-500/5 via-transparent to-cyan-500/5 pointer-events-none rounded-xl" />
            
            <div className="relative z-10 space-y-6">
              {/* Request Letter Display */}
              <div>
                <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-amber-500" />
                  Justification Letter Output
                </h4>
                {justGeneratedLetter ? (
                  <div className="space-y-3">
                    <textarea
                      readOnly
                      value={justGeneratedLetter}
                      className="w-full h-80 p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-300 font-mono resize-none leading-relaxed"
                    />
                    <button
                      type="button"
                      className="btn btn-primary w-full text-xs font-semibold py-2.5"
                      onClick={() => {
                        navigator.clipboard.writeText(justGeneratedLetter);
                        alert("Justification letter copied to clipboard!");
                      }}
                    >
                      Copy Letter to Clipboard
                    </button>
                  </div>
                ) : (
                  <div className="p-8 bg-slate-950/50 border border-slate-850 rounded-xl text-center">
                    <Info size={24} className="text-slate-600 mb-2 mx-auto" />
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Fill out the parameters on the left and click "Generate" to construct your program change justification letter.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default CareerStrategyView;
