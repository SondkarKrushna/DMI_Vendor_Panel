import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const affiliationApi = createApi({
    reducerPath: "affiliationApi",

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

    tagTypes: ["Affiliation"],
    endpoints: (builder) => ({
        getAffiliationDashboard: builder.query({
            query: () => ({
                url: "/api/vendor/affiliation/dashboard",
            }),
            providesTags: ["Affiliation"],
        }),
    }),
})

export const {
    useGetAffiliationDashboardQuery,
} = affiliationApi;