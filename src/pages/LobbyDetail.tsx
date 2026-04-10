import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetLobbiesQuery,
  useGetLobbyPageMutation,
  useGetBulkKpisMutation,
} from "../services/lobbyApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// --- Types ---

interface ConditionalFormat {
  Value: string;
  Foreground: string;
  Comparer: string;
}

interface CounterElement {
  Title: string;
  Footer?: string;
  Suffix?: string;
  Row: number;
  Column: number;
  ColumnMapping?: {
    MappedColumns?: {
      MappedColumn?: Array<{
        Column: string;
        ConditionalFormats?: {
          ConditionalFormatting?: ConditionalFormat[];
        };
      }>;
    };
  };
  ProjectionDataSource?: {
    Filter?: string;
  };
}

interface TextElement {
  BodyText: string;
  WebUrl?: string;
  ID: string;
}

interface ImageElement {
  Image: string;
  Name: string;
  ID: string;
}

interface GroupData {
  Elements?: {
    Counter?: CounterElement[];
    Text?: TextElement[];
    Image?: ImageElement[];
  };
  IsSeparator?: boolean;
  SeparatorTitle?: string;
}

interface PageData {
  page?: {
    Layout?: {
      Groups?: {
        Group?: GroupData[];
      };
    };
  };
}

// --- Helpers ---

function parseKpiId(filter?: string): string | null {
  if (!filter) return null;
  const m = filter.match(/Id\s+eq\s+'(\d+)'/);
  return m ? m[1] : null;
}

function ifsColor(hex: string): string {
  // IFS uses #AARRGGBB format, CSS needs #RRGGBB
  return hex.length === 9 ? `#${hex.slice(3)}` : hex;
}

function getColor(measure: number, formats?: ConditionalFormat[]): string {
  if (!formats) return "#4B4A4D";
  for (const f of formats) {
    const v = parseFloat(f.Value);
    const c = ifsColor(f.Foreground);
    if (f.Comparer === "EQUAL_OR_GREATER" && measure >= v) return c;
    if (f.Comparer === "EQUAL_OR_LESS" && measure <= v) return c;
    if (f.Comparer === "GREATER" && measure > v) return c;
    if (f.Comparer === "LESS" && measure < v) return c;
  }
  return "#4B4A4D";
}

// --- Components ---

function KpiCard({
  counter,
  measure,
}: {
  counter: CounterElement;
  measure: number | null;
}) {
  const formats =
    counter.ColumnMapping?.MappedColumns?.MappedColumn?.[0]?.ConditionalFormats
      ?.ConditionalFormatting;

  const color = measure !== null ? getColor(measure, formats) : "#4B4A4D";

  let displayValue = "...";
  if (measure !== null) {
    if (Math.abs(measure) < 1 && measure !== 0) {
      displayValue = measure.toFixed(2);
    } else if (Number.isInteger(measure)) {
      displayValue = String(measure);
    } else {
      displayValue = measure.toFixed(1);
    }
    if (counter.Suffix) displayValue += counter.Suffix;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 text-center">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {counter.Title}
      </p>
      <p className="text-3xl font-bold" style={{ color }}>
        {displayValue}
      </p>
      {counter.Footer && (
        <p className="text-xs text-gray-400 mt-2 uppercase">{counter.Footer}</p>
      )}
    </div>
  );
}

// --- Main Page ---

function LobbyDetail() {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const navigate = useNavigate();
  const { data: lobbiesData } = useGetLobbiesQuery();
  const [fetchPage, { data: rawPageData, isLoading: pageLoading }] =
    useGetLobbyPageMutation();
  const [fetchKpis, { data: kpisData, isLoading: kpisLoading }] =
    useGetBulkKpisMutation();

  const lobby = lobbiesData?.value?.find((l) => l.PoId === lobbyId);

  // 1. Fetch lobby page config
  useEffect(() => {
    if (lobbyId) fetchPage(lobbyId);
  }, [lobbyId, fetchPage]);

  // 2. Parse groups from page data
  const groups: GroupData[] = useMemo(() => {
    const pd = rawPageData as PageData | undefined;
    return pd?.page?.Layout?.Groups?.Group ?? [];
  }, [rawPageData]);

  // 3. Extract KPI IDs from counters and fetch
  const allCounters = useMemo(() => {
    const result: Array<{ counter: CounterElement; kpiId: string | null }> = [];
    for (const g of groups) {
      for (const c of g.Elements?.Counter ?? []) {
        result.push({
          counter: c,
          kpiId: parseKpiId(c.ProjectionDataSource?.Filter),
        });
      }
    }
    return result;
  }, [groups]);

  useEffect(() => {
    const ids = [
      ...new Set(allCounters.map((c) => c.kpiId).filter(Boolean)),
    ] as string[];
    if (ids.length > 0) fetchKpis(ids);
  }, [allCounters, fetchKpis]);

  // 4. Build KPI ID -> Measure map
  const kpiMap: Record<string, number> = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of kpisData?.kpis ?? []) {
      if (!item) continue;
      const kpi = item as { Id: string; Measure: number };
      if (kpi.Id && kpi.Measure !== undefined) {
        map[kpi.Id] = kpi.Measure;
      }
    }
    return map;
  }, [kpisData]);

  // --- Render ---

  if (!lobbiesData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!lobby) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-500 text-lg mb-4">Lobby not found</p>
        <button
          onClick={() => navigate("/lobbies")}
          className="px-6 py-2 bg-blue-600 text-white rounded text-sm font-semibold cursor-pointer hover:bg-blue-700"
        >
          Back to Lobbies
        </button>
      </div>
    );
  }

  const title = (
    lobby.Description ||
    lobby.PageTitle ||
    lobby.PoId ||
    "Untitled"
  ).replace(/^LOBBY\s*-\s*/i, "");

  const loading = pageLoading || kpisLoading;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 bg-blue-600 text-white">
        <div className="flex items-center gap-3">
          <img
            src="/ifs_logo_name.svg"
            alt="IFS Logo"
            className="h-8 brightness-0 invert"
          />
          <h1 className="text-xl font-semibold truncate max-w-150">{title}</h1>
        </div>
        <button
          onClick={() => navigate("/lobbies")}
          className="px-5 py-2 bg-white text-sm text-blue-600 rounded font-semibold hover:bg-gray-100 cursor-pointer shrink-0"
        >
          Back to Lobbies
        </button>
      </header>

      <div className="p-8">
        {loading && groups.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500">Loading lobby details...</p>
          </div>
        ) : groups.length > 0 ? (
          groups.map((group, idx) => (
            <div key={idx} className="mb-6">
              {/* Separator Title */}
              {group.IsSeparator && group.SeparatorTitle && (
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="inline-block w-4 h-4">
                    <svg
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="text-gray-400"
                    >
                      <rect x="0" y="0" width="7" height="7" rx="1" />
                      <rect x="9" y="0" width="7" height="7" rx="1" />
                      <rect x="0" y="9" width="7" height="7" rx="1" />
                      <rect x="9" y="9" width="7" height="7" rx="1" />
                    </svg>
                  </span>
                  {group.SeparatorTitle}
                </h3>
              )}

              {/* Images */}
              {group.Elements?.Image && group.Elements.Image.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {group.Elements.Image.map((img) => (
                    <div
                      key={img.ID}
                      className="rounded-lg overflow-hidden shadow-sm h-52 bg-gray-200"
                    >
                      <img
                        src={`${API_URL}/api/ifs-image?path=${encodeURIComponent(img.Image)}`}
                        alt={img.Name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* KPI Counter Cards */}
              {group.Elements?.Counter && group.Elements.Counter.length > 0 && (
                <div className={`grid gap-4 grid-cols-6`}>
                  {[...group.Elements.Counter]
                    .sort((a, b) => a.Column - b.Column)
                    .map((counter, i) => {
                      const kpiId = parseKpiId(
                        counter.ProjectionDataSource?.Filter,
                      );
                      return (
                        <KpiCard
                          key={i}
                          counter={counter}
                          measure={
                            kpiId && kpiMap[kpiId] !== undefined
                              ? kpiMap[kpiId]
                              : null
                          }
                        />
                      );
                    })}
                </div>
              )}

              {/* Text / Sub-Lobby Link Cards */}
              {group.Elements?.Text && group.Elements.Text.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {group.Elements.Text.map((text) => (
                    <div
                      key={text.ID}
                      onClick={() => {
                        if (text.WebUrl?.startsWith("lobby/")) {
                          navigate(
                            `/lobbies/${text.WebUrl.replace("lobby/", "")}`,
                          );
                        }
                      }}
                      className="bg-indigo-900 rounded-lg shadow-sm p-8 text-center cursor-pointer hover:bg-indigo-800 transition-colors"
                    >
                      <p className="text-sm font-bold text-white uppercase">
                        {text.BodyText}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          /* Fallback - no page data, show lobby properties */
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-600">
              <h2 className="text-2xl font-bold text-gray-800 uppercase">
                {title}
              </h2>
              {lobby.DescriptiveText && (
                <p className="text-gray-600 mt-2">
                  {String(lobby.DescriptiveText)}
                </p>
              )}
              {lobby.Keywords && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {String(lobby.Keywords)
                    .split(",")
                    .map((kw, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {kw.trim()}
                      </span>
                    ))}
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Lobby Properties
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(lobby)
                .filter(
                  ([key, value]) =>
                    value !== null &&
                    value !== undefined &&
                    value !== "" &&
                    key !== "@odata.etag",
                )
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
                  >
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      {key}
                    </p>
                    <p className="text-sm text-gray-800 break-all">
                      {String(value)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LobbyDetail;
