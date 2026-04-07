import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const punchApi = createApi({
  reducerPath: "punchApi",

  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ["Punches"],

  endpoints: (builder) => ({
    // ✅ SEARCH CARDHOLDER (Used for auto-fill)
    searchCardHolder: builder.query({
      query: (query) => `/api/cards/search?query=${query}`,
    }),

    // ✅ CREATE PUNCH
    createPunch: builder.mutation({
      query: (data) => ({
        url: "/api/vendor/create-punch",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Punches"],
    }),

    // ✅ GET PUNCH HISTORY
    getPunches: builder.query({
      query: (params) => ({
        url: "/api/vendor/get-punch",
        params, // dynamically passes dateFilter, startDate, endDate
      }),
      providesTags: ["Punches"],
    }),
  }),
});

export const {
  useLazySearchCardHolderQuery,
  useCreatePunchMutation,
  useGetPunchesQuery,
} = punchApi;
