import { api } from "./api";

interface LoginUrlResponse {
  authUrl: string;
}

interface CallbackRequest {
  code: string;
  state: string;
}

interface CallbackResponse {
  message: string;
  token_type: string;
  expires_in: number;
}

interface UserInfo {
  sub: string;
  preferred_username: string;
  name: string;
  given_name: string;
  family_name: string;
  email: string;
}

interface AuthStatus {
  loggedIn: boolean;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLoginUrl: builder.query<LoginUrlResponse, void>({
      query: () => "/auth/login",
    }),

    handleCallback: builder.mutation<CallbackResponse, CallbackRequest>({
      query: ({ code, state }) => ({
        url: `/auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
        method: "GET",
      }),
      invalidatesTags: ["Auth"],
    }),

    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth", "Lobbies"],
    }),

    getUserInfo: builder.query<UserInfo, void>({
      query: () => "/auth/userinfo",
      providesTags: ["Auth"],
    }),

    getAuthStatus: builder.query<AuthStatus, void>({
      query: () => "/auth/status",
      providesTags: ["Auth"],
    }),

    refreshToken: builder.mutation<
      { message: string; expires_in: number },
      void
    >({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetLoginUrlQuery,
  useHandleCallbackMutation,
  useLogoutMutation,
  useGetUserInfoQuery,
  useGetAuthStatusQuery,
  useRefreshTokenMutation,
} = authApi;
