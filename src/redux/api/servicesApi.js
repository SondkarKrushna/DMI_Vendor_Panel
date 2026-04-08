import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const servicesApi = createApi({
  reducerPath: "servicesApi",

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
