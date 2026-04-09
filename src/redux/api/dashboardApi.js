import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const dashboardApi = createApi({
    reducerPath: "dashboardApi",

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
