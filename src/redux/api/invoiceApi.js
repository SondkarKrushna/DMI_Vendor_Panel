import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./apiUtils";

export const invoiceApi = createApi({
    reducerPath: "invoiceApi",
    baseQuery: baseQueryWithReauth,

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