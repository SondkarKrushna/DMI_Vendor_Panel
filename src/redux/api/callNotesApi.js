import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const callNotesApi = createApi({
  reducerPath: "callNotesApi",
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
  tagTypes: ["CallNotes"],
  endpoints: (builder) => ({
    // ✅ GET CALL NOTES
    getCallNotes: builder.query({
      query: ({ status = "pending", type = "follow-up" } = {}) => 
        `/api/vendor/get/call-notes?status=${status}&type=${type}`,
      providesTags: ["CallNotes"],
    }),

    // ✅ CREATE CALL NOTE
    addCallNote: builder.mutation({
      query: (data) => ({
        url: "/api/vendor/create/call-notes",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CallNotes"],
    }),

    // ✅ UPDATE CALL NOTE STATUS
    updateCallNoteStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/vendor/update/call-notes/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["CallNotes"],
    }),
  }),
});

export const {
  useGetCallNotesQuery,
  useAddCallNoteMutation,
  useUpdateCallNoteStatusMutation,
} = callNotesApi;
