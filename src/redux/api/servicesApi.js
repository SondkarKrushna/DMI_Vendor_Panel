import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./apiUtils";

export const servicesApi = createApi({
  reducerPath: "servicesApi",

  baseQuery: baseQueryWithReauth,

  tagTypes: ["Services"],

  endpoints: (builder) => ({
    // ✅ CREATE
    addService: builder.mutation({
      query: (data) => ({
        url: "/api/services/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Services"],
    }),

    // ✅ UPDATE
    updateService: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/services/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Services"],
    }),

    // ✅ DELETE
    deleteService: builder.mutation({
      query: (id) => ({
        url: `/api/services/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Services"],
    }),

    // ✅ READ
    getServices: builder.query({
      query: (params) => ({
        url: "/api/vendor/my-services",
        params, // dynamically passes ?page=1&limit=10, etc.
      }),
      providesTags: ["Services"],
    }),
    getActiveServices: builder.query({
      query: (params) => ({
        url: "/api/vendor/my-active-services",
        params, // dynamically passes ?page=1&limit=10, etc.
      }),
      providesTags: ["Services"],
    }),
  }),
});

export const {
  useAddServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetServicesQuery,
  useGetActiveServicesQuery,
} = servicesApi;
