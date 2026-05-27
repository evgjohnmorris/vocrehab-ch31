import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bookmark,
  Bot,
  MessageSquare,
  Send,
  Settings2,
  Trash2,
  User
} from 'lucide-react';

const STORAGE_KEYS = {
  connector: 'm28c_ai_connector',
  messages: 'm28c_ai_messages',
  settingsOpen: 'm28c_ai_settings_open'
};

const DEFAULT_SYSTEM_PROMPT = `You are the user's AI copilot inside a Chapter 31 VR&E support app. Be practical, concise, and honest about uncertainty.`;

const CONNECTOR_PRESETS = {
  custom: {
    label: 'Custom OpenAI-compatible',
    transport: 'openai',
    endpoint: '',
    model: '',
    endpointLabel: 'Endpoint',
    endpointPlaceholder: 'https://your-proxy.example.com/v1/chat/completions',
    helpText: 'Best for your own proxy or any OpenAI-compatible endpoint.'
  },
  openai: {
    label: 'OpenAI',
    transport: 'openai',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4.1-mini',
    endpointLabel: 'Endpoint',
    endpointPlaceholder: 'https://api.openai.com/v1/chat/completions',
    helpText: 'Official OpenAI chat completions endpoint.'
  },
  openrouter: {
    label: 'OpenRouter',
    transport: 'openai',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'openai/gpt-4.1-mini',
    endpointLabel: 'Endpoint',
    endpointPlaceholder: 'https://openrouter.ai/api/v1/chat/completions',
    helpText: 'Useful when you want one connector for many model providers.'
  },
  anthropic: {
    label: 'Anthropic Claude',
    transport: 'anthropic',
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-sonnet-4-20250514',
    endpointLabel: 'Endpoint',
    endpointPlaceholder: 'https://api.anthropic.com/v1/messages',
    helpText: 'Claude Messages API. Uses the top-level system prompt field.'
  },
  gemini: {
    label: 'Google Gemini',
    transport: 'gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    model: 'gemini-2.5-flash',
    endpointLabel: 'API Base',
    endpointPlaceholder: 'https://generativelanguage.googleapis.com/v1beta/models',
    helpText: 'Gemini REST API base. The selected model is appended automatically.'
  }
};

const VIEW_LABELS = {
  home: 'Home Dashboard',
  dispute_hub: 'Appeals & Disputes Hub',
  reference: 'Authority Library',
  authority_library: 'Authority Library',
  wizard: 'Eligibility & Entitlement Wizard',
  calculator: 'Payment Calculator',
  disability_hub: 'Disability Hub',
  financial_planner: 'Financial Planner',
  planning: 'Career Strategy',
  self_employment: 'Self-Employment Track',
  special_programs: 'Special Programs',
  error_spotter: 'VA Error Spotter',
  document_generator: 'Document Generator',
  coverage_report: 'Coverage Report',
  source_diff: 'Source Updates',
  claim_builder: 'Claim Argument Builder',
  directory: 'Counselor Directory',
  resources: 'Resource Center',
  glossary: 'Glossary',
  case_status_guide: 'Case Status Guide',
  independent_living_builder: 'Independent Living Builder',
  school_payment_tracker: 'School Payment Tracker',
  forms_center: 'Forms & Packets Center',
  case_packet_builder: 'Case Packet Builder',
  taps: 'Transition Guide',
  in_service_edu: 'In-Service Education',
  family_caregivers: 'Family & Caregiver Support',
  global_search: 'Global Search',
  written_decision_analyzer: 'Written Decision Analyzer',
  benefits_index: 'Benefits & Rights Index'
};

function getDefaultConnector() {
  return {
    providerId: 'custom',
    transport: 'openai',
    endpoint: CONNECTOR_PRESETS.custom.endpoint,
    model: CONNECTOR_PRESETS.custom.model,
    apiKey: '',
    systemPrompt: DEFAULT_SYSTEM_PROMPT
  };
}

function getActiveStorage(privacyMode) {
  return privacyMode ? window.sessionStorage : window.localStorage;
}

function getInactiveStorage(privacyMode) {
  return privacyMode ? window.localStorage : window.sessionStorage;
}

function readStoredJson(key, privacyMode, fallback) {
  try {
    const raw = getActiveStorage(privacyMode).getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Failed to parse ${key}`, error);
    return fallback;
  }
}

function syncStoredJson(key, value, privacyMode) {
  getActiveStorage(privacyMode).setItem(key, JSON.stringify(value));
  getInactiveStorage(privacyMode).removeItem(key);
}

function syncStoredText(key, value, privacyMode) {
  getActiveStorage(privacyMode).setItem(key, value);
  getInactiveStorage(privacyMode).removeItem(key);
}

function normalizeConnector(connector) {
  const nextConnector = connector || {};
  const preset = CONNECTOR_PRESETS[nextConnector.providerId] || CONNECTOR_PRESETS.custom;

  return {
    ...getDefaultConnector(),
    ...nextConnector,
    transport: preset.transport,
    endpoint: nextConnector.endpoint ?? preset.endpoint,
    model: nextConnector.model ?? preset.model,
    systemPrompt: nextConnector.systemPrompt || DEFAULT_SYSTEM_PROMPT
  };
}

function buildContextPrompt(activeView, selectedSection) {
  const activeViewLabel = VIEW_LABELS[activeView] || activeView || 'Unknown module';
  const authorityLabel = selectedSection?.id || 'None selected';

  return [
    'Current app context:',
    `- Active module: ${activeViewLabel}`,
    `- Selected authority id: ${authorityLabel}`,
    'Use this context only when the user is asking about the current app or Chapter 31 workflow.'
  ].join('\n');
}

function buildStatus(type, text) {
  return { type, text };
}

async function readErrorMessage(response) {
  try {
    const data = await response.json();
    if (typeof data?.error === 'string') return data.error;
    if (typeof data?.error?.message === 'string') return data.error.message;
    if (typeof data?.message === 'string') return data.message;
    return JSON.stringify(data);
  } catch {
    return response.statusText || `HTTP ${response.status}`;
  }
}

function flattenOpenAIContent(content) {
  if (typeof content === 'string') return content.trim();
  if (!Array.isArray(content)) return '';

  return content
    .map((part) => {
      if (typeof part === 'string') return part;
      if (typeof part?.text === 'string') return part.text;
      return '';
    })
    .join('')
    .trim();
}

function extractOpenAIReply(data) {
  return flattenOpenAIContent(data?.choices?.[0]?.message?.content);
}

function extractAnthropicReply(data) {
  if (!Array.isArray(data?.content)) return '';

  return data.content
    .map((block) => (block?.type === 'text' ? block.text : ''))
    .join('')
    .trim();
}

function extractGeminiReply(data) {
  if (!Array.isArray(data?.candidates)) return '';

  return data.candidates
    .flatMap((candidate) => candidate?.content?.parts || [])
    .map((part) => part?.text || '')
    .join('')
    .trim();
}

async function requestOpenAICompatible(connector, messages, contextPrompt) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${connector.apiKey.trim()}`
  };

  if (connector.providerId === 'openrouter') {
    headers['HTTP-Referer'] = window.location.origin;
    headers['X-Title'] = 'Veteran Resource Guide';
  }

  const response = await fetch(connector.endpoint.trim(), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: connector.model.trim(),
      messages: [
        {
          role: 'system',
          content: `${connector.systemPrompt.trim()}\n\n${contextPrompt}`
        },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content
        }))
      ]
    })
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const data = await response.json();
  const reply = extractOpenAIReply(data);

  if (!reply) {
    throw new Error('The provider responded without any assistant text.');
  }

  return reply;
}

async function requestAnthropic(connector, messages, contextPrompt) {
  const response = await fetch(connector.endpoint.trim(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': connector.apiKey.trim(),
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: connector.model.trim(),
      max_tokens: 1024,
      system: `${connector.systemPrompt.trim()}\n\n${contextPrompt}`,
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content
      }))
    })
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const data = await response.json();
  const reply = extractAnthropicReply(data);

  if (!reply) {
    throw new Error('Claude responded without any assistant text.');
  }

  return reply;
}

async function requestGemini(connector, messages, contextPrompt) {
  const endpointBase = connector.endpoint.trim().replace(/\/+$/, '');
  const modelId = encodeURIComponent(connector.model.trim());
  const response = await fetch(`${endpointBase}/${modelId}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': connector.apiKey.trim()
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: `${connector.systemPrompt.trim()}\n\n${contextPrompt}`
          }
        ]
      },
      contents: messages.map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [
          {
            text: message.content
          }
        ]
      }))
    })
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const data = await response.json();
  const reply = extractGeminiReply(data);

  if (!reply) {
    throw new Error('Gemini responded without any assistant text.');
  }

  return reply;
}

async function requestAssistantReply(connector, messages, activeView, selectedSection) {
  const contextPrompt = buildContextPrompt(activeView, selectedSection);

  switch (connector.transport) {
    case 'anthropic':
      return requestAnthropic(connector, messages, contextPrompt);
    case 'gemini':
      return requestGemini(connector, messages, contextPrompt);
    case 'openai':
    default:
      return requestOpenAICompatible(connector, messages, contextPrompt);
  }
}

function BookmarkSidebar({
  bookmarks,
  setSelectedSection,
  setActiveView,
  toggleBookmark,
  privacyMode,
  activeView,
  selectedSection,
  dataResetToken
}) {
  const [connector, setConnector] = useState(() =>
    normalizeConnector(readStoredJson(STORAGE_KEYS.connector, privacyMode, getDefaultConnector()))
  );
  const [messages, setMessages] = useState(() =>
    readStoredJson(STORAGE_KEYS.messages, privacyMode, [])
  );
  const [showSettings, setShowSettings] = useState(() => {
    const raw = getActiveStorage(privacyMode).getItem(STORAGE_KEYS.settingsOpen);
    return raw ? raw === 'true' : true;
  });
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState(
    buildStatus('info', 'Choose a provider preset, add your key, and start chatting.')
  );

  useEffect(() => {
    syncStoredJson(STORAGE_KEYS.connector, connector, privacyMode);
  }, [connector, privacyMode]);

  useEffect(() => {
    syncStoredJson(STORAGE_KEYS.messages, messages, privacyMode);
  }, [messages, privacyMode]);

  useEffect(() => {
    syncStoredText(STORAGE_KEYS.settingsOpen, String(showSettings), privacyMode);
  }, [showSettings, privacyMode]);

  useEffect(() => {
    if (dataResetToken === 0) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;

      setConnector(getDefaultConnector());
      setMessages([]);
      setDraft('');
      setShowSettings(true);
      setStatus(buildStatus('info', 'Connector and chat cleared.'));
    });

    return () => {
      cancelled = true;
    };
  }, [dataResetToken]);

  const preset = CONNECTOR_PRESETS[connector.providerId] || CONNECTOR_PRESETS.custom;

  const handleProviderChange = (providerId) => {
    const nextPreset = CONNECTOR_PRESETS[providerId] || CONNECTOR_PRESETS.custom;

    setConnector((currentConnector) => ({
      ...currentConnector,
      providerId,
      transport: nextPreset.transport,
      endpoint: nextPreset.endpoint,
      model: nextPreset.model
    }));

    setStatus(buildStatus('info', `${nextPreset.label} preset loaded. Settings save automatically.`));
  };

  const handleConnectorChange = (field, value) => {
    setConnector((currentConnector) => ({
      ...currentConnector,
      [field]: value
    }));
  };

  const handleClearChat = () => {
    setMessages([]);
    setStatus(buildStatus('info', 'Chat history cleared.'));
  };

  const handleSendMessage = async () => {
    const trimmedDraft = draft.trim();
    const trimmedKey = connector.apiKey.trim();
    const trimmedModel = connector.model.trim();
    const trimmedEndpoint = connector.endpoint.trim();

    if (!trimmedDraft || isSending) return;

    if (!trimmedKey || !trimmedModel || !trimmedEndpoint) {
      setStatus(buildStatus('error', 'Add an endpoint, model, and API key before sending.'));
      return;
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmedDraft
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setDraft('');
    setIsSending(true);
    setStatus(buildStatus('info', `Sending to ${preset.label}...`));

    try {
      const reply = await requestAssistantReply(connector, nextMessages, activeView, selectedSection);

      setMessages([
        ...nextMessages,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: reply
        }
      ]);

      setStatus(buildStatus('success', `${preset.label} replied successfully.`));
    } catch (error) {
      const fallbackMessage =
        'The browser could not complete that AI request. If the provider blocks client-side calls, use your own proxy endpoint instead.';
      const rawErrorMessage = error?.message ? `${error.message}` : '';
      const errorMessage =
        rawErrorMessage && !/failed to fetch|networkerror|load failed/i.test(rawErrorMessage)
          ? rawErrorMessage
          : fallbackMessage;
      setStatus(buildStatus('error', errorMessage));
    } finally {
      setIsSending(false);
    }
  };

  const handleDraftKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <aside className="side-panel">
      <div className="panel-section">
        <div className="panel-title">
          <Bookmark size={16} />
          <span>My Bookmarks ({bookmarks.length})</span>
        </div>
        {bookmarks.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            No bookmarks added yet. Click the bookmark icon on any document section to add it.
          </p>
        ) : (
          <div>
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="panel-list-item">
                <span
                  className="panel-item-text"
                  onClick={() => {
                    setSelectedSection({ type: bookmark.type, id: bookmark.id });
                    setActiveView('reference');
                  }}
                >
                  {bookmark.title}
                </span>
                <span
                  className="remove-btn"
                  onClick={() => toggleBookmark(bookmark.type, bookmark.id, bookmark.title)}
                  title="Remove bookmark"
                >
                  <Trash2 size={12} />
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel-section">
        <div className="panel-title">
          <MessageSquare size={16} />
          <span>Bring Your Own AI</span>
        </div>

        <div className="ai-warning">
          <AlertTriangle size={15} />
          <span>
            This static site cannot hide provider API keys in the browser. A personal proxy or limited-scope key is the
            safest setup.
          </span>
        </div>

        <button type="button" className="ai-settings-toggle" onClick={() => setShowSettings((open) => !open)}>
          <Settings2 size={14} />
          <span>{showSettings ? 'Hide connector settings' : 'Show connector settings'}</span>
        </button>

        {showSettings && (
          <div className="ai-settings-card">
            <div className="form-group">
              <label htmlFor="ai-provider">Provider preset</label>
              <select
                id="ai-provider"
                className="form-control"
                value={connector.providerId}
                onChange={(event) => handleProviderChange(event.target.value)}
              >
                {Object.entries(CONNECTOR_PRESETS).map(([providerId, provider]) => (
                  <option key={providerId} value={providerId}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="ai-endpoint">{preset.endpointLabel}</label>
              <input
                id="ai-endpoint"
                className="form-control"
                type="text"
                value={connector.endpoint}
                placeholder={preset.endpointPlaceholder}
                onChange={(event) => handleConnectorChange('endpoint', event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="ai-model">Model</label>
              <input
                id="ai-model"
                className="form-control"
                type="text"
                value={connector.model}
                placeholder="Enter model id"
                onChange={(event) => handleConnectorChange('model', event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="ai-api-key">API key</label>
              <input
                id="ai-api-key"
                className="form-control"
                type="password"
                value={connector.apiKey}
                placeholder="Paste your provider key"
                onChange={(event) => handleConnectorChange('apiKey', event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="ai-system-prompt">Assistant instructions</label>
              <textarea
                id="ai-system-prompt"
                className="form-control ai-textarea ai-settings-textarea"
                value={connector.systemPrompt}
                onChange={(event) => handleConnectorChange('systemPrompt', event.target.value)}
              />
            </div>

            <div className="ai-helper-text">
              <span>{preset.helpText}</span>
              <span>Saved automatically to {privacyMode ? 'this tab only' : 'local browser storage'}.</span>
            </div>
          </div>
        )}

        <div className={`ai-status ai-status-${status.type}`}>{status.text}</div>

        <div className="ai-chat-shell">
          <div className="ai-chat-log">
            {messages.length === 0 ? (
              <div className="ai-empty-state">
                <Bot size={16} />
                <span>Ask about the current page, Chapter 31 strategy, or anything your connected model should help with.</span>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`ai-message-row ai-message-${message.role}`}>
                  <div className={`ai-avatar ai-avatar-${message.role}`}>
                    {message.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                  </div>
                  <div className="ai-bubble">{message.content}</div>
                </div>
              ))
            )}

            {isSending && (
              <div className="ai-message-row ai-message-assistant">
                <div className="ai-avatar ai-avatar-assistant">
                  <Bot size={14} />
                </div>
                <div className="ai-bubble ai-bubble-pending">Thinking...</div>
              </div>
            )}
          </div>

          <div className="ai-chat-composer">
            <textarea
              className="form-control ai-textarea"
              value={draft}
              placeholder="Type a message. Press Enter to send and Shift+Enter for a new line."
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleDraftKeyDown}
            />

            <div className="ai-chat-actions">
              <button
                type="button"
                className="btn ai-btn-secondary"
                onClick={handleClearChat}
                disabled={isSending || messages.length === 0}
              >
                Clear
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSendMessage}
                disabled={isSending || !draft.trim()}
              >
                <Send size={14} />
                <span>{isSending ? 'Sending...' : 'Send'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default BookmarkSidebar;
