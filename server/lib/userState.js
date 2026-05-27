export const LEGACY_USER_SCOPE = 'legacy-default';
export const USER_SCOPE_HEADER = 'X-M28C-Client-Scope';

const ALLOWED_USER_STATE_KEYS = new Set([
  'bookmarks',
  'user_mode',
  'case_stage'
]);

const ALLOWED_USER_MODES = new Set([
  'veteran',
  'advocate',
  'school',
  'legal'
]);

const MAX_SCOPE_LENGTH = 128;
const MAX_CASE_STAGE_LENGTH = 64;
const MAX_BOOKMARKS = 250;

function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

export function getRequestScope(req) {
  const headerScope = req.get(USER_SCOPE_HEADER);
  const fallbackScope = typeof req.query.scope === 'string' ? req.query.scope : '';
  const rawScope = (headerScope || fallbackScope || LEGACY_USER_SCOPE).trim();

  if (!rawScope) {
    return LEGACY_USER_SCOPE;
  }

  if (rawScope.length > MAX_SCOPE_LENGTH) {
    throw createValidationError(`Client scope exceeds ${MAX_SCOPE_LENGTH} characters.`);
  }

  return rawScope;
}

export function assertAllowedUserStateKey(key) {
  if (!ALLOWED_USER_STATE_KEYS.has(key)) {
    throw createValidationError(`Unsupported user state key: ${key}`);
  }
}

export function validateUserStateValue(key, value) {
  if (key === 'bookmarks') {
    if (!Array.isArray(value)) {
      throw createValidationError('Bookmarks payload must be an array.');
    }

    if (value.length > MAX_BOOKMARKS) {
      throw createValidationError(`Bookmarks payload exceeds ${MAX_BOOKMARKS} items.`);
    }

    value.forEach((bookmark, index) => {
      if (!bookmark || typeof bookmark !== 'object' || Array.isArray(bookmark)) {
        throw createValidationError(`Bookmark at index ${index} must be an object.`);
      }

      if (typeof bookmark.type !== 'string' || !bookmark.type.trim()) {
        throw createValidationError(`Bookmark at index ${index} is missing a valid type.`);
      }

      if (typeof bookmark.id !== 'string' || !bookmark.id.trim()) {
        throw createValidationError(`Bookmark at index ${index} is missing a valid id.`);
      }

      if ('title' in bookmark && bookmark.title != null && typeof bookmark.title !== 'string') {
        throw createValidationError(`Bookmark at index ${index} has an invalid title.`);
      }
    });

    return;
  }

  if (key === 'user_mode') {
    if (typeof value !== 'string' || !ALLOWED_USER_MODES.has(value)) {
      throw createValidationError('User mode must be one of: veteran, advocate, school, legal.');
    }

    return;
  }

  if (key === 'case_stage') {
    if (typeof value !== 'string' || !value.trim()) {
      throw createValidationError('Case stage must be a non-empty string.');
    }

    if (value.length > MAX_CASE_STAGE_LENGTH) {
      throw createValidationError(`Case stage exceeds ${MAX_CASE_STAGE_LENGTH} characters.`);
    }
  }
}
