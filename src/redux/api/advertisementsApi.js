import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const advertisementsApi = createApi({
  reducerPath: "advertisementsApi",

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

  tagTypes: ["Advertisements"],

  endpoints: (builder) => ({
    // ✅ CREATE
    addAdvertisement: builder.mutation({
      query: (data) => ({
        url: "/api/advertisement/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Advertisements"],
    }),

    // ✅ UPDATE
    updateAdvertisement: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/advertisement/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Advertisements"],
    }),

    // ✅ DELETE
    deleteAdvertisement: builder.mutation({
      query: (id) => ({
        url: `/api/advertisement/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Advertisements"],
    }),

    // ✅ READ
    getAdvertisements: builder.query({
      query: () => "/api/advertisement/my-advertisements",
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
