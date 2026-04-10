import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./apiUtils";

export const profileApi = createApi({
  reducerPath: "profileApi",

  baseQuery: baseQueryWithReauth,

  tagTypes: ["Profile"],

  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => "/api/vendor/profile/get",
      providesTags: ["Profile"],
    }),
    editProfile: builder.mutation({
      query: (data) => ({
        url: "/api/vendor/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Profile"],
    }),
  }),
});

export const { useGetProfileQuery, useEditProfileMutation } = profileApi;