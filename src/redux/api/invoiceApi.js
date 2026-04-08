import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const invoiceApi = createApi({
    reducerPath: "invoiceApi",
    baseQuery: fetchBaseQuery({
        baseUrl,
        credentials: "include",
        prepareHeaders: (headers) => {
      const token = localStorage.getItem("token"); 



      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    }
    }),

    tagTypes: ["Invoices"],

    endpoints: (builder) => ({
        getInvoices: builder.query({
            query: (params) => ({
                url: "/api/vendor/get/invoices",
                params,
            }),
            providesTags: ["Invoices"],
        }),
        getActiveServices: builder.query({
            query: () => "/api/vendor/my-active-services",
            providesTags: ["Services"],
        }),
    }),
});

export const { useGetInvoicesQuery, useGetActiveServicesQuery } = invoiceApi;