import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const enrollmentApi = createApi({
  reducerPath: "enrollmentApi",

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
      query: ({ filter } = {}) => {
        let url = "/api/vendor/get/enrollments";
        const params = new URLSearchParams();

        if (filter) {
          params.append("filter", filter);
        }

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
