import { api } from "./api";

interface Lobby {
  PoId?: string;
  Description?: string;
  PageTitle?: string;
  Keywords?: string;
  Author?: string;
  DescriptiveText?: string;
  [key: string]: unknown;
}

interface LobbyResponse {
  value: Lobby[];
  "@odata.count"?: number;
}

export interface KpiData {
  Id: string;
  Title: string;
  Measure: number;
  Target: number;
  Benchmark: number;
  Description: string;
  Benefits: string;
  [key: string]: unknown;
}

interface BulkKpiResponse {
  kpis: KpiData[];
}

export const lobbyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLobbies: builder.query<LobbyResponse, void>({
      query: () => "/api/lobbies",
      providesTags: ["Lobbies"],
    }),

    getLobbyPage: builder.mutation<unknown, string>({
      query: (pageId) => `/api/lobbies/${encodeURIComponent(pageId)}/page`,
    }),

    getBulkKpis: builder.mutation<BulkKpiResponse, string[]>({
      query: (ids) => ({
        url: "/api/kpi/bulk",
        method: "POST",
        body: { ids },
      }),
    }),
  }),
});

export const {
  useGetLobbiesQuery,
  useGetLobbyPageMutation,
  useGetBulkKpisMutation,
} = lobbyApi;
