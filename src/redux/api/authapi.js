import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const authApi = createApi({
    reducerPath: "authApi",
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

    endpoints: (builder) => ({
        loginVendor: builder.mutation({
            query: (data) => ({
                url: "/api/auth/login",
                method: "POST",
                body: data,
            }),
        }),
        registerVendor: builder.mutation({
            query: (data) => ({
                url: "/api/auth/register",
                method: "POST",
                body: data,
            }),
        }),
        logoutVendor: builder.mutation({
            query: () => ({
                url: "/api/auth/logout",
                method: "POST",
            }),
        }),
    }),
});

export const { useLoginVendorMutation, useRegisterVendorMutation, useLogoutVendorMutation } = authApi;