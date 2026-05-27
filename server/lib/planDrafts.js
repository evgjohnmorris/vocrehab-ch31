import { randomUUID } from 'node:crypto';

const DRAFT_TYPE_PATTERN = /^[a-z0-9_-]{1,64}$/;
const MAX_TITLE_LENGTH = 160;
const MAX_LONG_TEXT_LENGTH = 12000;
const MAX_TEXT_LENGTH = 500;
const MAX_SHORT_TEXT_LENGTH = 120;
const MAX_OBJECTIVES = 20;
const MAX_BOOLEAN_MAP_KEYS = 32;

const CLAIM_BUILDER_TABS = new Set(['plan_builder', 'brief_builder']);
const CLAIM_BUILDER_TRACKS = new Set([
  'reemployment',
  'rapid_employment',
  'self_employment',
  'long_term',
  'independent_living'
]);
const CLAIM_BUILDER_AREAS = new Set([
  'computer_denial',
  'seh_extension'
]);
const REQUIRED_SERVICE_KEYS = [
  'tuition',
  'books',
  'laptop',
  'ergoChair',
  'dental',
  'tutoring',
  'placement',
  'clothing',
  'certs'
];

const DEFAULT_REQUIRED_SERVICES = {
  tuition: true,
  books: true,
  laptop: true,
  ergoChair: false,
  dental: false,
  tutoring: false,
  placement: true,
  clothing: false,
  certs: true
};

const DEFAULT_OBJECTIVES = [
  {
    id: '1',
    desc: 'Complete academic training requirements for the target vocational goal',
    targetDate: 'Year 3',
    measure: 'Maintain GPA >= 2.0 and submit term transcripts'
  },
  {
    id: '2',
    desc: 'Acquire required industry certifications or complete capstone/internship',
    targetDate: 'Year 3',
    measure: 'Provide passing scores / supervisor evaluation'
  },
  {
    id: '3',
    desc: 'Transition to IEAP (Employment Plan) and secure suitable direct placement',
    targetDate: 'Year 4',
    measure: '60 days continuous employment in target field'
  }
];

function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function normalizeOptionalString(value, fieldName, maxLength, fallback = '') {
  if (value == null) {
    return fallback;
  }

  if (typeof value !== 'string') {
    throw createValidationError(`${fieldName} must be a string.`);
  }

  if (value.length > maxLength) {
    throw createValidationError(`${fieldName} exceeds ${maxLength} characters.`);
  }

  return value;
}

function normalizeBooleanMap(rawValue, fieldName) {
  if (rawValue == null) {
    return {};
  }

  if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
    throw createValidationError(`${fieldName} must be an object.`);
  }

  const entries = Object.entries(rawValue);
  if (entries.length > MAX_BOOLEAN_MAP_KEYS) {
    throw createValidationError(`${fieldName} exceeds ${MAX_BOOLEAN_MAP_KEYS} keys.`);
  }

  const normalized = {};
  entries.forEach(([key, value]) => {
    if (typeof key !== 'string' || !key.trim()) {
      throw createValidationError(`${fieldName} contains an invalid key.`);
    }

    if (typeof value !== 'boolean') {
      throw createValidationError(`${fieldName}.${key} must be a boolean.`);
    }

    normalized[key] = value;
  });

  return normalized;
}

function normalizeObjectives(rawObjectives) {
  if (rawObjectives == null) {
    return DEFAULT_OBJECTIVES;
  }

  if (!Array.isArray(rawObjectives)) {
    throw createValidationError('planBuilder.objectives must be an array.');
  }

  if (rawObjectives.length > MAX_OBJECTIVES) {
    throw createValidationError(`planBuilder.objectives exceeds ${MAX_OBJECTIVES} items.`);
  }

  return rawObjectives.map((objective, index) => {
    if (!objective || typeof objective !== 'object' || Array.isArray(objective)) {
      throw createValidationError(`planBuilder.objectives[${index}] must be an object.`);
    }

    return {
      id: normalizeOptionalString(objective.id, `planBuilder.objectives[${index}].id`, 40, String(index + 1)),
      desc: normalizeOptionalString(objective.desc, `planBuilder.objectives[${index}].desc`, MAX_TEXT_LENGTH),
      targetDate: normalizeOptionalString(objective.targetDate, `planBuilder.objectives[${index}].targetDate`, MAX_SHORT_TEXT_LENGTH),
      measure: normalizeOptionalString(objective.measure, `planBuilder.objectives[${index}].measure`, MAX_TEXT_LENGTH)
    };
  });
}

function normalizeRequiredServices(rawValue) {
  if (rawValue == null) {
    return { ...DEFAULT_REQUIRED_SERVICES };
  }

  if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
    throw createValidationError('planBuilder.requiredServices must be an object.');
  }

  const normalized = { ...DEFAULT_REQUIRED_SERVICES };
  REQUIRED_SERVICE_KEYS.forEach((key) => {
    if (key in rawValue) {
      if (typeof rawValue[key] !== 'boolean') {
        throw createValidationError(`planBuilder.requiredServices.${key} must be a boolean.`);
      }

      normalized[key] = rawValue[key];
    }
  });

  return normalized;
}

function normalizeClaimBuilderWorkspace(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw createValidationError('Plan draft payload must be an object.');
  }

  const planBuilder = payload.planBuilder && typeof payload.planBuilder === 'object' && !Array.isArray(payload.planBuilder)
    ? payload.planBuilder
    : {};
  const briefBuilder = payload.briefBuilder && typeof payload.briefBuilder === 'object' && !Array.isArray(payload.briefBuilder)
    ? payload.briefBuilder
    : {};
  const activeTab = CLAIM_BUILDER_TABS.has(payload.activeTab) ? payload.activeTab : 'plan_builder';
  const selectedTrack = CLAIM_BUILDER_TRACKS.has(planBuilder.selectedTrack) ? planBuilder.selectedTrack : 'long_term';
  const selectedAreaId = CLAIM_BUILDER_AREAS.has(briefBuilder.selectedAreaId) ? briefBuilder.selectedAreaId : 'computer_denial';
  const rawStep = Number.isInteger(briefBuilder.step) ? briefBuilder.step : 1;
  const step = rawStep === 2 ? 2 : 1;
  const userFacts = briefBuilder.userFacts && typeof briefBuilder.userFacts === 'object' && !Array.isArray(briefBuilder.userFacts)
    ? briefBuilder.userFacts
    : {};

  return {
    schemaVersion: 1,
    activeTab,
    planBuilder: {
      vocGoal: normalizeOptionalString(planBuilder.vocGoal, 'planBuilder.vocGoal', MAX_TEXT_LENGTH),
      onetCode: normalizeOptionalString(planBuilder.onetCode, 'planBuilder.onetCode', MAX_SHORT_TEXT_LENGTH),
      riasecCode: normalizeOptionalString(planBuilder.riasecCode, 'planBuilder.riasecCode', MAX_SHORT_TEXT_LENGTH, 'Realistic'),
      selectedTrack,
      trainingObjectives: normalizeOptionalString(planBuilder.trainingObjectives, 'planBuilder.trainingObjectives', MAX_LONG_TEXT_LENGTH),
      zipCode: normalizeOptionalString(planBuilder.zipCode, 'planBuilder.zipCode', 16),
      estimatedMha: normalizeOptionalString(planBuilder.estimatedMha, 'planBuilder.estimatedMha', 32),
      subsistenceElection: planBuilder.subsistenceElection === 'ch33' ? 'ch33' : 'ch31',
      objectives: normalizeObjectives(planBuilder.objectives),
      requiredServices: normalizeRequiredServices(planBuilder.requiredServices)
    },
    briefBuilder: {
      step,
      selectedAreaId,
      userFacts: {
        veteranName: normalizeOptionalString(userFacts.veteranName, 'briefBuilder.userFacts.veteranName', MAX_SHORT_TEXT_LENGTH),
        claimNumber: normalizeOptionalString(userFacts.claimNumber, 'briefBuilder.userFacts.claimNumber', MAX_SHORT_TEXT_LENGTH),
        schoolOrProgram: normalizeOptionalString(userFacts.schoolOrProgram, 'briefBuilder.userFacts.schoolOrProgram', MAX_TEXT_LENGTH),
        counselorArgument: normalizeOptionalString(userFacts.counselorArgument, 'briefBuilder.userFacts.counselorArgument', MAX_TEXT_LENGTH),
        personalContext: normalizeOptionalString(userFacts.personalContext, 'briefBuilder.userFacts.personalContext', MAX_LONG_TEXT_LENGTH)
      },
      selectedErrors: normalizeBooleanMap(briefBuilder.selectedErrors, 'briefBuilder.selectedErrors'),
      selectedCitations: normalizeBooleanMap(briefBuilder.selectedCitations, 'briefBuilder.selectedCitations')
    }
  };
}

export function assertValidDraftType(draftType) {
  if (typeof draftType !== 'string' || !DRAFT_TYPE_PATTERN.test(draftType)) {
    throw createValidationError('Draft type must use lowercase letters, numbers, underscores, or hyphens.');
  }
}

export function createPlanDraftId() {
  return `plan_${randomUUID()}`;
}

export function validatePlanDraftTitle(title) {
  return normalizeOptionalString(title, 'title', MAX_TITLE_LENGTH).trim();
}

export function validatePlanDraftPayload(draftType, payload) {
  if (draftType === 'claim_builder_workspace') {
    return normalizeClaimBuilderWorkspace(payload);
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw createValidationError('Plan draft payload must be an object.');
  }

  return payload;
}
