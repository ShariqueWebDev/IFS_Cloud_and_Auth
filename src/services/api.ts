import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include", // cookies bhejne ke liye (session)
  }),
  tagTypes: ["Auth", "Lobbies"],
  endpoints: () => ({}),
});
