import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./apiUtils";

export const verticalApi = createApi({
    reducerPath: "verticalApi",
    baseQuery: baseQueryWithReauth,

    tagTypes: ["Verticals"],

    endpoints: (builder) => ({
        getVerticals: builder.query({
            query: () => "/api/vendor/verticals/get-all",
            providesTags: ["Verticals"],
        }),
    }),
});

export const { useGetVerticalsQuery } = verticalApi;