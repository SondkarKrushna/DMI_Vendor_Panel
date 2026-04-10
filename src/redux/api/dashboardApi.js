import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./apiUtils";

export const dashboardApi = createApi({
    reducerPath: "dashboardApi",

    baseQuery: baseQueryWithReauth,

    tagTypes: ["Dashboard"],
    endpoints: (builder) => ({
        getDashboard: builder.query({
            query: ({ graphFilter } = {}) => {
                let url = "/api/vendor/dashboard";
                const params = new URLSearchParams();

                if (graphFilter) {
                    params.append("graphFilter", graphFilter);
                }

                const queryString = params.toString();
                return {
                    url: queryString ? `${url}?${queryString}` : url,
                };
            },
            providesTags: ["Dashboard"],
        }),
    }),
})

export const {
    useGetDashboardQuery,
} = dashboardApi;
