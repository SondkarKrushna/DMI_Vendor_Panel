import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./apiUtils";

export const enrollmentApi = createApi({
  reducerPath: "enrollmentApi",

  baseQuery: baseQueryWithReauth,

  tagTypes: ["Enrollments"],

  endpoints: (builder) => ({
    // ✅ CREATE ENROLLMENT (POST with FormData for image upload)
    createEnrollment: builder.mutation({
      query: (formData) => ({
        url: "/api/vendor/create/enrollment",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Enrollments"],
    }),

    // ✅ GET ENROLLMENTS with filter support
    // filter can be: month | today | weekly | yearly | range
    // for range: pass startDate and endDate as well
    getEnrollments: builder.query({
      query: ({ filter, page = 1, limit = 10 } = {}) => {
        let url = "/api/vendor/get/enrollments";
        const params = new URLSearchParams();

        if (filter) params.append("filter", filter);
        if (page) params.append("page", page);
        if (limit) params.append("limit", limit);

        const queryString = params.toString();
        return {
          url: queryString ? `${url}?${queryString}` : url,
        };
      },
      providesTags: ["Enrollments"],
    }),
  }),
});

export const {
  useCreateEnrollmentMutation,
  useGetEnrollmentsQuery,
} = enrollmentApi;
