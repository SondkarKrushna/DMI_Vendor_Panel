import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./apiUtils";

export const affiliationApi = createApi({
    reducerPath: "affiliationApi",

    baseQuery: baseQueryWithReauth,

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