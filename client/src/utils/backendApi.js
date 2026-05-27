const DEFAULT_BACKEND_URL = 'http://localhost:5000';
const LOCAL_SCOPE_KEY = 'm28c_backend_scope_local';
const SESSION_SCOPE_KEY = 'm28c_backend_scope_session';

export const BACKEND_BASE_URL = (import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, '');

function createScopeId(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}:${crypto.randomUUID()}`;
  }

  return `${prefix}:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getBackendScope(privacyMode = false) {
  const storage = privacyMode ? sessionStorage : localStorage;
  const storageKey = privacyMode ? SESSION_SCOPE_KEY : LOCAL_SCOPE_KEY;

  let scope = storage.getItem(storageKey);
  if (!scope) {
    scope = createScopeId(privacyMode ? 'session' : 'local');
    storage.setItem(storageKey, scope);
  }

  return scope;
}

export function buildBackendUrl(pathname) {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${BACKEND_BASE_URL}${normalizedPath}`;
}

export function backendFetch(pathname, options = {}) {
  const {
    privacyMode = false,
    includeJson = false,
    headers,
    ...fetchOptions
  } = options;

  const requestHeaders = new Headers(headers || {});
  requestHeaders.set('X-M28C-Client-Scope', getBackendScope(privacyMode));

  if (includeJson && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  return fetch(buildBackendUrl(pathname), {
    ...fetchOptions,
    headers: requestHeaders
  });
}

async function createBackendError(response) {
  let message = `Backend request failed with status ${response.status}`;

  try {
    const data = await response.json();
    if (data?.error) {
      message = data.error;
    }
  } catch {
    // Ignore JSON parsing failures and keep the default message.
  }

  const error = new Error(message);
  error.status = response.status;
  return error;
}

export async function fetchCurrentPlanDraft(draftType, options = {}) {
  const response = await backendFetch(`/api/plans/current/${encodeURIComponent(draftType)}`, {
    privacyMode: options.privacyMode
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw await createBackendError(response);
  }

  return response.json();
}

export async function saveCurrentPlanDraft(draftType, payload, options = {}) {
  const response = await backendFetch(`/api/plans/current/${encodeURIComponent(draftType)}`, {
    method: 'PUT',
    includeJson: true,
    privacyMode: options.privacyMode,
    body: JSON.stringify({
      title: options.title || '',
      payload
    })
  });

  if (!response.ok) {
    throw await createBackendError(response);
  }

  return response.json();
}

export async function fetchCaseDashboard(options = {}) {
  const response = await backendFetch('/api/cases/dashboard', {
    privacyMode: options.privacyMode
  });

  if (!response.ok) {
    throw await createBackendError(response);
  }

  return response.json();
}

export async function fetchCurrentCaseRecord(options = {}) {
  const response = await backendFetch('/api/cases/current', {
    privacyMode: options.privacyMode
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw await createBackendError(response);
  }

  return response.json();
}

export async function saveCurrentCaseRecord(payload, options = {}) {
  const response = await backendFetch('/api/cases/current', {
    method: 'PUT',
    includeJson: true,
    privacyMode: options.privacyMode,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await createBackendError(response);
  }

  return response.json();
}

export async function addCurrentCaseActivity(payload, options = {}) {
  const response = await backendFetch('/api/cases/current/activities', {
    method: 'POST',
    includeJson: true,
    privacyMode: options.privacyMode,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await createBackendError(response);
  }

  return response.json();
}

export async function deleteCurrentCaseActivity(activityId, options = {}) {
  const response = await backendFetch(`/api/cases/current/activities/${encodeURIComponent(activityId)}`, {
    method: 'DELETE',
    privacyMode: options.privacyMode
  });

  if (!response.ok && response.status !== 204) {
    throw await createBackendError(response);
  }
}

export async function fetchReferenceLibraryOverview(options = {}) {
  const response = await backendFetch('/api/library/overview', {
    privacyMode: options.privacyMode
  });

  if (!response.ok) {
    throw await createBackendError(response);
  }

  return response.json();
}
