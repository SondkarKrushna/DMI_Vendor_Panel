import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./apiUtils";

export const offersApi = createApi({
  reducerPath: "offersApi",

  baseQuery: baseQueryWithReauth,

  tagTypes: ["Offers"],

  endpoints: (builder) => ({
    // ✅ CREATE
    addOffer: builder.mutation({
      query: (data) => ({
        url: "/api/offers/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Offers"],
    }),

    // ✅ UPDATE
    updateOffer: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/offers/update/${id}`,
        method: "PUT", // or PATCH depending on backend
        body: data,
      }),
      invalidatesTags: ["Offers"],
    }),

    // ✅ DELETE
    deleteOffer: builder.mutation({
      query: (id) => ({
        url: `/api/offers/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Offers"],
    }),

    // ✅ READ
    getOffers: builder.query({
      query: ({ page = 1, status = "" } = {}) =>
        `/api/offers/my-offers?page=${page}&status=${status}`,
      providesTags: ["Offers"],
    }),
  }),
});

// ✅ Export hooks
export const {
  useAddOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
  useGetOffersQuery,
} = offersApi;