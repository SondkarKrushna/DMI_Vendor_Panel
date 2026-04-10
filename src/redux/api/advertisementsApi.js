import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./apiUtils";

export const advertisementsApi = createApi({
  reducerPath: "advertisementsApi",

  baseQuery: baseQueryWithReauth,

  tagTypes: ["Advertisements"],

  endpoints: (builder) => ({
    // ✅ CREATE
    addAdvertisement: builder.mutation({
      query: (data) => ({
        url: "/api/vendor/create/ads",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Advertisements"],
    }),

    // ✅ UPDATE
    updateAdvertisement: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/vendor/update/ads/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Advertisements"],
    }),

    // ✅ DELETE
    deleteAdvertisement: builder.mutation({
      query: (id) => ({
        url: `/api/vendor/delete/ads/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Advertisements"],
    }),

    // ✅ READ
    getAdvertisements: builder.query({
      query: (params) => ({
        url: "/api/vendor/get/ads",
        params,
      }),
      providesTags: ["Advertisements"],
    }),
  }),
});

// ✅ Export hooks
export const {
  useAddAdvertisementMutation,
  useUpdateAdvertisementMutation,
  useDeleteAdvertisementMutation,
  useGetAdvertisementsQuery,
} = advertisementsApi;
