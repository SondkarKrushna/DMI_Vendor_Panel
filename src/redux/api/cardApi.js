import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./apiUtils";


const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const cardApi = createApi({
    reducerPath: "cardApi",
    
    baseQuery: baseQueryWithReauth,

    tagTypes: ["Cards"],

    endpoints: (builder) => ({
        getCards: builder.query({
            query: () => "/api/vendor/card-name/get-active",
            providesTags: ["Cards"],
        }),
    }),
});

export const { useGetCardsQuery } = cardApi;