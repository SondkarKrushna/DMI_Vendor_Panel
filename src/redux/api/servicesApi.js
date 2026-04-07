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
        url: "/api/service/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Services"],
    }),

    // ✅ UPDATE
    updateService: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/service/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Services"],
    }),

    // ✅ DELETE
    deleteService: builder.mutation({
      query: (id) => ({
        url: `/api/service/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Services"],
    }),

    // ✅ READ
    getServices: builder.query({
      query: () => "/api/service/my-services",
      providesTags: ["Services"],
    }),
  }),
});

// ✅ Export hooks
export const {
  useAddServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetServicesQuery,
} = servicesApi;
