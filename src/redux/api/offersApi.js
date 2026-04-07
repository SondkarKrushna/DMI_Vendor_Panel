import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const offersApi = createApi({
  reducerPath: "offersApi",

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
      query: () => "/api/offers/my-offers",
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