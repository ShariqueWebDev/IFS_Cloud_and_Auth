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

interface LobbyParams {
  top?: number;
  skip?: number;
}

export const lobbyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLobbies: builder.query<LobbyResponse, LobbyParams>({
      query: (params) => ({
        url: "/api/lobbies",
        params: {
          top: params.top ?? 9,
          skip: params.skip ?? 0,
        },
      }),
      // Merge new pages into existing data
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems, { arg }) => {
        if (arg.skip === 0) {
          return newItems;
        }
        currentCache.value.push(...newItems.value);
        currentCache["@odata.count"] = newItems["@odata.count"];
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        return currentArg?.skip !== previousArg?.skip;
      },
      providesTags: ["Lobbies"],
    }),
  }),
});

export const { useGetLobbiesQuery } = lobbyApi;
