import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./apiUtils";

export const punchApi = createApi({
  reducerPath: "punchApi",

  baseQuery: baseQueryWithReauth,

  tagTypes: ["Punches"],

  endpoints: (builder) => ({
    // ✅ SEARCH CARDHOLDER (Used for auto-fill)
    searchCardHolder: builder.query({
      query: (query) => `/api/cards/search?query=${query}`,
    }),

    // ✅ CREATE PUNCH (creates order + generates QR code for payment)
    createPunch: builder.mutation({
      query: (data) => ({
        url: "/api/vendor/create-punch",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Punches"],
    }),

    // ✅ VERIFY RAZORPAY PAYMENT
    verifyPayment: builder.mutation({
      query: (data) => ({
        url: "/api/vendor/verify",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Punches"],
    }),

    // ✅ GET PUNCH HISTORY
    getPunches: builder.query({
      query: (params) => ({
        url: "/api/vendor/get-punch",
        params,
      }),
      providesTags: ["Punches"],
    }),
  }),
});

export const {
  useLazySearchCardHolderQuery,
  useCreatePunchMutation,
  useVerifyPaymentMutation,
  useGetPunchesQuery,
} = punchApi;
