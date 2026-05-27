import { useEffect, useMemo, useState } from 'react';
import {
  ExternalLink,
  FileJson,
  FileText,
  Layers3,
  Loader2,
  Search
} from 'lucide-react';

const TITLE_DETAIL_BASE = `${import.meta.env.BASE_URL}authority/ecfr`;

const TYPE_LABELS = {
  chapter: 'Chapter',
  subtitle: 'Subtitle',
  subchapter: 'Subchapter',
  part: 'Part',
  subpart: 'Subpart',
  section: 'Section',
  appendix: 'Appendix',
  subject_group: 'Subject Group'
};

function formatNodeType(type) {
  return TYPE_LABELS[type] || type.replace(/_/g, ' ');
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value || 0);
}

function matchesQuery(title, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  const haystack = [
    title.titleNumber,
    title.label,
    title.shortLabel,
    ...(title.keywords || [])
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

function getResultLimitLabel(resultCount) {
  if (resultCount <= 200) {
    return `${formatNumber(resultCount)} results`;
  }

  return `Showing first 200 of ${formatNumber(resultCount)} results`;
}

function EcfrTitleDirectoryPanel({
  directory,
  searchQuery,
  selectedTitleId,
  onSelectTitle
}) {
  const [titleDetails, setTitleDetails] = useState({});
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [nodeFilter, setNodeFilter] = useState({ titleId: null, value: '' });

  const filteredTitles = useMemo(
    () => (directory?.titles || []).filter((title) => matchesQuery(title, searchQuery)),
    [directory, searchQuery]
  );

  const activeTitleSummary = useMemo(
    () =>
      (directory?.titles || []).find((title) => title.id === selectedTitleId) ||
      filteredTitles[0] ||
      null,
    [directory, filteredTitles, selectedTitleId]
  );

  useEffect(() => {
    if (!selectedTitleId && filteredTitles.length > 0) {
      onSelectTitle(filteredTitles[0].id);
    }
  }, [filteredTitles, onSelectTitle, selectedTitleId]);

  useEffect(() => {
    if (!activeTitleSummary?.id || titleDetails[activeTitleSummary.id]) {
      return;
    }

    let cancelled = false;

    const loadDetail = async () => {
      setIsLoadingDetail(true);
      setDetailError(null);

      try {
        const response = await fetch(`${TITLE_DETAIL_BASE}/${activeTitleSummary.id}.json`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!cancelled) {
          setTitleDetails((prev) => ({ ...prev, [activeTitleSummary.id]: data }));
        }
      } catch (error) {
        if (!cancelled) {
          setDetailError(`Failed to load ${activeTitleSummary.label}. ${error.message}`);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingDetail(false);
        }
      }
    };

    loadDetail();

    return () => {
      cancelled = true;
    };
  }, [activeTitleSummary, titleDetails]);

  const activeDetail = activeTitleSummary ? titleDetails[activeTitleSummary.id] : null;
  const nodeQuery = nodeFilter.titleId === activeTitleSummary?.id ? nodeFilter.value : '';

  const filteredNodes = useMemo(() => {
    if (!activeDetail?.items) {
      return [];
    }

    const normalizedQuery = nodeQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return activeDetail.items.slice(0, 200);
    }

    return activeDetail.items
      .filter((item) =>
        [
          item.identifier,
          item.label,
          item.labelLevel,
          item.description,
          item.pathLabel,
          item.type
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      )
      .slice(0, 200);
  }, [activeDetail, nodeQuery]);

  const totalNodeMatches = useMemo(() => {
    if (!activeDetail?.items) {
      return 0;
    }

    const normalizedQuery = nodeQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return activeDetail.items.length;
    }

    return activeDetail.items.filter((item) =>
      [
        item.identifier,
        item.label,
        item.labelLevel,
        item.description,
        item.pathLabel,
        item.type
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    ).length;
  }, [activeDetail, nodeQuery]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
      <div className="md:col-span-4 bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[550px]">
        <div className="p-3 bg-slate-950/30 border-b border-slate-800">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Related eCFR Titles
          </span>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-slate-800/40">
          {filteredTitles.map((title) => (
            <button
              key={title.id}
              type="button"
              onClick={() => onSelectTitle(title.id)}
              className={`w-full text-left p-3.5 transition flex flex-col gap-1.5 ${
                activeTitleSummary?.id === title.id
                  ? 'bg-emerald-500/5 text-emerald-400 border-l-2 border-emerald-500'
                  : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase">
                  Title {title.titleNumber}
                </span>
                <span className="text-[9px] text-slate-500">
                  {formatNumber(title.stats.sections)} sections
                </span>
              </div>
              <span className="text-xs font-semibold leading-snug">{title.label}</span>
              <span className="text-[10px] text-slate-500 line-clamp-2">
                {title.topLevelSummary.map((entry) => entry.label).join(' • ')}
              </span>
            </button>
          ))}

          {filteredTitles.length === 0 && (
            <div className="p-5 text-xs text-slate-500">
              No eCFR titles matched "{searchQuery}".
            </div>
          )}
        </div>
      </div>

      <div className="md:col-span-8 flex flex-col h-[550px]">
        {!activeTitleSummary ? (
          <div className="flex-1 bg-slate-900/20 border border-slate-800 rounded-xl flex items-center justify-center text-center p-8">
            <div className="max-w-xs">
              <Layers3 size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">
                Select a related eCFR title to inspect its indexed chapters, parts, and sections.
              </p>
            </div>
          </div>
        ) : isLoadingDetail ? (
          <div className="flex-1 bg-slate-900/20 border border-slate-800 rounded-xl flex items-center justify-center">
            <div className="text-center text-slate-400 text-xs">
              <Loader2 className="animate-spin text-emerald-500 mx-auto mb-2" size={24} />
              <span>Loading indexed eCFR title structure...</span>
            </div>
          </div>
        ) : detailError ? (
          <div className="flex-1 bg-slate-900/20 border border-slate-800 rounded-xl flex items-center justify-center text-center p-8">
            <div className="max-w-md text-xs text-amber-300">{detailError}</div>
          </div>
        ) : activeDetail ? (
          <div className="flex-1 bg-slate-900/20 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-800 bg-slate-950/20 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-300 tracking-wider">
                      {activeDetail.label}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      Index Only
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-2xl">
                    Structural directory from the eCFR versioner API snapshot dated {activeDetail.structureDate}. Use it to locate related titles, chapters, and parts before opening the live eCFR title page.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={activeDetail.currentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold rounded-lg border border-slate-700 text-slate-200 hover:border-slate-600 hover:bg-slate-900/70 transition"
                  >
                    <ExternalLink size={12} />
                    <span>Open Current Title</span>
                  </a>
                  <a
                    href={activeDetail.apiUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold rounded-lg border border-slate-700 text-slate-200 hover:border-slate-600 hover:bg-slate-900/70 transition"
                  >
                    <FileJson size={12} />
                    <span>Open Structure JSON</span>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Parts</div>
                  <div className="text-sm font-bold text-slate-100 mt-1">
                    {formatNumber(activeDetail.stats.parts)}
                  </div>
                </div>
                <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Sections</div>
                  <div className="text-sm font-bold text-slate-100 mt-1">
                    {formatNumber(activeDetail.stats.sections)}
                  </div>
                </div>
                <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Chapters</div>
                  <div className="text-sm font-bold text-slate-100 mt-1">
                    {formatNumber(activeDetail.stats.chapters)}
                  </div>
                </div>
                <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Appendices</div>
                  <div className="text-sm font-bold text-slate-100 mt-1">
                    {formatNumber(activeDetail.stats.appendices)}
                  </div>
                </div>
                <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-3">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Reserved Nodes</div>
                  <div className="text-sm font-bold text-slate-100 mt-1">
                    {formatNumber(activeDetail.stats.reservedNodes)}
                  </div>
                </div>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={nodeQuery}
                  onChange={(event) =>
                    setNodeFilter({
                      titleId: activeTitleSummary?.id || null,
                      value: event.target.value
                    })
                  }
                  placeholder={`Filter Title ${activeDetail.titleNumber} by chapter, part, section, or keyword...`}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700 transition"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {activeDetail.topLevelSummary.slice(0, 8).map((entry) => (
                  <span
                    key={`${entry.type}-${entry.identifier}`}
                    className="text-[10px] bg-slate-950/60 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-md"
                  >
                    {entry.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Indexed Nodes
                </span>
                <span className="text-[10px] text-slate-500">
                  {getResultLimitLabel(totalNodeMatches)}
                </span>
              </div>

              {filteredNodes.length > 0 ? (
                <div className="space-y-3">
                  {filteredNodes.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-950/30 border border-slate-800 rounded-xl p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          {formatNodeType(item.type)}
                        </span>
                        <span className="text-[10px] font-mono text-slate-300">
                          {item.identifier}
                        </span>
                        {item.reserved && (
                          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Reserved
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-100 mt-2">
                        {item.label}
                      </div>
                      {item.description && item.description !== item.label && (
                        <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                      <div className="mt-2.5 text-[10px] text-slate-500 leading-relaxed">
                        <div>{item.pathLabel}</div>
                        {item.descendantRange && <div>Range: {item.descendantRange}</div>}
                        {item.receivedOn && <div>Received on: {item.receivedOn.slice(0, 10)}</div>}
                        {item.volumes?.length > 0 && <div>Volumes: {item.volumes.join(', ')}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8">
                  <FileText size={28} className="text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400">
                    No indexed nodes matched "{nodeQuery}" inside {activeDetail.label}.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default EcfrTitleDirectoryPanel;
