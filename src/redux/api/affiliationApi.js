import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./apiUtils";

export const affiliationApi = createApi({
    reducerPath: "affiliationApi",

    baseQuery: baseQueryWithReauth,

    tagTypes: ["Affiliation"],
    endpoints: (builder) => ({
        getAffiliationDashboard: builder.query({
            query: ({ page = 1, limit = 10, search = "" } = {}) => {
                const params = new URLSearchParams();
                if (page) params.append("page", page);
                if (limit) params.append("limit", limit);
                if (search) params.append("search", search);

                const queryString = params.toString();
                return {
                    url: queryString ? `/api/vendor/affiliation/dashboard?${queryString}` : "/api/vendor/affiliation/dashboard",
                };
            },
            providesTags: ["Affiliation"],
        }),
    }),
})

export const {
    useGetAffiliationDashboardQuery,
} = affiliationApi;