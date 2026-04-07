import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const profileApi = createApi({
  reducerPath: "profileApi",

  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders: (headers) => {
  const token = localStorage.getItem("token"); // ✅ FIX

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}
  }),

  tagTypes: ["Profile"],

  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => "/api/auth/profile",
      providesTags: ["Profile"],
    }),
  }),
});

export const { useGetProfileQuery } = profileApi;